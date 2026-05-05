Set oShell = CreateObject("WScript.Shell")
Dim KEY, SRV
KEY = """C:\Users\Matheus\Downloads\microerp-key.pem"""
SRV = "ubuntu@56.124.56.111"

Dim sshCmd
sshCmd = "cmd /c ssh -i " & KEY & " -o StrictHostKeyChecking=no " & SRV & " " & _
         """echo === googleStrategy.ts (src) ===; cat /home/ubuntu/microerp/backend/src/modules/auth/googleStrategy.ts 2>/dev/null || echo NOT_FOUND; " & _
         "echo; echo === googleStrategy.js (dist) ===; cat /home/ubuntu/microerp/backend/dist/modules/auth/googleStrategy.js 2>/dev/null | head -60; " & _
         "echo; echo === authRoutes callback section ===; cat /home/ubuntu/microerp/backend/src/modules/auth/authRoutes.ts 2>/dev/null | head -80"" 2>&1"

Set oExec = oShell.Exec(sshCmd)
Dim sOut
Do While Not oExec.StdOut.AtEndOfStream
    sOut = sOut & oExec.StdOut.ReadLine() & vbCrLf
Loop

Set oFSO = CreateObject("Scripting.FileSystemObject")
Set oFile = oFSO.CreateTextFile("C:\Users\Matheus\Desktop\Site MicroERP\google_strategy_output.txt", True)
oFile.Write sOut
oFile.Close

MsgBox "Salvo em google_strategy_output.txt", 64, "Check Done"
