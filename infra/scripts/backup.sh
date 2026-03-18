#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${1:-.}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/gofree_backup_${TIMESTAMP}.sql.gz"

echo "Backing up GoFree database..."
docker compose -f infra/compose/docker-compose.yml exec -T postgres \
  pg_dump -U gofree gofree | gzip > "${BACKUP_FILE}"

echo "Backup saved to: ${BACKUP_FILE}"
