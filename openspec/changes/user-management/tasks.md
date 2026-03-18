## 1. Session-Aware tRPC Context

- [x] 1.1 Update `packages/api/src/trpc/context.ts` to extract session from Better Auth using `auth.api.getSession({ headers })`
- [x] 1.2 Create `protectedProcedure` in `packages/api/src/trpc/router.ts` that throws UNAUTHORIZED if no session
- [x] 1.3 Create `orgProcedure` in `packages/api/src/trpc/router.ts` that takes `orgSlug` input, resolves org + membership, and attaches to context

## 2. Org Routers with Permissions

- [x] 2.1 Update `org.list` to filter by current user's memberships (use protectedProcedure)
- [x] 2.2 Update `org.getBySlug` to use orgProcedure (validates membership)
- [x] 2.3 Update `org.create` to auto-create OWNER membership for the creating user

## 3. Member Management Router

- [x] 3.1 Create `packages/api/src/trpc/routers/member.ts` with: `member.list` (org members), `member.add` (ADMIN+), `member.updateRole` (ADMIN+), `member.remove` (ADMIN+, prevent last OWNER removal)
- [x] 3.2 Wire member router into the root tRPC router

## 4. Project Router Permissions

- [x] 4.1 Update `project.list` and `project.getBySlug` to use orgProcedure
- [x] 4.2 Add `project.create` permission check (MEMBER+) and `project.delete` (ADMIN+)

## 5. Auto-Create Personal Org on Signup

- [x] 5.1 Add Better Auth `databaseHooks.user.create.after` hook in `packages/auth/src/auth.ts` to create personal org + OWNER membership when a new user registers

## 6. App Shell UI

- [x] 6.1 Create `<Greeting>` client component showing "Hello, {firstName}" in app header
- [x] 6.2 Create `<OrgSwitcher>` client component in sidebar that lists user's orgs via `trpc.org.list` and highlights current org from URL
- [x] 6.3 Update `apps/web/app/(app)/layout.tsx` to include Greeting and OrgSwitcher
- [x] 6.4 Set up tRPC provider in `apps/web/app/(app)/layout.tsx` or root layout for client-side queries

## 7. Org Members Page

- [x] 7.1 Update `apps/web/app/(app)/[org]/page.tsx` to show org dashboard with members list
- [x] 7.2 Add role badges and management controls (change role, remove) visible only to ADMIN+

## 8. Dev Seed & Verification

- [x] 8.1 Update `packages/db/prisma/seed.ts` to create a test user with org membership
- [x] 8.2 Verify: login, see greeting with first name, see org in switcher, view members, test role permissions
