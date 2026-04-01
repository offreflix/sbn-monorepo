## ADDED Requirements

### Requirement: Dashboard MVVM architecture adherence
The Dashboard page SHALL be refactored to adhere to the MVVM architectural pattern, decoupling the user interface from business logic and state management.

#### Scenario: Code structure isolation
- **WHEN** a developer navigates the Dashboard source code
- **THEN** they find distinct files for the ViewModel (`dashboard.model.ts`), the View (`dashboard.view.tsx`), the types (`dashboard.type.ts`), schemas (`dashboard.schema.ts`), and the page entrypoint (`page.tsx`), with no business logic inside the View component.

### Requirement: Model/ViewModel responsibilities
The ViewModel (`dashboard.model.ts`) SHALL be implemented as a custom React hook that manages all the state, orchestrates data fetching, and exposes data/actions for the View.

#### Scenario: State management
- **WHEN** the Dashboard needs to fetch data or handle user interactions
- **THEN** the View delegates these actions to the methods exposed by the ViewModel hook, without performing any data fetching or complex state mutation itself.
