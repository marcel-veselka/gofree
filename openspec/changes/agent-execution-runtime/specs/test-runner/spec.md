## ADDED Requirements

### Requirement: Runner creates a Run record and iterates test cases
The test runner SHALL create a `Run` record with type=TEST, linked to the test suite, environment, and agent definition. It SHALL iterate over all non-archived test cases in the suite in position order, executing each one sequentially.

#### Scenario: Run a suite with 3 test cases
- **WHEN** a suite run is triggered with 3 test cases
- **THEN** the runner creates 1 Run record, executes cases in position order (0, 1, 2), and creates 3 TestResult records

### Requirement: Runner resolves environment configuration
The runner SHALL load the specified environment (or the project's default environment) and merge its config and secrets into the agent's execution context. Template variables in the prompt (`{{environment.baseUrl}}`) SHALL be resolved with actual values.

#### Scenario: Environment with baseUrl
- **WHEN** a run uses an environment with config `{"baseUrl": "https://staging.example.com"}`
- **THEN** the agent prompt template variable `{{environment.baseUrl}}` is replaced with `https://staging.example.com`

### Requirement: Runner renders agent prompt template per test case
The runner SHALL render the agent definition's prompt template for each test case, substituting `{{testCase.title}}`, `{{testCase.steps}}`, `{{testCase.expectedAssertions}}`, `{{environment.*}}`, and `{{suite.name}}`.

#### Scenario: Prompt with test case context
- **WHEN** the agent template is "Test: {{testCase.title}} on {{environment.baseUrl}}"
- **THEN** the rendered prompt for a case "Login flow" is "Test: Login flow on https://staging.example.com"

### Requirement: Runner invokes AI model with tools and persists steps
The runner SHALL call the AI model using `generateText` with the rendered prompt and available tools. Each model invocation (including tool calls and results) SHALL be persisted as a `RunStep` record with input, output, timing, and error fields.

#### Scenario: Agent makes 3 tool calls
- **WHEN** the AI model responds with 3 sequential tool calls for a test case
- **THEN** 3 RunStep records are created with type, input, output, and timestamps

### Requirement: Runner maps tool results to assertions
When a testing tool returns a structured assertion result (`{ passed, expected, actual }`), the runner SHALL create an `Assertion` record on the current `TestResult`.

#### Scenario: Assert tool returns pass
- **WHEN** the `assert-status-code` tool returns `{ passed: true, expected: 200, actual: 200 }`
- **THEN** an Assertion record is created with passed=true, expected=200, actual=200

### Requirement: Runner determines test case status from assertions
After all steps for a test case complete, the runner SHALL set the TestResult status: PASSED if all assertions passed, FAILED if any assertion failed, ERROR if the agent errored, SKIPPED if the case was skipped.

#### Scenario: Mixed assertions
- **WHEN** a test case produces 5 assertions — 4 passed, 1 failed
- **THEN** the TestResult status is set to FAILED

### Requirement: Runner handles failures gracefully
The runner SHALL catch model errors, tool timeouts, and unexpected exceptions. On failure, it SHALL set the TestResult status to ERROR with the error message, then continue to the next test case. The Run status SHALL be FAILED if any case errored or failed.

#### Scenario: Model timeout
- **WHEN** the AI model times out after 5 minutes on a test case
- **THEN** the TestResult is marked ERROR with message "Model timeout", and the runner proceeds to the next case

### Requirement: Runner enforces max steps
The runner SHALL enforce the agent definition's `maxSteps` configuration. If the model exceeds max steps for a single test case, the runner SHALL stop that case and mark it ERROR.

#### Scenario: Max steps exceeded
- **WHEN** an agent has maxSteps=50 and the model makes 51 tool calls on one case
- **THEN** the TestResult is marked ERROR with message "Max steps exceeded (50)"

### Requirement: Runner updates Run status on completion
After all test cases are processed, the runner SHALL set the Run status to COMPLETED (if all cases passed), FAILED (if any case failed or errored), and record completedAt and total token usage.

#### Scenario: All cases pass
- **WHEN** a run with 5 test cases completes with all PASSED
- **THEN** the Run status is COMPLETED with completedAt set
