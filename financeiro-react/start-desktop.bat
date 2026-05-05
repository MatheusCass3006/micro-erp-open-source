@echo off
chcp 65001 >nul 2>&1
title MicroERP Desktop

set "BASE_DIR=%~dp0"
set "FRONTEND_DIR=%BASE_DIR%financeiro-react"

echo ========================================
echo     MicroERP Desktop
echo ========================================
echo.

if not exist "%FRONTEND_DIR%\.next\standalone\server.js" (
    echo [ERRO] Build do Next.js nao encontrado!
    echo Execute primeiro: npm run build
    pause
    exit /b 1
)

echo [1/2] Iniciando servidor Next.js...
cd /d "%FRONTEND_DIR%\.next\standalone"
start "MicroERP-Server" /min cmd /c "node server.js"

echo [2/2] Abrindo aplicacao...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo ========================================
echo  MicroERP aberto em: http://localhost:3000
echo ========================================
echo.
pause