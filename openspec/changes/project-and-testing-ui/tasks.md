## 1. Shared UI Components

- [ ] 1.1 Add shadcn Dialog, Select, Badge, Tabs components to `packages/ui` (if not already present)
- [ ] 1.2 Create `apps/web/components/breadcrumbs.tsx` — route-aware breadcrumb component reading `[org]`, `[project]`, `[suite]` params
- [ ] 1.3 Create `apps/web/components/stat-card.tsx` — reusable stat card (label, value, optional trend)
- [ ] 1.4 Create `apps/web/components/create-dialog.tsx` — generic dialog wrapper with form, title, submit button, error display

## 2. Sidebar Navigation

- [ ] 2.1 Create `apps/web/components/sidebar-nav.tsx` — project list with collapsible sub-items (Suites, Environments, Agents), active state from route
- [ ] 2.2 Update `apps/web/app/(app)/layout.tsx` — integrate sidebar-nav, breadcrumbs in header, keep mobile hamburger working
- [ ] 2.3 Wire `trpc.project.list` into sidebar-nav to show real projects for the current org

## 3. Org Dashboard — Real Data

- [ ] 3.1 Update `apps/web/app/(app)/[org]/org-dashboard.tsx` — replace hardcoded stats with real project count, suite count, latest run queries
- [ ] 3.2 Add project list section to org dashboard — project cards with name, description, suite count, link to project page
- [ ] 3.3 Add "New project" button + dialog — name, description fields, calls `trpc.project.create`, refreshes list on success
- [ ] 3.4 Handle empty state — no projects prompt with create CTA

## 4. Project Detail Page

- [ ] 4.1 Rewrite `apps/web/app/(app)/[org]/[project]/page.tsx` — fetch project via `trpc.project.getBySlug`, display name, description
- [ ] 4.2 Add tabbed layout — Test Suites (default), Environments, Agents tabs using URL search params
- [ ] 4.3 Build Test Suites tab — list from `trpc.testSuite.list`, show name, target type badge, case count, "New test suite" button + dialog
- [ ] 4.4 Build Environments tab — list from `trpc.testEnvironment.list`, show name, target type, default badge
- [ ] 4.5 Build Agents tab — list from `trpc.agentDefinition.list`, show name, model, supported targets, version, run count

## 5. Test Suite Detail Page

- [ ] 5.1 Create route `apps/web/app/(app)/[org]/[project]/suites/[suite]/page.tsx`
- [ ] 5.2 Fetch suite via `trpc.testSuite.getBySlug` — display name, description, target type, config summary
- [ ] 5.3 Build test case table — columns: position, title, target type, priority, tags; ordered by position
- [ ] 5.4 Add "Add test case" button + dialog — title, target type, priority, tags fields
- [ ] 5.5 Add "Recent Runs" section — last 5 runs from `trpc.testSuite.runHistory` with status badges
- [ ] 5.6 Add archive/unarchive action for the suite

## 6. Polish and Verification

- [ ] 6.1 Verify full navigation flow: org → create project → project page → create suite → suite page → add case
- [ ] 6.2 Verify breadcrumbs show correctly at each level
- [ ] 6.3 Verify sidebar active states match current route
- [ ] 6.4 Verify mobile hamburger menu shows project nav
- [ ] 6.5 Verify empty states display correctly for projects, suites, and cases
