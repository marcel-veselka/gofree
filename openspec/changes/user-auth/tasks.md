## 1. Server Auth Config

- [x] 1.1 Add GitHub social provider to `packages/auth/src/auth.ts` with `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` env vars
- [x] 1.2 Add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to `.env.example` and root `.env.local`

## 2. Auth UI Pages

- [x] 2.1 Create login page at `apps/web/app/(auth)/login/page.tsx` with email/password form and "Sign in with GitHub" button (client component)
- [x] 2.2 Create signup page at `apps/web/app/(auth)/signup/page.tsx` with name/email/password form and "Sign up with GitHub" button (client component)
- [x] 2.3 Update auth layout at `apps/web/app/(auth)/layout.tsx` with centered card styling

## 3. Route Protection

- [x] 3.1 Create Next.js middleware at `apps/web/middleware.ts` to protect `(app)` and `(workspace)` routes, redirecting unauthenticated users to `/login?callbackUrl=<original-url>`

## 4. Session-Aware UI

- [x] 4.1 Update `apps/web/app/(app)/layout.tsx` to display authenticated user name/avatar in header and sign-out button
- [x] 4.2 Implement sign-out functionality that destroys session and redirects to `/login`

## 5. Verification

- [x] 5.1 Test email/password registration: visit `/signup`, fill form, verify user created and redirected
- [x] 5.2 Test email/password login: visit `/login`, fill form, verify session created and redirected
- [x] 5.3 Test middleware: visit `/default/demo` while logged out, verify redirect to `/login?callbackUrl=%2Fdefault%2Fdemo`
- [x] 5.4 Test sign-out: click sign-out, verify session destroyed and redirected to `/login`
