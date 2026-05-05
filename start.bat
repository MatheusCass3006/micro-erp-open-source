@echo off
chcp 65001 >nul 2>&1
title MicroERP

set "APP_DIR=%~dp0"
set "FRONTEND_DIR=%APP_DIR%frontend"
set "BACKEND_DIR=%APP_DIR%backend"

pushd "%BACKEND_DIR%"
start cmd /k "npm run dev"
popd

timeout /t 3 /nobreak >nul

pushd "%FRONTEND_DIR%"
start cmd /k "npm run dev"
popd

timeout /t 5 /nobreak >nul

start http://localhost:3000

echo.
echo ========================================
echo  MicroERP aberto em http://localhost:3000
echo ========================================
echo.
pause