#!/bin/bash
echo "=== Testing login API ==="
RESP=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"matheuscassalho3006@gmail.com","senha":"Matheus.3006"}')
echo "Login response: ${RESP:0:300}"
echo ""

TOKEN=$(echo "$RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); t=d.get('data',{}).get('access_token','') if isinstance(d.get('data'),dict) else ''; print(t)" 2>/dev/null)

if [ -n "$TOKEN" ]; then
  echo "=== Token obtained, testing /api/notas ==="
  STATUS=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3001/api/notas \
    -H "Authorization: Bearer $TOKEN")
  echo "GET /api/notas status: $STATUS"

  if [ "$STATUS" = "200" ]; then
    echo "SUCCESS: /api/notas returns 200"
    curl -s http://localhost:3001/api/notas \
      -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; d=json.load(sys.stdin); print('Type:', type(d).__name__); print('Keys:', list(d.keys()) if isinstance(d,dict) else 'is array, len='+str(len(d)))"
  fi
else
  echo "No token extracted — check login response above"
  echo "Trying raw token key..."
  TOKEN2=$(echo "$RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); [print(k,'=',str(v)[:80]) for k,v in d.items()]" 2>/dev/null)
  echo "$TOKEN2"
fi

echo ""
echo "=== PM2 status ==="
pm2 list 2>&1 | grep micro
