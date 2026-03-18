## Context

GoFree uses Better Auth v1.5.5 with Prisma adapter for authentication. The server-side auth instance is configured in `packages/auth/src/auth.ts` with email/password enabled and the organization plugin. The auth API route handler is at `apps/web/app/api/auth/[...auth]/route.ts`. The client-side auth hooks (`signIn`, `signUp`, `signOut`, `useSession`) are exported from `packages/auth/src/client.ts`.

The database already has `User`, `Session`, `Account`, and `Verification` models that support both email/password and OAuth flows — no schema changes needed.

Currently: login page is a stub, no signup page exists, no middleware protects routes, no session-aware UI.

## Goals / Non-Goals

**Goals:**

- Working email/password registration and login with proper form validation
- GitHub OAuth sign-in as an alternative auth method
- Protected routes for `(app)` and `(workspace)` route groups
- Session-aware header with user info and sign-out
- Clean, minimal auth UI using Tailwind (no additional UI libraries)

**Non-Goals:**

- Magic link, passwordless, or 2FA authentication
- Enterprise SSO (SAML/OIDC)
- Email verification flow (deferred — Better Auth supports it but not wired in v1)
- Password reset flow (deferred)
- User profile/settings page

## Decisions

### D1: Client components for auth forms

Auth forms require interactivity (state, event handlers, error display). Use `'use client'` directive on form components. Layouts remain server components.

**Rationale:** Next.js app router requires client components for interactive forms. Better Auth's React hooks (`signIn`, `signUp`) only work in client components.

### D2: Better Auth social providers for GitHub OAuth

Add `socialProviders.github` to the Better Auth server config. Better Auth handles the full OAuth flow (redirect → GitHub → callback → session creation) automatically via the existing `[...auth]` catch-all route.

**Rationale:** No custom OAuth implementation needed. Better Auth abstracts the entire flow. Just needs `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` env vars.

**Alternative considered:** Manual OAuth with `next-auth` or custom implementation — rejected because Better Auth already supports this natively.

### D3: Next.js middleware for route protection

Create `apps/web/middleware.ts` that checks for a session cookie on `(app)` and `(workspace)` routes. Unauthenticated users get redirected to `/login` with a `callbackUrl` parameter for post-login redirect.

**Rationale:** Next.js middleware runs at the edge before page rendering — fastest way to protect routes without loading page components. Better Auth provides a `getSession` helper for middleware.

**Alternative considered:** Checking session in each layout's server component — rejected because it's repetitive and slower (page starts rendering before redirect).

### D4: Inline form components (no shared form library)

Build login and signup forms directly in their page files using standard HTML form elements + Tailwind styling. No form library (react-hook-form, formik).

**Rationale:** Two simple forms don't justify adding a form library. Standard React state + Better Auth hooks are sufficient. Can add a form library later if form complexity grows.

### D5: Callback URL preservation

Store the original URL in a `callbackUrl` search parameter during middleware redirect. After successful auth, redirect to `callbackUrl` or default to `/`.

**Rationale:** Standard pattern for auth flows. Prevents users from losing their place after login.

## Risks / Trade-offs

- **[GitHub OAuth requires a GitHub App]** → Document env var setup in `.env.example` with comments. App works without GitHub OAuth (email/password still available).
- **[No email verification in v1]** → Users can register with any email. Acceptable for early stage; Better Auth has built-in verification that can be enabled later.
- **[Middleware runs on every request to protected routes]** → Session cookie check is fast (no DB call in middleware). Only validates cookie existence, not session validity. Full session validation happens server-side.
- **[No CSRF protection on forms]** → Better Auth handles CSRF tokens internally via its API endpoints. Forms POST to Better Auth API, not custom endpoints.
