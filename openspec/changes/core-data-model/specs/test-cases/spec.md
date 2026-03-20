## ADDED Requirements

### Requirement: Test case belongs to a test suite
The system SHALL store test cases within a test suite. Each test case MUST have a title, target type, priority, and an ordered position within the suite.

#### Scenario: Create a test case
- **WHEN** a user adds a test case "Verify login button works" with priority HIGH and target type WEB to suite "Login Flow Tests"
- **THEN** the system creates a TestCase record linked to the suite with the next available position index

### Requirement: Test case has structured steps
The system SHALL store test case steps as a JSON column containing an ordered array of step objects. Each step MUST have a type (navigate, click, fill, assert, api-call, db-query, etc.) and parameters.

#### Scenario: Web test case with steps
- **WHEN** a test case is created with steps `[{"type": "navigate", "url": "/"}, {"type": "click", "selector": "#login"}, {"type": "assert", "check": "visible", "selector": "#dashboard"}]`
- **THEN** the system stores the steps array and it can be retrieved in order

### Requirement: Test case has expected assertions
The system SHALL store expected assertions as a JSON column containing an array of assertion definitions. Each assertion MUST have a type (equals, contains, visible, status-code, row-count, etc.) and expected value.

#### Scenario: API test case with assertions
- **WHEN** a test case targeting API has assertions `[{"type": "status-code", "expected": 200}, {"type": "json-path", "path": "$.data.length", "expected": 5}]`
- **THEN** the system stores the assertions and they can be used by the agent during execution

### Requirement: Test case supports all target types
The system SHALL accept any value from the TargetType enum (WEB, MOBILE, DESKTOP, API, DATABASE, CROSS_PLATFORM) on a test case. Target-specific configuration MUST be stored in a `targetConfig` JSON column.

#### Scenario: Mobile test case
- **WHEN** a test case with target type MOBILE is created with targetConfig `{"platform": "ios", "device": "iPhone 15", "appBundle": "com.example.app"}`
- **THEN** the system stores the target config and associates it with the MOBILE target type

#### Scenario: Database test case
- **WHEN** a test case with target type DATABASE is created with targetConfig `{"dialect": "postgresql", "query": "SELECT count(*) FROM users"}`
- **THEN** the system stores the target config for database testing

### Requirement: Test case is semantically searchable
The system SHALL support a pgvector embedding column on TestCase for semantic search. The embedding MUST be generated asynchronously by the indexing pipeline.

#### Scenario: Search test cases by meaning
- **WHEN** a user searches "check if user can log in" across a project's test cases
- **THEN** the system performs a vector similarity search and returns relevant test cases ranked by relevance

### Requirement: Test case has tags
The system SHALL store tags as a text array column on TestCase. Tags MUST be queryable for filtering test cases within a suite or project.

#### Scenario: Filter by tag
- **WHEN** a user filters test cases by tag "smoke"
- **THEN** the system returns only test cases that include "smoke" in their tags array
