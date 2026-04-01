## Why

The current architecture of `sbn-finance-mfe` is difficult to maintain and scale. To address this, we are migrating the project to an MVVM (Model-View-ViewModel) architecture to improve separation of concerns, testability, and code organization. This proposal focuses specifically on refactoring the Dashboard page as the first phase of this architectural migration, establishing the standard pattern that will be followed by all future pages.

## What Changes

- Reorganize the Dashboard page to follow the MVVM pattern.
- Breakdown the current implementation into distinct files for different responsibilities:
  - `dashboard.model.ts`: The Model/ViewModel containing the application logic, data fetching, and state management.
  - `dashboard.schema.ts`: Validation schemas (e.g., Zod).
  - `dashboard.type.ts`: TypeScript definitions and interfaces.
  - `dashboard.view.tsx`: The "dumb" UI presentation component that receives state and callbacks via props.
  - `page.tsx`: The Next.js page entrypoint that connects the Model to the View.

## Capabilities

### New Capabilities

- `dashboard-mvvm`: Structuring the Dashboard page using the new MVVM architectural standard.

### Modified Capabilities

None.

## Impact

- **Code Affected**: `sbn-finance-mfe` application, specifically the Dashboard page directory and any tight couplings it currently possesses.
- **Systems**: No backend changes, purely frontend architectural refactoring.
- **Future Impact**: Sets the architectural standard for the rest of the `sbn-finance-mfe` pages.
