Set oShell = CreateObject("WScript.Shell")

' Step 1: Upload fixed dashboard.service.ts
Dim scpCmd
scpCmd = "cmd /c scp -i ""C:\Users\Matheus\Downloads\microerp-key.pem"" -o StrictHostKeyChecking=no " & _
         """C:\Users\Matheus\Desktop\Site MicroERP\financeiro-react\src\services\dashboard.service.ts"" " & _
         "ubuntu@56.124.56.111:/home/ubuntu/microerp/frontend/src/services/dashboard.service.ts 2>&1"

Set oExec1 = oShell.Exec(scpCmd)
Dim sScp
Do While Not oExec1.StdOut.AtEndOfStream
    sScp = sScp & oExec1.StdOut.ReadLine() & vbCrLf
Loop

' Step 2: Build + restart frontend
Dim sshCmd
sshCmd = "cmd /c ssh -i ""C:\Users\Matheus\Downloads\microerp-key.pem"" -o StrictHostKeyChecking=no -o ServerAliveInterval=60 ubuntu@56.124.56.111 " & _
         """echo === SCP RESULT ===; echo done; " & _
         "echo; echo === STOPPING OLD PROCESS ===; pm2 delete microerp-frontend 2>&1 || echo already-deleted; " & _
         "echo; echo === BUILDING NEXT.JS ===; cd /home/ubuntu/microerp/frontend && npm run build 2>&1; " & _
         "echo; echo === BUILD EXIT CODE: $? ===; " & _
         "echo; echo === STARTING FRONTEND FORK MODE ===; pm2 start npm --name microerp-frontend -- start 2>&1; " & _
         "sleep 5; " & _
         "echo; echo === PM2 STATUS ===; pm2 list 2>&1; " & _
         "pm2 save 2>&1; " & _
         "echo; echo === PORT 3000 CHECK ===; ss -tlnp | grep 3000 || echo PORT_3000_NOT_LISTENING"" 2>&1"

Set oExec2 = oShell.Exec(sshCmd)
Dim sBuild
Do While Not oExec2.StdOut.AtEndOfStream
    sBuild = sBuild & oExec2.StdOut.ReadLine() & vbCrLf
Loop

Dim sAll
sAll = "=== SCP ===" & vbCrLf & sScp & vbCrLf & "=== BUILD/RESTART ===" & vbCrLf & sBuild

Set oFSO = CreateObject("Scripting.FileSystemObject")
Set oFile = oFSO.CreateTextFile("C:\Users\Matheus\Desktop\Site MicroERP\rebuild_output.txt", True)
oFile.Write sAll
oFile.Close

MsgBox Right(sAll, 1500), 64, "MicroERP Rebuild Result"
