#!/usr/bin/env bash
set -euo pipefail
DB_PATH="${DB_PATH:-/Users/soares/Documents/sabtec-garantia/sabtec-web/prisma/dev.db}"
BACKUP_DIR="${BACKUP_DIR:-/Users/soares/Documents/sabtec-garantia/backups}"
mkdir -p "$BACKUP_DIR"
TS=$(date +%Y%m%d-%H%M%S)
cp "$DB_PATH" "$BACKUP_DIR/dev-$TS.db"
echo "Backup criado: $BACKUP_DIR/dev-$TS.db"