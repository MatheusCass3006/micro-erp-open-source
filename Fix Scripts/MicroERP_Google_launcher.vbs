' MicroERP Launcher — Login direto com Google
' Abre o fluxo de autenticacao Google no navegador padrao
Dim oShell
Set oShell = CreateObject("WScript.Shell")
oShell.Run "https://micro-erp-production.digital/api/auth/google", 1, False
Set oShell = Nothing
