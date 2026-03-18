#!/usr/bin/env bash
set -euo pipefail

echo "GoFree - First-run setup"
echo "========================"

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "Docker is required. Install from https://docker.com"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "pnpm is required. Run: corepack enable && corepack prepare pnpm@latest --activate"; exit 1; }

# Copy env if needed
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "Created .env.local from .env.example — please edit with your values."
fi

# Start dev services
docker compose -f infra/compose/docker-compose.yml up -d
echo "PostgreSQL and Redis started."

# Install dependencies
pnpm install

# Push schema to dev DB
pnpm db:push

# Seed database
pnpm db:seed

echo ""
echo "Setup complete! Run 'pnpm dev' to start development."
