Set oShell = CreateObject("WScript.Shell")

' Testa conectividade com o site de producao usando PowerShell
Dim cmd
cmd = "cmd /c powershell -NoProfile -Command """ & _
      "$ErrorActionPreference='SilentlyContinue';" & _
      "Write-Host '=== DNS RESOLVE ==='; " & _
      "try { $dns = [System.Net.Dns]::GetHostAddresses('micro-erp-production.digital'); Write-Host ('DNS: ' + ($dns | ForEach-Object {$_.ToString()} | Join-String -Separator ', ')) } catch { Write-Host 'DNS FAILED: ' $_.Exception.Message }; " & _
      "Write-Host '=== HTTP TEST ==='; " & _
      "try { $r = Invoke-WebRequest -Uri 'http://micro-erp-production.digital/login' -MaximumRedirection 0 -ErrorAction SilentlyContinue -TimeoutSec 10; Write-Host ('HTTP status: ' + $r.StatusCode) } catch { Write-Host 'HTTP error: ' $_.Exception.Message }; " & _
      "Write-Host '=== HTTPS TEST ==='; " & _
      "try { $r2 = Invoke-WebRequest -Uri 'https://micro-erp-production.digital/login' -MaximumRedirection 5 -ErrorAction SilentlyContinue -TimeoutSec 10 -UseBasicParsing; Write-Host ('HTTPS status: ' + $r2.StatusCode + ' len: ' + $r2.Content.Length) } catch { Write-Host 'HTTPS error: ' $_.Exception.Message }; " & _
      """ 2>&1"

Set oExec = oShell.Exec(cmd)
Dim sOutput
Do While Not oExec.StdOut.AtEndOfStream
    sOutput = sOutput & oExec.StdOut.ReadLine() & vbCrLf
Loop

Set oFSO = CreateObject("Scripting.FileSystemObject")
Set oFile = oFSO.CreateTextFile("C:\Users\Matheus\Desktop\Site MicroERP\connectivity_test.txt", True)
oFile.Write sOutput
oFile.Close

MsgBox "Teste de conectividade concluido!" & vbCrLf & vbCrLf & sOutput, 64, "MicroERP - Connectivity"
