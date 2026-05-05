' MicroERP Launcher
' Abre o sistema no navegador padrão
Dim oShell
Set oShell = CreateObject("WScript.Shell")
oShell.Run "https://micro-erp-production.digital", 1, False
Set oShell = Nothing
