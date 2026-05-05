Set oShell = CreateObject("WScript.Shell")

Dim sshCmd
sshCmd = "cmd /c ssh -i ""C:\Users\Matheus\Downloads\microerp-key.pem"" -o StrictHostKeyChecking=no ubuntu@56.124.56.111 " & _
         """echo === BACKEND ENV OAUTH ===; grep -i 'google\|callback\|oauth\|frontend_url\|base_url\|app_url' /home/ubuntu/microerp/backend/.env 2>/dev/null; " & _
         "echo; echo === BACKEND AUTH ROUTES ===; grep -rn 'callback\|google' /home/ubuntu/microerp/backend/src/routes/ 2>/dev/null | head -20; " & _
         "echo; echo === NGINX REDIRECT ===; cat /etc/nginx/sites-enabled/microerp 2>/dev/null | grep -A3 'auth/google'"" 2>&1"

Set oExec = oShell.Exec(sshCmd)
Dim sOut
Do While Not oExec.StdOut.AtEndOfStream
    sOut = sOut & oExec.StdOut.ReadLine() & vbCrLf
Loop

MsgBox Left(sOut, 2000), 64, "OAuth Check"
