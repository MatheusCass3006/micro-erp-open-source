@echo off
chcp 65001 >nul 2>&1

set "APP_DIR=%~dp0"
echo [1/2] Instalando dependências do Frontend...
cd /d "%APP_DIR%app"
call npm install --legacy-peer-deps

echo [2/2] Instalando dependências do Backend...
cd /d "%APP_DIR%backend"
call npm install

echo.
echo Dependências instaladas!
pause