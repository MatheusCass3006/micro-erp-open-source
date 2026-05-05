@echo off
chcp 65001 >nul 2>&1
title MicroERP - Tudo Local

set "BACKEND_DIR=%~dp0backend - node+type"
set "FRONTEND_DIR=%~dp0financeiro-react"

echo ========================================
echo     MicroERP - Modo Local
echo ========================================
echo.

echo [1/3] Verificando SQLite...
if not exist "%BACKEND_DIR%\microerp.db" (
    echo      Banco SQLite sera criado automaticamente
)

echo.
echo [2/3] Iniciando Backend (SQLite local)...
start "MicroERP-Backend" /min cmd /c "cd /d \"%BACKEND_DIR%\" && npm run dev"

echo [3/3] Iniciando Frontend...
start "MicroERP-Frontend" /min cmd /c "cd /d \"%FRONTEND_DIR%\" && npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo  Acesse: http://localhost:3000
echo  Backend: http://localhost:3001
echo ========================================
echo.
echo Pressione qualquer tecla para encerrar...
pause >nul

taskkill /f /im node.exe 2>nul
exit