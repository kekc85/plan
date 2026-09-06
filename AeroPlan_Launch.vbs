' Запуск AeroPlan W&B в тихом режиме без консольных окон
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
currentDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = currentDir

' Проверка доступности сервера
serverReady = False
On Error Resume Next
Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
http.setTimeouts 1000, 1000, 1000, 1000
http.Open "GET", "http://127.0.0.1:8000/api/health", False
http.Send

If Err.Number = 0 Then
    If http.Status = 200 Then
        serverReady = True
    End If
End If
Err.Clear
On Error GoTo 0

' Если сервер не запущен - запускаем его в скрытом режиме (0 = окно скрыто)
If Not serverReady Then
    WshShell.Run "pythonw.exe api_server.py", 0, False
    
    ' Ожидание готовности сервера до 5 секунд
    For i = 1 To 20
        WScript.Sleep 250
        On Error Resume Next
        Set checkHttp = CreateObject("MSXML2.ServerXMLHTTP.6.0")
        checkHttp.setTimeouts 500, 500, 500, 500
        checkHttp.Open "GET", "http://127.0.0.1:8000/api/health", False
        checkHttp.Send
        If Err.Number = 0 Then
            If checkHttp.Status = 200 Then
                serverReady = True
                Exit For
            End If
        End If
        Err.Clear
        On Error GoTo 0
    Next
End If

' Открытие веб-интерфейса в браузере по умолчанию
WshShell.Run "http://127.0.0.1:8000/plan/", 1, False
