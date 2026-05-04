#!/usr/bin/env bash
# Crea backend/src/main/resources/seed/mylserena-pe-singles.json con [] si no existe.
# No sobrescribe un archivo ya presente. Uso: ./scripts/ensure_proveedor-externo_pe_json.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="$ROOT/backend/src/main/resources/seed/mylserena-pe-singles.json"
mkdir -p "$(dirname "$TARGET")"
if [[ -f "$TARGET" ]]; then
  echo "Ya existe: $TARGET"
  exit 0
fi
printf '%s\n' '[]' > "$TARGET"
echo "Creado placeholder: $TARGET"
