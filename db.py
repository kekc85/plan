#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Модуль работы с базой данных для AeroPlan W&B.
Основной движок: MySQL / MariaDB (хостинг Beget).
Для локальной разработки без MySQL доступен автоматический fallback на SQLite.
"""

import os
import json
import hashlib
import secrets
import urllib.request
import urllib.parse
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional

from db_config import DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_CHARSET

MSK_TZ = timezone(timedelta(hours=3))

# Проверяем доступность PyMySQL
try:
    import pymysql
    import pymysql.cursors
    HAS_PYMYSQL = True
except ImportError:
    HAS_PYMYSQL = False

import sqlite3

def is_mysql_configured() -> bool:
    """Проверяет, заданы ли учетные данные MySQL"""
    return bool(HAS_PYMYSQL and DB_NAME and DB_USER)


class DatabaseConnection:
    """Менеджер соединения с базой данных (MySQL на Beget или SQLite локально)"""

    @staticmethod
    def get_connection():
        if is_mysql_configured():
            try:
                conn = pymysql.connect(
                    host=DB_HOST,
                    port=DB_PORT,
                    user=DB_USER,
                    password=DB_PASSWORD,
                    database=DB_NAME,
                    charset=DB_CHARSET,
                    cursorclass=pymysql.cursors.DictCursor,
                    autocommit=True
                )
                return conn, "mysql"
            except Exception as e:
                print(f"[DB Warning] Не удалось подключиться к MySQL ({e}). Переключение на локальный SQLite.")

        # Fallback на SQLite для локального тестирования
        sqlite_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "plan.db")
        conn = sqlite3.connect(sqlite_file)
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA synchronous=NORMAL;")
        conn.row_factory = sqlite3.Row
        return conn, "sqlite"


def hash_password(password: str, salt: str = None) -> tuple[str, str]:
    """Хеширует пароль с солью (PBKDF2-SHA256)"""
    if not salt:
        salt = secrets.token_hex(16)
    pwd_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    ).hex()
    return pwd_hash, salt


def verify_password(password: str, password_hash: str, salt: str) -> bool:
    """Проверяет соответствие пароля хешу"""
    test_hash, _ = hash_password(password, salt)
    return secrets.compare_digest(test_hash, password_hash)


def init_db():
    """Инициализирует таблицы базы данных и базовых пользователей"""
    conn, engine = DatabaseConnection.get_connection()
    cursor = conn.cursor()

    if engine == "mysql":
        # Создание таблиц MySQL на Beget
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS plan_users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(64) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            salt VARCHAR(64) NOT NULL,
            full_name VARCHAR(128) NOT NULL,
            role VARCHAR(32) NOT NULL DEFAULT 'dispatcher',
            is_active TINYINT(1) NOT NULL DEFAULT 1,
            created_at VARCHAR(64) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS plan_shifts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            date_interval VARCHAR(64) NOT NULL,
            dispatcher_name VARCHAR(128) NOT NULL,
            started_at VARCHAR(64) NOT NULL,
            closed_at VARCHAR(64) NULL,
            status VARCHAR(32) NOT NULL DEFAULT 'active',
            deleted_flights TEXT NULL,
            created_at VARCHAR(64) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS plan_flights (
            id VARCHAR(64) PRIMARY KEY,
            shift_id INT NULL,
            flight_number VARCHAR(32) NOT NULL,
            flight_date VARCHAR(16) NULL,
            route_city VARCHAR(128) NULL,
            route_airports VARCHAR(64) NULL,
            departure_time VARCHAR(16) NULL,
            release_time VARCHAR(16) NULL,
            ac_num VARCHAR(32) NULL,
            ac_type VARCHAR(16) NULL,
            ac_config VARCHAR(32) NULL,
            pax VARCHAR(32) NULL,
            crew VARCHAR(32) NULL,
            fuel_block VARCHAR(32) NULL,
            fuel_trip VARCHAR(32) NULL,
            fuel_taxi VARCHAR(32) NULL,
            dow VARCHAR(32) NULL,
            doi VARCHAR(32) NULL,
            galley VARCHAR(16) DEFAULT 'D',
            mtow VARCHAR(32) NULL,
            lir_sent TINYINT(1) DEFAULT 0,
            cargo VARCHAR(32) NULL,
            mail VARCHAR(32) NULL,
            baggage VARCHAR(255) NULL,
            szv_sent TINYINT(1) DEFAULT 0,
            ldm_sent TINYINT(1) DEFAULT 0,
            astra_times_sent TINYINT(1) DEFAULT 0,
            status VARCHAR(32) DEFAULT 'pending',
            notes TEXT NULL,
            inbound_flight VARCHAR(32) NULL,
            inbound_dep VARCHAR(16) NULL,
            inbound_takeoff_time VARCHAR(16) NULL,
            inbound_landing_calc VARCHAR(16) NULL,
            inbound_landing_time VARCHAR(16) NULL,
            outbound_takeoff_time VARCHAR(16) NULL,
            plane_status VARCHAR(32) NULL,
            sort_order INT DEFAULT 0,
            updated_at VARCHAR(64) NULL,
            updated_by VARCHAR(128) NULL,
            INDEX idx_shift (shift_id),
            INDEX idx_flight_date (flight_number, flight_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS plan_handover_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            shift_id INT NULL,
            handed_over_by VARCHAR(128) NOT NULL,
            accepted_by VARCHAR(128) NOT NULL,
            handover_time VARCHAR(64) NOT NULL,
            active_flights_count INT NOT NULL DEFAULT 0,
            transferred_flights_summary TEXT NULL,
            notes TEXT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS plan_departure_airports (
            code VARCHAR(10) PRIMARY KEY,
            city_name VARCHAR(100) NOT NULL,
            is_enabled TINYINT(1) DEFAULT 1,
            is_custom TINYINT(1) DEFAULT 0,
            sort_order INT DEFAULT 0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        cursor.execute("SELECT COUNT(*) as count FROM plan_departure_airports;")
        res_airports = cursor.fetchone()
        c_airports = res_airports["count"] if isinstance(res_airports, dict) else res_airports[0]
        if c_airports == 0:
            default_airports = [
                ('KQT', 'Бохтар', 1, 0, 1), ('VRA', 'Варадеро', 1, 0, 2), ('GOI', 'Гоа', 1, 0, 3),
                ('GOX', 'Гоа', 1, 0, 4), ('DYU', 'Душанбе', 1, 0, 5), ('ISB', 'Исламабад', 1, 0, 6),
                ('CCC', 'Кайококо', 1, 0, 7), ('CXR', 'Камрань', 1, 0, 8), ('HOG', 'Ольгин', 1, 0, 9),
                ('REN', 'Оренбург', 1, 0, 10), ('OSS', 'Ош', 1, 0, 11), ('PMW', 'Парламар', 1, 0, 12),
                ('PMV', 'Парламар', 1, 0, 13), ('ROV', 'Ростов', 1, 0, 14), ('XIY', 'Сиань', 1, 0, 15),
                ('AER', 'Сочи', 1, 0, 16), ('SUI', 'Сухум', 1, 0, 17), ('UUD', 'Улан-Удэ', 1, 0, 18),
                ('UTP', 'Утапао', 1, 0, 19), ('LBD', 'Худжант', 1, 0, 20), ('HTA', 'Чита', 1, 0, 21),
                ('SSH', 'Шарм Эль Шейх', 1, 0, 22), ('SVO', 'Москва', 1, 0, 23), ('TAS', 'Ташкент', 1, 0, 24),
                ('NMA', 'Наманган', 1, 0, 25), ('TJU', 'Куляб', 1, 0, 26), ('SKD', 'Самарканд', 1, 0, 27)
            ]
            cursor.executemany("""
            INSERT IGNORE INTO plan_departure_airports (code, city_name, is_enabled, is_custom, sort_order)
            VALUES (%s, %s, %s, %s, %s);
            """, default_airports)

        # Проверяем наличие администратора
        cursor.execute("SELECT COUNT(*) as count FROM plan_users WHERE role = 'admin';")
        res = cursor.fetchone()
        count = res["count"] if isinstance(res, dict) else res[0]
        if count == 0:
            now_str = datetime.now(MSK_TZ).isoformat()
            admin_hash, admin_salt = hash_password("admin123")
            cursor.execute("""
            INSERT INTO plan_users (username, password_hash, salt, full_name, role, is_active, created_at)
            VALUES (%s, %s, %s, %s, %s, 1, %s);
            """, ("admin", admin_hash, admin_salt, "Администратор системы", "admin", now_str))

            disp_hash, disp_salt = hash_password("dispatch123")
            cursor.execute("""
            INSERT INTO plan_users (username, password_hash, salt, full_name, role, is_active, created_at)
            VALUES (%s, %s, %s, %s, %s, 1, %s);
            """, ("dispatcher", disp_hash, disp_salt, "Диспетчер по центровке", "dispatcher", now_str))
            print("[MySQL] Созданы начальные учётные записи в MySQL на Beget")

        # Таблица системных логов и аудита ошибок
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS plan_system_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            level VARCHAR(16) NOT NULL DEFAULT 'INFO',
            module VARCHAR(32) NOT NULL DEFAULT 'system',
            message TEXT NOT NULL,
            details MEDIUMTEXT NULL,
            user_id INT NULL,
            username VARCHAR(64) NULL,
            ip_address VARCHAR(64) NULL,
            created_at VARCHAR(64) NOT NULL,
            INDEX idx_logs_created_at (created_at),
            INDEX idx_logs_level (level),
            INDEX idx_logs_module (module)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # Таблица системных настроек (например, срок хранения логов)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS plan_settings (
            setting_key VARCHAR(64) PRIMARY KEY,
            setting_value TEXT NOT NULL,
            updated_at VARCHAR(64) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # Таблица посменных архивов (авто-бэкапы при сдаче смены)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS plan_shift_archives (
            id INT AUTO_INCREMENT PRIMARY KEY,
            shift_id INT NULL,
            date_interval VARCHAR(64) NOT NULL,
            dispatcher_name VARCHAR(128) NOT NULL,
            snapshot_reason VARCHAR(64) NOT NULL DEFAULT 'handover',
            flights_count INT NOT NULL DEFAULT 0,
            flights_data MEDIUMTEXT NOT NULL,
            shift_metadata TEXT NULL,
            created_at VARCHAR(64) NOT NULL,
            INDEX idx_archives_created (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # Таблица истории правок рейсов (Flight Audit Trail)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS plan_flight_audit_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            flight_id VARCHAR(64) NOT NULL,
            flight_number VARCHAR(32) NOT NULL,
            flight_date VARCHAR(16) NULL,
            field_name VARCHAR(64) NOT NULL,
            field_label VARCHAR(64) NULL,
            old_val TEXT NULL,
            new_val TEXT NULL,
            changed_by VARCHAR(128) NOT NULL,
            user_id INT NULL,
            created_at VARCHAR(64) NOT NULL,
            INDEX idx_flight_history (flight_number, flight_date),
            INDEX idx_flight_id (flight_id),
            INDEX idx_audit_created (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # Значение по умолчанию для срока хранения логов (7 дней)
        cursor.execute("""
        INSERT IGNORE INTO plan_settings (setting_key, setting_value, updated_at)
        VALUES ('log_retention_days', '7', NOW());
        """)

        # Автомиграция: добавление колонки ac_type если ее еще нет
        try:
            cursor.execute("ALTER TABLE plan_flights ADD COLUMN ac_type VARCHAR(16) NULL AFTER ac_num;")
            conn.commit()
        except Exception:
            pass

        # Автомиграция: добавление колонки unread_changes если ее еще нет
        try:
            cursor.execute("ALTER TABLE plan_flights ADD COLUMN unread_changes TEXT NULL;")
            conn.commit()
        except Exception:
            pass

        # Автомиграция: добавление колонки deleted_flights в plan_shifts
        try:
            cursor.execute("ALTER TABLE plan_shifts ADD COLUMN deleted_flights TEXT NULL;")
            conn.commit()
        except Exception:
            pass

    else:
        # SQLite таблицы
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS plan_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            full_name TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'dispatcher',
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL
        );
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS plan_shifts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date_interval TEXT NOT NULL,
            dispatcher_name TEXT NOT NULL,
            started_at TEXT NOT NULL,
            closed_at TEXT,
            status TEXT NOT NULL DEFAULT 'active',
            deleted_flights TEXT,
            created_at TEXT NOT NULL
        );
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS plan_flights (
            id TEXT PRIMARY KEY,
            shift_id INTEGER,
            flight_number TEXT NOT NULL,
            flight_date TEXT,
            route_city TEXT,
            route_airports TEXT,
            departure_time TEXT,
            release_time TEXT,
            ac_num TEXT,
            ac_type TEXT,
            ac_config TEXT,
            pax TEXT,
            crew TEXT,
            fuel_block TEXT,
            fuel_trip TEXT,
            fuel_taxi TEXT,
            dow TEXT,
            doi TEXT,
            galley TEXT DEFAULT 'D',
            mtow TEXT,
            lir_sent INTEGER DEFAULT 0,
            cargo TEXT,
            mail TEXT,
            baggage TEXT,
            szv_sent INTEGER DEFAULT 0,
            ldm_sent INTEGER DEFAULT 0,
            astra_times_sent INTEGER DEFAULT 0,
            status TEXT DEFAULT 'pending',
            notes TEXT,
            inbound_flight TEXT,
            inbound_dep TEXT,
            inbound_takeoff_time TEXT,
            inbound_landing_calc TEXT,
            inbound_landing_time TEXT,
            outbound_takeoff_time TEXT,
            plane_status TEXT,
            unread_changes TEXT,
            sort_order INTEGER DEFAULT 0,
            updated_at TEXT,
            updated_by TEXT
        );
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS plan_handover_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            shift_id INTEGER,
            handed_over_by TEXT NOT NULL,
            accepted_by TEXT NOT NULL,
            handover_time TEXT NOT NULL,
            active_flights_count INTEGER NOT NULL DEFAULT 0,
            transferred_flights_summary TEXT,
            notes TEXT
        );
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS plan_departure_airports (
            code TEXT PRIMARY KEY,
            city_name TEXT NOT NULL,
            is_enabled INTEGER DEFAULT 1,
            is_custom INTEGER DEFAULT 0,
            sort_order INTEGER DEFAULT 0,
            updated_at TEXT
        );
        """)
        conn.commit()

        cursor.execute("SELECT COUNT(*) as count FROM plan_departure_airports;")
        res_airports = cursor.fetchone()
        c_airports = res_airports["count"] if isinstance(res_airports, sqlite3.Row) else res_airports[0]
        if c_airports == 0:
            default_airports = [
                ('KQT', 'Бохтар', 1, 0, 1), ('VRA', 'Варадеро', 1, 0, 2), ('GOI', 'Гоа', 1, 0, 3),
                ('GOX', 'Гоа', 1, 0, 4), ('DYU', 'Душанбе', 1, 0, 5), ('ISB', 'Исламабад', 1, 0, 6),
                ('CCC', 'Кайококо', 1, 0, 7), ('CXR', 'Камрань', 1, 0, 8), ('HOG', 'Ольгин', 1, 0, 9),
                ('REN', 'Оренбург', 1, 0, 10), ('OSS', 'Ош', 1, 0, 11), ('PMW', 'Парламар', 1, 0, 12),
                ('PMV', 'Парламар', 1, 0, 13), ('ROV', 'Ростов', 1, 0, 14), ('XIY', 'Сиань', 1, 0, 15),
                ('AER', 'Сочи', 1, 0, 16), ('SUI', 'Сухум', 1, 0, 17), ('UUD', 'Улан-Удэ', 1, 0, 18),
                ('UTP', 'Утапао', 1, 0, 19), ('LBD', 'Худжант', 1, 0, 20), ('HTA', 'Чита', 1, 0, 21),
                ('SSH', 'Шарм Эль Шейх', 1, 0, 22), ('SVO', 'Москва', 1, 0, 23), ('TAS', 'Ташкент', 1, 0, 24),
                ('NMA', 'Наманган', 1, 0, 25), ('TJU', 'Куляб', 1, 0, 26), ('SKD', 'Самарканд', 1, 0, 27)
            ]
            cursor.executemany("""
            INSERT OR IGNORE INTO plan_departure_airports (code, city_name, is_enabled, is_custom, sort_order)
            VALUES (?, ?, ?, ?, ?);
            """, default_airports)
            conn.commit()

        cursor.execute("SELECT COUNT(*) as count FROM plan_users WHERE role = 'admin';")
        res = cursor.fetchone()
        count = res["count"] if isinstance(res, sqlite3.Row) else res[0]
        if count == 0:
            now_str = datetime.now(MSK_TZ).isoformat()
            admin_hash, admin_salt = hash_password("admin123")
            cursor.execute("""
            INSERT INTO plan_users (username, password_hash, salt, full_name, role, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, 1, ?);
            """, ("admin", admin_hash, admin_salt, "Администратор системы", "admin", now_str))

            disp_hash, disp_salt = hash_password("dispatch123")
            cursor.execute("""
            INSERT INTO plan_users (username, password_hash, salt, full_name, role, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, 1, ?);
            """, ("dispatcher", disp_hash, disp_salt, "Диспетчер по центровке", "dispatcher", now_str))
            conn.commit()
            print("[SQLite] Созданы базовые учётные записи admin / dispatcher")

        # Таблица системных логов и аудита ошибок
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS plan_system_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            level TEXT NOT NULL DEFAULT 'INFO',
            module TEXT NOT NULL DEFAULT 'system',
            message TEXT NOT NULL,
            details TEXT,
            user_id INTEGER,
            username TEXT,
            ip_address TEXT,
            created_at TEXT NOT NULL
        );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_logs_created_at ON plan_system_logs(created_at);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_logs_level ON plan_system_logs(level);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_logs_module ON plan_system_logs(module);")

        # Таблица посменных архивов (авто-бэкапы при сдаче смены)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS plan_shift_archives (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            shift_id INTEGER,
            date_interval TEXT NOT NULL,
            dispatcher_name TEXT NOT NULL,
            snapshot_reason TEXT NOT NULL DEFAULT 'handover',
            flights_count INTEGER NOT NULL DEFAULT 0,
            flights_data TEXT NOT NULL,
            shift_metadata TEXT,
            created_at TEXT NOT NULL
        );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_archives_created ON plan_shift_archives(created_at);")

        # Таблица истории правок рейсов (Flight Audit Trail)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS plan_flight_audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            flight_id TEXT NOT NULL,
            flight_number TEXT NOT NULL,
            flight_date TEXT,
            field_name TEXT NOT NULL,
            field_label TEXT,
            old_val TEXT,
            new_val TEXT,
            changed_by TEXT NOT NULL,
            user_id INTEGER,
            created_at TEXT NOT NULL
        );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_flight_history ON plan_flight_audit_logs(flight_number, flight_date);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_flight_id ON plan_flight_audit_logs(flight_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_created ON plan_flight_audit_logs(created_at);")

        # Таблица системных настроек
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS plan_settings (
            setting_key TEXT PRIMARY KEY,
            setting_value TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        """)
        now_str = datetime.now(MSK_TZ).strftime('%Y-%m-%d %H:%M:%S')
        cursor.execute("""
        INSERT OR IGNORE INTO plan_settings (setting_key, setting_value, updated_at)
        VALUES ('log_retention_days', '7', ?);
        """, (now_str,))
        conn.commit()

        # Автомиграция: добавление колонок если их еще нет
        for col in ["ac_type", "unread_changes", "inbound_flight", "inbound_dep", "inbound_takeoff_time", "inbound_landing_calc", "inbound_landing_time", "outbound_takeoff_time", "plane_status"]:
            try:
                cursor.execute(f"ALTER TABLE plan_flights ADD COLUMN {col} TEXT;")
                conn.commit()
            except Exception:
                pass

        try:
            cursor.execute("ALTER TABLE plan_shifts ADD COLUMN deleted_flights TEXT;")
            conn.commit()
        except Exception:
            pass

    conn.close()


def get_setting(key: str, default: str = "") -> str:
    """Получает значение системной настройки из БД"""
    try:
        conn, engine = DatabaseConnection.get_connection()
        cursor = conn.cursor()
        if engine == "mysql":
            cursor.execute("SELECT setting_value FROM plan_settings WHERE setting_key = %s LIMIT 1;", (key,))
        else:
            cursor.execute("SELECT setting_value FROM plan_settings WHERE setting_key = ? LIMIT 1;", (key,))
        row = cursor.fetchone()
        conn.close()
        if row:
            return row["setting_value"] if isinstance(row, dict) else row[0]
        return default
    except Exception:
        return default


def set_setting(key: str, value: str):
    """Сохраняет значение системной настройки в БД"""
    now_str = datetime.now(MSK_TZ).strftime('%Y-%m-%d %H:%M:%S')
    conn, engine = DatabaseConnection.get_connection()
    cursor = conn.cursor()
    try:
        if engine == "mysql":
            cursor.execute("""
            INSERT INTO plan_settings (setting_key, setting_value, updated_at)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = VALUES(updated_at);
            """, (key, str(value), now_str))
            conn.commit()
        else:
            cursor.execute("""
            INSERT INTO plan_settings (setting_key, setting_value, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = excluded.updated_at;
            """, (key, str(value), now_str))
            conn.commit()
    finally:
        conn.close()


def get_log_retention_days() -> int:
    """Возвращает количество дней хранения логов (по умолчанию 7)"""
    val = get_setting("log_retention_days", "7")
    try:
        days = int(val)
        return max(1, min(365, days))
    except Exception:
        return 7


def cleanup_old_logs(days: Optional[int] = None) -> int:
    """
    Удаляет записи системных логов старше указанного количества дней (по умолчанию из настроек).
    Возвращает количество удаленных записей.
    """
    if days is None:
        days = get_log_retention_days()
    cutoff_dt = datetime.now(MSK_TZ) - timedelta(days=days)
    cutoff_str = cutoff_dt.strftime('%Y-%m-%d %H:%M:%S')
    cutoff_iso = cutoff_dt.isoformat()

    conn, engine = DatabaseConnection.get_connection()
    cursor = conn.cursor()
    deleted_count = 0
    try:
        if engine == "mysql":
            cursor.execute("""
            DELETE FROM plan_system_logs 
            WHERE created_at < %s OR created_at < %s;
            """, (cutoff_str, cutoff_iso))
            deleted_count = cursor.rowcount
            conn.commit()
        else:
            cursor.execute("""
            DELETE FROM plan_system_logs 
            WHERE created_at < ? OR created_at < ?;
            """, (cutoff_str, cutoff_iso))
            deleted_count = cursor.rowcount
            conn.commit()
    except Exception as e:
        print(f"[Log Cleanup Error] {e}")
    finally:
        conn.close()
    return deleted_count


def log_system_event(
    level: str,
    module: str,
    message: str,
    details: Optional[str] = None,
    user_id: Optional[int] = None,
    username: Optional[str] = None,
    ip_address: Optional[str] = None
):
    """
    Универсальная запись события/ошибки в таблицу plan_system_logs с автоматической ротацией.
    """
    level_clean = (level or "INFO").upper()
    module_clean = (module or "system").lower()
    now_str = datetime.now(MSK_TZ).strftime('%Y-%m-%d %H:%M:%S')

    # Конвертируем details в строку если передан словарь/список
    if details is not None and not isinstance(details, str):
        try:
            details = json.dumps(details, ensure_ascii=False, indent=2)
        except Exception:
            details = str(details)

    try:
        conn, engine = DatabaseConnection.get_connection()
        cursor = conn.cursor()
        if engine == "mysql":
            cursor.execute("""
            INSERT INTO plan_system_logs (level, module, message, details, user_id, username, ip_address, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
            """, (level_clean, module_clean, message, details, user_id, username, ip_address, now_str))
            conn.commit()
        else:
            cursor.execute("""
            INSERT INTO plan_system_logs (level, module, message, details, user_id, username, ip_address, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            """, (level_clean, module_clean, message, details, user_id, username, ip_address, now_str))
            conn.commit()
        conn.close()
    except Exception as e:
        print(f"[Logging Failure] {e} | Message: {message}")


def send_telegram_notification(text: str, category: str = "errors") -> bool:
    """
    Отправляет уведомление в Telegram бот администратора.
    Категории: 'errors', 'handover', 'aviabit'
    """
    bot_token = get_setting("tg_bot_token", "").strip()
    chat_id = get_setting("tg_chat_id", "").strip()
    if not bot_token or not chat_id:
        return False

    # Проверяем, включено ли уведомление для данной категории
    if category == "errors" and get_setting("tg_notify_errors", "1") != "1":
        return False
    if category == "handover" and get_setting("tg_notify_handover", "1") != "1":
        return False
    if category == "aviabit" and get_setting("tg_notify_aviabit", "1") != "1":
        return False

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": True
    }

    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={"Content-Type": "application/json", "User-Agent": "AeroPlan-WB-Monitor"}
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.status == 200
    except Exception as e:
        print(f"[Telegram Notification Error] {e}")
        return False


def create_shift_snapshot(
    shift_id: Optional[int],
    date_interval: str,
    dispatcher_name: str,
    reason: str,
    flights: List[dict],
    shift_metadata: Optional[dict] = None
) -> int:
    """
    Создает снимок (архивный снапшот) смены со всеми рейсами и их полями.
    Возвращает ID созданного архива.
    """
    now_str = datetime.now(MSK_TZ).strftime('%Y-%m-%d %H:%M:%S')
    flights_json = json.dumps(flights, ensure_ascii=False)
    meta_json = json.dumps(shift_metadata, ensure_ascii=False) if shift_metadata else None
    count = len(flights)

    conn, engine = DatabaseConnection.get_connection()
    cursor = conn.cursor()
    new_id = 0
    try:
        if engine == "mysql":
            cursor.execute("""
            INSERT INTO plan_shift_archives (
                shift_id, date_interval, dispatcher_name, snapshot_reason,
                flights_count, flights_data, shift_metadata, created_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
            """, (shift_id, date_interval, dispatcher_name, reason, count, flights_json, meta_json, now_str))
            new_id = cursor.lastrowid
            conn.commit()
        else:
            cursor.execute("""
            INSERT INTO plan_shift_archives (
                shift_id, date_interval, dispatcher_name, snapshot_reason,
                flights_count, flights_data, shift_metadata, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            """, (shift_id, date_interval, dispatcher_name, reason, count, flights_json, meta_json, now_str))
            new_id = cursor.lastrowid
            conn.commit()
    finally:
        conn.close()

    log_system_event(
        "INFO", "shift",
        f"Создан архивный снимок смены '{date_interval}' (причина: {reason}, рейсов: {count})",
        user_id=None, username=dispatcher_name
    )
    return new_id


def get_shift_archives(limit: int = 50, offset: int = 0) -> List[dict]:
    """Возвращает список архивных снимков смен (метаданные без тяжелого flights_data)"""
    conn, engine = DatabaseConnection.get_connection()
    cursor = conn.cursor()
    try:
        if engine == "mysql":
            cursor.execute("""
            SELECT id, shift_id, date_interval, dispatcher_name, snapshot_reason, flights_count, shift_metadata, created_at
            FROM plan_shift_archives
            ORDER BY id DESC
            LIMIT %s OFFSET %s;
            """, (limit, offset))
        else:
            cursor.execute("""
            SELECT id, shift_id, date_interval, dispatcher_name, snapshot_reason, flights_count, shift_metadata, created_at
            FROM plan_shift_archives
            ORDER BY id DESC
            LIMIT ? OFFSET ?;
            """, (limit, offset))
        rows = cursor.fetchall()
        archives = []
        for r in rows:
            d = dict(r)
            if d.get("shift_metadata"):
                try:
                    d["shift_metadata"] = json.loads(d["shift_metadata"])
                except Exception:
                    pass
            archives.append(d)
        return archives
    finally:
        conn.close()


def get_shift_archive_by_id(archive_id: int) -> Optional[dict]:
    """Возвращает детальные данные снимка смены, включая полный массив flights_data"""
    conn, engine = DatabaseConnection.get_connection()
    cursor = conn.cursor()
    try:
        if engine == "mysql":
            cursor.execute("SELECT * FROM plan_shift_archives WHERE id = %s;", (archive_id,))
        else:
            cursor.execute("SELECT * FROM plan_shift_archives WHERE id = ?;", (archive_id,))
        row = cursor.fetchone()
        if not row:
            return None
        d = dict(row)
        if d.get("flights_data"):
            try:
                d["flights_data"] = json.loads(d["flights_data"])
            except Exception:
                pass
        if d.get("shift_metadata"):
            try:
                d["shift_metadata"] = json.loads(d["shift_metadata"])
            except Exception:
                pass
        return d
    finally:
        conn.close()


def delete_shift_archive(archive_id: int) -> bool:
    """Удаляет архивный снимок по ID"""
    conn, engine = DatabaseConnection.get_connection()
    cursor = conn.cursor()
    try:
        if engine == "mysql":
            cursor.execute("DELETE FROM plan_shift_archives WHERE id = %s;", (archive_id,))
            conn.commit()
        else:
            cursor.execute("DELETE FROM plan_shift_archives WHERE id = ?;", (archive_id,))
            conn.commit()
        return True
    finally:
        conn.close()


FIELD_LABELS = {
    "flight_number": "№ Рейса",
    "flight_date": "Дата рейса",
    "departure_time": "Время вылета",
    "release_time": "Время выпуска (-40м)",
    "route_city": "Город маршрута",
    "route_airports": "Аэропорты маршрута",
    "ac_num": "Бортовой номер",
    "ac_type": "Тип ВС",
    "ac_config": "Компоновка",
    "pax": "Пассажиры (PAX)",
    "crew": "Экипаж",
    "fuel_block": "Топливо Block",
    "fuel_trip": "Топливо Trip",
    "fuel_taxi": "Топливо Taxi",
    "dow": "DOW (Сухой вес)",
    "doi": "DOI (Индекс)",
    "galley": "Кухня (Galley)",
    "mtow": "MTOW",
    "cargo": "Груз (Cargo)",
    "mail": "Почта (Mail)",
    "baggage": "Багаж",
    "lir_sent": "Чекбокс LIR",
    "szv_sent": "Чекбокс СЗВ",
    "ldm_sent": "Чекбокс LDM",
    "astra_times_sent": "Чекбокс Времена",
    "status": "Статус рейса",
    "notes": "Примечания / Заметки",
    "inbound_flight": "Прибывающий рейс",
    "inbound_takeoff_time": "Взлет входящего",
    "inbound_landing_time": "Посадка входящего",
    "outbound_takeoff_time": "Фактический вылет",
    "plane_status": "Движение борта"
}


def record_flight_change(
    flight_id: str,
    flight_number: str,
    flight_date: str,
    field_name: str,
    old_val: Any,
    new_val: Any,
    changed_by: str,
    user_id: Optional[int] = None
):
    """Фиксирует одиночное изменение поля рейса в журнале аудита plan_flight_audit_logs"""
    old_s = str(old_val).strip() if old_val is not None else ""
    new_s = str(new_val).strip() if new_val is not None else ""
    if old_s == new_s:
        return

    field_label = FIELD_LABELS.get(field_name, field_name)
    now_str = datetime.now(MSK_TZ).strftime('%Y-%m-%d %H:%M:%S')

    conn, engine = DatabaseConnection.get_connection()
    cursor = conn.cursor()
    try:
        if engine == "mysql":
            cursor.execute("""
            INSERT INTO plan_flight_audit_logs (
                flight_id, flight_number, flight_date, field_name, field_label,
                old_val, new_val, changed_by, user_id, created_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
            """, (str(flight_id), str(flight_number), str(flight_date), field_name, field_label, old_s, new_s, changed_by, user_id, now_str))
            conn.commit()
        else:
            cursor.execute("""
            INSERT INTO plan_flight_audit_logs (
                flight_id, flight_number, flight_date, field_name, field_label,
                old_val, new_val, changed_by, user_id, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (str(flight_id), str(flight_number), str(flight_date), field_name, field_label, old_s, new_s, changed_by, user_id, now_str))
            conn.commit()
    except Exception as e:
        print(f"[Flight Audit Log Error] {e}")
    finally:
        conn.close()


def record_flight_batch_changes(changes_list: List[dict]):
    """Пакетная запись изменений рейсов"""
    if not changes_list:
        return
    now_str = datetime.now(MSK_TZ).strftime('%Y-%m-%d %H:%M:%S')
    conn, engine = DatabaseConnection.get_connection()
    cursor = conn.cursor()
    try:
        for c in changes_list:
            old_s = str(c.get("old_val", "")).strip() if c.get("old_val") is not None else ""
            new_s = str(c.get("new_val", "")).strip() if c.get("new_val") is not None else ""
            if old_s == new_s:
                continue
            f_name = c.get("field_name", "")
            f_label = FIELD_LABELS.get(f_name, f_name)
            params = (
                str(c.get("flight_id", "")),
                str(c.get("flight_number", "")),
                str(c.get("flight_date", "")),
                f_name,
                f_label,
                old_s,
                new_s,
                str(c.get("changed_by", "system")),
                c.get("user_id"),
                now_str
            )
            if engine == "mysql":
                cursor.execute("""
                INSERT INTO plan_flight_audit_logs (
                    flight_id, flight_number, flight_date, field_name, field_label,
                    old_val, new_val, changed_by, user_id, created_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
                """, params)
            else:
                cursor.execute("""
                INSERT INTO plan_flight_audit_logs (
                    flight_id, flight_number, flight_date, field_name, field_label,
                    old_val, new_val, changed_by, user_id, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                """, params)
        if engine == "sqlite":
            conn.commit()
    except Exception as e:
        print(f"[Flight Batch Audit Log Error] {e}")
    finally:
        conn.close()


def get_flight_audit_history(
    flight_id: Optional[str] = None,
    flight_number: Optional[str] = None,
    flight_date: Optional[str] = None,
    limit: int = 100
) -> List[dict]:
    """Возвращает историю правок рейса по flight_id или номеру и дате рейса"""
    conn, engine = DatabaseConnection.get_connection()
    cursor = conn.cursor()
    conditions = []
    params = []

    if flight_id:
        conditions.append("flight_id = %s" if engine == "mysql" else "flight_id = ?")
        params.append(str(flight_id))
    elif flight_number:
        clean_num = flight_number.replace("-", "").replace(" ", "").upper()
        conditions.append("REPLACE(REPLACE(UPPER(flight_number), '-', ''), ' ', '') = %s" if engine == "mysql" else "REPLACE(REPLACE(UPPER(flight_number), '-', ''), ' ', '') = ?")
        params.append(clean_num)
        if flight_date:
            conditions.append("flight_date = %s" if engine == "mysql" else "flight_date = ?")
            params.append(str(flight_date).strip())

    where_sql = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    limit_clause = f"LIMIT {int(limit)}"

    try:
        sql = f"""
        SELECT id, flight_id, flight_number, flight_date, field_name, field_label,
               old_val, new_val, changed_by, user_id, created_at
        FROM plan_flight_audit_logs
        {where_sql}
        ORDER BY id DESC
        {limit_clause};
        """
        cursor.execute(sql, tuple(params))
        rows = cursor.fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def execute_query(sql_mysql: str, sql_sqlite: str, params: tuple = ()):
    """Универсальный исполнитель запросов для MySQL и SQLite"""
    conn, engine = DatabaseConnection.get_connection()
    cursor = conn.cursor()
    sql = sql_mysql if engine == "mysql" else sql_sqlite

    try:
        cursor.execute(sql, params)
        if engine == "sqlite":
            conn.commit()
        return cursor, conn, engine
    except Exception as e:
        conn.close()
        raise e


if __name__ == "__main__":
    init_db()
    print("Инициализация базы данных завершена.")


