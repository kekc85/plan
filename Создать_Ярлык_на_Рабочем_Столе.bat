@echo off
title AeroPlan 2.0 - Shortcut Creator
color 0B
cls
cd /d "%~dp0"

cscript //nologo "create_shortcut.vbs"

if %errorlevel% equ 0 (
    color 0A
    echo.
    echo ======================================================================
    echo  [SUCCESS] Desktop shortcut 'AeroPlan 2.0' created successfully!
    echo ======================================================================
    echo.
) else (
    color 0E
    echo.
    echo ======================================================================
    echo  [NOTE] 'AeroPlan 2.0.lnk' is created in the program folder.
    echo  You can manually copy it to your Desktop.
    echo ======================================================================
    echo.
)
pause
