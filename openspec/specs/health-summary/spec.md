## ADDED Requirements

### Requirement: Get daily health summary

The system SHALL return an aggregated summary of the authenticated user's health data for a given date, including the active goal, total macros consumed, water progress, and meal entries grouped by type.

#### Scenario: Summary with goal and data

- **WHEN** user sends GET /summary?date=2024-03-15
- **THEN** system returns:
  ```json
  {
    "date": "2024-03-15",
    "goal": {
      "dailyCalorieGoal": 2000,
      "proteinGoalG": 150,
      "carbsGoalG": 200,
      "fatGoalG": 60,
      "waterGoalMl": 2000
    },
    "consumed": {
      "calories": 1400,
      "protein": 110.5,
      "carbs": 160.0,
      "fat": 42.0
    },
    "water": {
      "totalMl": 1500,
      "goalMl": 2000
    },
    "meals": {
      "breakfast": [...meal log entries...],
      "lunch": [...],
      "dinner": [...],
      "snack": [...]
    }
  }
  ```

#### Scenario: Summary with no active goal

- **WHEN** user sends GET /summary?date=2024-03-15 but no goal has activeFrom <= 2024-03-15
- **THEN** system returns summary with goal: null and water.goalMl: null

#### Scenario: Summary with no data for date

- **WHEN** user sends GET /summary?date=2024-03-15 and no meal logs or water logs exist
- **THEN** system returns consumed = { calories: 0, protein: 0, carbs: 0, fat: 0 } and water = { totalMl: 0, goalMl: ... }

#### Scenario: Missing date defaults to today

- **WHEN** user sends GET /summary without date query param
- **THEN** system uses today's date

#### Scenario: Missing userId header

- **WHEN** GET /summary is called without x-user-id header
- **THEN** system returns HTTP 400 Bad Request
