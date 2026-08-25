@echo off
chcp 65001 > nul
title AviaBit Schedule Parser
cd /d "%~dp0"

echo ========================================================
echo        Запуск парсера расписания AviaBit
echo ========================================================
echo.

python gui.py
if errorlevel 1 (
    echo.
    echo Графический интерфейс не смог запуститься, переключение в консольный режим...
    python parser.py
    pause
)
