## ADDED Requirements

### Requirement: Org dashboard shows real project list
The org dashboard SHALL display a list of projects belonging to the current organization, showing each project's name, description, test suite count, and creation date. The list SHALL be fetched from `trpc.project.list`.

#### Scenario: Org with projects
- **WHEN** a user views the org dashboard and the org has 3 projects
- **THEN** the dashboard displays 3 project cards/rows with name, description, and suite count

#### Scenario: Org with no projects
- **WHEN** a user views the org dashboard and the org has no projects
- **THEN** the dashboard displays an empty state with a prompt to create the first project

### Requirement: Org dashboard shows real stats
The org dashboard stats row SHALL display real counts: total projects, total test suites across all projects, and latest run status. Stats SHALL be derived from tRPC queries.

#### Scenario: Stats with data
- **WHEN** an org has 2 projects with 5 test suites total and the last run was COMPLETED
- **THEN** the stats row shows "2 Projects", "5 Test suites", and "Last run: Completed"

### Requirement: User can create a project from the org dashboard
The org dashboard SHALL have a "New project" button that opens a dialog with fields: name (required), description (optional). On submit, the project is created via `trpc.project.create` and the project list refreshes.

#### Scenario: Create project successfully
- **WHEN** a user fills in name "My API" and clicks Create
- **THEN** the dialog closes, the project appears in the list, and no page navigation occurs

#### Scenario: Create project with duplicate slug
- **WHEN** a user creates a project with a name that generates a slug already in use
- **THEN** the dialog shows an error message from the server

### Requirement: Project detail page shows project overview
The project detail page at `(app)/[org]/[project]` SHALL display the project name, description, and tabbed content for Test Suites, Environments, and Agents.

#### Scenario: View project with suites
- **WHEN** a user navigates to a project that has 2 test suites
- **THEN** the Test Suites tab (default) shows 2 suite cards with name, target type, case count, and archived status

#### Scenario: View project environments tab
- **WHEN** a user clicks the Environments tab on a project page
- **THEN** the page shows a list of test environments with name, target type, and default badge
