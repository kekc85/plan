#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Модуль аутентификации и работы с JWT токенами для AeroPlan W&B.
"""

import os
import hmac
import hashlib
import base64
import json
import time
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, Depends
from db import DatabaseConnection
from db_config import JWT_SECRET

TOKEN_EXPIRY_SECONDS = 7 * 24 * 3600  # Токен действителен 7 дней


def base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')


def base64url_decode(data: str) -> bytes:
    padding = '=' * (4 - (len(data) % 4)) if len(data) % 4 != 0 else ''
    return base64.urlsafe_b64decode(data + padding)


def create_jwt_token(payload: Dict[str, Any]) -> str:
    """Создает подписанный JWT токен"""
    header = {"alg": "HS256", "typ": "JWT"}
    payload_copy = payload.copy()
    payload_copy["exp"] = int(time.time()) + TOKEN_EXPIRY_SECONDS
    payload_copy["iat"] = int(time.time())

    encoded_header = base64url_encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
    encoded_payload = base64url_encode(json.dumps(payload_copy, separators=(',', ':')).encode('utf-8'))

    signature_base = f"{encoded_header}.{encoded_payload}".encode('utf-8')
    signature = hmac.new(JWT_SECRET.encode('utf-8'), signature_base, hashlib.sha256).digest()
    encoded_signature = base64url_encode(signature)

    return f"{encoded_header}.{encoded_payload}.{encoded_signature}"


def verify_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    """Проверяет подпись и срок действия JWT токена"""
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None

        encoded_header, encoded_payload, encoded_signature = parts
        signature_base = f"{encoded_header}.{encoded_payload}".encode('utf-8')
        expected_signature = hmac.new(JWT_SECRET.encode('utf-8'), signature_base, hashlib.sha256).digest()

        if not hmac.compare_digest(base64url_encode(expected_signature), encoded_signature):
            return None

        payload_bytes = base64url_decode(encoded_payload)
        payload = json.loads(payload_bytes.decode('utf-8'))

        if payload.get("exp", 0) < time.time():
            return None

        return payload
    except Exception:
        return None


def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Зависимость FastAPI для извлечения текущего аутентифицированного пользователя"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Требуется авторизация")

    token = authorization[len("Bearer "):].strip()
    payload = verify_jwt_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Недействительный или истекший токен сессии")

    user_id = payload.get("user_id")
    conn, engine = DatabaseConnection.get_connection()
    cursor = conn.cursor()

    if engine == "mysql":
        cursor.execute("SELECT id, username, full_name, role, is_active FROM plan_users WHERE id = %s;", (user_id,))
    else:
        cursor.execute("SELECT id, username, full_name, role, is_active FROM plan_users WHERE id = ?;", (user_id,))
    
    user = cursor.fetchone()
    conn.close()

    if not user:
        raise HTTPException(status_code=401, detail="Пользователь не найден")

    user_dict = dict(user)
    if not user_dict.get("is_active"):
        raise HTTPException(status_code=401, detail="Учетная запись отключена или удалена")

    return user_dict


def require_admin(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Зависимость FastAPI для проверки прав администратора"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Доступ разрешен только Администратору")
    return current_user
