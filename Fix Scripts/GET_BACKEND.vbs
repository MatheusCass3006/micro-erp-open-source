Set oShell = CreateObject("WScript.Shell")
Set oExec = oShell.Exec("cmd /c ssh -i ""C:\Users\Matheus\Downloads\microerp-key.pem"" -o StrictHostKeyChecking=no ubuntu@56.124.56.111 ""cat /home/ubuntu/microerp/backend/src/modules/auth/authRoutes.ts && echo ---SEPARATOR--- && cat /home/ubuntu/microerp/backend/src/modules/auth/authController.ts && echo ---SEPARATOR2--- && cat /home/ubuntu/microerp/backend/src/modules/auth/authService.ts"" 2>&1")

Dim sOutput
Do While Not oExec.StdOut.AtEndOfStream
    sOutput = sOutput & oExec.StdOut.ReadLine() & vbCrLf
Loop

Set oFSO = CreateObject("Scripting.FileSystemObject")
Set oFile = oFSO.CreateTextFile("C:\Users\Matheus\Desktop\Site MicroERP\backend_auth_output.txt", True)
oFile.Write sOutput
oFile.Close

MsgBox "Pronto! backend_auth_output.txt salvo.", 64, "MicroERP"
