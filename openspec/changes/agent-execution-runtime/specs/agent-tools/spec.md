## ADDED Requirements

### Requirement: Assert tools return structured results
All assertion tools SHALL return a structured object `{ passed: boolean, expected: unknown, actual: unknown, message?: string }` that the runner maps to Assertion records.

#### Scenario: Status code assertion
- **WHEN** the `assert-status-code` tool is called with expected=200 and the API returned 404
- **THEN** the tool returns `{ passed: false, expected: 200, actual: 404, message: "Expected 200 but got 404" }`

### Requirement: API call tool
The system SHALL provide an `api-call` tool that makes HTTP requests. Parameters: method, url, headers, body, timeout. Returns: statusCode, headers, body, durationMs.

#### Scenario: GET request
- **WHEN** the agent calls `api-call` with method=GET, url="https://api.example.com/health"
- **THEN** the tool makes the HTTP request and returns `{ statusCode: 200, body: {...}, durationMs: 45 }`

### Requirement: Assert status code tool
The system SHALL provide an `assert-status-code` tool. Parameters: actual (number), expected (number). Returns structured assertion result.

#### Scenario: Matching status
- **WHEN** the agent calls `assert-status-code` with actual=200, expected=200
- **THEN** the tool returns `{ passed: true, expected: 200, actual: 200 }`

### Requirement: Assert JSON path tool
The system SHALL provide an `assert-json-path` tool. Parameters: json (object), path (JSONPath string), expected (unknown). Returns structured assertion result with the actual value at the path.

#### Scenario: JSON path match
- **WHEN** the agent calls `assert-json-path` with json=`{"data":{"count":5}}`, path="$.data.count", expected=5
- **THEN** the tool returns `{ passed: true, expected: 5, actual: 5 }`

### Requirement: Assert contains tool
The system SHALL provide an `assert-contains` tool. Parameters: text (string), substring (string). Returns structured assertion result.

#### Scenario: Text contains substring
- **WHEN** the agent calls `assert-contains` with text="Welcome back, John", substring="Welcome"
- **THEN** the tool returns `{ passed: true, expected: "contains 'Welcome'", actual: "Welcome back, John" }`

### Requirement: DB query tool
The system SHALL provide a `db-query` tool that executes read-only SQL queries. Parameters: query (string), connectionString (resolved from environment secrets). Returns: rows, rowCount, durationMs. The tool SHALL reject write operations (INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE).

#### Scenario: SELECT query
- **WHEN** the agent calls `db-query` with query="SELECT count(*) as cnt FROM users"
- **THEN** the tool returns `{ rows: [{ cnt: 42 }], rowCount: 1, durationMs: 12 }`

#### Scenario: Write query blocked
- **WHEN** the agent calls `db-query` with query="DELETE FROM users"
- **THEN** the tool returns an error "Write operations are not allowed in test queries"

### Requirement: Browser simulation tools (placeholder)
The system SHALL provide placeholder browser tools (`browser-navigate`, `browser-click`, `browser-fill`, `browser-screenshot`) that return simulated success responses. These tools SHALL be replaced with real Playwright integration in a future change.

#### Scenario: Navigate simulation
- **WHEN** the agent calls `browser-navigate` with url="/login"
- **THEN** the tool returns `{ success: true, url: "/login", title: "Simulated page", message: "Browser automation not yet connected — simulated success" }`

### Requirement: Report result tool
The system SHALL provide a `report-result` tool that the agent calls to explicitly report a test case outcome. Parameters: status (passed/failed/skipped), summary (string). This allows the agent to declare the overall case result beyond individual assertions.

#### Scenario: Agent reports pass
- **WHEN** the agent calls `report-result` with status="passed", summary="All checks passed"
- **THEN** the runner records the reported status as a factor in the final TestResult status
