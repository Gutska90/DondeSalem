#!/usr/bin/env bash
set -euo pipefail

# Wrapper simple para importar/actualizar productos MyL desde Tienda Proveedor externo.
# Permite sobreescribir API/credenciales por variables de entorno.
#
# Uso:
#   ./scripts/fetch_proveedor-externo_myl_products.sh
#
# Variables opcionales:
#   API_BASE_URL (default: http://localhost:8080)
#   ADMIN_EMAIL  (default: admin@dondesalem.local)
#   ADMIN_PASSWORD (default: Admin123!)

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

API_BASE_URL="${API_BASE_URL:-http://localhost:8080}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@dondesalem.local}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-Admin123!}"

python3 "$ROOT_DIR/scripts/fetch_stribog_myl_products.py" \
  --api "$API_BASE_URL" \
  --email "$ADMIN_EMAIL" \
  --password "$ADMIN_PASSWORD"

