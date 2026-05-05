Set oShell = CreateObject("WScript.Shell")

' SCP the test script to server
Dim scpCmd
scpCmd = "cmd /c scp -i ""C:\Users\Matheus\Downloads\microerp-key.pem"" -o StrictHostKeyChecking=no " & _
         """C:\Users\Matheus\Desktop\Site MicroERP\test_notas.sh"" ubuntu@56.124.56.111:/tmp/test_notas.sh 2>&1"
Set o1 = oShell.Exec(scpCmd)
Dim s1
Do While Not o1.StdOut.AtEndOfStream
    s1 = s1 & o1.StdOut.ReadLine() & vbCrLf
Loop

' Run the test script on server
Dim sshCmd
sshCmd = "cmd /c ssh -i ""C:\Users\Matheus\Downloads\microerp-key.pem"" -o StrictHostKeyChecking=no ubuntu@56.124.56.111 ""bash /tmp/test_notas.sh"" 2>&1"
Set o2 = oShell.Exec(sshCmd)
Dim s2
Do While Not o2.StdOut.AtEndOfStream
    s2 = s2 & o2.StdOut.ReadLine() & vbCrLf
Loop

Dim sAll
sAll = "SCP: " & s1 & vbCrLf & s2

Set oFSO = CreateObject("Scripting.FileSystemObject")
Set oFile = oFSO.CreateTextFile("C:\Users\Matheus\Desktop\Site MicroERP\notas_test_output.txt", True)
oFile.Write sAll
oFile.Close

MsgBox Left(sAll, 2000), 64, "Notas Test Result"
