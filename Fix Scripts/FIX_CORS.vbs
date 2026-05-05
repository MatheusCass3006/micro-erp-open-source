Set oShell = CreateObject("WScript.Shell")

' Le a configuracao atual do CORS
Dim cmdRead
cmdRead = "cmd /c ssh -i ""C:\Users\Matheus\Downloads\microerp-key.pem"" -o StrictHostKeyChecking=no ubuntu@56.124.56.111 " & _
          """grep -n 'origin\|cors\|CORS\|allow\|Allow' /home/ubuntu/microerp/backend/src/app.ts | head -30"" 2>&1"

Set oExec = oShell.Exec(cmdRead)
Dim sConfig
Do While Not oExec.StdOut.AtEndOfStream
    sConfig = sConfig & oExec.StdOut.ReadLine() & vbCrLf
Loop

' Aplica o fix: adiciona https ao array de origens permitidas no dist/app.js
Dim cmdFix
cmdFix = "cmd /c ssh -i ""C:\Users\Matheus\Downloads\microerp-key.pem"" -o StrictHostKeyChecking=no ubuntu@56.124.56.111 " & _
         """sed -i 's|http://micro-erp-production.digital|http://micro-erp-production.digital\x27,\x27https://micro-erp-production.digital|g' /home/ubuntu/microerp/backend/dist/app.js && " & _
         "grep 'micro-erp-production' /home/ubuntu/microerp/backend/dist/app.js | head -5 && " & _
         "pm2 restart microerp-backend && echo CORS_FIXED && " & _
         "sleep 3 && curl -s -X POST http://localhost:3001/api/auth/registrar -H 'Content-Type: application/json' -d '{""nome_usuario"":""Teste CORS"",""nome_empresa"":""Empresa CORS"",""email"":""teste.cors.fix@gmail.com"",""senha"":""Teste123!"",""confirmar_senha"":""Teste123!""}' 2>&1"" 2>&1"

Set oExec2 = oShell.Exec(cmdFix)
Dim sOutput
Do While Not oExec2.StdOut.AtEndOfStream
    sOutput = sOutput & oExec2.StdOut.ReadLine() & vbCrLf
Loop

Set oFSO = CreateObject("Scripting.FileSystemObject")
Set oFile = oFSO.CreateTextFile("C:\Users\Matheus\Desktop\Site MicroERP\cors_fix_output.txt", True)
oFile.Write "=== CORS CONFIG ===" & vbCrLf & sConfig & vbCrLf & "=== FIX OUTPUT ===" & vbCrLf & sOutput
oFile.Close

MsgBox "Fix CORS:" & vbCrLf & vbCrLf & Left(sConfig, 300) & vbCrLf & "---" & vbCrLf & Right(sOutput, 500), 64, "MicroERP - CORS Fix"
