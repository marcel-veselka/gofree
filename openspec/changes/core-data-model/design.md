## Context

GoFree has a working monorepo with auth (Better Auth), tenancy (org/team/project), and generic AI execution models (Run, RunStep, RunArtifact, RunLog, Conversation, Message). The platform positions itself as "AI Testing Agents for Everything" — web, mobile, desktop, API, DB, and cross-platform.

The current schema lacks testing-domain entities. Runs exist but have no connection to test suites, test cases, environments, or structured assertions. The dashboard shows placeholder data because there's nothing to query.

Existing schema files: `base.prisma`, `auth.prisma`, `tenancy.prisma`, `ai.prisma`, `content.prisma`, `search.prisma`.

## Goals / Non-Goals

**Goals:**
- Add testing-domain models that connect to the existing Run execution model
- Support all target types (web, mobile, desktop, API, DB, cross-platform) from day one
- Enable structured test results with individual assertions, screenshots, and flakiness tracking
- Make test cases semantically searchable via pgvector embeddings
- Keep the schema additive — no breaking changes to existing models
- Design for the agent execution loop: agent definition → test suite → run → results

**Non-Goals:**
- Test editor UI (separate change)
- Agent execution runtime implementation (separate change — this is just the data model)
- Real-time collaboration on test case editing (future Yjs integration)
- Billing/usage metering on test runs (future monetization change)
- CI/CD integration API (separate change — this is the storage layer)

## Decisions

### 1. New schema file: `testing.prisma`

All testing-domain models go in a new `packages/db/prisma/schema/testing.prisma` file. This keeps the existing files untouched and makes ownership clear.

**Rationale:** Follows the existing pattern (auth.prisma, ai.prisma, content.prisma). Each domain gets its own file. Avoids merge conflicts with other changes.

**Alternative considered:** Adding to `ai.prisma` since tests are AI-driven. Rejected because testing is the core domain, not a subset of generic AI runs.

### 2. Extend Run with optional foreign keys rather than creating a separate TestRun model

Add `testSuiteId`, `environmentId`, and `agentDefinitionId` as optional fields on the existing `Run` model. A Run with these fields populated is a "test run"; without them, it's a generic AI run (chat, tool call).

**Rationale:** Avoids duplicating the run execution infrastructure. The Run model already has steps, artifacts, logs, and comments. Test runs are a specialization, not a different concept.

**Alternative considered:** Separate `TestRun` model with its own steps/logs. Rejected because it would require duplicating all execution infrastructure and splitting the worker runtime.

### 3. TargetType enum over polymorphic models

Use a single `TargetType` enum (`WEB`, `MOBILE`, `DESKTOP`, `API`, `DATABASE`, `CROSS_PLATFORM`) on TestCase and AgentDefinition, with target-specific configuration stored as `Json`.

**Rationale:** Simpler schema, easier to add new target types (just add an enum value). The configuration structure varies significantly per target (browser settings vs API endpoints vs DB connections), making a typed JSON column more practical than separate tables.

**Alternative considered:** Separate tables per target type (WebTestCase, ApiTestCase, etc.). Rejected — too many tables, complex joins, hard to build unified UI.

### 4. TestResult per test case per run, with child Assertions

Each test case execution within a run produces one `TestResult`. Each TestResult has zero or more `Assertion` rows for individual checks (element visible, status code = 200, query returned rows, etc.).

**Rationale:** Enables detailed reporting — "3 of 47 assertions failed in this test case" — and supports different assertion types (visual, functional, performance, accessibility).

**Alternative considered:** Flat results with assertions as JSON array. Rejected because it prevents querying/filtering on individual assertions and makes flakiness tracking harder.

### 5. AgentDefinition as a project-level template

Agent definitions live at the project level and define what an AI testing agent can do: its prompt template, available tools, supported target types, and default model. Runs reference an agent definition.

**Rationale:** Separates "what the agent is" from "what it did" (runs). Users configure agents once and run them many times. Supports versioning later.

### 6. Raw SQL migration for pgvector on TestCase

Add an `embedding vector(1536)` column and HNSW index on `TestCase` via a raw SQL migration, same pattern as the existing SearchIndex approach.

**Rationale:** Prisma doesn't natively support pgvector column types. Raw SQL migration is the established pattern in this codebase.

## Risks / Trade-offs

- **Json configuration columns are untyped at the DB level** → Mitigate with Zod validation schemas in the API layer. Define TypeScript types for each target type's config shape.
- **Optional FKs on Run create implicit polymorphism** → Mitigate with a `type` discriminator (already exists as `RunType` enum — extend it with `TEST`).
- **pgvector embeddings require an embedding model** → Defer embedding generation to the search/indexing pipeline. TestCase rows work fine without embeddings initially.
- **Large test suites could produce many TestResult + Assertion rows** → Add composite indexes and consider partitioning if suites exceed ~100K results. Monitor with pg_stat_user_tables.

## Migration Plan

1. Create `testing.prisma` with all new models and enums
2. Extend `Run` model in `ai.prisma` with optional FK fields
3. Add `TEST` to `RunType` enum
4. Run `prisma db push` for development
5. Create raw SQL migration for pgvector embedding column + HNSW index
6. Generate Prisma client
7. Verify with `prisma studio` that all relations resolve

**Rollback:** Drop the new tables and remove the FK columns. No existing data is modified.

## Open Questions

- Should `TestEnvironment` store secrets (API keys, passwords) directly or reference an external secrets manager? For now: encrypted JSON column, with a TODO to integrate Vault/SOPS later.
- Should `AgentDefinition` support versioning from day one (version column + unique constraint on name+version)? Recommendation: yes, add `version Int @default(1)` now, enforce uniqueness later.
