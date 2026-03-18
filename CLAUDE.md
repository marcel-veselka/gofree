# CLAUDE.md

Read and follow all instructions in AGENTS.md.
Read package-specific instructions from packages/*/README.md and apps/*/README.md.

## Quick Reference

- `pnpm dev` — Start all apps in dev mode
- `pnpm build` — Build all packages and apps
- `pnpm lint` — Lint all packages
- `pnpm typecheck` — Type-check all packages
- `pnpm test` — Run all tests
- `pnpm db:push` — Push Prisma schema to dev DB
- `pnpm db:migrate` — Run Prisma migrations
- `pnpm db:seed` — Seed database
- `pnpm db:studio` — Open Prisma Studio

## Architecture

- Monorepo: pnpm workspaces + Turborepo
- Frontend: Next.js 15 app router in apps/web
- Worker: Trigger.dev v3 in apps/worker
- API: tRPC (internal) + REST /api/v1/* (external)
- AI: Vercel AI SDK (multi-provider)
- DB: PostgreSQL 16 + pgvector via Prisma
- Auth: Better Auth in packages/auth
- MCP: Client + Server via @modelcontextprotocol/sdk

## Package Dependency Rules

- packages/core and packages/config are leaf nodes (no internal deps)
- packages/ui must NOT depend on db, auth, or api
- packages/db depends only on core
- Only apps/* may depend on packages/api
- See docs/adr/001-monorepo-structure.md for full dependency graph

## Dev Setup

```bash
docker compose -f infra/compose/docker-compose.yml up -d  # pg + redis
cp .env.example .env.local                                  # configure
pnpm install
pnpm db:push
pnpm dev
```
