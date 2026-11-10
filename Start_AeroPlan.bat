@echo off
title AeroPlan 2.0
cd /d "%~dp0"
start "" wscript.exe AeroPlan_Launch.vbs 2>nul || start "" pythonw.exe launcher.py 2>nul || start "" python.exe launcher.py
