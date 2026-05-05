Set oShell = CreateObject("WScript.Shell")

' Comando SSH com heredoc para corrigir .env.local e rebuild
Dim cmd
cmd = "ssh -i ""C:\Users\Matheus\Downloads\microerp-key.pem"" -o StrictHostKeyChecking=no ubuntu@56.124.56.111 """ & _
      "echo 'NEXT_PUBLIC_USE_MOCK=false' > /home/ubuntu/microerp/frontend/.env.local && " & _
      "echo 'NEXT_PUBLIC_API_URL=https://micro-erp-production.digital' >> /home/ubuntu/microerp/frontend/.env.local && " & _
      "cat /home/ubuntu/microerp/frontend/.env.local && " & _
      "cd /home/ubuntu/microerp/frontend && npm run build 2>&1 | tail -20 && " & _
      "pm2 reload microerp-frontend --update-env && " & _
      "echo DEPLOY_OK"""

' Executa e captura saida
Set oExec = oShell.Exec("cmd /c " & cmd & " 2>&1")

Dim sOutput
Do While Not oExec.StdOut.AtEndOfStream
    sOutput = sOutput & oExec.StdOut.ReadLine() & vbCrLf
Loop

' Salva resultado
Set oFSO = CreateObject("Scripting.FileSystemObject")
Set oFile = oFSO.CreateTextFile("C:\Users\Matheus\Desktop\Site MicroERP\fix_output.txt", True)
oFile.Write sOutput
oFile.Close

MsgBox "Processo concluido! Verifique fix_output.txt" & vbCrLf & vbCrLf & Left(sOutput, 500), 64, "MicroERP Fix"
