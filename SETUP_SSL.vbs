Set oShell = CreateObject("WScript.Shell")

' Instala certbot e configura SSL para o dominio
Dim cmd
cmd = "cmd /c ssh -i ""C:\Users\Matheus\Downloads\microerp-key.pem"" -o StrictHostKeyChecking=no ubuntu@56.124.56.111 " & _
      """sudo apt-get update -qq && sudo apt-get install -y certbot python3-certbot-nginx 2>&1 | tail -5 && echo CERTBOT_INSTALLED && sudo certbot --nginx -d micro-erp-production.digital -d www.micro-erp-production.digital --non-interactive --agree-tos -m matheuscassalho3006@gmail.com 2>&1 && echo SSL_OK && sudo nginx -t 2>&1 && sudo systemctl reload nginx && echo NGINX_RELOADED"" 2>&1"

Set oExec = oShell.Exec(cmd)
Dim sOutput
Do While Not oExec.StdOut.AtEndOfStream
    sOutput = sOutput & oExec.StdOut.ReadLine() & vbCrLf
Loop

Set oFSO = CreateObject("Scripting.FileSystemObject")
Set oFile = oFSO.CreateTextFile("C:\Users\Matheus\Desktop\Site MicroERP\ssl_output.txt", True)
oFile.Write sOutput
oFile.Close

MsgBox "SSL setup resultado:" & vbCrLf & vbCrLf & Right(sOutput, 800), 64, "MicroERP - SSL"
