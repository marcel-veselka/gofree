## ADDED Requirements

### Requirement: tRPC mutation to trigger a suite run
The system SHALL provide a `run.trigger` tRPC mutation that creates a Run record, enqueues the `ai.agent-run` Trigger.dev task, and returns the run ID immediately.

#### Scenario: Trigger a suite run
- **WHEN** a user calls `run.trigger` with suiteId, environmentId (optional), and agentDefinitionId (optional)
- **THEN** the system creates a Run with status=PENDING, enqueues the worker task, and returns `{ runId: "..." }`

### Requirement: Default agent and environment resolution
When `agentDefinitionId` is not specified, the system SHALL use the latest version of the first agent definition in the project. When `environmentId` is not specified, the system SHALL use the project's default environment.

#### Scenario: No explicit agent or environment
- **WHEN** a user triggers a run without specifying agent or environment
- **THEN** the system resolves the project's default environment (isDefault=true) and the latest agent definition

### Requirement: Run trigger requires member role
Only users with MEMBER role or above SHALL be able to trigger runs. VIEWER role SHALL be rejected.

#### Scenario: Viewer tries to trigger
- **WHEN** a user with VIEWER role calls `run.trigger`
- **THEN** the system returns a FORBIDDEN error

### Requirement: UI button to trigger suite run
The suite detail page SHALL have a "Run suite" button that calls `run.trigger` and navigates to or refreshes the Recent Runs section to show the new run.

#### Scenario: Click Run suite
- **WHEN** a user clicks "Run suite" on a suite with 3 test cases
- **THEN** a new run appears in Recent Runs with status PENDING, then transitions to RUNNING as the worker picks it up
