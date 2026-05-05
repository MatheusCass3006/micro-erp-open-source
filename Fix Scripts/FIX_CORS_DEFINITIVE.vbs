Set oShell = CreateObject("WScript.Shell")

' Fix definitivo: deletar PM2 process e reiniciar sem CORS_ORIGIN cached
' O dotenv vai ler o .env correto que ja tem CORS_ORIGIN certo
Dim cmd
cmd = "cmd /c ssh -i ""C:\Users\Matheus\Downloads\microerp-key.pem"" -o StrictHostKeyChecking=no ubuntu@56.124.56.111 " & _
      """echo === DELETANDO PROCESSO PM2 ===; " & _
      "pm2 delete microerp-backend 2>&1; sleep 2; " & _
      "echo === INICIANDO BACKEND FRESH ===; " & _
      "cd /home/ubuntu/microerp/backend && " & _
      "pm2 start dist/app.js --name microerp-backend; " & _
      "pm2 save; sleep 4; " & _
      "echo === STATUS PM2 ===; pm2 list 2>&1; " & _
      "echo === CORS_ORIGIN NO PM2 ===; pm2 env 0 2>&1 | grep -i cors; " & _
      "echo === CORS_ORIGIN NO .ENV ===; grep CORS /home/ubuntu/microerp/backend/.env; " & _
      "echo === TESTE SEM ORIGIN HEADER ===; " & _
      "curl -s -X POST http://localhost:3001/api/auth/registrar " & _
      "-H 'Content-Type: application/json' " & _
      "-d '{" & Chr(34) & "nome_usuario" & Chr(34) & ":" & Chr(34) & "Matheus Teste" & Chr(34) & "," & _
      Chr(34) & "nome_empresa" & Chr(34) & ":" & Chr(34) & "Empresa Teste" & Chr(34) & "," & _
      Chr(34) & "email" & Chr(34) & ":" & Chr(34) & "matheus.cors.fix2@gmail.com" & Chr(34) & "," & _
      Chr(34) & "senha" & Chr(34) & ":" & Chr(34) & "Teste123!" & Chr(34) & "," & _
      Chr(34) & "confirmar_senha" & Chr(34) & ":" & Chr(34) & "Teste123!" & Chr(34) & "}' 2>&1; " & _
      "echo; echo === TESTE COM ORIGIN HTTPS ===; " & _
      "curl -s -X POST http://localhost:3001/api/auth/registrar " & _
      "-H 'Content-Type: application/json' " & _
      "-H 'Origin: https://micro-erp-production.digital' " & _
      "-d '{" & Chr(34) & "nome_usuario" & Chr(34) & ":" & Chr(34) & "Matheus HTTPS" & Chr(34) & "," & _
      Chr(34) & "nome_empresa" & Chr(34) & ":" & Chr(34) & "Empresa HTTPS" & Chr(34) & "," & _
      Chr(34) & "email" & Chr(34) & ":" & Chr(34) & "matheus.https.fix2@gmail.com" & Chr(34) & "," & _
      Chr(34) & "senha" & Chr(34) & ":" & Chr(34) & "Teste123!" & Chr(34) & "," & _
      Chr(34) & "confirmar_senha" & Chr(34) & ":" & Chr(34) & "Teste123!" & Chr(34) & "}' 2>&1; " & _
      "echo; echo === LOGS BACKEND ===; pm2 logs microerp-backend --lines 20 --nostream 2>&1 | tail -25"" 2>&1"

Set oExec = oShell.Exec(cmd)
Dim sOutput
Do While Not oExec.StdOut.AtEndOfStream
    sOutput = sOutput & oExec.StdOut.ReadLine() & vbCrLf
Loop

Set oFSO = CreateObject("Scripting.FileSystemObject")
Set oFile = oFSO.CreateTextFile("C:\Users\Matheus\Desktop\Site MicroERP\cors_definitive_output.txt", True)
oFile.Write sOutput
oFile.Close

MsgBox "RESULTADO:" & vbCrLf & vbCrLf & Right(sOutput, 1200), 64, "MicroERP - CORS Fix Definitivo"
