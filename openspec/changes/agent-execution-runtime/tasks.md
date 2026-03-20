## 1. Built-in Testing Tools

- [ ] 1.1 Create `packages/ai/src/agent/tools/api-call.ts` — HTTP request tool using fetch, returns statusCode, headers, body, durationMs
- [ ] 1.2 Create `packages/ai/src/agent/tools/assert-status-code.ts` — compare actual vs expected status code, return structured assertion result
- [ ] 1.3 Create `packages/ai/src/agent/tools/assert-json-path.ts` — extract value at JSONPath, compare with expected, return assertion result
- [ ] 1.4 Create `packages/ai/src/agent/tools/assert-contains.ts` — check if text contains substring, return assertion result
- [ ] 1.5 Create `packages/ai/src/agent/tools/db-query.ts` — execute read-only SQL via pg client, reject write operations, return rows/rowCount/durationMs
- [ ] 1.6 Create `packages/ai/src/agent/tools/browser-simulate.ts` — placeholder browser tools (navigate, click, fill, screenshot) returning simulated success
- [ ] 1.7 Create `packages/ai/src/agent/tools/report-result.ts` — agent declares overall case outcome (passed/failed/skipped + summary)
- [ ] 1.8 Create `packages/ai/src/agent/tools/index.ts` — tool registry that returns the correct tool set for a given TargetType
- [ ] 1.9 Define all tools using Vercel AI SDK `tool()` with Zod parameter schemas

## 2. Agent Executor

- [ ] 2.1 Create `packages/ai/src/agent/executor.ts` — core agent loop using `generateText` with tools, maxSteps enforcement, step persistence callback
- [ ] 2.2 Implement prompt template rendering — replace `{{testCase.*}}`, `{{environment.*}}`, `{{suite.*}}` with actual values
- [ ] 2.3 Add token usage tracking — aggregate prompt + completion tokens from each generateText call
- [ ] 2.4 Add error handling — catch model errors, tool timeouts, map to structured error objects

## 3. Test Runner Orchestrator

- [ ] 3.1 Create `packages/ai/src/agent/runner.ts` — load suite, resolve environment, iterate cases, invoke executor per case
- [ ] 3.2 Implement Run lifecycle management — create Run (PENDING), update to RUNNING, update to COMPLETED/FAILED on finish
- [ ] 3.3 Implement TestResult creation per case — map executor results to TestResult + Assertion records
- [ ] 3.4 Implement progress publishing — emit events to Redis pub/sub channel `run:{runId}:progress`
- [ ] 3.5 Handle environment secrets resolution — decrypt/resolve secrets for tool use
- [ ] 3.6 Export runner from `packages/ai/src/index.ts`

## 4. Trigger.dev Task

- [ ] 4.1 Implement `apps/worker/src/jobs/ai/agent-run.ts` — wire to runner, pass runId, handle task-level errors
- [ ] 4.2 Add `ANTHROPIC_API_KEY` to `.env.local` and document required env vars
- [ ] 4.3 Verify task registration with `trigger.dev dev`

## 5. Run Trigger API

- [ ] 5.1 Create `packages/api/src/trpc/routers/run.ts` — `trigger` mutation: create Run, resolve defaults, enqueue task, return runId
- [ ] 5.2 Add default agent/environment resolution logic — latest agent version, project default environment
- [ ] 5.3 Register run router in main app router
- [ ] 5.4 Add permission check — require MEMBER role

## 6. SSE Streaming

- [ ] 6.1 Create `packages/realtime/src/run-events.ts` — Redis pub/sub helpers for publishing and subscribing to run progress
- [ ] 6.2 Create `apps/web/app/api/runs/[runId]/stream/route.ts` — SSE endpoint that subscribes to Redis channel and streams events
- [ ] 6.3 Implement reconnection snapshot — on connect, query current Run state and send as initial `run:snapshot` event
- [ ] 6.4 Export SSE event types from `packages/realtime/src/index.ts`

## 7. UI — Run Suite and Live Progress

- [ ] 7.1 Add "Run suite" button to suite detail page — calls `trpc.run.trigger`, refreshes run list
- [ ] 7.2 Create `apps/web/components/run-progress.tsx` — connects to SSE endpoint, shows live case progress, pass/fail counters
- [ ] 7.3 Integrate run-progress component into suite detail page for the latest active run
- [ ] 7.4 Show run results inline — expand a run in Recent Runs to see per-case results and assertions

## 8. Verification

- [ ] 8.1 End-to-end test: create suite with API test cases → trigger run → verify Run + TestResult + Assertion records created
- [ ] 8.2 Verify SSE stream delivers events during a run
- [ ] 8.3 Verify UI shows run progress and final results
- [ ] 8.4 Verify error handling: trigger run with invalid agent definition → run marked FAILED with error
- [ ] 8.5 Verify maxSteps enforcement: agent exceeds limit → case marked ERROR
