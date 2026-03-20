#!/bin/bash
set -e

# Generate Prisma client
cd packages/db
npx prisma generate --schema=prisma/schema
cd ../..

# Find and copy Prisma engine to web app for Vercel bundling
echo "=== Looking for Prisma engine files ==="
find node_modules/.pnpm -name 'libquery_engine*' -type f 2>/dev/null || true
find node_modules/.prisma -name 'libquery_engine*' -type f 2>/dev/null || true

# Copy engine to apps/web for Next.js to find
ENGINE=$(find node_modules -name 'libquery_engine-rhel*' -type f 2>/dev/null | head -1)
if [ -n "$ENGINE" ]; then
  echo "Found engine: $ENGINE"
  cp "$ENGINE" apps/web/
  mkdir -p apps/web/.prisma/client
  cp "$ENGINE" apps/web/.prisma/client/
fi

# Build
pnpm --filter @gofree/web build
