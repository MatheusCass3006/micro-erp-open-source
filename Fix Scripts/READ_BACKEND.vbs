Set oShell = CreateObject("WScript.Shell")

' Le os arquivos de auth do backend
Dim cmd
cmd = "cmd /c ssh -i ""C:\Users\Matheus\Downloads\microerp-key.pem"" -o StrictHostKeyChecking=no ubuntu@56.124.56.111 " & _
      """cat /home/ubuntu/microerp/backend/src/modules/auth/authController.ts 2>/dev/null; echo ===SEP===; cat /home/ubuntu/microerp/backend/src/modules/auth/authService.ts 2>/dev/null; echo ===SEP===; ls /home/ubuntu/microerp/backend/src/modules/auth/ 2>/dev/null"" 2>&1"

Set oExec = oShell.Exec(cmd)

Dim sOutput
Do While Not oExec.StdOut.AtEndOfStream
    sOutput = sOutput & oExec.StdOut.ReadLine() & vbCrLf
Loop

Set oFSO = CreateObject("Scripting.FileSystemObject")
Set oFile = oFSO.CreateTextFile("C:\Users\Matheus\Desktop\Site MicroERP\backend_code.txt", True)
oFile.Write sOutput
oFile.Close

MsgBox "Leitura concluida! Verifique backend_code.txt", 64, "MicroERP"
