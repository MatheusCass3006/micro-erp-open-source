Set oShell = CreateObject("WScript.Shell")

Dim cmd
cmd = "cmd /c ssh -i ""C:\Users\Matheus\Downloads\microerp-key.pem"" -o StrictHostKeyChecking=no ubuntu@56.124.56.111 " & _
      """echo === AUTH MIDDLEWARE ===; " & _
      "cat /home/ubuntu/microerp/backend/src/middleware/auth.ts 2>/dev/null || " & _
      "cat /home/ubuntu/microerp/backend/src/middlewares/auth.ts 2>/dev/null || " & _
      "find /home/ubuntu/microerp/backend/src -name 'auth*' -type f 2>/dev/null; " & _
      "echo; echo === DASHBOARD ROUTE ===; " & _
      "find /home/ubuntu/microerp/backend/src -name '*dashboard*' -type f 2>/dev/null; " & _
      "echo; echo === FRONTEND API SERVICE ===; " & _
      "find /home/ubuntu/microerp -path '*/src*' -name 'api*' -type f 2>/dev/null | head -10; " & _
      "find /home/ubuntu/microerp -path '*/lib*' -name 'api*' -type f 2>/dev/null | head -10; " & _
      "echo; echo === AUTH CONTEXT FRONTEND ===; " & _
      "find /home/ubuntu/microerp -name '*auth*' -path '*/context*' 2>/dev/null | head -5; " & _
      "find /home/ubuntu/microerp -name '*auth*' -path '*/store*' 2>/dev/null | head -5; " & _
      "find /home/ubuntu/microerp -name '*auth*' -path '*/hooks*' 2>/dev/null | head -5; " & _
      "echo; echo === BACKEND CORS ORIGIN ATUAL ===; pm2 env 2 2>&1 | grep -i cors"" 2>&1"

Set oExec = oShell.Exec(cmd)
Dim sOutput
Do While Not oExec.StdOut.AtEndOfStream
    sOutput = sOutput & oExec.StdOut.ReadLine() & vbCrLf
Loop

Set oFSO = CreateObject("Scripting.FileSystemObject")
Set oFile = oFSO.CreateTextFile("C:\Users\Matheus\Desktop\Site MicroERP\auth_code_check.txt", True)
oFile.Write sOutput
oFile.Close

MsgBox Left(sOutput, 1500), 64, "Auth Code Check"
