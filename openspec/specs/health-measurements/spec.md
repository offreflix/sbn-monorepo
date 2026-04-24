## ADDED Requirements

### Requirement: Record body measurement

The system SHALL allow an authenticated user to record a body weight measurement for a specific date.

#### Scenario: Successful measurement creation

- **WHEN** user sends POST /measurements with weightKg and measuredAt date
- **THEN** system creates the measurement and returns the created record

#### Scenario: Missing userId header

- **WHEN** POST /measurements is called without x-user-id header
- **THEN** system returns HTTP 400 Bad Request

### Requirement: List measurements by date range

The system SHALL return all body measurements for the authenticated user within an optional date range, ordered by measuredAt ascending (for chart rendering).

#### Scenario: List with date range

- **WHEN** user sends GET /measurements?startDate=2024-01-01&endDate=2024-03-31
- **THEN** system returns measurements within the range ordered by measuredAt ASC

#### Scenario: List without date range

- **WHEN** user sends GET /measurements with no query params
- **THEN** system returns all measurements for the user ordered by measuredAt ASC

#### Scenario: No measurements exist

- **WHEN** user sends GET /measurements and no records exist
- **THEN** system returns empty array

### Requirement: Delete a measurement

The system SHALL allow a user to delete a measurement they own.

#### Scenario: Successful deletion

- **WHEN** user sends DELETE /measurements/:id for a measurement they own
- **THEN** system deletes the record and returns HTTP 200

#### Scenario: Delete another user's measurement

- **WHEN** user sends DELETE /measurements/:id for a measurement belonging to another user
- **THEN** system returns HTTP 404 Not Found
