#!/bin/bash
set -e
cd /home/ema/personal-repos/RestApp/backend
npm run start:dev > /tmp/backend_smoke.log 2>&1 &
BGPID=$!
sleep 8

TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}' | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

echo "--- paginated movimientos ---"
curl -s "http://localhost:3000/api/movimientos?page=1&limit=2" -H "Authorization: Bearer $TOKEN"
echo
echo "--- paginated solicitudes (opt-in) ---"
curl -s "http://localhost:3000/api/solicitudes?page=1&limit=2" -H "Authorization: Bearer $TOKEN"
echo
echo "--- paginated centros-acopio (opt-in) ---"
curl -s "http://localhost:3000/api/centros-acopio?page=1&limit=1" -H "Authorization: Bearer $TOKEN"
echo

kill $BGPID 2>/dev/null
