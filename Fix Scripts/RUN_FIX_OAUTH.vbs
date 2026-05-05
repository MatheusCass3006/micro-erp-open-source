Set oShell = CreateObject("WScript.Shell")
Dim KEY, SRV
KEY = """C:\Users\Matheus\Downloads\microerp-key.pem"""
SRV = "ubuntu@56.124.56.111"

' Step 1: SCP the fix script
Dim scpCmd
scpCmd = "cmd /c scp -i " & KEY & " -o StrictHostKeyChecking=no " & _
         """C:\Users\Matheus\Desktop\Site MicroERP\fix_oauth.sh"" " & _
         SRV & ":/home/ubuntu/fix_oauth.sh 2>&1"

Set o1 = oShell.Exec(scpCmd)
Dim s1
Do While Not o1.StdOut.AtEndOfStream
    s1 = s1 & o1.StdOut.ReadLine() & vbCrLf
Loop

' Step 2: Run the fix script
Dim sshCmd
sshCmd = "cmd /c ssh -i " & KEY & " -o StrictHostKeyChecking=no -o ServerAliveInterval=60 " & _
         SRV & " ""chmod +x /home/ubuntu/fix_oauth.sh && bash /home/ubuntu/fix_oauth.sh"" 2>&1"

Set o2 = oShell.Exec(sshCmd)
Dim s2
Do While Not o2.StdOut.AtEndOfStream
    s2 = s2 & o2.StdOut.ReadLine() & vbCrLf
Loop

Dim sAll
sAll = "SCP: " & s1 & vbCrLf & s2

' Save output
Set oFSO = CreateObject("Scripting.FileSystemObject")
Set oFile = oFSO.CreateTextFile("C:\Users\Matheus\Desktop\Site MicroERP\run_fix_oauth_output.txt", True)
oFile.Write sAll
oFile.Close

MsgBox Right(sAll, 2000), 64, "Fix OAuth - Result"
