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
