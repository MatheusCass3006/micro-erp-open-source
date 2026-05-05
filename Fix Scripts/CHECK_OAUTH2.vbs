Set oShell = CreateObject("WScript.Shell")

Dim sshCmd
sshCmd = "cmd /c ssh -i ""C:\Users\Matheus\Downloads\microerp-key.pem"" -o StrictHostKeyChecking=no ubuntu@56.124.56.111 " & _
         """echo === FULL BACKEND ENV ===; cat /home/ubuntu/microerp/backend/.env 2>/dev/null; " & _
         "echo; echo === AUTH ROUTE REDIRECT ===; grep -rn 'redirect\|FRONTEND\|CLIENT_URL\|APP_URL\|redirect_uri' /home/ubuntu/microerp/backend/src/ 2>/dev/null | grep -v '.map' | head -30; " & _
         "echo; echo === GOOGLE STRATEGY ===; find /home/ubuntu/microerp/backend -name '*.js' -o -name '*.ts' 2>/dev/null | xargs grep -l 'google\|passport' 2>/dev/null | head -5"" 2>&1"

Set oExec = oShell.Exec(sshCmd)
Dim sOut
Do While Not oExec.StdOut.AtEndOfStream
    sOut = sOut & oExec.StdOut.ReadLine() & vbCrLf
Loop

MsgBox Left(sOut, 2000), 64, "OAuth2 Deep Check"
