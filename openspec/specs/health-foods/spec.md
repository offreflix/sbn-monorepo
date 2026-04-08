## ADDED Requirements

### Requirement: Create custom food
The system SHALL allow an authenticated user to create a custom food item associated with their account.

#### Scenario: Successful custom food creation
- **WHEN** user sends POST /foods with valid name, servingSizeValue, servingSizeUnit, caloriesPerServing
- **THEN** system creates the food with isCustom=true and userId set to the requesting user

#### Scenario: Missing required fields
- **WHEN** user sends POST /foods without name or servingSizeValue or servingSizeUnit or caloriesPerServing
- **THEN** system returns HTTP 400 Bad Request

### Requirement: List foods (public + user custom)
The system SHALL return all public foods (userId = NULL) plus the requesting user's custom foods, optionally filtered by name search.

#### Scenario: List without search filter
- **WHEN** user sends GET /foods
- **THEN** system returns all public foods and the user's own custom foods

#### Scenario: List with search filter
- **WHEN** user sends GET /foods?search=frango
- **THEN** system returns only foods whose name contains "frango" (case-insensitive), from the visible set (public + user's custom)

#### Scenario: User sees only their own custom foods
- **WHEN** user A sends GET /foods
- **THEN** user A does NOT see custom foods created by user B

### Requirement: Get food by id
The system SHALL return a single food item if it is public or belongs to the requesting user.

#### Scenario: Get public food
- **WHEN** user sends GET /foods/:id for a public food
- **THEN** system returns the food regardless of who is requesting

#### Scenario: Get own custom food
- **WHEN** user sends GET /foods/:id for a food they created
- **THEN** system returns the food

#### Scenario: Get another user's custom food
- **WHEN** user sends GET /foods/:id for a food created by another user
- **THEN** system returns HTTP 404 Not Found

### Requirement: Update custom food
The system SHALL allow a user to update only their own custom food items.

#### Scenario: Successful update of own custom food
- **WHEN** user sends PATCH /foods/:id for a food they own (isCustom=true)
- **THEN** system updates and returns the food

#### Scenario: Attempt to update public food
- **WHEN** user sends PATCH /foods/:id for a public food (userId=NULL)
- **THEN** system returns HTTP 403 Forbidden

#### Scenario: Attempt to update another user's food
- **WHEN** user sends PATCH /foods/:id for a food owned by another user
- **THEN** system returns HTTP 404 Not Found

### Requirement: Delete custom food
The system SHALL allow a user to delete only their own custom food items.

#### Scenario: Successful deletion of own custom food
- **WHEN** user sends DELETE /foods/:id for a food they own
- **THEN** system deletes the food and returns HTTP 200

#### Scenario: Attempt to delete public food
- **WHEN** user sends DELETE /foods/:id for a public food
- **THEN** system returns HTTP 403 Forbidden
