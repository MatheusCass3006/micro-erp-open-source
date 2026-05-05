#!/bin/bash
echo "=== dist/googleStrategy.js ==="
cat /home/ubuntu/microerp/backend/dist/modules/auth/googleStrategy.js

echo ""
echo "=== dist/authRoutes.js (full) ==="
cat /home/ubuntu/microerp/backend/dist/modules/auth/authRoutes.js

echo ""
echo "=== Usuario entity columns ==="
grep -n 'Column\|google\|email\|nome\|senha' /home/ubuntu/microerp/backend/src/database/entities/Usuario.ts 2>/dev/null | head -40
