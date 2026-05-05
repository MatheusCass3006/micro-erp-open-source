Set oShell = CreateObject("WScript.Shell")
Dim KEY, SRV
KEY = """C:\Users\Matheus\Downloads\microerp-key.pem"""
SRV = "ubuntu@56.124.56.111"

' SCP the updated login page
Dim scpCmd
scpCmd = "cmd /c scp -i " & KEY & " -o StrictHostKeyChecking=no " & _
         """C:\Users\Matheus\Desktop\Site MicroERP\financeiro-react\app\(auth)\login\page.tsx"" " & _
         SRV & ":/home/ubuntu/microerp/frontend/app/(auth)/login/page.tsx 2>&1"

Set o1 = oShell.Exec(scpCmd)
Dim s1
Do While Not o1.StdOut.AtEndOfStream
    s1 = s1 & o1.StdOut.ReadLine() & vbCrLf
Loop

' Build + restart frontend
Dim sshCmd
sshCmd = "cmd /c ssh -i " & KEY & " -o StrictHostKeyChecking=no -o ServerAliveInterval=60 " & _
         SRV & " ""echo SCP: " & Chr(39) & s1 & Chr(39) & "; " & _
         "echo === BUILD ===; cd /home/ubuntu/microerp/frontend && npm run build 2>&1; " & _
         "echo === BUILD EXIT: $? ===; " & _
         "echo === RESTART ===; pm2 delete microerp-frontend 2>&1; pm2 start npm --name microerp-frontend -- start 2>&1; " & _
         "sleep 5; pm2 list 2>&1 | grep micro; " & _
         "echo === PORT CHECK ===; ss -tlnp | grep 3000"" 2>&1"

Set o2 = oShell.Exec(sshCmd)
Dim s2
Do While Not o2.StdOut.AtEndOfStream
    s2 = s2 & o2.StdOut.ReadLine() & vbCrLf
Loop

Set oFSO = CreateObject("Scripting.FileSystemObject")
Set oFile = oFSO.CreateTextFile("C:\Users\Matheus\Desktop\Site MicroERP\deploy_login_google_output.txt", True)
oFile.Write "SCP: " & s1 & vbCrLf & s2
oFile.Close

MsgBox Right(s2, 1500), 64, "Deploy Login Google"
