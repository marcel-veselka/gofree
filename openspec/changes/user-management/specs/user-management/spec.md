## ADDED Requirements

### Requirement: Session-aware tRPC context
The tRPC context SHALL extract the current user session from Better Auth cookies on every request and expose `session.user` to all procedures.

#### Scenario: Authenticated request
- **WHEN** a request with a valid Better Auth session cookie reaches a tRPC endpoint
- **THEN** `ctx.session` contains the user object with `id`, `name`, `email`, and `image`

#### Scenario: Unauthenticated request
- **WHEN** a request without a session cookie reaches a tRPC endpoint
- **THEN** `ctx.session` is `null`

### Requirement: Protected procedure middleware
The system SHALL provide a `protectedProcedure` tRPC middleware that rejects unauthenticated requests with an UNAUTHORIZED error.

#### Scenario: Authenticated call to protected procedure
- **WHEN** an authenticated user calls a protected procedure
- **THEN** the procedure executes normally with `ctx.session` available

#### Scenario: Unauthenticated call to protected procedure
- **WHEN** an unauthenticated request calls a protected procedure
- **THEN** the system returns an UNAUTHORIZED tRPC error

### Requirement: Org-scoped procedure middleware
The system SHALL provide an `orgProcedure` middleware that validates the user's membership in the specified organization and attaches org context.

#### Scenario: User is org member
- **WHEN** an org member calls an org-scoped procedure with a valid org slug
- **THEN** the procedure executes with `ctx.org` and `ctx.membership` available

#### Scenario: User is not org member
- **WHEN** a user who is not a member calls an org-scoped procedure
- **THEN** the system returns a NOT_FOUND error (do not leak org existence)

### Requirement: Org list filtered by membership
The `org.list` query SHALL return only organizations where the current user is a member.

#### Scenario: User with multiple orgs
- **WHEN** a user who is a member of 2 orgs calls `org.list`
- **THEN** only those 2 organizations are returned

#### Scenario: User with no orgs
- **WHEN** a user with no org memberships calls `org.list`
- **THEN** an empty list is returned

### Requirement: Auto-create personal org on signup
The system SHALL automatically create a personal organization and OWNER membership when a new user registers.

#### Scenario: New user registration
- **WHEN** a user signs up with email/password or GitHub OAuth
- **THEN** a personal organization named after the user is created with the user as OWNER

### Requirement: Member management
Organization ADMINs and OWNERs SHALL be able to invite members, change member roles, and remove members.

#### Scenario: Invite a new member
- **WHEN** an ADMIN invites a user by email
- **THEN** the user is added as a MEMBER of the organization

#### Scenario: Change member role
- **WHEN** an ADMIN changes a member's role to VIEWER
- **THEN** the member's role is updated

#### Scenario: Remove a member
- **WHEN** an ADMIN removes a member from the organization
- **THEN** the membership is deleted

#### Scenario: Insufficient permissions
- **WHEN** a MEMBER or VIEWER attempts to invite, change roles, or remove members
- **THEN** the system returns a FORBIDDEN error

#### Scenario: Cannot remove last OWNER
- **WHEN** the last OWNER attempts to leave or be removed
- **THEN** the system returns an error preventing the action

### Requirement: Personalized greeting after login
The app shell SHALL display a personalized greeting showing the user's first name.

#### Scenario: User with full name
- **WHEN** a logged-in user named "Browser Test User" views the app dashboard
- **THEN** the header displays "Hello, Browser" (first name only)

#### Scenario: User with single name
- **WHEN** a logged-in user named "Marcel" views the app dashboard
- **THEN** the header displays "Hello, Marcel"

### Requirement: Org switcher in sidebar
The app shell sidebar SHALL display a list of the user's organizations with the current org highlighted, allowing switching between orgs.

#### Scenario: User views org switcher
- **WHEN** a user with memberships in "Default Organization" and "Acme Corp" views the sidebar
- **THEN** both organizations are listed with the current one highlighted

#### Scenario: User switches org
- **WHEN** the user clicks a different organization in the sidebar
- **THEN** the app navigates to that organization's dashboard

### Requirement: Project CRUD with permissions
Project creation SHALL require MEMBER+ role. Project deletion SHALL require ADMIN+ role.

#### Scenario: Member creates a project
- **WHEN** a MEMBER creates a project in their org
- **THEN** the project is created successfully

#### Scenario: Viewer tries to create a project
- **WHEN** a VIEWER attempts to create a project
- **THEN** the system returns a FORBIDDEN error

### Requirement: Org members page
The org dashboard SHALL show a list of members with their roles, and ADMIN+ users SHALL see management controls.

#### Scenario: Admin views members page
- **WHEN** an ADMIN navigates to the org page
- **THEN** a members list is displayed with role badges and management controls (change role, remove)

#### Scenario: Member views members page
- **WHEN** a MEMBER navigates to the org page
- **THEN** a members list is displayed with role badges but no management controls
