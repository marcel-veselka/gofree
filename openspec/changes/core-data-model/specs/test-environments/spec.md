## ADDED Requirements

### Requirement: Test environment belongs to a project
The system SHALL store test environments as project-scoped entities. Each environment MUST have a name, slug (unique per project), and a target type.

#### Scenario: Create a web environment
- **WHEN** a user creates an environment named "Staging" with baseUrl "https://staging.example.com" in project "my-app"
- **THEN** the system creates a TestEnvironment record linked to the project with slug "staging"

### Requirement: Environment stores target-specific configuration
The system SHALL store environment configuration as a JSON column. Configuration structure varies by target type: web (baseUrl, browser, viewport), mobile (device, platform, appUrl), API (baseUrl, headers, auth), database (connectionString, dialect).

#### Scenario: Web environment config
- **WHEN** an environment with target type WEB is created with config `{"baseUrl": "https://staging.example.com", "browser": "chromium", "viewport": {"width": 1440, "height": 900}}`
- **THEN** the system stores the full configuration for use during test runs

#### Scenario: API environment config
- **WHEN** an environment with target type API is created with config `{"baseUrl": "https://api.staging.example.com", "defaultHeaders": {"Authorization": "Bearer {{token}}"}}`
- **THEN** the system stores the configuration with template variables intact

### Requirement: Environment stores secrets securely
The system SHALL store sensitive values (passwords, tokens, connection strings) in an encrypted `secrets` JSON column. Secrets MUST NOT be returned in list/read API responses unless explicitly requested with a `reveal` flag.

#### Scenario: Secrets not leaked in listing
- **WHEN** a user lists environments for a project
- **THEN** the response includes environment metadata but secrets are replaced with `"***"` placeholders

#### Scenario: Reveal secrets for execution
- **WHEN** the worker runtime requests an environment with reveal=true for test execution
- **THEN** the system returns the decrypted secrets for agent use

### Requirement: Environment can be set as default for a project
The system SHALL support marking one environment per project as the default. The default environment MUST be used when a test suite or run does not specify an explicit environment.

#### Scenario: Default environment fallback
- **WHEN** a test suite run is triggered without specifying an environment
- **THEN** the system uses the project's default environment
