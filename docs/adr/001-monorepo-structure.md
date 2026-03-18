# ADR-001: Monorepo Structure

**Status:** Accepted
**Date:** 2026-03-18

## Context

GoFree needs a maintainable codebase structure that supports:
- Rich web UI (Next.js) + durable worker runtime (Trigger.dev)
- AI chat, agent runs, MCP connectivity, streaming
- Self-hostable-first distribution with Docker packaging
- Future managed cloud offering
- Clear package boundaries for a modular monolith

## Decision

Use a pnpm workspaces + Turborepo monorepo with the following structure:

- **apps/web** — Next.js 15 app router (UI + API routes)
- **apps/worker** — Trigger.dev v3 durable job runtime
- **packages/api** — tRPC v11 (internal) + REST (external)
- **packages/ai** — Vercel AI SDK multi-provider integration
- **packages/auth** — Better Auth + RBAC + org/team/project tenancy
- **packages/core** — Shared types, constants, utilities, errors
- **packages/config** — Shared tsconfig, eslint, tailwind presets
- **packages/db** — Prisma multi-file schema + PostgreSQL 16 + pgvector
- **packages/mcp** — MCP client + server via @modelcontextprotocol/sdk
- **packages/realtime** — SSE streaming + Redis pub/sub
- **packages/search** — Hybrid keyword (pg_trgm) + semantic (pgvector) search
- **packages/ui** — shadcn/ui components + Monaco + Lexical editors
- **infra/** — Docker Compose, Dockerfiles, deploy scripts

### Dependency DAG

```
core, config → (leaf)
db → core
auth → db, core
mcp → core
search → db, core
realtime → core
ai → db, mcp, core
api → db, auth, ai, search, mcp, realtime, core
ui → core (types only)
apps/web → all packages
apps/worker → db, ai, mcp, search, core
```

## Consequences

### Positive

- Clear ownership boundaries per package
- Type-safe internal API via tRPC
- Packages can become services later (migration path)
- Single `pnpm dev` starts everything
- Docker images can be built per app

### Negative

- More package.json files to maintain
- Cross-package changes require understanding the DAG
- Turborepo cache invalidation can be surprising

### Risks

- Turborepo is Vercel-owned (mitigated: Nx is a documented migration path)
- Better Auth is newer (mitigated: abstracted behind packages/auth)
- Trigger.dev v3 is relatively new (mitigated: jobs are portable plain functions)
