Set oShell = CreateObject("WScript.Shell")
Dim BASE_DIR
BASE_DIR = "C:\Users\Matheus\Desktop\Site MicroERP\financeiro-react\src\hooks"

' Upload 3 fixed hooks
Dim scp1, scp2, scp3
scp1 = "cmd /c scp -i ""C:\Users\Matheus\Downloads\microerp-key.pem"" -o StrictHostKeyChecking=no """ & BASE_DIR & "\useNotas.ts"" ubuntu@56.124.56.111:/home/ubuntu/microerp/frontend/src/hooks/useNotas.ts 2>&1"
scp2 = "cmd /c scp -i ""C:\Users\Matheus\Downloads\microerp-key.pem"" -o StrictHostKeyChecking=no """ & BASE_DIR & "\useSaidas.ts"" ubuntu@56.124.56.111:/home/ubuntu/microerp/frontend/src/hooks/useSaidas.ts 2>&1"
scp3 = "cmd /c scp -i ""C:\Users\Matheus\Downloads\microerp-key.pem"" -o StrictHostKeyChecking=no """ & BASE_DIR & "\useEntradas.ts"" ubuntu@56.124.56.111:/home/ubuntu/microerp/frontend/src/hooks/useEntradas.ts 2>&1"

Dim o1, o2, o3, s1, s2, s3
Set o1 = oShell.Exec(scp1) : Do While Not o1.StdOut.AtEndOfStream : s1 = s1 & o1.StdOut.ReadLine() & vbCrLf : Loop
Set o2 = oShell.Exec(scp2) : Do While Not o2.StdOut.AtEndOfStream : s2 = s2 & o2.StdOut.ReadLine() & vbCrLf : Loop
Set o3 = oShell.Exec(scp3) : Do While Not o3.StdOut.AtEndOfStream : s3 = s3 & o3.StdOut.ReadLine() & vbCrLf : Loop

' Rebuild + restart
Dim sshCmd
sshCmd = "cmd /c ssh -i ""C:\Users\Matheus\Downloads\microerp-key.pem"" -o StrictHostKeyChecking=no -o ServerAliveInterval=60 ubuntu@56.124.56.111 " & _
         """echo === FILES UPLOADED ===; " & _
         "echo; echo === STOPPING ===; pm2 delete microerp-frontend 2>&1; " & _
         "echo; echo === BUILD ===; cd /home/ubuntu/microerp/frontend && npm run build 2>&1; " & _
         "echo; echo === BUILD EXIT: $? ===; " & _
         "echo; echo === START ===; pm2 start npm --name microerp-frontend -- start 2>&1; " & _
         "sleep 5; pm2 list 2>&1; pm2 save 2>&1; " & _
         "echo; echo === PORT 3000 ===; ss -tlnp | grep 3000 || echo NOT_LISTENING"" 2>&1"

Set oExec = oShell.Exec(sshCmd)
Dim sBuild
Do While Not oExec.StdOut.AtEndOfStream
    sBuild = sBuild & oExec.StdOut.ReadLine() & vbCrLf
Loop

Dim sAll
sAll = "SCP1:" & s1 & "SCP2:" & s2 & "SCP3:" & s3 & vbCrLf & sBuild

Set oFSO = CreateObject("Scripting.FileSystemObject")
Set oFile = oFSO.CreateTextFile("C:\Users\Matheus\Desktop\Site MicroERP\fix_hooks_output.txt", True)
oFile.Write sAll
oFile.Close

MsgBox Right(sAll, 1500), 64, "Fix Hooks Result"
