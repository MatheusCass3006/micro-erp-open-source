Set oShell = CreateObject("WScript.Shell")

' Janela 1: Backend Node.js (porta 3001)
oShell.Run "cmd /k ""cd /d C:\Users\Matheus\Desktop\backend - node+type && npm run dev""", 1, False

' Aguarda 3 segundos para o backend iniciar
WScript.Sleep 3000

' Janela 2: Frontend Next.js (porta 3000)
oShell.Run "cmd /k ""cd /d C:\Users\Matheus\Desktop\Site MicroERP\financeiro-react && npm run dev""", 1, False

MsgBox "Sistema iniciado!" & Chr(13) & Chr(13) & _
       "Backend (API): http://localhost:3001" & Chr(13) & _
       "Frontend:      http://localhost:3000" & Chr(13) & Chr(13) & _
       "Aguarde os dois terminais ficarem prontos antes de abrir o navegador.", _
       64, "MicroERP"
