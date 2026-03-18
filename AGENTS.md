# AGENTS.md — GoFree Platform

## Project Overview

GoFree is an AI-native platform for specs, agents, and collaboration. Self-hostable first, with a future managed cloud offering.

## Repository Structure

```
gofree/
├── apps/web          # Next.js 15 app router — UI + API routes
├── apps/worker       # Trigger.dev v3 — durable jobs (AI, MCP, search)
├── packages/api      # tRPC routers + REST handlers
├── packages/ai       # Vercel AI SDK integration
├── packages/auth     # Better Auth + RBAC + tenancy
├── packages/core     # Shared types, constants, utils, errors
├── packages/config   # Shared tsconfig, eslint, tailwind presets
├── packages/db       # Prisma schema + client
├── packages/mcp      # MCP client + server
├── packages/realtime # SSE + Redis pub/sub
├── packages/search   # Keyword + vector search
├── packages/ui       # shadcn/ui + Monaco + Lexical
├── infra/            # Docker, compose, deploy scripts
└── docs/             # ADRs, guides
```

## Code Style

- TypeScript strict mode everywhere
- ESM modules (`type: "module"`)
- Prettier: single quotes, trailing commas, 100 char width
- ESLint flat config via @gofree/config
- Prefer Zod for runtime validation
- Prefer `@gofree/core` error classes over raw throws

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps (turbo) |
| `pnpm build` | Build everything |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Type-check all packages |
| `pnpm test` | Run all tests |
| `pnpm db:push` | Push schema to dev DB |
| `pnpm db:migrate` | Deploy migrations |
| `pnpm db:seed` | Seed dev data |
| `pnpm db:studio` | Open Prisma Studio |

## Package Dependency Rules

Strict DAG — violations break the build:

```
core, config          → (no deps — leaf nodes)
db                    → core
auth                  → db, core
mcp                   → core
search                → db, core
realtime              → core
ai                    → db, mcp, core
api                   → db, auth, ai, search, mcp, realtime, core
ui                    → core (types only — NO db, auth, api)
apps/web              → all packages
apps/worker           → db, ai, mcp, search, core
```

## Agent Behavior Rules

1. Always read CLAUDE.md and AGENTS.md before starting work.
2. Check relevant package README.md for package-specific patterns.
3. Follow the dependency DAG — never import from a forbidden dependency.
4. Use `@gofree/core` error classes for all error handling.
5. Use Zod schemas for all external input validation.
6. Use tRPC procedures for all internal API calls.
7. Use Prisma client from `@gofree/db` — never create new instances.
8. Run `pnpm typecheck` after making changes across packages.

## Environment

- Node.js 22 LTS
- pnpm 10
- PostgreSQL 16 + pgvector
- Redis 7
- Docker Compose for dev services
