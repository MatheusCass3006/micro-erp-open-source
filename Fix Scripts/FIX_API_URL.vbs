Set oShell = CreateObject("WScript.Shell")

' Fix NEXT_PUBLIC_API_URL (remove /api from the end), rebuild, restart
Dim sshCmd
sshCmd = "cmd /c ssh -i ""C:\Users\Matheus\Downloads\microerp-key.pem"" -o StrictHostKeyChecking=no -o ServerAliveInterval=60 ubuntu@56.124.56.111 " & _
         """echo === FIXING ENV ===; " & _
         "sed -i 's|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=https://micro-erp-production.digital|g' /home/ubuntu/microerp/frontend/.env.local; " & _
         "echo === NEW ENV CONTENT ===; cat /home/ubuntu/microerp/frontend/.env.local; " & _
         "echo; echo === STOPPING FRONTEND ===; pm2 delete microerp-frontend 2>&1; " & _
         "echo; echo === REBUILDING ===; cd /home/ubuntu/microerp/frontend && npm run build 2>&1; " & _
         "echo; echo === BUILD EXIT: $? ===; " & _
         "echo; echo === STARTING FRONTEND ===; pm2 start npm --name microerp-frontend -- start 2>&1; " & _
         "sleep 5; pm2 list 2>&1; pm2 save 2>&1; " & _
         "echo; echo === PORT 3000 ===; ss -tlnp | grep 3000 || echo NOT_LISTENING"" 2>&1"

Set oExec = oShell.Exec(sshCmd)
Dim sOutput
Do While Not oExec.StdOut.AtEndOfStream
    sOutput = sOutput & oExec.StdOut.ReadLine() & vbCrLf
Loop

Set oFSO = CreateObject("Scripting.FileSystemObject")
Set oFile = oFSO.CreateTextFile("C:\Users\Matheus\Desktop\Site MicroERP\fix_api_url_output.txt", True)
oFile.Write sOutput
oFile.Close

MsgBox Right(sOutput, 1500), 64, "Fix API URL Result"
