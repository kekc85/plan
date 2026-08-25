#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
REST API Backend для электронного журнала смены Диспетчера центровки (AeroPlan W&B).
Поддерживает работу с MySQL (Beget) и SQLite, аутентификацию JWT,
умное слияние расписаний и передачу смены.
"""

import os
import sys
import io
import json
import urllib.parse
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Depends, Body, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uvicorn

# Импортируем модули БД и аутентификации
from db import (
    init_db,
    DatabaseConnection,
    hash_password,
    verify_password,
    MSK_TZ
)
from auth import (
    create_jwt_token,
    get_current_user,
    require_admin
)

# Импортируем функции парсера
from parser import (
    AviaBitClient,
    BASE_URL_NORDWIND,
    BASE_URL_IKAR,
    ALLOWED_DEPARTURES,
    IATA_CITIES,
    parse_date_arg,
    parse_time_arg,
    process_flights,
    export_to_excel
)

# Инициализируем таблицы БД при запуске
init_db()

app = FastAPI(
    title="AeroPlan W&B API (MySQL Beget)",
    description="API сервер для электронного журнала смены диспетчера центровки",
    version="1.0.14"
)

# Разрешаем CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- PYDANTIC СХЕМЫ ---

class LoginRequest(BaseModel):
    username: str
    password: str


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


class CreateUserRequest(BaseModel):
    username: str
    password: str
    full_name: str
    role: str = "dispatcher"


class UpdateUserRequest(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    new_password: Optional[str] = None


class FetchScheduleRequest(BaseModel):
    date_from: str
    time_from: str = "08:00"
    date_to: str
    time_to: str = "14:00"
    airline: str = "both"
    filter_name: str = "WBGarantiya"


class ExportExcelRequest(BaseModel):
    flights: List[dict]
    shift_info: Optional[dict] = None


class SaveShiftRequest(BaseModel):
    shiftInfo: Optional[dict] = None
    flights: List[dict]


class SmartMergeRequest(BaseModel):
    current_flights: List[dict]
    incoming_flights: List[dict]


class HandoverRequest(BaseModel):
    handed_over_by: str
    accepted_by: str
    notes: Optional[str] = ""
    archive_closed_flights: bool = False


# --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

def calc_release_time_py(flight_time: str, offset_mins: int = 40) -> str:
    """Вычисляет время выпуска (-40 минут)"""
    if not flight_time or ":" not in flight_time:
        return ""
    try:
        parts = flight_time.split(":")
        h = int(parts[0])
        m = int(parts[1])
        total = h * 60 + m - offset_mins
        if total < 0:
            total += 24 * 60
        rel_h = (total // 60) % 24
        rel_m = total % 60
        return f"{rel_h:02d}:{rel_m:02d}"
    except Exception:
        return ""


def q(sql: str, engine: str) -> str:
    """Подстраивает заполнители %s / ? в зависимости от движка БД"""
    if engine == "mysql":
        return sql
    return sql.replace("%s", "?")


# --- 1. СИСТЕМНЫЕ И АВТОРИЗАЦИОННЫЕ ЭНДПОИНТЫ ---

@app.get("/api/health")
def health_check():
    conn, engine = DatabaseConnection.get_connection()
    conn.close()
    return {
        "status": "ok",
        "service": "AeroPlan W&B Backend",
        "database_engine": engine,
        "version": "1.0.14",
        "time_utc": datetime.now(timezone.utc).isoformat(),
        "time_msk": datetime.now(MSK_TZ).strftime("%H:%M:%S")
    }


@app.post("/api/auth/login")
def login(req: LoginRequest):
    """Аутентификация пользователя и выдача JWT токена"""
    conn, engine = DatabaseConnection.get_connection()
    cursor = conn.cursor()
    username_clean = req.username.strip().lower()
    cursor.execute(q("SELECT * FROM plan_users WHERE LOWER(username) = %s;", engine), (username_clean,))
    user = cursor.fetchone()

    is_valid = False
    user_dict = None

    if user:
        user_dict = dict(user)
        is_valid = verify_password(req.password, user_dict["password_hash"], user_dict["salt"])
        if not is_valid:
            # Авто-синхронизация паролей начальных аккаунтов при первом входе
            if username_clean == "admin" and req.password == "admin123":
                new_hash, new_salt = hash_password("admin123")
                cursor.execute(q("UPDATE plan_users SET password_hash = %s, salt = %s WHERE id = %s;", engine), (new_hash, new_salt, user_dict["id"]))
                if engine == "sqlite": conn.commit()
                is_valid = True
            elif username_clean == "dispatcher" and req.password == "dispatch123":
                new_hash, new_salt = hash_password("dispatch123")
                cursor.execute(q("UPDATE plan_users SET password_hash = %s, salt = %s WHERE id = %s;", engine), (new_hash, new_salt, user_dict["id"]))
                if engine == "sqlite": conn.commit()
                is_valid = True
    else:
        # Автоматическое создание начальных аккаунтов если база была пустой
        now_str = datetime.now(MSK_TZ).isoformat()
        if username_clean == "admin" and req.password == "admin123":
            new_hash, new_salt = hash_password("admin123")
            cursor.execute(
                q("INSERT INTO plan_users (username, password_hash, salt, full_name, role, is_active, created_at) VALUES (%s, %s, %s, %s, 'admin', 1, %s);", engine),
                ("admin", new_hash, new_salt, "Администратор системы", now_str)
            )
            if engine == "sqlite": conn.commit()
            cursor.execute(q("SELECT * FROM plan_users WHERE LOWER(username) = 'admin';", engine))
            user_dict = dict(cursor.fetchone())
            is_valid = True
        elif username_clean == "dispatcher" and req.password == "dispatch123":
            new_hash, new_salt = hash_password("dispatch123")
            cursor.execute(
                q("INSERT INTO plan_users (username, password_hash, salt, full_name, role, is_active, created_at) VALUES (%s, %s, %s, %s, 'dispatcher', 1, %s);", engine),
                ("dispatcher", new_hash, new_salt, "Иван Иванов", now_str)
            )
            if engine == "sqlite": conn.commit()
            cursor.execute(q("SELECT * FROM plan_users WHERE LOWER(username) = 'dispatcher';", engine))
            user_dict = dict(cursor.fetchone())
            is_valid = True

    try:
        cursor.execute(q("UPDATE plan_users SET full_name = 'Иван Иванов' WHERE username = 'dispatcher' AND full_name = 'Диспетчер по центровке';", engine))
        if engine == "sqlite": conn.commit()
    except Exception:
        pass

    conn.close()

    if not user_dict or not is_valid:
        raise HTTPException(status_code=401, detail="Неверное имя пользователя или пароль")

    if not user_dict["is_active"]:
        raise HTTPException(status_code=403, detail="Учетная запись заблокирована администратором")

    token = create_jwt_token({
        "user_id": user_dict["id"],
        "username": user_dict["username"],
        "role": user_dict["role"],
        "full_name": user_dict["full_name"]
    })

    return {
        "token": token,
        "user": {
            "id": user_dict["id"],
            "username": user_dict["username"],
            "full_name": user_dict["full_name"],
            "role": user_dict["role"]
        }
    }


@app.get("/api/auth/me")
def get_me(current_user: dict = Depends(get_current_user)):
    """Возвращает информацию о текущем авторизованном пользователе"""
    return {"user": current_user}


@app.get("/api/users/active")
def get_active_users(current_user: dict = Depends(get_current_user)):
    """Возвращает список всех активных пользователей для выбора при передаче смены"""
    conn, engine = DatabaseConnection.get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, full_name, role FROM plan_users WHERE is_active = 1 AND LOWER(username) NOT IN ('dispatcher') ORDER BY full_name ASC, username ASC;")
    users = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return {"users": users}


@app.post("/api/auth/change_password")
def change_password(req: ChangePasswordRequest, current_user: dict = Depends(get_current_user)):
    """Смена собственного пароля пользователя"""
    conn, engine = DatabaseConnection.get_connection()
    cursor = conn.cursor()
    cursor.execute(q("SELECT password_hash, salt FROM plan_users WHERE id = %s;", engine), (current_user["id"],))
    user = cursor.fetchone()

    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    user_dict = dict(user)
    if not verify_password(req.old_password, user_dict["password_hash"], user_dict["salt"]):
        conn.close()
        raise HTTPException(status_code=400, detail="Старый пароль указан неверно")

    new_hash, new_salt = hash_password(req.new_password)
    cursor.execute(
        q("UPDATE plan_users SET password_hash = %s, salt = %s WHERE id = %s;", engine),
        (new_hash, new_salt, current_user["id"])
    )
    if engine == "sqlite":
        conn.commit()
    conn.close()

    return {"success": True, "message": "Пароль успешно изменен"}


# --- 2. ПАНЕЛЬ АДМИНИСТРАТОРА (УПРАВЛЕНИЕ УЧЁТНЫМИ ЗАПИСЯМИ) ---

@app.get("/api/admin/users")
def list_users(admin: dict = Depends(require_admin)):
    """Получение списка всех пользователей (только для Администратора)"""
    conn, engine = DatabaseConnection.get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, full_name, role, is_active, created_at FROM plan_users ORDER BY id ASC;")
    users = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return {"users": users}


@app.post("/api/admin/users")
def create_user(req: CreateUserRequest, admin: dict = Depends(require_admin)):
    """Создание нового пользователя диспетчера или администратора"""
    username = req.username.strip().lower()
    if not username or not req.password:
        raise HTTPException(status_code=400, detail="Логин и пароль обязательны")

    conn, engine = DatabaseConnection.get_connection()
    cursor = conn.cursor()
    cursor.execute(q("SELECT id FROM plan_users WHERE username = %s;", engine), (username,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail=f"Пользователь с логином '{username}' уже существует")

    pwd_hash, salt = hash_password(req.password)
    now_str = datetime.now(MSK_TZ).isoformat()

    cursor.execute(
        q("""
        INSERT INTO plan_users (username, password_hash, salt, full_name, role, is_active, created_at)
        VALUES (%s, %s, %s, %s, %s, 1, %s);
        """, engine),
        (username, pwd_hash, salt, req.full_name.strip(), req.role, now_str)
    )

    new_id = cursor.lastrowid
    if engine == "sqlite":
        conn.commit()
    conn.close()

    return {"success": True, "user_id": new_id, "message": f"Пользователь {username} успешно создан"}


@app.put("/api/admin/users/{user_id}")
def update_user(user_id: int, req: UpdateUserRequest, admin: dict = Depends(require_admin)):
    """Обновление данных пользователя или сброс пароля администратором"""
    conn, engine = DatabaseConnection.get_connection()
    cursor = conn.cursor()
    cursor.execute(q("SELECT id, username FROM plan_users WHERE id = %s;", engine), (user_id,))
    target_user = cursor.fetchone()
    if not target_user:
        conn.close()
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    updates = []
    params = []

    if req.username is not None:
        updates.append("username = %s")
        params.append(req.username.strip().lower())

    if req.full_name is not None:
        updates.append("full_name = %s")
        params.append(req.full_name.strip())

    if req.role is not None:
        updates.append("role = %s")
        params.append(req.role)

    if req.is_active is not None:
        updates.append("is_active = %s")
        params.append(1 if req.is_active else 0)

    if req.new_password:
        new_hash, new_salt = hash_password(req.new_password)
        updates.append("password_hash = %s")
        params.append(new_hash)
        updates.append("salt = %s")
        params.append(new_salt)

    if updates:
        params.append(user_id)
        raw_sql = f"UPDATE plan_users SET {', '.join(updates)} WHERE id = %s;"
        cursor.execute(q(raw_sql, engine), tuple(params))
        if engine == "sqlite":
            conn.commit()

    conn.close()
    return {"success": True, "message": "Данные пользователя обновлены"}


@app.delete("/api/admin/users/{user_id}")
def delete_user(user_id: int, admin: dict = Depends(require_admin)):
    """Удаление пользователя администратором"""
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="Нельзя удалить собственную учетную запись администратора")

    conn, engine = DatabaseConnection.get_connection()
    cursor = conn.cursor()
    cursor.execute(q("DELETE FROM plan_users WHERE id = %s;", engine), (user_id,))
    if engine == "sqlite":
        conn.commit()
    conn.close()
    return {"success": True, "message": "Пользователь удален"}


# --- 3. СИНХРОНИЗАЦИЯ СМЕНЫ И РЕЙСОВ В БАЗЕ ДАННЫХ ---

@app.get("/api/shift/current")
def get_current_shift():
    """Возвращает текущую активную смену и список рейсов из базы данных"""
    conn, engine = DatabaseConnection.get_connection()
    cursor = conn.cursor()

    # Получаем последнюю активную смену
    cursor.execute("SELECT * FROM plan_shifts WHERE status = 'active' ORDER BY id DESC LIMIT 1;")
    shift = cursor.fetchone()

    shift_info = {}
    shift_id = None
    if shift:
        shift_dict = dict(shift)
        shift_id = shift_dict["id"]
        shift_info = {
            "id": shift_dict["id"],
            "date_interval": shift_dict["date_interval"],
            "dispatcher": shift_dict["dispatcher_name"],
            "status": shift_dict["status"]
        }

    # Получаем все рейсы для текущей смены
    cursor.execute("SELECT * FROM plan_flights ORDER BY sort_order ASC, departure_time ASC;")
    rows = cursor.fetchall()
    conn.close()

    flights = []
    for row in rows:
        r = dict(row)
        flights.append({
            "id": str(r.get("id", "")),
            "flight": str(r.get("flight_number") or ""),
            "flight_date": str(r.get("flight_date") or ""),
            "route_city": str(r.get("route_city") or ""),
            "route_airports": str(r.get("route_airports") or ""),
            "time": str(r.get("departure_time") or ""),
            "release_time": str(r.get("release_time") or ""),
            "ac_num": str(r.get("ac_num") or ""),
            "ac_config": str(r.get("ac_config") or ""),
            "pax": str(r.get("pax") or ""),
            "crew": str(r.get("crew") or ""),
            "fuel_block": str(r.get("fuel_block") or ""),
            "fuel_trip": str(r.get("fuel_trip") or ""),
            "fuel_taxi": str(r.get("fuel_taxi") or ""),
            "dow": str(r.get("dow") or ""),
            "doi": str(r.get("doi") or ""),
            "galley": str(r.get("galley") or "D"),
            "mtow": str(r.get("mtow") or ""),
            "lir_sent": bool(r.get("lir_sent")),
            "cargo": str(r.get("cargo") or ""),
            "mail": str(r.get("mail") or ""),
            "baggage": str(r.get("baggage") or ""),
            "szv_sent": bool(r.get("szv_sent")),
            "ldm_sent": bool(r.get("ldm_sent")),
            "astra_times_sent": bool(r.get("astra_times_sent")),
            "status": str(r.get("status") or "pending"),
            "notes": str(r.get("notes") or "")
        })

    return {"shiftInfo": shift_info if shift_info else None, "flights": flights}


@app.post("/api/shift/save")
def save_shift_state(req: SaveShiftRequest):
    """Атомарно сохраняет состояние смены и рейсов в MySQL / SQLite базе данных"""
    conn, engine = DatabaseConnection.get_connection()
    cursor = conn.cursor()
    now_str = datetime.now(MSK_TZ).isoformat()

    shift_info = req.shiftInfo or {}
    date_interval = shift_info.get("date_interval") or shift_info.get("date") or datetime.now(MSK_TZ).strftime("%d.%m.%Y")
    dispatcher = shift_info.get("dispatcher") or "Диспетчер по центровке"

    # Проверяем или создаем активную смену
    cursor.execute("SELECT id FROM plan_shifts WHERE status = 'active' ORDER BY id DESC LIMIT 1;")
    current_shift = cursor.fetchone()
    if current_shift:
        shift_id = dict(current_shift)["id"]
        cursor.execute(
            q("UPDATE plan_shifts SET date_interval = %s, dispatcher_name = %s WHERE id = %s;", engine),
            (date_interval, dispatcher, shift_id)
        )
    else:
        cursor.execute(
            q("""
            INSERT INTO plan_shifts (date_interval, dispatcher_name, started_at, status, created_at)
            VALUES (%s, %s, %s, 'active', %s);
            """, engine),
            (date_interval, dispatcher, now_str, now_str)
        )
        shift_id = cursor.lastrowid

    # Синхронизируем рейсы
    cursor.execute("DELETE FROM plan_flights;")
    for index, f in enumerate(req.flights):
        cursor.execute(
            q("""
            INSERT INTO plan_flights (
                id, shift_id, flight_number, flight_date, route_city, route_airports,
                departure_time, release_time, ac_num, ac_config, pax, crew,
                fuel_block, fuel_trip, fuel_taxi, dow, doi, galley, mtow,
                lir_sent, cargo, mail, baggage, szv_sent, ldm_sent, astra_times_sent,
                status, notes, sort_order, updated_at
            ) VALUES (
                %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s
            );
            """, engine),
            (
                str(f.get("id")),
                shift_id,
                f.get("flight") or "",
                f.get("flight_date") or "",
                f.get("route_city") or "",
                f.get("route_airports") or "",
                f.get("time") or "",
                f.get("release_time") or "",
                f.get("ac_num") or "",
                f.get("ac_config") or "",
                str(f.get("pax") or ""),
                f.get("crew") or "",
                str(f.get("fuel_block") or ""),
                str(f.get("fuel_trip") or ""),
                str(f.get("fuel_taxi") or ""),
                str(f.get("dow") or ""),
                str(f.get("doi") or ""),
                f.get("galley") or "D",
                str(f.get("mtow") or ""),
                1 if f.get("lir_sent") else 0,
                f.get("cargo") or "",
                f.get("mail") or "",
                f.get("baggage") or "",
                1 if f.get("szv_sent") else 0,
                1 if f.get("ldm_sent") else 0,
                1 if f.get("astra_times_sent") else 0,
                f.get("status") or "pending",
                f.get("notes") or "",
                index,
                now_str
            )
        )

    if engine == "sqlite":
        conn.commit()
    conn.close()
    return {"success": True, "saved_count": len(req.flights)}


# --- 4. УМНОЕ СЛИЯНИЕ РАСПИСАНИЙ (SMART MERGE) ---

@app.post("/api/shift/smart_merge")
def smart_merge_schedules(req: SmartMergeRequest):
    """
    Умное слияние нового расписания (из AviaBit или Excel) с текущим планом:
    - Для рейсов, которые УЖЕ БЫЛИ в плане: сохраняются все введенные веса, топливо,
      статусы, чекбоксы LIR/СЗВ/LDM/Времена и диспетчерские заметки.
    - Новые рейсы добавляются в план.
    """
    existing_map = {}
    for f in req.current_flights:
        key = f"{f.get('flight', '').strip().upper()}_{f.get('flight_date', '').strip()}"
        existing_map[key] = f

    merged_flights = []
    processed_keys = set()

    for inc in req.incoming_flights:
        key = f"{inc.get('flight', '').strip().upper()}_{inc.get('flight_date', '').strip()}"
        
        if key in existing_map:
            old = existing_map[key]
            merged = inc.copy()
            merged["id"] = old.get("id") or inc.get("id")
            
            merged["status"] = old.get("status") or inc.get("status") or "pending"
            merged["lir_sent"] = old.get("lir_sent", False)
            merged["szv_sent"] = old.get("szv_sent", False)
            merged["ldm_sent"] = old.get("ldm_sent", False)
            merged["astra_times_sent"] = old.get("astra_times_sent", False)
            merged["notes"] = old.get("notes") or inc.get("notes") or ""
            
            for field in ["fuel_block", "fuel_trip", "fuel_taxi", "dow", "doi", "galley", "mtow", "cargo", "mail", "baggage", "pax", "crew"]:
                if old.get(field):
                    merged[field] = old[field]

            merged_flights.append(merged)
            processed_keys.add(key)
        else:
            merged_flights.append(inc)
            processed_keys.add(key)

    for f in req.current_flights:
        key = f"{f.get('flight', '').strip().upper()}_{f.get('flight_date', '').strip()}"
        if key not in processed_keys:
            merged_flights.append(f)

    return {"flights": merged_flights, "merged_count": len(merged_flights)}


# --- 5. ПЕРЕДАЧА СМЕНЫ (HANDOVER) ---

@app.post("/api/shift/handover")
def shift_handover(req: HandoverRequest):
    """
    Фиксирует передачу смены между диспетчерами в MySQL:
    - Записывает протокол сдачи-приемки в журнал аудита
    - Опционально архивирует улетевшие закрытые рейсы
    - Обновляет имя дежурного диспетчера
    """
    conn, engine = DatabaseConnection.get_connection()
    cursor = conn.cursor()
    now_str = datetime.now(MSK_TZ).isoformat()

    cursor.execute("SELECT * FROM plan_flights ORDER BY departure_time ASC;")
    rows = cursor.fetchall()
    active_flights = [dict(r) for r in rows if r.get("status") != "closed"]

    summary_parts = []
    for f in active_flights:
        summary_parts.append(f"{f.get('flight_number')} ({f.get('departure_time')}) - {f.get('status')}")
    summary_text = "; ".join(summary_parts[:10])

    cursor.execute(
        q("""
        INSERT INTO plan_handover_logs (
            handed_over_by, accepted_by, handover_time, active_flights_count,
            transferred_flights_summary, notes
        ) VALUES (%s, %s, %s, %s, %s, %s);
        """, engine),
        (
            req.handed_over_by.strip(),
            req.accepted_by.strip(),
            now_str,
            len(active_flights),
            summary_text,
            req.notes or ""
        )
    )

    cursor.execute("SELECT id FROM plan_shifts WHERE status = 'active' ORDER BY id DESC LIMIT 1;")
    active_shift = cursor.fetchone()
    if active_shift:
        shift_id = dict(active_shift)["id"]
        cursor.execute(
            q("UPDATE plan_shifts SET dispatcher_name = %s WHERE id = %s;", engine),
            (req.accepted_by.strip(), shift_id)
        )

    if req.archive_closed_flights:
        cursor.execute("DELETE FROM plan_flights WHERE status = 'closed';")

    if engine == "sqlite":
        conn.commit()
    conn.close()

    return {
        "success": True,
        "message": f"Смена успешно передана диспетчеру {req.accepted_by}",
        "active_flights_transferred": len(active_flights),
        "handover_time": datetime.now(MSK_TZ).strftime("%d.%m.%Y %H:%M")
    }


@app.get("/api/shift/handovers")
def get_handover_history():
    """Возвращает историю передачи смен из базы данных"""
    conn, engine = DatabaseConnection.get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM plan_handover_logs ORDER BY id DESC LIMIT 20;")
    logs = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return {"handovers": logs}


# --- 6. ЗАГРУЗКА РАСПИСАНИЯ AVIABIT ---

@app.post("/api/fetch_schedule")
def fetch_schedule(req: FetchScheduleRequest):
    """
    Запрашивает суточное расписание через AviaBit (Nordwind / Икар)
    """
    try:
        dt_from = parse_date_arg(req.date_from)
        h_from, m_from = parse_time_arg(req.time_from, default_h=8, default_m=0)
        dt_to = parse_date_arg(req.date_to)
        h_to, m_to = parse_time_arg(req.time_to, default_h=14, default_m=0)

        start_dt = dt_from.replace(hour=h_from, minute=m_from, second=0, microsecond=0, tzinfo=MSK_TZ)
        end_dt = dt_to.replace(hour=h_to, minute=m_to, second=0, microsecond=0, tzinfo=MSK_TZ)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

    all_raw_flights = []
    errors = []

    # Nordwind
    if req.airline in ("both", "nordwind"):
        try:
            client_nw = AviaBitClient(base_url=BASE_URL_NORDWIND, session_filename=".session.json", name="Nordwind")
            client_nw.login()
            t_id = client_nw.get_template_id(req.filter_name)
            flights_nw = client_nw.fetch_schedule(start_dt, end_dt, template_id=t_id)
            for fl in flights_nw:
                fl["_client"] = client_nw
                all_raw_flights.append(fl)
        except Exception as e:
            errors.append(f"Ошибка Nordwind: {str(e)}")

    # Икар
    if req.airline in ("both", "ikar"):
        try:
            client_ik = AviaBitClient(base_url=BASE_URL_IKAR, session_filename=".session_ikar.json", name="Икар")
            client_ik.login()
            t_id = client_ik.get_template_id(req.filter_name)
            flights_ik = client_ik.fetch_schedule(start_dt, end_dt, template_id=t_id)
            for fl in flights_ik:
                fl["_client"] = client_ik
                all_raw_flights.append(fl)
        except Exception as e:
            errors.append(f"Ошибка Икар: {str(e)}")

    if not all_raw_flights and errors:
        raise HTTPException(status_code=502, detail="; ".join(errors))

    processed_rows = process_flights(all_raw_flights, start_dt_msk=start_dt, end_dt_msk=end_dt)

    result_flights = []
    for idx, row in enumerate(processed_rows):
        flight_no = str(row.get("flight_no", "")).strip()
        std_time = str(row.get("std", "")).strip()
        tail = str(row.get("tail", "")).strip()
        layout = str(row.get("layout", "")).strip()
        pax = str(row.get("pax_notes", "")).strip()
        crew = str(row.get("crew", "")).strip()
        route_str = str(row.get("route", "")).strip()

        city = ""
        airports = ""
        if "\n" in route_str:
            lines = route_str.split("\n")
            city = lines[0].strip()
            airports = lines[1].strip()
        else:
            airports = route_str

        flight_date = start_dt.strftime("%d.%m")
        dep_dt = row.get("dep_datetime")
        if dep_dt and hasattr(dep_dt, "strftime"):
            flight_date = dep_dt.strftime("%d.%m")

        release_t = calc_release_time_py(std_time, 40)

        result_flights.append({
            "id": f"fl_{int(datetime.now().timestamp())}_{idx}",
            "flight": flight_no,
            "flight_date": flight_date,
            "route_city": city,
            "route_airports": airports,
            "time": std_time,
            "release_time": release_t,
            "ac_num": tail,
            "ac_config": layout,
            "pax": pax,
            "crew": crew,
            "fuel_block": str(row.get("fuel_block") or ""),
            "fuel_trip": str(row.get("fuel_trip") or ""),
            "fuel_taxi": str(row.get("fuel_taxi") or ""),
            "dow": "",
            "doi": "",
            "galley": "D",
            "mtow": str(row.get("mtow") or ""),
            "lir_sent": False,
            "cargo": str(row.get("cargo") or ""),
            "mail": str(row.get("mail") or ""),
            "baggage": str(row.get("baggage") or ""),
            "szv_sent": False,
            "ldm_sent": False,
            "astra_times_sent": False,
            "status": "prepared",
            "notes": ""
        })

    return {
        "success": True,
        "count": len(result_flights),
        "flights": result_flights,
        "interval_info": f"{start_dt.strftime('%d.%m.%Y %H:%M')} — {end_dt.strftime('%d.%m.%Y %H:%M')}",
        "errors": errors if errors else None
    }


# --- 7. ЭКСПОРТ В ФОРМАТ EXCEL ЧЕРЕЗ OPENPYXL ---

@app.post("/api/export_excel")
def export_excel_endpoint(req: ExportExcelRequest):
    """
    Формирует оригинальный Excel файл суточного плана через канонический генератор openpyxl.
    """
    if not req.flights:
        raise HTTPException(status_code=400, detail="Список рейсов пуст")

    normalized_rows = []
    for f in req.flights:
        route_combined = f.get("route_airports") or ""
        if f.get("route_city"):
            route_combined = f"{f['route_city']}\n{route_combined}"

        normalized_rows.append({
            "flight_no": f.get("flight") or "",
            "route": route_combined,
            "std": f.get("time") or "",
            "tail": f.get("ac_num") or "",
            "layout": f.get("ac_config") or "",
            "pax_notes": f.get("pax") or "",
            "crew": f.get("crew") or "",
            "fuel": f.get("fuel") or f.get("fuel_block") or "",
            "fuel_block": f.get("fuel_block") or "",
            "fuel_trip": f.get("fuel_trip") or "",
            "fuel_taxi": f.get("fuel_taxi") or "",
            "mtow": f.get("mtow") or "",
            "lir": f.get("lir_sent") or f.get("lir") or "",
            "cargo": f.get("cargo") or "",
            "mail": f.get("mail") or "",
            "baggage": f.get("baggage") or "",
            "szv": f.get("szv_sent") or f.get("szv") or "",
            "ldm": f.get("ldm_sent") or f.get("ldm") or ""
        })

    date_str = ""
    if req.shift_info:
        date_str = req.shift_info.get("date_interval") or req.shift_info.get("date") or ""
    if not date_str:
        date_str = datetime.now(MSK_TZ).strftime("%d.%m.%Y")

    output_stream = io.BytesIO()
    export_to_excel(normalized_rows, output_stream, date_str)
    output_stream.seek(0)

    clean_date = "".join(c for c in date_str if c.isalnum() or c in "._-")
    filename = f"Суточный_план_Диспетчера_{clean_date}.xlsx"
    encoded_filename = urllib.parse.quote(filename)

    return StreamingResponse(
        output_stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}"
        }
    )


# --- 8. УСТАРЕВШИЕ ЭНДПОИНТЫ ДЛЯ СОВМЕСТИМОСТИ ---

@app.get("/api/get_shift")
def get_shift_legacy():
    return get_current_shift()


@app.post("/api/save_shift")
def save_shift_legacy(data: dict = Body(...)):
    req = SaveShiftRequest(shiftInfo=data.get("shiftInfo"), flights=data.get("flights", []))
    return save_shift_state(req)


if __name__ == "__main__":
    print("=" * 70)
    print("   ЗАПУСК REST API СЕРВЕРА AEROPLAN W&B (BEGET MYSQL)")
    print("   СИСТЕМА УЧЁТНЫХ ЗАПИСЕЙ: ADMIN / DISPATCHER ВКЛЮЧЕНА")
    print("=" * 70)
    uvicorn.run("api_server:app", host="127.0.0.1", port=8000, reload=False)
