## ADDED Requirements

### Requirement: Email/password registration
The system SHALL allow users to register with name, email, and password via a signup form at `/signup`.

#### Scenario: Successful registration
- **WHEN** user submits the signup form with valid name, email, and password
- **THEN** a new user account is created and the user is redirected to the app dashboard

#### Scenario: Registration with existing email
- **WHEN** user submits the signup form with an email that already exists
- **THEN** the form displays an error message indicating the email is already registered

#### Scenario: Registration with invalid input
- **WHEN** user submits the signup form with missing or invalid fields (empty name, invalid email, password too short)
- **THEN** the form displays appropriate validation error messages

### Requirement: Email/password login
The system SHALL allow registered users to log in with email and password via a login form at `/login`.

#### Scenario: Successful login
- **WHEN** user submits the login form with valid credentials
- **THEN** a session is created and the user is redirected to the callback URL or app dashboard

#### Scenario: Login with invalid credentials
- **WHEN** user submits the login form with incorrect email or password
- **THEN** the form displays a generic error message (not revealing which field is wrong)

#### Scenario: Login with callback URL
- **WHEN** user visits `/login?callbackUrl=/default/demo` and logs in successfully
- **THEN** the user is redirected to `/default/demo` instead of the default dashboard

### Requirement: GitHub OAuth authentication
The system SHALL allow users to sign in or register using their GitHub account.

#### Scenario: Sign in with GitHub (new user)
- **WHEN** user clicks "Sign in with GitHub" and authorizes the application
- **THEN** a new user account is created from GitHub profile data and the user is redirected to the app dashboard

#### Scenario: Sign in with GitHub (existing user)
- **WHEN** user clicks "Sign in with GitHub" and their GitHub email matches an existing account
- **THEN** the GitHub account is linked and the user is logged in

#### Scenario: GitHub OAuth button on login page
- **WHEN** user visits the login page
- **THEN** a "Sign in with GitHub" button is displayed alongside the email/password form

#### Scenario: GitHub OAuth button on signup page
- **WHEN** user visits the signup page
- **THEN** a "Sign up with GitHub" button is displayed alongside the registration form

### Requirement: Route protection via middleware
The system SHALL protect `(app)` and `(workspace)` route groups, requiring an authenticated session.

#### Scenario: Unauthenticated access to app routes
- **WHEN** an unauthenticated user visits any route under `(app)` (e.g., `/default/demo`)
- **THEN** the user is redirected to `/login?callbackUrl=<original-url>`

#### Scenario: Unauthenticated access to workspace routes
- **WHEN** an unauthenticated user visits any route under `(workspace)` (e.g., `/default/demo/w`)
- **THEN** the user is redirected to `/login?callbackUrl=<original-url>`

#### Scenario: Authenticated access
- **WHEN** an authenticated user visits a protected route
- **THEN** the page loads normally without redirect

#### Scenario: Public routes remain accessible
- **WHEN** any user visits `/`, `/login`, `/signup`, `/api/health`, or `/api/auth/*`
- **THEN** the page loads without requiring authentication

### Requirement: Session-aware navigation
The system SHALL display the current user's identity in the app shell header and provide sign-out functionality.

#### Scenario: Authenticated user sees their info
- **WHEN** an authenticated user views any page in the `(app)` route group
- **THEN** the header displays the user's name and avatar (or initials if no avatar)

#### Scenario: Sign out
- **WHEN** user clicks "Sign out" in the user menu
- **THEN** the session is destroyed and the user is redirected to `/login`

### Requirement: Auth page navigation
The system SHALL provide navigation links between login and signup pages.

#### Scenario: Login page links to signup
- **WHEN** user views the login page
- **THEN** a link to "/signup" is displayed with text like "Don't have an account? Sign up"

#### Scenario: Signup page links to login
- **WHEN** user views the signup page
- **THEN** a link to "/login" is displayed with text like "Already have an account? Sign in"
