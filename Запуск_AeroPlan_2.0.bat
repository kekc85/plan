@echo off
chcp 65001 > nul
title AeroPlan 2.0 - Запуск
cd /d "%~dp0"
start "" wscript.exe "%~dp0AeroPlan_Launch.vbs"
