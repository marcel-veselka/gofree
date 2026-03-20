## Why

The core data model for test suites, cases, environments, agents, and results exists with full tRPC routers and seed data — but the UI shows only placeholders. Users who sign up see a dashboard with "0 tests" and "Project overview coming soon." There's no way to create projects, define test suites, or view any testing data through the app. This change wires real data into the UI and builds the first complete feature loop from project creation through test suite management.

## What Changes

- Replace the org dashboard placeholder stats with real queries (project count, total test suites, recent runs)
- Add a project list to the org dashboard showing real projects with their test suite counts
- Build a "Create project" dialog/form accessible from the org dashboard
- Build the project detail page with test suite listing, environment listing, and agent definition listing
- Build the test suite detail page with test case list, suite stats, and run history
- Build "Create test suite" and "Create test case" forms
- Add sidebar navigation: org → projects → suites within the `(app)` layout
- Add breadcrumb navigation for org > project > suite > case hierarchy

## Capabilities

### New Capabilities
- `project-management-ui`: Project list, create, and detail pages wired to tRPC — the first CRUD loop through the full stack
- `test-suite-ui`: Test suite list, create, detail, and test case management within a project
- `app-navigation`: Sidebar nav with project tree, breadcrumbs, and route-aware active states

### Modified Capabilities
(none)

## Impact

- **apps/web**: New pages and components for project CRUD, test suite management, navigation
- **apps/web/components**: New shared components — breadcrumbs, sidebar nav items, create dialogs, stat cards, data tables
- **packages/ui**: May add reusable primitives (dialog, form components) if not already present from shadcn
- No backend changes — all tRPC routers already exist from the core-data-model change
