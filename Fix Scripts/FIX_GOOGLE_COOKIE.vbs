Set oShell = CreateObject("WScript.Shell")
Dim KEY, SRV
KEY = """C:\Users\Matheus\Downloads\microerp-key.pem"""
SRV = "ubuntu@56.124.56.111"

' SCP do script de fix
Dim scpCmd
scpCmd = "cmd /c scp -i " & KEY & " -o StrictHostKeyChecking=no " & _
         """C:\Users\Matheus\Desktop\Site MicroERP\fix_google_cookie.sh"" " & _
         SRV & ":/home/ubuntu/fix_google_cookie.sh 2>&1"

Set o1 = oShell.Exec(scpCmd)
Dim s1
Do While Not o1.StdOut.AtEndOfStream
    s1 = s1 & o1.StdOut.ReadLine() & vbCrLf
Loop

' Executa o fix
Dim sshCmd
sshCmd = "cmd /c ssh -i " & KEY & " -o StrictHostKeyChecking=no " & _
         SRV & " ""chmod +x /home/ubuntu/fix_google_cookie.sh && bash /home/ubuntu/fix_google_cookie.sh 2>&1"""

Set o2 = oShell.Exec(sshCmd)
Dim s2
Do While Not o2.StdOut.AtEndOfStream
    s2 = s2 & o2.StdOut.ReadLine() & vbCrLf
Loop

Set oFSO = CreateObject("Scripting.FileSystemObject")
Set oFile = oFSO.CreateTextFile("C:\Users\Matheus\Desktop\Site MicroERP\fix_google_cookie_output.txt", True)
oFile.Write "SCP: " & s1 & vbCrLf & s2
oFile.Close

MsgBox Right(s2, 1500), 64, "Fix Google Cookie"
