#!/usr/bin/env bash
set -euo pipefail

echo "GoFree - Upgrade"
echo "================"

# Pull latest images
echo "Pulling latest images..."
docker compose -f infra/compose/docker-compose.prod.yml pull

# Run migrations
echo "Running database migrations..."
docker compose -f infra/compose/docker-compose.prod.yml run --rm web pnpm db:migrate

# Restart services
echo "Restarting services..."
docker compose -f infra/compose/docker-compose.prod.yml up -d

echo "Upgrade complete."
