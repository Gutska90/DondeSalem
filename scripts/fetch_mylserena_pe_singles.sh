#!/usr/bin/env bash
# Regenera seed/mylserena-pe-singles.json (catálogo completo por defecto: páginas 1–90).
# Uso: ./scripts/fetch_proveedor-externo_pe_singles.sh
#      ./scripts/fetch_proveedor-externo_pe_singles.sh --from 1 --to 90 --stop-on-empty
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec python3 "$ROOT/scripts/fetch_mylserena_pe_singles.py" "$@"
