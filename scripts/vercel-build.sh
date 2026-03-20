#!/bin/bash
set -e

# Generate Prisma client
cd packages/db
npx prisma generate --schema=prisma/schema
cd ../..

# Copy Prisma engine and generated client to apps/web for Next.js bundling
mkdir -p apps/web/node_modules/.prisma/client
cp -r packages/db/node_modules/.prisma/client/* apps/web/node_modules/.prisma/client/ 2>/dev/null || true
cp -r node_modules/.prisma/client/* apps/web/node_modules/.prisma/client/ 2>/dev/null || true

echo "=== Prisma client files in apps/web ==="
ls apps/web/node_modules/.prisma/client/*.node 2>/dev/null || echo "No engine files found"

# Build
pnpm --filter @gofree/web build
