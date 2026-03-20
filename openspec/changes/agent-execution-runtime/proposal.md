## Why

The data model, API, and UI for test suites, cases, environments, and agent definitions are complete — but nothing actually runs. When a user clicks "Run test" or triggers a suite execution, nothing happens. The platform's core value proposition is AI agents that autonomously test applications. Without the execution runtime, GoFree is just a test case organizer. This change implements the agent execution loop: trigger a run → load agent definition → execute test cases with AI → write structured results.

## What Changes

- Implement the `ai.agent-run` Trigger.dev task to execute a full test suite run using AI
- Build a test runner orchestrator that loads the agent definition, resolves the environment, iterates over test cases, and invokes the AI model with tools
- Create built-in testing tools (browser automation, API caller, DB query, assertion checker, screenshot capture) that the AI agent can call during execution
- Implement the agent loop: prompt → tool calls → results → next step, with step/result/assertion persistence
- Add a "Run suite" button to the suite detail UI that triggers the worker job
- Add SSE-based live status updates so the UI shows run progress in real time
- Wire the run results into the existing test results UI (suite summary, per-case results, assertions)

## Capabilities

### New Capabilities
- `test-runner`: Orchestration logic that loads a suite, resolves environment, iterates test cases, invokes the AI agent, and persists structured results
- `agent-tools`: Built-in tools the AI agent can call during test execution — browser actions, API calls, DB queries, assertions, screenshots
- `run-trigger`: UI and API surface for triggering test suite runs, including the "Run suite" button and tRPC mutation
- `run-streaming`: SSE endpoint for live run status updates — step progress, case completion, final summary

### Modified Capabilities
(none)

## Impact

- **apps/worker**: `ai.agent-run` task fully implemented with orchestration loop
- **packages/ai**: New `agent/executor.ts` module with the agent execution loop using Vercel AI SDK `generateText` with tools
- **packages/ai**: New `agent/tools/` directory with built-in testing tool definitions
- **packages/api**: New `run.trigger` mutation, new SSE endpoint for run streaming
- **apps/web**: "Run suite" button on suite detail page, live run progress UI
- **packages/realtime**: SSE utilities for run status broadcasting
- **.env.local**: Requires `ANTHROPIC_API_KEY` to be set for Claude model access
