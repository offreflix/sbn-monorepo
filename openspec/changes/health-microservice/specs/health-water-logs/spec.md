## ADDED Requirements

### Requirement: Log water intake
The system SHALL allow an authenticated user to log a water intake entry with a volume in milliliters for a specific date.

#### Scenario: Successful water log creation
- **WHEN** user sends POST /water-logs with volumeMl and loggedDate
- **THEN** system creates the entry and returns the created record

#### Scenario: Zero or negative volume rejected
- **WHEN** user sends POST /water-logs with volumeMl <= 0
- **THEN** system returns HTTP 400 Bad Request

### Requirement: List water logs by date with daily total
The system SHALL return all water intake entries for the authenticated user on a specific date, along with the sum of all volumeMl for that date.

#### Scenario: Entries exist for date
- **WHEN** user sends GET /water-logs?date=2024-03-15
- **THEN** system returns { entries: [...], totalMl: <sum> } for that date

#### Scenario: No entries for date
- **WHEN** user sends GET /water-logs?date=2024-03-15 and no entries exist
- **THEN** system returns { entries: [], totalMl: 0 }

#### Scenario: Missing date defaults to today
- **WHEN** user sends GET /water-logs without date query param
- **THEN** system uses today's date

### Requirement: Delete a water log entry
The system SHALL allow a user to delete a water intake entry they own.

#### Scenario: Successful deletion
- **WHEN** user sends DELETE /water-logs/:id for an entry they own
- **THEN** system deletes the entry and returns HTTP 200

#### Scenario: Delete another user's entry
- **WHEN** user sends DELETE /water-logs/:id for an entry belonging to another user
- **THEN** system returns HTTP 404 Not Found
