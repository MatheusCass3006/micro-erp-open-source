' ============================================================
' MicroERP — Launcher
' Abre o app no Edge em modo "aplicativo" (sem barra de endereço)
' Se o servidor já estiver rodando, só abre o browser.
' ============================================================

Option Explicit

Dim oShell, oFSO, installDir
Set oShell = CreateObject("WScript.Shell")
Set oFSO   = CreateObject("Scripting.FileSystemObject")

installDir = oFSO.GetParentFolderName(WScript.ScriptFullName)

' ── 1. Verifica se o servidor já está rodando ────────────────
Dim xmlHttp
Set xmlHttp = CreateObject("MSXML2.XMLHTTP")
On Error Resume Next
xmlHttp.Open "GET", "http://localhost:3001/api/health", False
xmlHttp.setRequestHeader "Connection", "close"
xmlHttp.Send
If Err.Number = 0 And xmlHttp.Status = 200 Then
  ' Já está rodando — abre só o browser
  Call AbrirApp()
  WScript.Quit
End If
On Error GoTo 0

' ── 2. Inicia o servidor em background ───────────────────────
Dim exePath
exePath = installDir & "\microerp.exe"

If Not oFSO.FileExists(exePath) Then
  MsgBox "Arquivo microerp.exe não encontrado em:" & vbCrLf & exePath, 16, "MicroERP — Erro"
  WScript.Quit
End If

oShell.Run """" & exePath & """", 0, False

' ── 3. Aguarda o servidor ficar pronto (até 15 segundos) ─────
Dim i, pronto
pronto = False
For i = 1 To 30
  WScript.Sleep 500
  On Error Resume Next
  Set xmlHttp = CreateObject("MSXML2.XMLHTTP")
  xmlHttp.Open "GET", "http://localhost:3001/api/health", False
  xmlHttp.setRequestHeader "Connection", "close"
  xmlHttp.Send
  If Err.Number = 0 And xmlHttp.Status = 200 Then
    pronto = True
    Exit For
  End If
  On Error GoTo 0
Next

If Not pronto Then
  MsgBox "O servidor demorou para responder." & vbCrLf & _
         "Tente abrir manualmente: http://localhost:3001", 48, "MicroERP"
End If

' ── 4. Abre o app no navegador ───────────────────────────────
Call AbrirApp()

' ── Sub: abre Edge em app-mode (parece aplicativo nativo) ────
Sub AbrirApp()
  Dim edgePaths(2)
  edgePaths(0) = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
  edgePaths(1) = "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
  edgePaths(2) = oShell.ExpandEnvironmentStrings("%LOCALAPPDATA%") & _
                 "\Microsoft\Edge\Application\msedge.exe"

  Dim j, edgeExe
  edgeExe = ""
  For j = 0 To 2
    If oFSO.FileExists(edgePaths(j)) Then
      edgeExe = edgePaths(j)
      Exit For
    End If
  Next

  If edgeExe <> "" Then
    ' App mode: sem barra de endereço, parece app nativo
    oShell.Run """" & edgeExe & """ --app=http://localhost:3001 " & _
               "--window-size=1280,800 --window-position=100,50", 1, False
  Else
    ' Fallback: browser padrão
    oShell.Run "http://localhost:3001", 1, False
  End If
End Sub
