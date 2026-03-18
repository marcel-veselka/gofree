# GoFree

AI-native platform for specs, agents, and collaboration. Self-hostable first.

## Quick Start

```bash
# Prerequisites: Node.js 22, pnpm, Docker

# Clone and setup
git clone <repo-url> && cd gofree
cp .env.example .env.local
pnpm install

# Start dev services (PostgreSQL + Redis)
docker compose -f infra/compose/docker-compose.yml up -d

# Initialize database
pnpm db:push
pnpm db:seed

# Start development
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

| Layer | Package | Tech |
|-------|---------|------|
| Frontend | apps/web | Next.js 15, Tailwind, shadcn/ui |
| Workers | apps/worker | Trigger.dev v3 |
| API | packages/api | tRPC (internal) + REST (external) |
| AI | packages/ai | Vercel AI SDK |
| Auth | packages/auth | Better Auth |
| Database | packages/db | Prisma, PostgreSQL 16, pgvector |
| MCP | packages/mcp | MCP SDK (client + server) |
| Search | packages/search | pg_trgm + pgvector |
| Realtime | packages/realtime | SSE + Redis pub/sub |
| UI | packages/ui | shadcn/ui, Monaco, Lexical |

## Self-Hosting

```bash
# Production deployment
docker compose -f infra/compose/docker-compose.prod.yml up -d
```

See [docs/guides/self-hosting.md](docs/guides/self-hosting.md) for details.

## License

TBD
