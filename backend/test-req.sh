#!/bin/bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}' | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
echo "TOKEN=$TOKEN"
curl -s -i -X POST http://localhost:3000/api/movimientos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tipo":"SALIDA","centroId":"c1a00000-0000-0000-0000-000000000001","tipoComidaId":"t1a00000-0000-0000-0000-000000000001","cantidad":1,"registradoPor":"Tester","fecha":"2026-07-04"}'
