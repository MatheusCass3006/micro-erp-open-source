@echo off
chcp 65001 >nul 2>&1
title MicroERP

set "APP_DIR=%~dp0"
cd /d "%APP_DIR%"

echo ========================================
echo     MicroERP - Gestao Financeira
echo ========================================
echo.

echo Iniciando servidor standalone...
start cmd /k "node server.js"

timeout /t 5 /nobreak >nul

start http://localhost:3000

echo ========================================
echo  Acesse: http://localhost:3000
echo ========================================

pause