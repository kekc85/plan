#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Лаунчер локального веб-приложения AeroPlan W&B.
Запускает сервер приложения в фоновом режиме (если еще не запущен)
и автоматически открывает веб-интерфейс в браузере по умолчанию.
"""

import sys
import os
import time
import subprocess
import urllib.request
import webbrowser

PORT = 8000
APP_URL = f"http://127.0.0.1:{PORT}/plan/"
HEALTH_URL = f"http://127.0.0.1:{PORT}/api/health"

def log(msg: str):
    try:
        log_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "launcher.log")
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {msg}\n")
    except Exception:
        pass

def is_server_running() -> bool:
    try:
        req = urllib.request.Request(HEALTH_URL, headers={"User-Agent": "AeroPlanLauncher"})
        with urllib.request.urlopen(req, timeout=1.2) as resp:
            return resp.status == 200
    except Exception:
        return False

def find_python_executable():
    current_exe = sys.executable
    if current_exe:
        base_dir = os.path.dirname(current_exe)
        pythonw = os.path.join(base_dir, "pythonw.exe")
        if os.path.exists(pythonw):
            return pythonw
        if os.path.exists(current_exe):
            return current_exe

    # Поиск в стандартных путях Windows
    local_app = os.environ.get("LOCALAPPDATA", "")
    if local_app:
        py_programs = os.path.join(local_app, "Programs", "Python")
        if os.path.isdir(py_programs):
            for entry in sorted(os.listdir(py_programs), reverse=True):
                cand_dir = os.path.join(py_programs, entry)
                pw = os.path.join(cand_dir, "pythonw.exe")
                if os.path.isfile(pw):
                    return pw
                p = os.path.join(cand_dir, "python.exe")
                if os.path.isfile(p):
                    return p

    return "python"

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(root_dir)

    log("Запуск лаунчера AeroPlan 2.0...")

    if not is_server_running():
        runner = find_python_executable()
        log(f"Сервер не запущен. Запуск через: {runner}")

        creationflags = 0
        if sys.platform == "win32":
            # DETACHED_PROCESS (0x00000008) и CREATE_NO_WINDOW (0x08000000)
            creationflags = 0x00000008 | getattr(subprocess, "CREATE_NO_WINDOW", 0x08000000)

        server_log_path = os.path.join(root_dir, "api_server.log")
        try:
            log_out = open(server_log_path, "a", encoding="utf-8")
        except Exception:
            log_out = subprocess.DEVNULL

        try:
            subprocess.Popen(
                [runner, "api_server.py"],
                cwd=root_dir,
                creationflags=creationflags,
                stdin=subprocess.DEVNULL,
                stdout=log_out,
                stderr=log_out,
                close_fds=True
            )
        except Exception as e:
            log(f"Ошибка вызова subprocess.Popen: {e}")

        # Ожидаем готовности сервера до 10 секунд (50 x 0.2с)
        started = False
        for _ in range(50):
            time.sleep(0.2)
            if is_server_running():
                started = True
                break

        if started:
            log("Сервер успешно запущен и ответил 200 OK.")
        else:
            log("Предупреждение: Сервер не ответил за 10 секунд, открываем браузер...")
    else:
        log("Сервер уже работает.")

    log(f"Открытие браузера по адресу: {APP_URL}")
    webbrowser.open(APP_URL)

if __name__ == "__main__":
    main()
