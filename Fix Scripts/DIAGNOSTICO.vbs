Set oShell = CreateObject("WScript.Shell")
Set oFS = CreateObject("Scripting.FileSystemObject")

logPath = "C:\Users\Matheus\Desktop\Site MicroERP\LOG_DIAGNOSTICO.txt"
Set oLog = oFS.CreateTextFile(logPath, True)
oLog.WriteLine "=== DIAGNÓSTICO MicroERP Dev Server ==="
oLog.WriteLine "Data: " & Now()
oLog.WriteLine ""

' Verifica se o diretório existe
dirPath = "C:\Users\Matheus\Desktop\Site MicroERP\financeiro-react"
If oFS.FolderExists(dirPath) Then
    oLog.WriteLine "OK: Pasta financeiro-react encontrada"
Else
    oLog.WriteLine "ERRO: Pasta não encontrada: " & dirPath
End If

' Verifica se package.json existe
pkgPath = dirPath & "\package.json"
If oFS.FileExists(pkgPath) Then
    oLog.WriteLine "OK: package.json encontrado"
Else
    oLog.WriteLine "ERRO: package.json não encontrado"
End If

' Verifica se node_modules existe
nmPath = dirPath & "\node_modules"
If oFS.FolderExists(nmPath) Then
    oLog.WriteLine "OK: node_modules encontrado"
Else
    oLog.WriteLine "ERRO: node_modules NÃO encontrado — precisa de npm install!"
End If

' Testa se npm está disponível
oLog.WriteLine ""
oLog.WriteLine "Tentando iniciar servidor..."
oShell.CurrentDirectory = dirPath
ret = oShell.Run("cmd /c npm run dev > """ & dirPath & "\npm_output.txt"" 2>&1", 0, False)
oLog.WriteLine "Processo iniciado com retorno: " & ret
oLog.WriteLine "Fim do diagnóstico: " & Now()
oLog.Close

MsgBox "Diagnóstico concluído! Verifique o arquivo:" & Chr(13) & logPath, 64, "MicroERP"
