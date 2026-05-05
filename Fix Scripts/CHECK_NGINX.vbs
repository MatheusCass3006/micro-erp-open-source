Set oShell = CreateObject("WScript.Shell")

Dim cmd
cmd = "cmd /c ssh -i ""C:\Users\Matheus\Downloads\microerp-key.pem"" -o StrictHostKeyChecking=no ubuntu@56.124.56.111 " & _
      """echo === CURL HTTP LOCAL ===; curl -s -o /dev/null -w 'http_local:%{http_code}' http://localhost 2>&1; echo; echo === CURL FRONTEND DIRETO ===; curl -s -o /dev/null -w 'next_local:%{http_code}' http://localhost:3000 2>&1; echo; echo === CURL BACKEND ===; curl -s -o /dev/null -w 'backend:%{http_code}' http://localhost:3001/api/auth/login 2>&1; echo; echo === NGINX CONFIG SITES ===; cat /etc/nginx/sites-enabled/* 2>&1 | head -60; echo === PM2 LOGS FRONTEND ===; pm2 logs microerp-frontend --lines 20 --nostream 2>&1 | tail -25"" 2>&1"

Set oExec = oShell.Exec(cmd)
Dim sOutput
Do While Not oExec.StdOut.AtEndOfStream
    sOutput = sOutput & oExec.StdOut.ReadLine() & vbCrLf
Loop

Set oFSO = CreateObject("Scripting.FileSystemObject")
Set oFile = oFSO.CreateTextFile("C:\Users\Matheus\Desktop\Site MicroERP\nginx_status.txt", True)
oFile.Write sOutput
oFile.Close

MsgBox "Diagnostico concluido!" & vbCrLf & vbCrLf & Left(sOutput, 800), 64, "MicroERP - Nginx Check"
