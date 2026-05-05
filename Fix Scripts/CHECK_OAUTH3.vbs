Set oShell = CreateObject("WScript.Shell")

Dim sshCmd
sshCmd = "cmd /c ssh -i ""C:\Users\Matheus\Downloads\microerp-key.pem"" -o StrictHostKeyChecking=no ubuntu@56.124.56.111 " & _
         """echo === BACKEND STRUCTURE ===; ls /home/ubuntu/microerp/backend/src/ 2>/dev/null; ls /home/ubuntu/microerp/backend/ 2>/dev/null; " & _
         "echo; echo === FIND AUTH/GOOGLE FILES ===; find /home/ubuntu/microerp/backend -name '*.js' -not -path '*/node_modules/*' | xargs grep -l 'google\|callback\|passport' 2>/dev/null | head -10; " & _
         "echo; echo === REDIRECT USAGE ===; find /home/ubuntu/microerp/backend -name '*.js' -not -path '*/node_modules/*' | xargs grep -n 'redirect\|CORS_ORIGIN\|FRONTEND' 2>/dev/null | head -20"" 2>&1"

Set oExec = oShell.Exec(sshCmd)
Dim sOut
Do While Not oExec.StdOut.AtEndOfStream
    sOut = sOut & oExec.StdOut.ReadLine() & vbCrLf
Loop

MsgBox Left(sOut, 2000), 64, "Backend Auth Code"
