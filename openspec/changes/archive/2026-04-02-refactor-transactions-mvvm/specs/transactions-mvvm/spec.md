## ADDED Requirements

### Requirement: Transactions MVVM architecture adherence

The Transactions List module SHALL be refactored to adhere to the MVVM architectural pattern, decoupling the user interface from business logic, filtering state, and action dispatching.

#### Scenario: Code structure isolation

- **WHEN** a developer navigates the Transactions source code
- **THEN** they find distinct files for the ViewModel (`transactions.model.ts`), the View (`transactions.view.tsx`), the types (`transactions.type.ts`), schemas (`transactions.schema.ts`), and the page entrypoint (`page.tsx`), with no complex business or modal logics inside the View component.

### Requirement: Model/ViewModel responsibilities

The ViewModel (`transactions.model.ts`) SHALL be implemented as a custom React hook that manages the local states (like search queries, selected filters, and modal toggles) and exposes pure data and callbacks for the View.

#### Scenario: State management

- **WHEN** the user interacts with filters or attempts to edit a transaction
- **THEN** the View delegates these actions to the methods exposed by the ViewModel hook, keeping the View stateless regarding business processes.
