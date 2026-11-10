' AeroPlan 2.0 - Zero-Admin Shortcut Creator
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
Set desktops = CreateObject("Scripting.Dictionary")

currentDir = fso.GetParentFolderName(WScript.ScriptFullName)
targetBat = currentDir & "\Запуск_AeroPlan_2.0.bat"
iconFile = currentDir & "\app_icon.ico"

' 1. Standard Desktop via WScript SpecialFolders
On Error Resume Next
d1 = WshShell.SpecialFolders("Desktop")
If d1 <> "" And fso.FolderExists(d1) Then desktops.Item(d1) = True

' 2. Desktop from Windows Explorer Registry
regDesktop = WshShell.RegRead("HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders\Desktop")
If regDesktop <> "" Then
    regDesktopExp = WshShell.ExpandEnvironmentStrings(regDesktop)
    If fso.FolderExists(regDesktopExp) Then desktops.Item(regDesktopExp) = True
End If

' 3. OneDrive and localized Desktop folders
userProf = WshShell.ExpandEnvironmentStrings("%USERPROFILE%")
If fso.FolderExists(userProf & "\OneDrive\Desktop") Then desktops.Item(userProf & "\OneDrive\Desktop") = True
If fso.FolderExists(userProf & "\OneDrive\Рабочий стол") Then desktops.Item(userProf & "\OneDrive\Рабочий стол") = True
If fso.FolderExists(userProf & "\Desktop") Then desktops.Item(userProf & "\Desktop") = True
If fso.FolderExists(userProf & "\Рабочий стол") Then desktops.Item(userProf & "\Рабочий стол") = True

' 4. Local application directory
desktops.Item(currentDir) = True

createdCount = 0
For Each d In desktops.Keys
    lnkPath = d & "\AeroPlan 2.0.lnk"
    Set lnk = WshShell.CreateShortcut(lnkPath)
    lnk.TargetPath = targetBat
    lnk.WorkingDirectory = currentDir
    If fso.FileExists(iconFile) Then
        lnk.IconLocation = iconFile & ",0"
    End If
    lnk.Description = "AeroPlan 2.0 - W&B, AeroBag and Loadsheet"
    lnk.Save
    WScript.Echo "[+] Shortcut created: " & lnkPath
    createdCount = createdCount + 1
Next

If createdCount > 0 Then
    WScript.Quit(0)
Else
    WScript.Quit(1)
End If
