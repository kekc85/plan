#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Лаунчер локального веб-приложения AeroPlan WB.
Запускает сервер приложения в фоновом режиме (если еще не запущен)
и автоматически открывает браузер.
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

def is_server_running():
    try:
        req = urllib.request.Request(HEALTH_URL, headers={"User-Agent": "AeroPlanLauncher"})
        with urllib.request.urlopen(req, timeout=1.5) as resp:
            return resp.status == 200
    except Exception:
        return False

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(root_dir)

    if not is_server_running():
        python_exe = sys.executable
        pythonw_candidate = os.path.join(os.path.dirname(python_exe), "pythonw.exe")
        runner = pythonw_candidate if os.path.exists(pythonw_candidate) else python_exe

        flags = getattr(subprocess, "CREATE_NO_WINDOW", 0)
        subprocess.Popen(
            [runner, "api_server.py"],
            cwd=root_dir,
            creationflags=flags
        )

        # Ожидаем готовности сервера до 6 секунд
        for _ in range(30):
            time.sleep(0.2)
            if is_server_running():
                break

    # Открываем интерфейс в браузере по умолчанию
    webbrowser.open(APP_URL)

if __name__ == "__main__":
    main()
