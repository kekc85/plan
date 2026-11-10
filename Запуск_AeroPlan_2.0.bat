@echo off
chcp 65001 > nul
title AeroPlan 2.0 - Запуск
cd /d "%~dp0"
start "" pythonw.exe launcher.py 2>nul || start "" python.exe launcher.py
