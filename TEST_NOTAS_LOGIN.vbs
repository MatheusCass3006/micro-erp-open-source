Set oShell = CreateObject("WScript.Shell")

' Write a test script to the server, then run it
Dim writeScript
writeScript = "cmd /c ssh -i ""C:\Users\Matheus\Downloads\microerp-key.pem"" -o StrictHostKeyChecking=no ubuntu@56.124.56.111 " & _
              """cat > /tmp/test_notas.sh << 'ENDSCRIPT'" & Chr(10) & _
              "#!/bin/bash" & Chr(10) & _
              "echo '=== Testing login API ==='" & Chr(10) & _
              "RESP=$(curl -s -X POST http://localhost:3001/api/auth/login -H 'Content-Type: application/json' -d '{""email"":""matheuscassalho3006@gmail.com"",""senha"":""Matheus.3006""}')" & Chr(10) & _
              "echo Login response: $RESP | head -c 300" & Chr(10) & _
              "TOKEN=$(echo $RESP | python3 -c ""import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('access_token','') or d.get('token','') or d.get('access_token',''))"" 2>/dev/null)" & Chr(10) & _
              "echo Token: ${TOKEN:0:50}..." & Chr(10) & _
              "if [ -n '$TOKEN' ]; then" & Chr(10) & _
              "  echo '=== Testing /api/notas with token ==='" & Chr(10) & _
              "  curl -s -o /dev/null -w '%{http_code}' http://localhost:3001/api/notas -H ""Authorization: Bearer $TOKEN""" & Chr(10) & _
              "fi" & Chr(10) & _
              "ENDSCRIPT" & Chr(10) & _
              "chmod +x /tmp/test_notas.sh && bash /tmp/test_notas.sh 2>&1"" 2>&1"

Set oExec = oShell.Exec(writeScript)
Dim sOut
Do While Not oExec.StdOut.AtEndOfStream
    sOut = sOut & oExec.StdOut.ReadLine() & vbCrLf
Loop

MsgBox Left(sOut, 2000), 64, "Notas Test"
