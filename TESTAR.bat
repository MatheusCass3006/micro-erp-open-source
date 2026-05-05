@echo off
title MicroERP — Ambiente de Teste
color 0B
cls

echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║     MicroERP — Novo Dashboard (Teste de Integração) ║
echo  ╚══════════════════════════════════════════════════════╝
echo.

REM ─────────────────────────────────────────────────────────────────────────────
REM  CONFIGURAÇÃO — ajuste os caminhos se necessário
REM ─────────────────────────────────────────────────────────────────────────────

set FRONTEND_DIR=%~dp0financeiro-react
set BACKEND_DIR=%~dp0..\sistema_financeiro

REM ─────────────────────────────────────────────────────────────────────────────
REM  Verifica se o backend existe
REM ─────────────────────────────────────────────────────────────────────────────

if not exist "%BACKEND_DIR%\app.py" (
    echo  [AVISO] Backend nao encontrado em: %BACKEND_DIR%
    echo.
    echo  Se a pasta do backend tiver outro nome, edite este arquivo e
    echo  corrija a variavel BACKEND_DIR na linha acima.
    echo.
    pause
    exit /b 1
)

REM ─────────────────────────────────────────────────────────────────────────────
REM  Verifica se node_modules existe no frontend
REM ─────────────────────────────────────────────────────────────────────────────

if not exist "%FRONTEND_DIR%\node_modules" (
    echo  [INFO] Dependencias do frontend nao encontradas.
    echo  [INFO] Instalando agora (pode demorar alguns minutos)...
    echo.
    cd /d "%FRONTEND_DIR%"
    call npm install
    echo.
)

REM ─────────────────────────────────────────────────────────────────────────────
REM  Garante que o .env.local aponta para o backend real
REM ─────────────────────────────────────────────────────────────────────────────

(
    echo NEXT_PUBLIC_USE_MOCK=false
    echo NEXT_PUBLIC_API_URL=http://localhost:8000
) > "%FRONTEND_DIR%\.env.local"

echo  [1/2] Iniciando Backend FastAPI na porta 8000...
start "MicroERP - Backend (porta 8000)" cmd /k "cd /d "%BACKEND_DIR%" && python -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload"

echo  Aguardando backend inicializar (3 segundos)...
timeout /t 3 /nobreak > nul

echo  [2/2] Iniciando Frontend Next.js na porta 3000...
start "MicroERP - Frontend (porta 3000)" cmd /k "cd /d "%FRONTEND_DIR%" && npm run dev"

echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║  Servidores iniciados!                              ║
echo  ║                                                     ║
echo  ║  Backend API:  http://localhost:8000/docs           ║
echo  ║  Frontend:     http://localhost:3000                ║
echo  ║                                                     ║
echo  ║  Para parar: feche as duas janelas do terminal      ║
echo  ╚══════════════════════════════════════════════════════╝
echo.
echo  Abrindo o navegador em 5 segundos...
timeout /t 5 /nobreak > nul
start "" "http://localhost:3000"

pause
