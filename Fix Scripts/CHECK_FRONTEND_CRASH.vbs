Set oShell = CreateObject("WScript.Shell")

Dim cmd
cmd = "cmd /c ssh -i ""C:\Users\Matheus\Downloads\microerp-key.pem"" -o StrictHostKeyChecking=no ubuntu@56.124.56.111 " & _
      """echo === PM2 STATUS ===; pm2 list 2>&1; " & _
      "echo === FRONTEND LOGS (ultimas linhas) ===; pm2 logs microerp-frontend --lines 30 --nostream 2>&1 | tail -35; " & _
      "echo === PORTA 3000 OUVINDO? ===; ss -tlnp 2>/dev/null | grep 3000 || echo 'PORTA 3000 NAO ESTA OUVINDO'; " & _
      "echo === CURL LOCALHOST:3000 ===; curl -s -o /dev/null -w 'HTTP:%{http_code}' http://localhost:3000 2>&1; " & _
      "echo; echo === NEXT BUILD EXISTE? ===; ls -la /home/ubuntu/microerp/frontend/.next/ 2>/dev/null | head -10 || echo 'SEM PASTA .NEXT'; " & _
      "echo === PACKAGE.JSON SCRIPTS ===; cat /home/ubuntu/microerp/frontend/package.json 2>/dev/null | grep -A5 '\"scripts\"'"" 2>&1"

Set oExec = oShell.Exec(cmd)
Dim sOutput
Do While Not oExec.StdOut.AtEndOfStream
    sOutput = sOutput & oExec.StdOut.ReadLine() & vbCrLf
Loop

Set oFSO = CreateObject("Scripting.FileSystemObject")
Set oFile = oFSO.CreateTextFile("C:\Users\Matheus\Desktop\Site MicroERP\frontend_crash_log.txt", True)
oFile.Write sOutput
oFile.Close

MsgBox "LOGS:" & vbCrLf & Right(sOutput, 1500), 64, "Frontend Crash Check"
