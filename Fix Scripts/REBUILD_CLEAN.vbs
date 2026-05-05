Set oShell = CreateObject("WScript.Shell")

' Rebuild limpo do frontend no servidor
Dim cmd
cmd = "cmd /c ssh -i ""C:\Users\Matheus\Downloads\microerp-key.pem"" -o StrictHostKeyChecking=no ubuntu@56.124.56.111 " & _
      """cd /home/ubuntu/microerp/frontend && pm2 stop microerp-frontend && rm -rf .next && npm run build 2>&1 | tail -30 && pm2 start microerp-frontend --update-env && echo REBUILD_OK"" 2>&1"

Set oExec = oShell.Exec(cmd)
Dim sOutput
Do While Not oExec.StdOut.AtEndOfStream
    sOutput = sOutput & oExec.StdOut.ReadLine() & vbCrLf
Loop

Set oFSO = CreateObject("Scripting.FileSystemObject")
Set oFile = oFSO.CreateTextFile("C:\Users\Matheus\Desktop\Site MicroERP\rebuild_output.txt", True)
oFile.Write sOutput
oFile.Close

MsgBox "Rebuild concluido!" & vbCrLf & vbCrLf & Right(sOutput, 800), 64, "MicroERP - Rebuild"
