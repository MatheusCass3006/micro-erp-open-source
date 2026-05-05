Set oShell = CreateObject("WScript.Shell")

Dim cmd
cmd = "cmd /c ssh -i ""C:\Users\Matheus\Downloads\microerp-key.pem"" -o StrictHostKeyChecking=no ubuntu@56.124.56.111 " & _
      """echo === PM2 STATUS ===; pm2 list 2>&1; " & _
      "echo; echo === FRONTEND ERROR LOG ===; cat /home/ubuntu/.pm2/logs/microerp-frontend-error.log 2>/dev/null | tail -30; " & _
      "echo; echo === FRONTEND OUT LOG ===; cat /home/ubuntu/.pm2/logs/microerp-frontend-out.log 2>/dev/null | tail -20; " & _
      "echo; echo === PORTA 3000 ===; ss -tlnp 2>/dev/null | grep 3000 || echo PORTA_NAO_OUVINDO; " & _
      "echo; echo === ENV FRONTEND ===; cat /home/ubuntu/microerp/frontend/.env.local 2>/dev/null || cat /home/ubuntu/microerp/frontend/.env.production 2>/dev/null || echo SEM_ENV"" 2>&1"

Set oExec = oShell.Exec(cmd)
Dim sOutput
Do While Not oExec.StdOut.AtEndOfStream
    sOutput = sOutput & oExec.StdOut.ReadLine() & vbCrLf
Loop

Set oFSO = CreateObject("Scripting.FileSystemObject")
Set oFile = oFSO.CreateTextFile("C:\Users\Matheus\Desktop\Site MicroERP\logs_now.txt", True)
oFile.Write sOutput
oFile.Close

MsgBox Right(sOutput, 1500), 64, "Frontend Logs"
