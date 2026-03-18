## Context

GoFree has working auth (login/signup/GitHub OAuth) and route protection via middleware. However the tRPC API layer has no session awareness — `ctx.session` is `null`. Org/project routers return unscoped data. No user management UI exists. The app shell shows no personalized content.

Better Auth provides a `auth.api.getSession()` method that validates session tokens server-side. The existing `packages/auth` package exports everything needed.

## Goals / Non-Goals

**Goals:**
- Wire session into tRPC context using Better Auth's `getSession`
- Build `protectedProcedure` and `orgProcedure` reusable middleware
- Implement org-scoped member management (invite, role change, remove)
- Auto-create personal org on signup via Better Auth hooks
- Personalized greeting in app header (first name)
- Org switcher in sidebar
- Members list on org page with role-gated management controls

**Non-Goals:**
- Email invitation system (just add by email for now)
- Project-level memberships (org membership covers all projects)
- Team management (teams exist in schema but deferred)
- Audit log implementation (table exists but deferred)

## Decisions

### D1: Session extraction via Better Auth `getSession`

Use `auth.api.getSession({ headers })` in `createTRPCContext` to validate the session cookie server-side. This makes a DB call per request but guarantees session validity (not just cookie existence).

**Alternative**: Parse cookie manually and trust it — rejected because it skips session expiry validation.

### D2: Layered tRPC middleware

Build three procedure layers:
- `publicProcedure` — no auth required (existing)
- `protectedProcedure` — requires valid session, attaches `ctx.session`
- `orgProcedure` — extends protected, requires `orgSlug` input, resolves org + membership, attaches `ctx.org` and `ctx.membership`

**Rationale**: Clean separation. Most routes need org context so `orgProcedure` avoids repeated boilerplate.

### D3: Auto-create org via Better Auth `after` hook

Use Better Auth's `hooks.after` on the signup flow to create a personal org + OWNER membership in the same transaction.

**Alternative**: tRPC mutation wrapper — rejected because GitHub OAuth signup bypasses tRPC.

### D4: Greeting as client component reading session

Use `authClient.useSession()` in a `<Greeting>` client component. Extract first name from `session.user.name.split(' ')[0]`. Place in app header next to UserMenu.

**Rationale**: Session is already cached client-side by Better Auth. No additional API call needed.

### D5: Org switcher as tRPC query + client component

New `org.listMine` query returns user's orgs. Client component in sidebar renders the list. Current org is derived from URL param `[org]`.

**Rationale**: tRPC gives type-safe data fetching. URL-based org selection is standard (GitHub pattern).

## Risks / Trade-offs

- **[getSession per request adds DB call]** → Acceptable at 10-50 user scale. Can add Redis session cache later.
- **[Auto-org creation in auth hook]** → If hook fails, user is created without org. Mitigation: wrap in transaction, add fallback check in `org.list`.
- **[No invitation emails]** → Members are added directly by email. Good enough for v1; can add email invites later via Brevo.
