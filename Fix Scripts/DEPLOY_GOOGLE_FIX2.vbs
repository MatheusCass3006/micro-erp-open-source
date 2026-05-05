Set oShell = CreateObject("WScript.Shell")
Dim KEY, SRV
KEY = """C:\Users\Matheus\Downloads\microerp-key.pem"""
SRV = "ubuntu@56.124.56.111"

' SCP AuthContext.tsx
Dim scp1
scp1 = "cmd /c scp -i " & KEY & " -o StrictHostKeyChecking=no " & _
       """C:\Users\Matheus\Desktop\Site MicroERP\financeiro-react\src\contexts\AuthContext.tsx"" " & _
       SRV & ":/tmp/AuthContext.tsx 2>&1"
Set o1 = oShell.Exec(scp1)
Dim r1 : Do While Not o1.StdOut.AtEndOfStream : r1 = r1 & o1.StdOut.ReadLine() & vbCrLf : Loop

' SCP login page
Dim scp2
scp2 = "cmd /c scp -i " & KEY & " -o StrictHostKeyChecking=no " & _
       """C:\Users\Matheus\Desktop\Site MicroERP\financeiro-react\app\(auth)\login\page.tsx"" " & _
       SRV & ":/tmp/login_page.tsx 2>&1"
Set o2 = oShell.Exec(scp2)
Dim r2 : Do While Not o2.StdOut.AtEndOfStream : r2 = r2 & o2.StdOut.ReadLine() & vbCrLf : Loop

' SCP script de deploy
Dim scp3
scp3 = "cmd /c scp -i " & KEY & " -o StrictHostKeyChecking=no " & _
       """C:\Users\Matheus\Desktop\Site MicroERP\deploy_google_fix2.sh"" " & _
       SRV & ":/home/ubuntu/deploy_google_fix2.sh 2>&1"
Set o3 = oShell.Exec(scp3)
Dim r3 : Do While Not o3.StdOut.AtEndOfStream : r3 = r3 & o3.StdOut.ReadLine() & vbCrLf : Loop

' Executa deploy via SSH
Dim sshCmd
sshCmd = "cmd /c ssh -i " & KEY & " -o StrictHostKeyChecking=no -o ServerAliveInterval=60 " & _
         SRV & " ""chmod +x /home/ubuntu/deploy_google_fix2.sh && bash /home/ubuntu/deploy_google_fix2.sh 2>&1"""

Set o4 = oShell.Exec(sshCmd)
Dim r4 : Do While Not o4.StdOut.AtEndOfStream : r4 = r4 & o4.StdOut.ReadLine() & vbCrLf : Loop

' Salva output
Set oFSO = CreateObject("Scripting.FileSystemObject")
Set oFile = oFSO.CreateTextFile("C:\Users\Matheus\Desktop\Site MicroERP\deploy_google_fix2_output.txt", True)
oFile.Write "SCP1: " & r1 & vbCrLf & "SCP2: " & r2 & vbCrLf & "SCP3: " & r3 & vbCrLf & r4
oFile.Close

MsgBox Right(r4, 1500), 64, "Deploy Google Fix 2"
