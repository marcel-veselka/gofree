#!/usr/bin/env bash
set -euo pipefail

BACKUP_FILE="${1:?Usage: restore.sh <backup_file.sql.gz>}"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "Error: Backup file not found: ${BACKUP_FILE}"
  exit 1
fi

echo "Restoring GoFree database from: ${BACKUP_FILE}"
echo "WARNING: This will overwrite the current database. Press Ctrl+C to cancel."
read -r -p "Continue? [y/N] " response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
  echo "Cancelled."
  exit 0
fi

gunzip -c "${BACKUP_FILE}" | docker compose -f infra/compose/docker-compose.yml exec -T postgres \
  psql -U gofree gofree

echo "Database restored."
