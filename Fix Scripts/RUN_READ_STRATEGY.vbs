Set oShell = CreateObject("WScript.Shell")
Dim KEY, SRV
KEY = """C:\Users\Matheus\Downloads\microerp-key.pem"""
SRV = "ubuntu@56.124.56.111"

Dim scpCmd
scpCmd = "cmd /c scp -i " & KEY & " -o StrictHostKeyChecking=no " & _
         """C:\Users\Matheus\Desktop\Site MicroERP\read_strategy.sh"" " & _
         SRV & ":/home/ubuntu/read_strategy.sh 2>&1"
Set o1 = oShell.Exec(scpCmd)
Do While Not o1.StdOut.AtEndOfStream : o1.StdOut.ReadLine() : Loop

Dim sshCmd
sshCmd = "cmd /c ssh -i " & KEY & " -o StrictHostKeyChecking=no " & _
         SRV & " ""bash /home/ubuntu/read_strategy.sh"" 2>&1"
Set o2 = oShell.Exec(sshCmd)
Dim sOut
Do While Not o2.StdOut.AtEndOfStream
    sOut = sOut & o2.StdOut.ReadLine() & vbCrLf
Loop

Set oFSO = CreateObject("Scripting.FileSystemObject")
Set oFile = oFSO.CreateTextFile("C:\Users\Matheus\Desktop\Site MicroERP\strategy_output.txt", True)
oFile.Write sOut
oFile.Close

MsgBox "Salvo em strategy_output.txt", 64, "Done"
