Set oShell = CreateObject("WScript.Shell")

Dim cmd
cmd = "cmd /c ssh -i ""C:\Users\Matheus\Downloads\microerp-key.pem"" -o StrictHostKeyChecking=no ubuntu@56.124.56.111 " & _
      """pm2 list 2>&1; echo ===; curl -sk https://micro-erp-production.digital/login -o /dev/null -w 'HTTP_STATUS:%{http_code}' 2>&1; echo ===; sudo nginx -t 2>&1; echo ===; sudo systemctl status nginx --no-pager 2>&1 | head -10"" 2>&1"

Set oExec = oShell.Exec(cmd)
Dim sOutput
Do While Not oExec.StdOut.AtEndOfStream
    sOutput = sOutput & oExec.StdOut.ReadLine() & vbCrLf
Loop

Set oFSO = CreateObject("Scripting.FileSystemObject")
Set oFile = oFSO.CreateTextFile("C:\Users\Matheus\Desktop\Site MicroERP\server_status.txt", True)
oFile.Write sOutput
oFile.Close

MsgBox "Verificacao concluida! Veja server_status.txt" & vbCrLf & vbCrLf & Left(sOutput, 600), 64, "MicroERP - Status"
