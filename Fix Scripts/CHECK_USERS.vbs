Set oShell = CreateObject("WScript.Shell")

Dim sshCmd
sshCmd = "cmd /c ssh -i ""C:\Users\Matheus\Downloads\microerp-key.pem"" -o StrictHostKeyChecking=no ubuntu@56.124.56.111 " & _
         """cat /home/ubuntu/microerp/backend/.env 2>&1 | grep -i 'admin\|user\|pass\|secret\|email' | head -20; " & _
         "echo; echo === PM2 STATUS ===; pm2 list 2>&1 | grep micro; " & _
         "echo; echo === NOTAS ENDPOINT TEST ===; curl -s -o /dev/null -w '%{http_code}' http://localhost:3001/api/notas 2>&1"" 2>&1"

Set oExec = oShell.Exec(sshCmd)
Dim sOut
Do While Not oExec.StdOut.AtEndOfStream
    sOut = sOut & oExec.StdOut.ReadLine() & vbCrLf
Loop

Set oFSO = CreateObject("Scripting.FileSystemObject")
Set oFile = oFSO.CreateTextFile("C:\Users\Matheus\Desktop\Site MicroERP\check_users_output.txt", True)
oFile.Write sOut
oFile.Close

MsgBox Left(sOut, 2000), 64, "Server Check"
