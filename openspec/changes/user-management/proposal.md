## Why

Users can register and log in, but the platform has no user management or access control. The tRPC context lacks session data, so all API routes run unauthenticated. Org routers don't filter by user membership, there are no protected procedures, and the app UI doesn't show any org context or personalized greeting. This blocks multi-tenant features and leaves all data accessible to any authenticated user.

## What Changes

- Wire Better Auth session into tRPC context so all routers know the current user
- Add `protectedProcedure` and `orgProcedure` tRPC middleware for auth and org-scoped access
- Org routers: filter by user memberships, auto-create org+membership on signup, permission-gated mutations
- Project routers: permission-gated CRUD scoped to org membership
- Member management: invite users, change roles, remove members (ADMIN+ only)
- App shell: personalized greeting showing user's first name, org switcher in sidebar
- Seed: create test user with org membership for dev workflow

## Capabilities

### New Capabilities

- `user-management`: Session-aware tRPC context, protected procedures, org-scoped member management, role-gated mutations, personalized app greeting, and org switcher UI

### Modified Capabilities

## Impact

- `packages/api/src/trpc/context.ts` — extract session from Better Auth
- `packages/api/src/trpc/router.ts` — add protectedProcedure, orgProcedure middleware
- `packages/api/src/trpc/routers/org.ts` — filter by membership, add member management mutations
- `packages/api/src/trpc/routers/project.ts` — add permission checks
- `packages/api/src/trpc/routers/member.ts` — new router for member CRUD
- `packages/auth/src/auth.ts` — no changes needed (Better Auth already supports getSession)
- `apps/web/app/(app)/layout.tsx` — personalized greeting, org switcher
- `apps/web/app/(app)/[org]/page.tsx` — show members list, invite UI
- `packages/db/prisma/seed.ts` — add test user + membership
- No schema changes needed — existing models cover all requirements
