Set oShell = CreateObject("WScript.Shell")
Dim KEY
KEY = """C:\Users\Matheus\Downloads\microerp-key.pem"""
Dim SRV
SRV = "ubuntu@56.124.56.111"

Dim sshCmd
sshCmd = "cmd /c ssh -i " & KEY & " -o StrictHostKeyChecking=no -o ServerAliveInterval=60 " & SRV & " " & _
         """echo === STEP 1: ADD FRONTEND_URL TO ENV ===; " & _
         "grep -q 'FRONTEND_URL' /home/ubuntu/microerp/backend/.env && echo 'FRONTEND_URL already exists' || echo 'FRONTEND_URL=https://micro-erp-production.digital' >> /home/ubuntu/microerp/backend/.env; " & _
         "grep 'FRONTEND_URL' /home/ubuntu/microerp/backend/.env; " & _
         "echo; echo === STEP 2: PATCH authRoutes.js (dist) ===; " & _
         "cp /home/ubuntu/microerp/backend/dist/modules/auth/authRoutes.js /home/ubuntu/microerp/backend/dist/modules/auth/authRoutes.js.bak; " & _
         "sed -i 's/res\.redirect(process\.env\.CORS_ORIGIN/res.redirect(process.env.FRONTEND_URL/g' /home/ubuntu/microerp/backend/dist/modules/auth/authRoutes.js; " & _
         "echo 'Patched line:'; grep -n 'redirect' /home/ubuntu/microerp/backend/dist/modules/auth/authRoutes.js | head -5; " & _
         "echo; echo === STEP 3: PATCH src authRoutes (if exists) ===; " & _
         "find /home/ubuntu/microerp/backend/src -name 'authRoutes*' 2>/dev/null | head -5; " & _
         "find /home/ubuntu/microerp/backend/src -name 'authRoutes*' 2>/dev/null | xargs sed -i 's/res\.redirect(process\.env\.CORS_ORIGIN/res.redirect(process.env.FRONTEND_URL/g' 2>/dev/null; echo 'src patched'; " & _
         "echo; echo === STEP 4: RESTART BACKEND ===; " & _
         "pm2 restart microerp-backend 2>&1; " & _
         "sleep 3; pm2 list 2>&1 | grep micro; " & _
         "echo; echo === STEP 5: VERIFY GOOGLE ROUTE ===; " & _
         "curl -s -o /dev/null -w 'HTTP_CODE:%{http_code} REDIRECT:%{redirect_url}' http://localhost:3001/api/auth/google 2>&1 | head -5"" 2>&1"

Set oExec = oShell.Exec(sshCmd)
Dim sOut
Do While Not oExec.StdOut.AtEndOfStream
    sOut = sOut & oExec.StdOut.ReadLine() & vbCrLf
Loop

Set oFSO = CreateObject("Scripting.FileSystemObject")
Set oFile = oFSO.CreateTextFile("C:\Users\Matheus\Desktop\Site MicroERP\fix_oauth_output.txt", True)
oFile.Write sOut
oFile.Close

MsgBox Left(sOut, 2000), 64, "Fix OAuth Result"
