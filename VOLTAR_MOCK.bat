@echo off
echo Voltando para modo MOCK (dados ficticios, sem backend)...
(
    echo NEXT_PUBLIC_USE_MOCK=true
    echo NEXT_PUBLIC_API_URL=http://localhost:8000
) > "%~dp0financeiro-react\.env.local"
echo Feito! Reinicie o servidor Next.js para aplicar.
pause
