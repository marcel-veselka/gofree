## Why

The existing Prisma schema covers auth, tenancy, generic AI runs, conversations, and basic content — but has no testing-domain models. GoFree is an AI testing agents platform (web, mobile, desktop, API, DB). Without test suites, test cases, test environments, agent definitions, and structured test results, the product cannot deliver its core value proposition. We need these entities now because every feature — the dashboard, project views, agent execution, reporting — depends on them.

## What Changes

- Add `TestSuite` model — a named collection of test cases within a project, with configuration and scheduling metadata
- Add `TestCase` model — individual test definitions with steps, assertions, target type (web/mobile/desktop/api/db), and priority
- Add `TestEnvironment` model — reusable environment configs (URLs, credentials, browser/device settings) per project
- Add `AgentDefinition` model — defines an AI testing agent's capabilities, prompt template, tools, and target types
- Add `TestResult` model — structured outcome of a test case execution within a run, with status, duration, screenshots, assertions
- Add `Assertion` model — individual pass/fail checks within a test result, with expected vs actual values
- Extend `Run` model with `testSuiteId`, `environmentId`, and `agentDefinitionId` foreign keys to connect runs to testing context
- Extend `Project` model with relations to new testing entities
- Add `TargetType` enum: `WEB`, `MOBILE`, `DESKTOP`, `API`, `DATABASE`, `CROSS_PLATFORM`
- Add `TestStatus` enum: `PASSED`, `FAILED`, `SKIPPED`, `FLAKY`, `ERROR`
- Add `Priority` enum: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`
- Add migration script for pgvector embedding column on `TestCase` for semantic test search

## Capabilities

### New Capabilities
- `test-suites`: CRUD for test suites — grouping, configuration, scheduling, and bulk operations on test cases
- `test-cases`: CRUD for individual test cases — steps, assertions, target type, priority, tagging, and semantic search
- `test-environments`: Reusable environment configurations — URLs, auth credentials, browser/device profiles
- `agent-definitions`: AI agent templates — prompt templates, tool configurations, target type bindings, model selection
- `test-results`: Structured test execution outcomes — per-case results, assertions, screenshots, duration, flakiness tracking

### Modified Capabilities
- (none — existing specs untouched, only additive schema changes)

## Impact

- **packages/db**: 5 new Prisma models, 3 new enums, 2 model extensions, 1 raw SQL migration for pgvector
- **packages/api**: New tRPC routers for test suites, cases, environments, agents, results
- **apps/web**: New UI pages for test suite management, case editing, results dashboard, agent configuration
- **apps/worker**: Agent execution jobs need to read agent definitions and write structured test results
- **packages/search**: SearchIndex needs to index test cases and suites for semantic search
