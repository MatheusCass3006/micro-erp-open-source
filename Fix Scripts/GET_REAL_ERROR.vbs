Set oShell = CreateObject("WScript.Shell")

Dim cmd
cmd = "cmd /c ssh -i ""C:\Users\Matheus\Downloads\microerp-key.pem"" -o StrictHostKeyChecking=no ubuntu@56.124.56.111 " & _
      """echo === PM2 LOGS FULL ===; pm2 logs microerp-frontend --lines 60 --nostream 2>&1; " & _
      "echo; echo === ALL PM2 LOG FILES ===; ls -la /home/ubuntu/.pm2/logs/ 2>&1; " & _
      "echo; echo === FRONTEND-3 ERROR LOG ===; cat /home/ubuntu/.pm2/logs/microerp-frontend-3-error.log 2>/dev/null | tail -30 || echo 'no id3 log'; " & _
      "echo; echo === PM2 SHOW 3 ===; pm2 show 3 2>&1; " & _
      "echo; echo === NODE VERSION ===; node --version; " & _
      "echo; echo === PACKAGE JSON ===; cat /home/ubuntu/microerp/frontend/package.json 2>/dev/null | head -20"" 2>&1"

Set oExec = oShell.Exec(cmd)
Dim sOutput
Do While Not oExec.StdOut.AtEndOfStream
    sOutput = sOutput & oExec.StdOut.ReadLine() & vbCrLf
Loop

Set oFSO = CreateObject("Scripting.FileSystemObject")
Set oFile = oFSO.CreateTextFile("C:\Users\Matheus\Desktop\Site MicroERP\real_error.txt", True)
oFile.Write sOutput
oFile.Close

MsgBox Right(sOutput, 2000), 64, "Real Error Check"
