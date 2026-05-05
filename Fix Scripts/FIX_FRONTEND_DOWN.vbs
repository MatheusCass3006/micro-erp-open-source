Set oShell = CreateObject("WScript.Shell")

Dim cmd
cmd = "cmd /c ssh -i ""C:\Users\Matheus\Downloads\microerp-key.pem"" -o StrictHostKeyChecking=no ubuntu@56.124.56.111 " & _
      """echo === STATUS PM2 ===; pm2 list 2>&1; " & _
      "echo === LOGS FRONTEND ===; pm2 logs microerp-frontend --lines 20 --nostream 2>&1 | tail -25; " & _
      "echo === REINICIANDO FRONTEND ===; pm2 restart microerp-frontend 2>&1 || " & _
      "(cd /home/ubuntu/microerp && pm2 start npm --name microerp-frontend -- start 2>&1); " & _
      "sleep 5; " & _
      "echo === STATUS APOS RESTART ===; pm2 list 2>&1; " & _
      "echo === TESTE HTTP ===; curl -s -o /dev/null -w 'HTTP_STATUS:%{http_code}' http://localhost:3000 2>&1"" 2>&1"

Set oExec = oShell.Exec(cmd)
Dim sOutput
Do While Not oExec.StdOut.AtEndOfStream
    sOutput = sOutput & oExec.StdOut.ReadLine() & vbCrLf
Loop

Set oFSO = CreateObject("Scripting.FileSystemObject")
Set oFile = oFSO.CreateTextFile("C:\Users\Matheus\Desktop\Site MicroERP\frontend_fix_output.txt", True)
oFile.Write sOutput
oFile.Close

MsgBox "RESULTADO:" & vbCrLf & Right(sOutput, 1200), 64, "MicroERP - Frontend Fix"
