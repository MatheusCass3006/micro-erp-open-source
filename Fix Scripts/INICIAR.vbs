Set oShell = CreateObject("WScript.Shell")
oShell.CurrentDirectory = "C:\Users\Matheus\Desktop\Site MicroERP\financeiro-react"
oShell.Run "cmd /k npm run dev", 1, False
