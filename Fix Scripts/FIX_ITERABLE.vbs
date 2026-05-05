Set oShell = CreateObject("WScript.Shell")
Dim KEY
KEY = """C:\Users\Matheus\Downloads\microerp-key.pem"""
Dim SRV
SRV = "ubuntu@56.124.56.111"
Dim BASE_LOCAL
BASE_LOCAL = "C:\Users\Matheus\Desktop\Site MicroERP\financeiro-react"
Dim BASE_REMOTE
BASE_REMOTE = "/home/ubuntu/microerp/frontend"

' SCP 3 files
Dim scp1, scp2, scp3
scp1 = "cmd /c scp -i " & KEY & " -o StrictHostKeyChecking=no """ & BASE_LOCAL & "\src\hooks\useBoletos.ts"" " & SRV & ":" & BASE_REMOTE & "/src/hooks/useBoletos.ts 2>&1"
scp2 = "cmd /c scp -i " & KEY & " -o StrictHostKeyChecking=no """ & BASE_LOCAL & "\src\hooks\useMaquininhas.ts"" " & SRV & ":" & BASE_REMOTE & "/src/hooks/useMaquininhas.ts 2>&1"
scp3 = "cmd /c scp -i " & KEY & " -o StrictHostKeyChecking=no """ & BASE_LOCAL & "\app\(dashboard)\estoque\page.tsx"" " & SRV & ":" & BASE_REMOTE & "/app/(dashboard)/estoque/page.tsx 2>&1"

Dim o1, o2, o3, s1, s2, s3
Set o1 = oShell.Exec(scp1) : Do While Not o1.StdOut.AtEndOfStream : s1 = s1 & o1.StdOut.ReadLine() & vbCrLf : Loop
Set o2 = oShell.Exec(scp2) : Do While Not o2.StdOut.AtEndOfStream : s2 = s2 & o2.StdOut.ReadLine() & vbCrLf : Loop
Set o3 = oShell.Exec(scp3) : Do While Not o3.StdOut.AtEndOfStream : s3 = s3 & o3.StdOut.ReadLine() & vbCrLf : Loop

' Rebuild + restart
Dim sshCmd
sshCmd = "cmd /c ssh -i " & KEY & " -o StrictHostKeyChecking=no -o ServerAliveInterval=60 " & SRV & " " & _
         """echo === UPLOADED ===; " & _
         "echo; echo === BUILD ===; cd " & BASE_REMOTE & " && npm run build 2>&1; " & _
         "echo; echo === BUILD EXIT: $? ===; " & _
         "echo; echo === RESTART ===; pm2 delete microerp-frontend 2>&1; pm2 start npm --name microerp-frontend -- start 2>&1; " & _
         "sleep 5; pm2 list 2>&1 | grep micro; pm2 save 2>&1; " & _
         "echo; echo === PORT 3000 ===; ss -tlnp | grep 3000 || echo NOT_LISTENING"" 2>&1"

Set oExec = oShell.Exec(sshCmd)
Dim sBuild
Do While Not oExec.StdOut.AtEndOfStream
    sBuild = sBuild & oExec.StdOut.ReadLine() & vbCrLf
Loop

Dim sAll
sAll = "SCP1:" & s1 & "SCP2:" & s2 & "SCP3:" & s3 & vbCrLf & sBuild

Set oFSO = CreateObject("Scripting.FileSystemObject")
Set oFile = oFSO.CreateTextFile("C:\Users\Matheus\Desktop\Site MicroERP\fix_iterable_output.txt", True)
oFile.Write sAll
oFile.Close

MsgBox Right(sAll, 1500), 64, "Fix Iterable Result"
