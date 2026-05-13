#!/bin/bash
# Script de Teste de Integração Rápida
# Uso: ./test-integration.sh <URL_AWS> <URL_VERCEL>
# Exemplo: ./test-integration.sh https://sua-api.amazonaws.com https://seu-app.vercel.app

API_URL=$1
FRONTEND_URL=$2

if [ -z "$API_URL" ] || [ -z "$FRONTEND_URL" ]; then
  echo "Uso: ./test-integration.sh <URL_AWS> <URL_VERCEL>"
  exit 1
fi

echo "=== Iniciando Testes de Integração ==="
echo "AWS API: $API_URL"
echo "Frontend: $FRONTEND_URL"
echo "--------------------------------------"

# 1. Teste de Health Check
echo "[1/3] Testando Health Check da API..."
HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}\n" "$API_URL/api/health")
if [ "$HTTP_STATUS" -eq 200 ]; then
  echo "✅ Health Check OK (HTTP 200)"
else
  echo "❌ Erro no Health Check (HTTP $HTTP_STATUS)"
fi

# 2. Teste de CORS
echo "[2/3] Testando CORS Headers..."
CORS_ALLOW=$(curl -s -I -X OPTIONS \
  -H "Origin: $FRONTEND_URL" \
  -H "Access-Control-Request-Method: GET" \
  "$API_URL/api/health" | grep -i "access-control-allow-origin")

if [ -z "$CORS_ALLOW" ]; then
  echo "❌ Header CORS não encontrado ou não permitido."
else
  echo "✅ CORS OK: $CORS_ALLOW"
fi

echo "--------------------------------------"
echo "Para o teste final, abra o console do navegador no Vercel."
echo "E execute fetch('$API_URL/api/health')."
