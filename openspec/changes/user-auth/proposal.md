## Why

GoFree has the auth backend wired up (Better Auth + Prisma + API route) but no usable frontend. Users cannot register, log in, or authenticate with GitHub. App and workspace routes are unprotected — anyone can access them without a session. This blocks all further feature development that depends on knowing who the user is.

## What Changes

- Add **email/password registration and login** frontend (signup + login pages with forms)
- Add **GitHub OAuth** as a social sign-in provider (server config + frontend button)
- Add **Next.js middleware** to protect `(app)` and `(workspace)` route groups, redirecting unauthenticated users to `/login`
- Add **session-aware UI** to the app shell (user menu with avatar, name, sign-out)
- Update **environment config** with GitHub OAuth credentials

## Capabilities

### New Capabilities

- `user-auth`: Email/password registration and login flows, GitHub OAuth, auth middleware, and session-aware navigation UI

### Modified Capabilities

## Impact

- `packages/auth/src/auth.ts` — add GitHub social provider config
- `apps/web/app/(auth)/` — replace stub login page, add signup page
- `apps/web/middleware.ts` — new file protecting authenticated routes
- `apps/web/app/(app)/layout.tsx` — add session-aware header
- `.env.example` — add `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- No new packages required — Better Auth already supports social providers and React hooks
- No database schema changes — existing User/Session/Account models handle GitHub OAuth
