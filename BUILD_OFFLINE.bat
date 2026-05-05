@echo off
chcp 65001 >nul
title MicroERP — Build Offline

echo.
echo ================================================================
echo   MicroERP Desktop — Build do instalador offline (.exe)
echo ================================================================
echo.

REM ── Caminhos ────────────────────────────────────────────────────
set "BASE=%~dp0"
set "FRONTEND=%BASE%financeiro-react"
set "LOCAL_APP=%BASE%microerp-local"
set "OUT_DIR=%LOCAL_APP%\frontend-out"

REM ── 1. Verifica Node.js ──────────────────────────────────────────
echo [1/6] Verificando Node.js...
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo ERRO: Node.js nao encontrado. Instale em https://nodejs.org
  pause
  exit /b 1
)
echo       OK: Node.js instalado.
echo.

REM ── 2. Verifica npm no frontend ──────────────────────────────────
echo [2/6] Verificando dependencias do frontend...
if not exist "%FRONTEND%\node_modules" (
  echo       Instalando dependencias (pode demorar)...
  cd /d "%FRONTEND%"
  call npm install
  if %ERRORLEVEL% neq 0 (
    echo ERRO: npm install falhou no frontend.
    pause
    exit /b 1
  )
)
echo       OK.
echo.

REM ── 3. Build Next.js em modo offline (static export) ────────────
echo [3/6] Buildando frontend (modo offline)...
cd /d "%FRONTEND%"

REM Seta variáveis de ambiente para o build offline
set NEXT_PUBLIC_OFFLINE=true
set NEXT_PUBLIC_API_URL=http://localhost:3001
set NEXT_PUBLIC_USE_MOCK=false

call npm run build
if %ERRORLEVEL% neq 0 (
  echo ERRO: Build do frontend falhou. Verifique os erros acima.
  pause
  exit /b 1
)
echo       Build concluido!
echo.

REM ── 4. Copia output para microerp-local ─────────────────────────
echo [4/6] Copiando arquivos para pasta do app...
if exist "%OUT_DIR%" rmdir /s /q "%OUT_DIR%"
xcopy /E /I /Q "%FRONTEND%\out" "%OUT_DIR%"
if %ERRORLEVEL% neq 0 (
  echo ERRO: Falha ao copiar arquivos.
  pause
  exit /b 1
)
echo       Copiados para: %OUT_DIR%
echo.

REM ── 5. Instala dependências do Electron ─────────────────────────
echo [5/6] Instalando dependencias do Electron...
cd /d "%LOCAL_APP%"
call npm install
if %ERRORLEVEL% neq 0 (
  echo ERRO: npm install falhou no Electron.
  pause
  exit /b 1
)
echo       OK.
echo.

REM ── 6. Empacota com electron-builder ────────────────────────────
echo [6/6] Empacotando instalador .exe...
call npm run build
if %ERRORLEVEL% neq 0 (
  echo ERRO: electron-builder falhou.
  pause
  exit /b 1
)

echo.
echo ================================================================
echo   BUILD CONCLUIDO!
echo   Instalador gerado em: %LOCAL_APP%\dist\
echo ================================================================
echo.

REM Abre a pasta do instalador
explorer "%LOCAL_APP%\dist"

pause
