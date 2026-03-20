## ADDED Requirements

### Requirement: SSE endpoint for run progress
The system SHALL provide an SSE endpoint at `/api/runs/[runId]/stream` that streams run progress events. Events include: `run:started`, `case:started`, `step:completed`, `case:completed`, `run:completed`.

#### Scenario: Subscribe to run progress
- **WHEN** a client connects to `/api/runs/{runId}/stream`
- **THEN** the client receives SSE events as the run progresses through test cases

### Requirement: Worker publishes progress to Redis
The worker SHALL publish run progress events to a Redis pub/sub channel `run:{runId}:progress`. Each event SHALL include: type, timestamp, and event-specific data (case index, step result, assertion result, etc.).

#### Scenario: Worker publishes case completion
- **WHEN** the runner finishes test case 2 of 5 with status PASSED
- **THEN** the worker publishes `{ type: "case:completed", caseIndex: 2, status: "PASSED", durationMs: 1200 }` to the Redis channel

### Requirement: SSE endpoint subscribes to Redis and forwards
The SSE endpoint SHALL subscribe to the Redis pub/sub channel for the requested run and forward all events to the connected client. On client disconnect, the subscription SHALL be cleaned up.

#### Scenario: Client receives live updates
- **WHEN** a client is connected to the SSE stream and the worker publishes a `step:completed` event
- **THEN** the client receives the event within seconds

### Requirement: UI shows live run progress
The suite detail page SHALL display live progress for an active run: which test case is currently executing, how many cases are done, pass/fail counts updating in real time.

#### Scenario: Run in progress
- **WHEN** a run is executing case 3 of 5 (2 passed, 0 failed)
- **THEN** the UI shows "Running case 3/5 — 2 passed" with a progress indicator

### Requirement: Reconnection fetches current state
When a client reconnects to the SSE endpoint (after a disconnect), the endpoint SHALL first send the current Run state (status, completed cases, results so far) as an initial event before streaming new updates.

#### Scenario: Client reconnects mid-run
- **WHEN** a client reconnects to a run that is on case 4 of 5
- **THEN** the first event is a `run:snapshot` with current status and results for completed cases 1-3
