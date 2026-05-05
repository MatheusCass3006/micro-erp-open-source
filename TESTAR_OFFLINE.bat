@echo off
chcp 65001 >nul
title MicroERP — Teste Offline (sem instalar)

echo.
echo ================================================================
echo   MicroERP Desktop — Teste rapido (sem gerar .exe)
echo ================================================================
echo.

set "BASE=%~dp0"
set "FRONTEND=%BASE%financeiro-react"
set "LOCAL_APP=%BASE%microerp-local"

REM ── Build frontend se não existir ────────────────────────────────
if not exist "%FRONTEND%\out\index.html" (
  echo [1/3] Buildando frontend...
  cd /d "%FRONTEND%"
  set NEXT_PUBLIC_OFFLINE=true
  set NEXT_PUBLIC_API_URL=http://localhost:3001
  set NEXT_PUBLIC_USE_MOCK=false
  call npm run build
  if %ERRORLEVEL% neq 0 (
    echo ERRO: Build falhou.
    pause
    exit /b 1
  )

  echo [2/3] Copiando arquivos...
  if exist "%LOCAL_APP%\frontend-out" rmdir /s /q "%LOCAL_APP%\frontend-out"
  xcopy /E /I /Q "%FRONTEND%\out" "%LOCAL_APP%\frontend-out"
) else (
  echo [Pulando build — frontend-out ja existe]
  echo [Apague a pasta out\ para forcar rebuild]
)

REM ── npm install se necessário ────────────────────────────────────
if not exist "%LOCAL_APP%\node_modules" (
  echo [3/3] Instalando dependencias do Electron...
  cd /d "%LOCAL_APP%"
  call npm install
)

REM ── Roda o Electron ─────────────────────────────────────────────
echo.
echo Abrindo MicroERP Desktop...
cd /d "%LOCAL_APP%"
call npx electron .

pause
