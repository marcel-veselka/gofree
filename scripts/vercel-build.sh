#!/bin/bash
set -e

# Generate Prisma client from the db package schema
cd packages/db
npx prisma generate --schema=prisma/schema
cd ../..

# Also generate in the web app context so the engine is at the right path
cd apps/web
npx prisma generate --schema=../../packages/db/prisma/schema
cd ../..

# Build
pnpm --filter @gofree/web build
