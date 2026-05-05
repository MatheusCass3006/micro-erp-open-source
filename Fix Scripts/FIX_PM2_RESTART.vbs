Set oShell = CreateObject("WScript.Shell")

' Deleta e recria o processo backend com as variaveis de ambiente corretas
Dim cmd
cmd = "cmd /c ssh -i ""C:\Users\Matheus\Downloads\microerp-key.pem"" -o StrictHostKeyChecking=no ubuntu@56.124.56.111 " & _
      """cd /home/ubuntu/microerp/backend && " & _
      "pm2 delete microerp-backend 2>&1; " & _
      "pm2 start dist/app.js --name microerp-backend " & _
      "--env CORS_ORIGIN='http://localhost:3000,https://micro-erp-production.digital,http://micro-erp-production.digital' " & _
      "--env NODE_ENV=production " & _
      "--env DATABASE_NAME=financeiro " & _
      "--env PORT=3001; " & _
      "pm2 save; " & _
      "sleep 3; " & _
      "echo === PM2 ENV CORS ===; pm2 env 0 2>&1 | grep CORS; " & _
      "echo === TESTE REGISTRO LOCAL ===; " & _
      "curl -s -X POST http://localhost:3001/api/auth/registrar " & _
      "-H 'Content-Type: application/json' " & _
      "-d '{""nome_usuario"":""Matheus Final"",""nome_empresa"":""Empresa Final"",""email"":""matheus.final.test@gmail.com"",""senha"":""Teste123!"",""confirmar_senha"":""Teste123!""}' 2>&1; " & _
      "echo; echo === LOGS BACKEND ===; pm2 logs microerp-backend --lines 10 --nostream 2>&1 | tail -15"" 2>&1"

Set oExec = oShell.Exec(cmd)
Dim sOutput
Do While Not oExec.StdOut.AtEndOfStream
    sOutput = sOutput & oExec.StdOut.ReadLine() & vbCrLf
Loop

Set oFSO = CreateObject("Scripting.FileSystemObject")
Set oFile = oFSO.CreateTextFile("C:\Users\Matheus\Desktop\Site MicroERP\pm2_restart_output.txt", True)
oFile.Write sOutput
oFile.Close

MsgBox Right(sOutput, 1000), 64, "MicroERP - PM2 Restart"
