## ADDED Requirements

### Requirement: Agent definition belongs to a project
The system SHALL store agent definitions as project-scoped entities. Each agent definition MUST have a name, slug (unique per project), and a list of supported target types.

#### Scenario: Create an agent definition
- **WHEN** a user creates an agent definition named "Visual Regression Agent" supporting WEB and MOBILE target types
- **THEN** the system creates an AgentDefinition record linked to the project

### Requirement: Agent definition has a prompt template
The system SHALL store a prompt template on each agent definition. The template MUST support variable interpolation (e.g., `{{testCase.title}}`, `{{environment.baseUrl}}`). The template defines the agent's behavior during test execution.

#### Scenario: Prompt with variables
- **WHEN** an agent definition has template "You are testing {{testCase.title}} on {{environment.baseUrl}}. Execute the steps and report results."
- **THEN** the system stores the template and it can be rendered with actual values at execution time

### Requirement: Agent definition specifies tools and model
The system SHALL store the agent's tool configuration (list of enabled MCP tools, browser automation capabilities, DB query access) and preferred AI model as structured fields.

#### Scenario: Agent with specific tools
- **WHEN** an agent definition is created with tools `["browser-navigate", "browser-click", "browser-screenshot", "assert-visual"]` and model "claude-sonnet-4-20250514"
- **THEN** the system stores the tool list and model, which the worker uses to configure the agent runtime

### Requirement: Agent definition supports versioning
The system SHALL track agent definition versions with an integer `version` column. Creating a new version MUST preserve the previous version for historical run references.

#### Scenario: Update agent definition
- **WHEN** a user modifies an agent definition's prompt template
- **THEN** the system creates version 2 of the definition while keeping version 1 intact for existing run references

### Requirement: Agent definition has default configuration
The system SHALL store default run configuration on the agent definition: max steps, timeout, retry policy, and screenshot-on-failure flag.

#### Scenario: Agent with timeout
- **WHEN** an agent definition is created with config `{"maxSteps": 50, "timeoutMs": 300000, "screenshotOnFailure": true}`
- **THEN** the system stores the defaults which are applied to runs using this agent unless overridden
