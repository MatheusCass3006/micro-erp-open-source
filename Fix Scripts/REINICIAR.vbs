Set oShell = CreateObject("WScript.Shell")

' Fechar instâncias anteriores do npm (Next.js)
oShell.Run "taskkill /F /IM node.exe", 0, True

' Aguardar 2 segundos
WScript.Sleep 2000

' Iniciar o servidor novamente
oShell.CurrentDirectory = "C:\Users\Matheus\Desktop\Site MicroERP\financeiro-react"
oShell.Run "cmd /k npm run dev", 1, False
