Set WshShell = CreateObject("WScript.Shell")
WshShell.Run chr(34) & "run.bat" & Chr(34), 0
Set WshShell = Nothing

Set WshShell = CreateObject("WScript.Shell")
WshShell.Run chr(34) & "chat-start.bat" & Chr(34), 1
