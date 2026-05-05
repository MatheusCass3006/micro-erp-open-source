Set oShell = CreateObject("WScript.Shell")

Dim cmd
cmd = "cmd /c ssh -i ""C:\Users\Matheus\Downloads\microerp-key.pem"" -o StrictHostKeyChecking=no ubuntu@56.124.56.111 " & _
      """echo === PM2 STATUS ===; pm2 list 2>&1; " & _
      "echo === FRONTEND ERRORS ===; pm2 logs microerp-frontend --lines 50 --nostream 2>&1; " & _
      "echo === PORTA 3000 ===; ss -tlnp 2>/dev/null | grep 3000 || echo PORTA_NAO_OUVINDO; " & _
      "echo === .NEXT BUILD ===; ls /home/ubuntu/microerp/frontend/.next/ 2>/dev/null || echo SEM_NEXT_BUILD; " & _
      "echo === ENV FRONTEND ===; cat /home/ubuntu/microerp/frontend/.env.local 2>/dev/null; cat /home/ubuntu/microerp/frontend/.env.production 2>/dev/null; echo FIM"" 2>&1"

Set oExec = oShell.Exec(cmd)
Dim sOutput
Do While Not oExec.StdOut.AtEndOfStream
    sOutput = sOutput & oExec.StdOut.ReadLine() & vbCrLf
Loop

Set oFSO = CreateObject("Scripting.FileSystemObject")
Set oFile = oFSO.CreateTextFile("C:\Users\Matheus\Desktop\Site MicroERP\diag_output.txt", True)
oFile.Write sOutput
oFile.Close

MsgBox "DONE. Check diag_output.txt" & vbCrLf & Right(sOutput, 800), 64, "MicroERP Diag"
