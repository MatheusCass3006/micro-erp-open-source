Set oShell = CreateObject("WScript.Shell")
Dim KEY, SRV
KEY = """C:\Users\Matheus\Downloads\microerp-key.pem"""
SRV = "ubuntu@56.124.56.111"

Dim BASE
BASE = "C:\Users\Matheus\Desktop\Site MicroERP\financeiro-react"

' SCP service worker
Dim scp1
scp1 = "cmd /c scp -i " & KEY & " -o StrictHostKeyChecking=no " & _
       """" & BASE & "\public\sw.js"" " & _
       SRV & ":/tmp/sw.js 2>&1"
Set o1 = oShell.Exec(scp1)
Dim r1 : Do While Not o1.StdOut.AtEndOfStream : r1 = r1 & o1.StdOut.ReadLine() & vbCrLf : Loop

' SCP layout.tsx
Dim scp2
scp2 = "cmd /c scp -i " & KEY & " -o StrictHostKeyChecking=no " & _
       """" & BASE & "\app\layout.tsx"" " & _
       SRV & ":/tmp/layout_tsx 2>&1"
Set o2 = oShell.Exec(scp2)
Dim r2 : Do While Not o2.StdOut.AtEndOfStream : r2 = r2 & o2.StdOut.ReadLine() & vbCrLf : Loop

' SCP manifest.json
Dim scp3
scp3 = "cmd /c scp -i " & KEY & " -o StrictHostKeyChecking=no " & _
       """" & BASE & "\public\manifest.json"" " & _
       SRV & ":/tmp/manifest.json 2>&1"
Set o3 = oShell.Exec(scp3)
Dim r3 : Do While Not o3.StdOut.AtEndOfStream : r3 = r3 & o3.StdOut.ReadLine() & vbCrLf : Loop

' SCP icon 192
Dim scp4
scp4 = "cmd /c scp -i " & KEY & " -o StrictHostKeyChecking=no " & _
       """" & BASE & "\public\icon-192x192.png"" " & _
       SRV & ":/tmp/icon-192.png 2>&1"
Set o4 = oShell.Exec(scp4)
Dim r4 : Do While Not o4.StdOut.AtEndOfStream : r4 = r4 & o4.StdOut.ReadLine() & vbCrLf : Loop

' SCP icon 512
Dim scp5
scp5 = "cmd /c scp -i " & KEY & " -o StrictHostKeyChecking=no " & _
       """" & BASE & "\public\icon-512x512.png"" " & _
       SRV & ":/tmp/icon-512.png 2>&1"
Set o5 = oShell.Exec(scp5)
Dim r5 : Do While Not o5.StdOut.AtEndOfStream : r5 = r5 & o5.StdOut.ReadLine() & vbCrLf : Loop

' SCP script de deploy
Dim scp6
scp6 = "cmd /c scp -i " & KEY & " -o StrictHostKeyChecking=no " & _
       """C:\Users\Matheus\Desktop\Site MicroERP\deploy_pwa.sh"" " & _
       SRV & ":/home/ubuntu/deploy_pwa.sh 2>&1"
Set o6 = oShell.Exec(scp6)
Dim r6 : Do While Not o6.StdOut.AtEndOfStream : r6 = r6 & o6.StdOut.ReadLine() & vbCrLf : Loop

' Executa deploy via SSH
Dim sshCmd
sshCmd = "cmd /c ssh -i " & KEY & " -o StrictHostKeyChecking=no -o ServerAliveInterval=60 " & _
         SRV & " ""chmod +x /home/ubuntu/deploy_pwa.sh && bash /home/ubuntu/deploy_pwa.sh 2>&1"""

Set o7 = oShell.Exec(sshCmd)
Dim r7 : Do While Not o7.StdOut.AtEndOfStream : r7 = r7 & o7.StdOut.ReadLine() & vbCrLf : Loop

' Salva output
Set oFSO = CreateObject("Scripting.FileSystemObject")
Set oFile = oFSO.CreateTextFile("C:\Users\Matheus\Desktop\Site MicroERP\deploy_pwa_output.txt", True)
oFile.Write "SCP1(sw.js): " & r1 & vbCrLf & _
            "SCP2(layout): " & r2 & vbCrLf & _
            "SCP3(manifest): " & r3 & vbCrLf & _
            "SCP4(icon192): " & r4 & vbCrLf & _
            "SCP5(icon512): " & r5 & vbCrLf & _
            "SCP6(script): " & r6 & vbCrLf & r7
oFile.Close

MsgBox Right(r7, 1500), 64, "Deploy PWA"
