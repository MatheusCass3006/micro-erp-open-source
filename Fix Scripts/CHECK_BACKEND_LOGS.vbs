Set oShell = CreateObject("WScript.Shell")

Dim cmd
cmd = "cmd /c ssh -i ""C:\Users\Matheus\Downloads\microerp-key.pem"" -o StrictHostKeyChecking=no ubuntu@56.124.56.111 " & _
      """pm2 logs microerp-backend --lines 30 --nostream 2>&1 | tail -40; echo ===; echo TESTANDO REGISTRO:; curl -s -X POST http://localhost:3001/api/auth/registrar -H 'Content-Type: application/json' -d '{""nome_usuario"":""Matheus Teste"",""nome_empresa"":""Empresa Teste"",""email"":""teste123abc@gmail.com"",""senha"":""Teste123!"",""confirmar_senha"":""Teste123!""}' 2>&1"" 2>&1"

Set oExec = oShell.Exec(cmd)
Dim sOutput
Do While Not oExec.StdOut.AtEndOfStream
    sOutput = sOutput & oExec.StdOut.ReadLine() & vbCrLf
Loop

Set oFSO = CreateObject("Scripting.FileSystemObject")
Set oFile = oFSO.CreateTextFile("C:\Users\Matheus\Desktop\Site MicroERP\backend_logs.txt", True)
oFile.Write sOutput
oFile.Close

MsgBox "Backend logs:" & vbCrLf & vbCrLf & Right(sOutput, 1000), 64, "MicroERP - Backend"
