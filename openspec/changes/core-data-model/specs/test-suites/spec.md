## ADDED Requirements

### Requirement: Test suite belongs to a project
The system SHALL store test suites as project-scoped entities with a unique slug per project. Each test suite MUST have a name, slug, description, and target type.

#### Scenario: Create a test suite
- **WHEN** a user creates a test suite with name "Login Flow Tests", target type WEB, in project "my-app"
- **THEN** the system creates a TestSuite record with an auto-generated slug "login-flow-tests", linked to the project

#### Scenario: Slug uniqueness within project
- **WHEN** a user creates a test suite with slug "login-flow-tests" in a project that already has that slug
- **THEN** the system rejects the creation with a unique constraint error

### Requirement: Test suite has configuration
The system SHALL store suite-level configuration as a JSON column including: default environment ID, scheduling settings (cron expression), retry policy, parallelism settings, and tags.

#### Scenario: Suite with schedule
- **WHEN** a test suite is created with config `{"schedule": "0 */6 * * *", "parallelism": 4}`
- **THEN** the system stores the configuration and the suite can be queried by scheduled suites

### Requirement: Test suite can be archived
The system SHALL support soft-archiving test suites via an `archived` boolean flag. Archived suites MUST NOT appear in default listings but MUST remain queryable with an explicit filter.

#### Scenario: Archive a suite
- **WHEN** a user archives a test suite
- **THEN** the suite's `archived` flag is set to true and it no longer appears in the default project suite list

### Requirement: Test suite tracks run history
The system SHALL relate test suites to runs via the `testSuiteId` foreign key on Run. A test suite MUST be queryable for its recent runs, latest status, and pass rate.

#### Scenario: Query suite run history
- **WHEN** a user views a test suite that has been executed 10 times
- **THEN** the system returns the list of runs with their statuses, ordered by creation date descending
