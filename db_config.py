#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Конфигурация подключения к базе данных MySQL (Beget).
Считывает параметры из переменных окружения или локального файла .env.
"""

import os

# Параметры подключения к MySQL на хостинге Beget
DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_PORT = int(os.environ.get("DB_PORT", "3306"))
DB_USER = os.environ.get("DB_USER", "")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "")
DB_NAME = os.environ.get("DB_NAME", "")
DB_CHARSET = "utf8mb4"

# Секретный ключ для JWT токенов
JWT_SECRET = os.environ.get("PLAN_JWT_SECRET", "aeroplan_wb_secret_beget_2026_andrey")
