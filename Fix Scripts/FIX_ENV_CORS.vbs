Set oShell = CreateObject("WScript.Shell")

' Le o .env atual e corrige CORS_ORIGIN + verifica erro no registrar
Dim cmd
cmd = "cmd /c ssh -i ""C:\Users\Matheus\Downloads\microerp-key.pem"" -o StrictHostKeyChecking=no ubuntu@56.124.56.111 " & _
      """echo === .ENV ATUAL ===; cat /home/ubuntu/microerp/backend/.env 2>/dev/null; echo; echo === ATUALIZANDO CORS_ORIGIN ===; " & _
      "grep -v 'CORS_ORIGIN' /home/ubuntu/microerp/backend/.env > /tmp/env_temp.txt; " & _
      "echo 'CORS_ORIGIN=http://localhost:3000,https://micro-erp-production.digital,http://micro-erp-production.digital' >> /tmp/env_temp.txt; " & _
      "cp /tmp/env_temp.txt /home/ubuntu/microerp/backend/.env; " & _
      "echo === .ENV NOVO ===; cat /home/ubuntu/microerp/backend/.env; " & _
      "echo === RESTART BACKEND ===; pm2 restart microerp-backend; sleep 3; " & _
      "echo === TESTE REGISTRO ===; curl -s -X POST http://localhost:3001/api/auth/registrar -H 'Content-Type: application/json' -H 'Origin: https://micro-erp-production.digital' -d '{""nome_usuario"":""Test User"",""nome_empresa"":""Test Empresa"",""email"":""test.env.cors@gmail.com"",""senha"":""Test123!"",""confirmar_senha"":""Test123!""}' 2>&1; " & _
      "echo; echo === BACKEND LOGS RECENTES ===; pm2 logs microerp-backend --lines 15 --nostream 2>&1 | tail -20"" 2>&1"

Set oExec = oShell.Exec(cmd)
Dim sOutput
Do While Not oExec.StdOut.AtEndOfStream
    sOutput = sOutput & oExec.StdOut.ReadLine() & vbCrLf
Loop

Set oFSO = CreateObject("Scripting.FileSystemObject")
Set oFile = oFSO.CreateTextFile("C:\Users\Matheus\Desktop\Site MicroERP\env_cors_fix.txt", True)
oFile.Write sOutput
oFile.Close

MsgBox "Resultado:" & vbCrLf & vbCrLf & Right(sOutput, 900), 64, "MicroERP - Env CORS Fix"
