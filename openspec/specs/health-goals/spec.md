## ADDED Requirements

### Requirement: Create daily goal

The system SHALL allow an authenticated user to create a daily nutrition goal specifying calorie, protein, carbs, fat, and water targets starting from a given date.

#### Scenario: Successful goal creation

- **WHEN** user sends POST /goals with valid calorie, protein, carbs, fat values and an activeFrom date
- **THEN** system creates the goal and returns the created record with id and timestamps

#### Scenario: Duplicate activeFrom rejected

- **WHEN** user sends POST /goals with an activeFrom date that already exists for that user
- **THEN** system returns HTTP 409 Conflict

#### Scenario: Missing userId header

- **WHEN** POST /goals is called without x-user-id header
- **THEN** system returns HTTP 400 Bad Request

### Requirement: List all goals for user

The system SHALL return all goals belonging to the authenticated user, ordered by activeFrom descending.

#### Scenario: User with multiple goals

- **WHEN** user sends GET /goals
- **THEN** system returns array of goals ordered by activeFrom DESC

#### Scenario: User with no goals

- **WHEN** user sends GET /goals and no goals exist for that user
- **THEN** system returns empty array

### Requirement: Get current active goal

The system SHALL return the most recent goal whose activeFrom is less than or equal to today's date.

#### Scenario: Active goal exists

- **WHEN** user sends GET /goals/current
- **THEN** system returns the goal with the highest activeFrom that is <= today

#### Scenario: No goal active yet

- **WHEN** user sends GET /goals/current and all goals have activeFrom > today
- **THEN** system returns HTTP 404 Not Found

### Requirement: Update a goal

The system SHALL allow a user to update any field of a goal they own.

#### Scenario: Successful update

- **WHEN** user sends PATCH /goals/:id with new values
- **THEN** system updates the goal and returns the updated record

#### Scenario: Update goal of another user

- **WHEN** user sends PATCH /goals/:id where the goal belongs to a different user
- **THEN** system returns HTTP 404 Not Found

### Requirement: Delete a goal

The system SHALL allow a user to delete a goal they own.

#### Scenario: Successful deletion

- **WHEN** user sends DELETE /goals/:id for a goal they own
- **THEN** system deletes the goal and returns HTTP 200

#### Scenario: Delete goal of another user

- **WHEN** user sends DELETE /goals/:id where the goal belongs to a different user
- **THEN** system returns HTTP 404 Not Found
