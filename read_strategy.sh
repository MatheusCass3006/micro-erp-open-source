#!/bin/bash
echo "=== googleStrategy.ts (src) ==="
cat /home/ubuntu/microerp/backend/src/modules/auth/googleStrategy.ts 2>/dev/null || echo NOT_FOUND

echo ""
echo "=== authRoutes.ts (src) ==="
cat /home/ubuntu/microerp/backend/src/modules/auth/authRoutes.ts 2>/dev/null || echo NOT_FOUND

echo ""
echo "=== Usuario entity (check google fields) ==="
grep -n 'google\|oauth\|provider\|googleId' /home/ubuntu/microerp/backend/src/database/entities/Usuario.ts 2>/dev/null || echo NOT_FOUND
