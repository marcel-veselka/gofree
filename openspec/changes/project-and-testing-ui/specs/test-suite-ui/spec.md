## ADDED Requirements

### Requirement: User can create a test suite from the project page
The project page Test Suites tab SHALL have a "New test suite" button that opens a dialog with fields: name (required), target type (required, dropdown of TargetType values), description (optional). On submit, the suite is created via `trpc.testSuite.create`.

#### Scenario: Create web test suite
- **WHEN** a user fills in name "Login Tests", selects target type WEB, and clicks Create
- **THEN** the dialog closes and the new suite appears in the list

### Requirement: Test suite detail page shows cases and stats
The test suite page at `(app)/[org]/[project]/suites/[suite]` SHALL display: suite name, description, target type badge, test case count, and a table of test cases ordered by position.

#### Scenario: Suite with test cases
- **WHEN** a user views a suite with 5 test cases
- **THEN** the page shows 5 rows in a table with columns: position, title, target type, priority, tags

#### Scenario: Empty suite
- **WHEN** a user views a suite with no test cases
- **THEN** the page shows an empty state with a prompt to add the first test case

### Requirement: User can create a test case from the suite page
The suite page SHALL have an "Add test case" button that opens a dialog with fields: title (required), target type (required), priority (optional, defaults to MEDIUM), tags (optional, comma-separated). On submit, the case is created via `trpc.testCase.create` with auto-assigned position.

#### Scenario: Create test case
- **WHEN** a user fills in title "Verify checkout flow" with target WEB and priority HIGH
- **THEN** the case is created at the next position and appears at the bottom of the table

### Requirement: Test suite shows run history
The suite page SHALL display a "Recent Runs" section showing the last 5 runs with status badges (PENDING/RUNNING/COMPLETED/FAILED/CANCELLED), timestamp, and test result count.

#### Scenario: Suite with runs
- **WHEN** a suite has been executed 3 times
- **THEN** the Recent Runs section shows 3 entries with status badges and timestamps

#### Scenario: Suite with no runs
- **WHEN** a suite has never been executed
- **THEN** the Recent Runs section shows "No runs yet"

### Requirement: User can archive a test suite
The suite page SHALL have an archive action (button or menu item). Archiving sets the suite's `archived` flag via `trpc.testSuite.archive`. Archived suites are hidden from the default project view but accessible via a filter.

#### Scenario: Archive a suite
- **WHEN** a user clicks "Archive" on a suite
- **THEN** the suite disappears from the default list and can be found via "Show archived"
