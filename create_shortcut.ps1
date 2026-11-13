# -*- coding: utf-8 -*-
# Создание ярлыков AeroPlan 2.0 без прав администратора
$WshShell = New-Object -ComObject WScript.Shell
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$Desktop = [Environment]::GetFolderPath('Desktop')

$TargetPath = Join-Path $ScriptDir "Запуск_AeroPlan_2.0.bat"
$IconPath = Join-Path $ScriptDir "app_icon.ico"

# 1. Ярлык на Рабочем столе
$DesktopShortcutPath = Join-Path $Desktop "AeroPlan 2.0.lnk"
$Shortcut1 = $WshShell.CreateShortcut($DesktopShortcutPath)
$Shortcut1.TargetPath = $TargetPath
$Shortcut1.WorkingDirectory = $ScriptDir
$Shortcut1.IconLocation = "$IconPath,0"
$Shortcut1.Description = "AeroPlan 2.0 - Суточный план, AeroBag и Loadsheet"
$Shortcut1.Save()

# 2. Ярлык в рабочей папке
$FolderShortcutPath = Join-Path $ScriptDir "AeroPlan 2.0.lnk"
$Shortcut2 = $WshShell.CreateShortcut($FolderShortcutPath)
$Shortcut2.TargetPath = $TargetPath
$Shortcut2.WorkingDirectory = $ScriptDir
$Shortcut2.IconLocation = "$IconPath,0"
$Shortcut2.Description = "AeroPlan 2.0 - Суточный план, AeroBag и Loadsheet"
$Shortcut2.Save()

Write-Host "УСПЕХ: Ярлыки созданы на Рабочем столе и в папке программы!"
