Set oShell = CreateObject("WScript.Shell")

' Testa o endpoint de registro com os campos corretos
Dim testCmd
testCmd = "cmd /c ssh -i ""C:\Users\Matheus\Downloads\microerp-key.pem"" -o StrictHostKeyChecking=no ubuntu@56.124.56.111 " & _
          """curl -s -X POST http://localhost:3001/api/auth/registrar -H 'Content-Type: application/json' -d '{" & Chr(34) & "nome_usuario" & Chr(34) & ":" & Chr(34) & "Matheus Teste" & Chr(34) & "," & Chr(34) & "email" & Chr(34) & ":" & Chr(34) & "matheus.teste" & Chr(34) & "+vbs@gmail.com," & Chr(34) & "senha" & Chr(34) & ":" & Chr(34) & "Teste123!" & Chr(34) & "," & Chr(34) & "nome_empresa" & Chr(34) & ":" & Chr(34) & "Empresa Teste VBS" & Chr(34) & "," & Chr(34) & "confirmar_senha" & Chr(34) & ":" & Chr(34) & "Teste123!" & Chr(34) & "}' 2>&1"" 2>&1"

Set oExec = oShell.Exec(testCmd)
Dim sResult
Do While Not oExec.StdOut.AtEndOfStream
    sResult = sResult & oExec.StdOut.ReadLine() & vbCrLf
Loop

' Salva resultado do teste
Set oFSO = CreateObject("Scripting.FileSystemObject")
Set oFile = oFSO.CreateTextFile("C:\Users\Matheus\Desktop\Site MicroERP\test_result.txt", True)
oFile.Write "=== TESTE DO ENDPOINT ===" & vbCrLf
oFile.Write sResult & vbCrLf
oFile.Close

' Abre o site no browser padrao
oShell.Run "https://micro-erp-production.digital/login"

MsgBox "Resultado do teste:" & vbCrLf & vbCrLf & Left(sResult, 400), 64, "MicroERP - Verificacao"
