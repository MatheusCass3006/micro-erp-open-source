Set oShell = CreateObject("WScript.Shell")

Dim cmd
cmd = "cmd /c ssh -i ""C:\Users\Matheus\Downloads\microerp-key.pem"" -o StrictHostKeyChecking=no ubuntu@56.124.56.111 " & _
      """echo === ECOSYSTEM CONFIG ===; cat /home/ubuntu/microerp/backend/ecosystem.config.js 2>/dev/null || echo NAO_EXISTE; " & _
      "echo === FORCAR UPDATE-ENV ===; pm2 restart microerp-backend --update-env; sleep 2; " & _
      "echo === CORS_ORIGIN ATUAL ===; pm2 env 0 2>&1 | grep CORS; " & _
      "echo === TESTE COM ORIGIN HEADER ===; curl -s -X POST http://localhost:3001/api/auth/registrar -H 'Content-Type: application/json' -H 'Origin: https://micro-erp-production.digital' -d '{""nome_usuario"":""Test User 2"",""nome_empresa"":""Test Empresa 2"",""email"":""test2.final@gmail.com"",""senha"":""Test123!"",""confirmar_senha"":""Test123!""}' 2>&1; " & _
      "echo; echo === TESTE SEM ORIGIN ===; curl -s -X POST http://localhost:3001/api/auth/registrar -H 'Content-Type: application/json' -d '{""nome_usuario"":""Test User 3"",""nome_empresa"":""Test 3"",""email"":""test3.noorigin@gmail.com"",""senha"":""Test123!"",""confirmar_senha"":""Test123!""}' 2>&1"" 2>&1"

Set oExec = oShell.Exec(cmd)
Dim sOutput
Do While Not oExec.StdOut.AtEndOfStream
    sOutput = sOutput & oExec.StdOut.ReadLine() & vbCrLf
Loop

Set oFSO = CreateObject("Scripting.FileSystemObject")
Set oFile = oFSO.CreateTextFile("C:\Users\Matheus\Desktop\Site MicroERP\cors_final.txt", True)
oFile.Write sOutput
oFile.Close

MsgBox Right(sOutput, 1000), 64, "MicroERP - CORS Final"
