' Запуск AeroPlan W&B в тихом режиме
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
currentDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = currentDir

On Error Resume Next
WshShell.Run "pythonw.exe launcher.py", 0, False
If Err.Number <> 0 Then
    Err.Clear
    WshShell.Run "python.exe launcher.py", 0, False
End If
