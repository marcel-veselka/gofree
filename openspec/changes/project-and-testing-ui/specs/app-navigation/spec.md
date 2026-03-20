## ADDED Requirements

### Requirement: Sidebar shows project list
The `(app)` layout sidebar SHALL display a list of projects for the current organization below the org switcher. Each project link navigates to `/{org}/{project}`. The active project SHALL be visually highlighted based on the current route.

#### Scenario: Navigate to project
- **WHEN** a user clicks a project name in the sidebar
- **THEN** the app navigates to `/{org}/{project}` and the sidebar item shows active state

#### Scenario: No projects
- **WHEN** the org has no projects
- **THEN** the sidebar shows "No projects" with a small "Create" link

### Requirement: Breadcrumb navigation in header
The header SHALL display breadcrumbs reflecting the current route hierarchy: Org > Project > Suite. Each breadcrumb segment SHALL be a clickable link. The last segment SHALL be non-clickable (current page).

#### Scenario: On project page
- **WHEN** a user is on `/{org}/{project}`
- **THEN** breadcrumbs show: `{org name} / {project name}`

#### Scenario: On suite page
- **WHEN** a user is on `/{org}/{project}/suites/{suite}`
- **THEN** breadcrumbs show: `{org name} / {project name} / {suite name}`

### Requirement: Sidebar project list is collapsible
Each project in the sidebar SHALL expand to show sub-items: Test Suites, Environments, Agents. The expanded state SHALL persist during navigation within that project.

#### Scenario: Expand project in sidebar
- **WHEN** a user clicks the expand arrow on a project
- **THEN** sub-items appear: "Test Suites", "Environments", "Agents"

#### Scenario: Navigate within expanded project
- **WHEN** a user clicks "Test Suites" under an expanded project
- **THEN** the app navigates to `/{org}/{project}?tab=suites` and the sidebar remains expanded

### Requirement: Mobile navigation works
On mobile viewports, the sidebar SHALL be hidden by default and accessible via a hamburger menu. The breadcrumbs SHALL be visible in the header on all viewport sizes.

#### Scenario: Mobile sidebar toggle
- **WHEN** a user taps the hamburger menu on mobile
- **THEN** the sidebar slides in as an overlay with the same project navigation
