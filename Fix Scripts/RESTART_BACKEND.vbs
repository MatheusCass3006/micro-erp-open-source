Set oShell = CreateObject("WScript.Shell")
Dim KEY, SRV
KEY = """C:\Users\Matheus\Downloads\microerp-key.pem"""
SRV = "ubuntu@56.124.56.111"

Dim sshCmd
sshCmd = "cmd /c ssh -i " & KEY & " -o StrictHostKeyChecking=no " & _
         SRV & " ""pm2 restart microerp-backend && sleep 2 && pm2 list | grep micro"" 2>&1"

Set o = oShell.Exec(sshCmd)
Dim r : Do While Not o.StdOut.AtEndOfStream : r = r & o.StdOut.ReadLine() & vbCrLf : Loop

MsgBox r, 64, "Backend Reiniciado"
