## ADDED Requirements

### Requirement: Log a meal with nutritional snapshot
The system SHALL allow an authenticated user to log a meal by referencing a food and specifying the amount consumed. The system SHALL calculate and persist the nutritional values at the time of logging.

#### Scenario: Successful meal log with known food
- **WHEN** user sends POST /meal-logs with foodId, mealType, amountConsumed, unitConsumed, and loggedAtDate
- **THEN** system fetches the food, calculates calc_calories = (caloriesPerServing / servingSizeValue) * amountConsumed (and similarly for protein, carbs, fat), persists the snapshot, and returns the created record

#### Scenario: Log meal with deleted food (food_id = NULL)
- **WHEN** the referenced food is later deleted (ON DELETE SET NULL)
- **THEN** the meal log retains its calc_* snapshot values and foodId becomes null

#### Scenario: Invalid mealType
- **WHEN** user sends POST /meal-logs with mealType not in [breakfast, lunch, dinner, snack]
- **THEN** system returns HTTP 400 Bad Request

#### Scenario: Food not found or not accessible
- **WHEN** user sends POST /meal-logs with a foodId that does not exist or belongs to another user
- **THEN** system returns HTTP 404 Not Found

### Requirement: List meal logs by date
The system SHALL return all meal log entries for the authenticated user on a specific date, grouped by meal type.

#### Scenario: Logs exist for date
- **WHEN** user sends GET /meal-logs?date=2024-03-15
- **THEN** system returns an object with keys breakfast, lunch, dinner, snack, each containing an array of log entries for that date

#### Scenario: No logs for date
- **WHEN** user sends GET /meal-logs?date=2024-03-15 and no entries exist
- **THEN** system returns an object with empty arrays for each meal type

#### Scenario: Missing date parameter
- **WHEN** user sends GET /meal-logs without date query param
- **THEN** system defaults to today's date

### Requirement: Delete a meal log entry
The system SHALL allow a user to delete a meal log entry they own.

#### Scenario: Successful deletion
- **WHEN** user sends DELETE /meal-logs/:id for an entry they own
- **THEN** system deletes the entry and returns HTTP 200

#### Scenario: Delete another user's entry
- **WHEN** user sends DELETE /meal-logs/:id for an entry belonging to another user
- **THEN** system returns HTTP 404 Not Found
