## 1. Schema — Enums and New Models

- [x] 1.1 Create `packages/db/prisma/schema/testing.prisma` with `TargetType`, `TestStatus`, and `Priority` enums
- [x] 1.2 Add `TestSuite` model with name, slug, description, targetType, config (Json), archived flag, project relation, unique constraint on [orgId, slug] — per test-suites spec
- [x] 1.3 Add `TestCase` model with title, targetType, priority, position, steps (Json), expectedAssertions (Json), targetConfig (Json), tags (String[]), suite relation — per test-cases spec
- [x] 1.4 Add `TestEnvironment` model with name, slug, targetType, config (Json), secrets (Json), isDefault flag, project relation, unique constraint on [projectId, slug] — per test-environments spec
- [x] 1.5 Add `AgentDefinition` model with name, slug, promptTemplate, tools (Json), model, supportedTargets (TargetType[]), version, defaultConfig (Json), project relation — per agent-definitions spec
- [x] 1.6 Add `TestResult` model with status (TestStatus), durationMs, startedAt, completedAt, error, screenshots (Json), retryCount, run + testCase + environment relations — per test-results spec
- [x] 1.7 Add `Assertion` model with name, type, expected (Json), actual (Json), passed (Boolean), testResult relation — per test-results spec

## 2. Schema — Extend Existing Models

- [x] 2.1 Add `TEST` value to `RunType` enum in `ai.prisma`
- [x] 2.2 Add optional `testSuiteId`, `environmentId`, `agentDefinitionId` foreign keys to `Run` model in `ai.prisma`
- [x] 2.3 Add `testSuites`, `testEnvironments`, `agentDefinitions` relations to `Project` model in `tenancy.prisma`
- [x] 2.4 Add `testResults` relation to `Run` model

## 3. Database Migration

- [x] 3.1 Run `prisma db push` to apply schema changes to dev database
- [x] 3.2 Create raw SQL migration for pgvector `embedding vector(1536)` column on `test_cases` table
- [x] 3.3 Create HNSW index on the embedding column: `CREATE INDEX test_cases_embedding_idx ON test_cases USING hnsw (embedding vector_cosine_ops)`
- [x] 3.4 Regenerate Prisma client (`prisma generate`)

## 4. Zod Validation Schemas

- [x] 4.1 Create `packages/db/src/validation/testing.ts` with Zod schemas for TestSuite config, TestCase steps, TestCase assertions, TestCase targetConfig (per target type)
- [x] 4.2 Create Zod schemas for TestEnvironment config (per target type) and TestEnvironment secrets
- [x] 4.3 Create Zod schemas for AgentDefinition tools, defaultConfig, and promptTemplate variable validation
- [x] 4.4 Create Zod schemas for TestResult screenshots array structure
- [x] 4.5 Export all validation schemas from `packages/db/src/index.ts`

## 5. tRPC Routers

- [x] 5.1 Create `packages/api/src/routers/test-suites.ts` — CRUD + list with pagination, archive/unarchive, run history query
- [x] 5.2 Create `packages/api/src/routers/test-cases.ts` — CRUD + reorder, filter by tag/target, semantic search endpoint
- [x] 5.3 Create `packages/api/src/routers/test-environments.ts` — CRUD + set default, secrets handling (masked by default)
- [x] 5.4 Create `packages/api/src/routers/agent-definitions.ts` — CRUD + version listing
- [x] 5.5 Create `packages/api/src/routers/test-results.ts` — query by run, by suite, aggregation endpoint for suite summary
- [x] 5.6 Register all new routers in the main app router

## 6. Verification

- [x] 6.1 Verify all models appear correctly in `prisma studio`
- [x] 6.2 Seed test data: 1 test suite, 3 test cases (web, api, db), 1 environment, 1 agent definition, 1 test run with results and assertions
- [x] 6.3 Verify tRPC endpoints return correct data via dev tools or curl
- [ ] 6.4 Verify search index can query test cases by embedding similarity (manual test with pgvector)
