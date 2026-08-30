#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Конфигурация подключения к базе данных MySQL и JWT аутентификации.
Считывает параметры строго из переменных окружения или локального .env файла.
"""

import os

def _load_env_file():
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip().strip("'\"")
                    if k and k not in os.environ:
                        os.environ[k] = v
        except Exception:
            pass

_load_env_file()

# Параметры подключения к MySQL (Beget / Prod)
DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_PORT = int(os.environ.get("DB_PORT", "3306"))
DB_USER = os.environ.get("DB_USER", "")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "")
DB_NAME = os.environ.get("DB_NAME", "")
DB_CHARSET = "utf8mb4"

# Секретный ключ для JWT токенов
JWT_SECRET = os.environ.get("PLAN_JWT_SECRET", "aeroplan_wb_dev_secret_local_2026")
