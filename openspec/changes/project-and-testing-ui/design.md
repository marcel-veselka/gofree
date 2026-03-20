## Context

GoFree has a working Next.js app with route groups: `(marketing)`, `(auth)`, `(app)`, `(workspace)`. The `(app)` group has a sidebar + header shell. Currently the org page shows a dashboard with hardcoded stats and a member list. The project page is a stub. All testing tRPC routers (testSuite, testCase, testEnvironment, agentDefinition, testResult) are wired and returning data from the seed.

Tech stack: Next.js App Router (Turbopack), Tailwind, tRPC client via `@/lib/trpc`, client components with `trpc.X.useQuery`.

## Goals / Non-Goals

**Goals:**
- Wire real project and testing data into every visible page
- Enable users to create projects, test suites, and test cases through the UI
- Provide clear navigation from org → project → suite → case
- Make the dashboard feel alive with real counts and statuses
- Keep all pages responsive and fast (client-side queries, optimistic updates)

**Non-Goals:**
- Agent execution or "Run test" functionality (next change)
- Test case step editor with drag-and-drop (future change)
- Workspace/IDE view (`(workspace)` route group — future)
- Settings pages (org settings, project settings — future)
- File uploads or screenshot viewing

## Decisions

### 1. Client components with tRPC hooks for all data pages

All project/suite/case pages use `'use client'` with `trpc.X.useQuery` and `trpc.X.useMutation`. No RSC data fetching — keeps the pattern consistent with the existing org-dashboard.tsx.

**Rationale:** Matches existing patterns. tRPC client hooks give us loading/error states, refetch, and optimistic updates for free. RSC would require duplicating the tRPC context setup on the server side.

**Alternative:** Server components with tRPC caller. Rejected — adds complexity for no clear benefit at this stage.

### 2. Sidebar navigation with collapsible project tree

Extend the existing sidebar in `(app)/layout.tsx` with: org home link, project list (collapsible), and per-project links to suites/environments/agents. Active state derived from URL params.

**Rationale:** GitHub-style navigation. Users need to see their project hierarchy at all times.

### 3. Inline dialogs for create actions (not separate pages)

"Create project", "Create test suite", and "Create test case" use modal dialogs (shadcn Dialog) rather than separate routes. After creation, the list refreshes and the dialog closes.

**Rationale:** Fewer page transitions. The forms are small (3-5 fields). Keeps the user in context.

### 4. Breadcrumb component derived from route params

A `<Breadcrumbs>` component reads route params (`org`, `project`, optionally `suite`) and renders a clickable path. Placed in the header bar.

**Rationale:** Standard pattern for hierarchical navigation. Works well with Next.js dynamic route segments.

### 5. Project detail page as a tabbed layout

The project page has tabs: Test Suites (default), Environments, Agents. Each tab queries its own tRPC router. Tabs are URL-driven via search params (`?tab=environments`).

**Rationale:** Avoids creating separate routes for each entity type within a project. Keeps the project as the primary navigation unit.

### 6. Test suite detail page with case table and run sidebar

The suite page shows: suite name/description at top, test case table (sortable by position, filterable by tag/target), and a collapsible "Recent Runs" panel on the right.

**Rationale:** Test cases are the primary content. Run history is secondary but always accessible.

## Risks / Trade-offs

- **No loading skeletons yet** → Accept for now. Add shimmer skeletons in a polish pass.
- **Inline dialogs don't support complex forms** → If test case creation grows complex (step editor), we'll migrate to a dedicated page. For now, basic fields only.
- **Client-only data means no SEO** → Acceptable — app pages behind auth don't need SEO.
- **Sidebar may get long with many projects** → Add search/filter to project list when > 10 projects. Skip for now.
