Set oShell = CreateObject("WScript.Shell")

Dim sshCmd
sshCmd = "cmd /c ssh -i ""C:\Users\Matheus\Downloads\microerp-key.pem"" -o StrictHostKeyChecking=no ubuntu@56.124.56.111 " & _
         """python3 -c ""import subprocess; r = subprocess.run(['psql', '-U', 'microerpdb', '-d', 'microerp', '-c', 'SELECT id, email, nome FROM usuarios LIMIT 5;'], capture_output=True, text=True, env={**__import__(chr(111)+chr(115)).environ, 'PGPASSWORD':'Matheus.3006'}); print(r.stdout or r.stderr)"" 2>&1; " & _
         "echo; echo --- trying with pg_isready ---; " & _
         "which psql || find / -name psql 2>/dev/null | head -5; " & _
         "echo; echo --- node query ---; " & _
         "cd /home/ubuntu/microerp/backend && node -e ""const{Pool}=require('pg');const p=new Pool({user:'microerpdb',password:'Matheus.3006',database:'microerp',host:'localhost'});p.query('SELECT id,email FROM usuarios LIMIT 5').then(r=>{console.log(JSON.stringify(r.rows));p.end()}).catch(e=>{console.error(e.message);p.end()})"" 2>&1"" 2>&1"

Set oExec = oShell.Exec(sshCmd)
Dim sOut
Do While Not oExec.StdOut.AtEndOfStream
    sOut = sOut & oExec.StdOut.ReadLine() & vbCrLf
Loop

MsgBox Left(sOut, 2000), 64, "DB Users"
