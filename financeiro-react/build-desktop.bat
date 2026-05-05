@echo off
echo Building MicroERP Desktop...

echo.
echo [1/3] Building Next.js...
cd /d "%~dp0"
call npm run build

if errorlevel 1 (
    echo Build Next.js failed!
    pause
    exit /b 1
)

echo.
echo [2/3] Compilando Electron...
cd /d "%~dp0electron"
call npx tsc

if errorlevel 1 (
    echo Compile Electron failed!
    pause
    exit /b 1
)

echo.
echo [3/3] Criando .exe...
cd /d "%~dp0electron"
call npx electron-builder --win

echo.
echo Build completo! Arquivo em: electron\release
pause