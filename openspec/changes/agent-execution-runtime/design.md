## Context

GoFree has: Trigger.dev worker with a stub `ai.agent-run` task, Vercel AI SDK with Anthropic/OpenAI providers, MCP client/server/registry, and a complete data model (TestSuite → TestCase → TestResult → Assertion, AgentDefinition, TestEnvironment, Run → RunStep). The UI has a suite detail page with a "Recent Runs" section but no way to trigger runs.

The worker runs as a separate process via `npx trigger.dev dev`. Jobs are defined in `apps/worker/src/jobs/` and triggered via Trigger.dev SDK from the tRPC layer.

## Goals / Non-Goals

**Goals:**
- Execute AI-driven test runs end-to-end: trigger → agent loop → structured results
- Support all target types from day one (WEB, API, DATABASE at minimum; MOBILE, DESKTOP as stubs)
- Persist every step, result, and assertion for full observability
- Stream run progress to the UI via SSE
- Keep the agent loop generic — the AgentDefinition's prompt template and tools define behavior
- Handle failures gracefully (timeouts, model errors, tool failures) without losing partial results

**Non-Goals:**
- Real browser automation (Playwright integration) — use simulated browser tools for now, real browser in next change
- Mobile/desktop device farms
- Parallel test case execution within a single run (sequential first, parallelize later)
- Cost tracking / token budgets
- Agent memory across runs

## Decisions

### 1. Vercel AI SDK `generateText` with tools for the agent loop

Use `generateText` (not `streamText`) in the worker since we need tool call results before continuing. The agent loop: build prompt → call model with tools → process tool results → repeat until done or max steps. Each iteration creates a RunStep record.

**Rationale:** `generateText` with `maxSteps` handles the tool call loop natively. The AI SDK manages the conversation state. We don't need streaming in the worker — streaming is for the UI.

**Alternative:** Manual loop with `streamText`. Rejected — more complex, `generateText` with tool results is the documented pattern for agent loops.

### 2. Built-in tools as AI SDK tool definitions, not MCP

The testing tools (assert, navigate, click, api-call, db-query, screenshot) are defined as Vercel AI SDK `tool()` definitions, not MCP tools. MCP connectivity is for user-configured external tools.

**Rationale:** Built-in tools need tight integration (DB access for assertions, direct result persistence). MCP adds transport overhead for internal tools. MCP tools from `McpConnection` records are loaded separately and merged into the tool set.

### 3. One Run per suite execution, one TestResult per case

Triggering a suite run creates one `Run` record (type=TEST, linked to suite/environment/agent). The runner iterates cases sequentially. Each case produces one `TestResult` with child `Assertion` records.

**Rationale:** Matches the data model. Sequential execution is simpler, more predictable, and easier to debug. Parallel execution is a future optimization.

### 4. SSE via a Next.js route handler, not WebSocket

Create `apps/web/app/api/runs/[runId]/stream/route.ts` that returns an SSE stream. The worker publishes progress to Redis pub/sub. The SSE endpoint subscribes and forwards events.

**Rationale:** SSE is simpler than WebSocket, works through proxies/CDNs, and matches the existing "SSE first" preference. Redis pub/sub decouples worker from web process.

### 5. Prompt template rendering with Handlebars-style interpolation

The AgentDefinition's `promptTemplate` uses `{{variable}}` syntax. Before calling the model, the runner renders the template with: `testCase` (current case), `environment` (resolved env config), `suite` (suite metadata). Simple string replacement — no template engine dependency.

**Rationale:** Keeps it simple. The template variables are well-known and finite.

### 6. Tool result → Assertion mapping

Each built-in tool that performs a check (assert-visible, assert-text, assert-status-code, etc.) returns a structured result with `{ passed, expected, actual }`. The runner maps these to `Assertion` records on the current `TestResult`.

**Rationale:** Makes every agent assertion a first-class data point, enabling aggregation, flakiness tracking, and detailed reporting.

## Risks / Trade-offs

- **AI model costs are unbounded per run** → Mitigate with `maxSteps` on AgentDefinition (default 50). Add token tracking on RunStep. Future: budget enforcement.
- **Agent may hallucinate tool calls or produce invalid results** → Mitigate with strict tool parameter schemas (Zod). Log all raw model responses in RunStep.
- **Sequential case execution is slow for large suites** → Accept for now. Design the runner interface so parallelization can be added without changing the data model.
- **No real browser for WEB tests** → Built-in browser tools return simulated results for now. Next change adds Playwright integration.
- **Redis pub/sub messages are fire-and-forget** → If the SSE client reconnects, it misses intermediate events. Mitigate by always querying the Run record for current state on reconnect.

## Migration Plan

1. Implement built-in testing tools in `packages/ai/src/agent/tools/`
2. Implement the agent executor in `packages/ai/src/agent/executor.ts`
3. Implement the test runner orchestrator in `packages/ai/src/agent/runner.ts`
4. Wire the `ai.agent-run` Trigger.dev task to use the runner
5. Add `run.trigger` tRPC mutation
6. Add SSE streaming endpoint with Redis pub/sub
7. Add "Run suite" button to the suite detail UI
8. Add live run progress component
9. Test end-to-end with API target type (simplest — no browser needed)

**Rollback:** Revert to stub agent-run task. No schema changes needed.

## Open Questions

- Should the runner support a "dry run" mode that validates the agent setup without calling the model? Recommendation: yes, add later as a separate flag.
- Should tool execution have individual timeouts? Recommendation: yes, 30s default per tool call, configurable on AgentDefinition.
