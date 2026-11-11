@echo off
title AeroPlan 2.0
cd /d "%~dp0"

where pythonw >nul 2>nul
if %errorlevel% equ 0 (
    start "" pythonw launcher.py
    exit /b 0
)

where python >nul 2>nul
if %errorlevel% equ 0 (
    start "" python launcher.py
    exit /b 0
)

where py >nul 2>nul
if %errorlevel% equ 0 (
    start "" py -3 launcher.py
    exit /b 0
)

echo [ERROR] Python not found in PATH!
pause
exit /b 1
