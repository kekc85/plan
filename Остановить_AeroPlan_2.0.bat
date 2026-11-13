@echo off
chcp 65001 > nul
title AeroPlan 2.0 - Завершение работы
color 0C
cls

echo ======================================================================
echo          [ AEROPLAN 2.0 : ОСТАНОВКА ЛОКАЛЬНОГО СЕРВЕРА ]
echo ======================================================================
echo.

cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }; Write-Host 'Сервер AeroPlan 2.0 (порт 8000) успешно остановлен.'"

echo.
echo ======================================================================
echo Процессы сервера завершены.
echo ======================================================================
timeout /t 2 > nul
exit
