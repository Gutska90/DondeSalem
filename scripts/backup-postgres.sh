#!/usr/bin/env bash
# Respaldo simple de PostgreSQL (VPS / cron diario). Ajustá DATABASE_URL o variables.
# Uso: DATABASE_URL=postgres://u:p@localhost:5432/dondesalem ./scripts/backup-postgres.sh
set -euo pipefail
OUT_DIR="${BACKUP_DIR:-./backups}"
mkdir -p "$OUT_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
FILE="$OUT_DIR/dondesalem-${STAMP}.sql.gz"

if [[ -n "${DATABASE_URL:-}" ]]; then
  pg_dump "$DATABASE_URL" | gzip >"$FILE"
else
  : "${PGHOST:=localhost}"
  : "${PGPORT:=5432}"
  : "${PGUSER:=postgres}"
  : "${PGDATABASE:=dondesalem}"
  pg_dump -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" "$PGDATABASE" | gzip >"$FILE"
fi

echo "OK: $FILE"
