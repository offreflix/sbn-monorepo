## Why

Following the successful MVVM architectural migration of the Dashboard page, the project is establishing a standardized MVVM pattern for all `.mfe` feature modules. The Transactions List page currently tightly couples filtering logic, transaction states, and UI rendering inside a single large component (`TransactionList.tsx`). Refactoring this into a distinct ViewModel, View, and explicit schemas/types is the next step to ensure scalability, testability, and architectural consistency across `sbn-finance-mfe`.

## What Changes

- Reorganize the Transactions page to follow the MVVM pattern.
- Break down the current implementation into distinct files for different responsibilities:
  - `transactions.model.ts`: The ViewModel containing the application logic, filtering state, API interactions, and local state management.
  - `transactions.schema.ts`: Validation schemas (e.g., Zod) for any filtering form or transaction operations.
  - `transactions.type.ts`: TypeScript definitions and interfaces defining Props and Model Outputs.
  - `transactions.view.tsx`: The UI presentation component that strictly renders data without holding logic.
  - `page.tsx`: The Next.js style entrypoint that connects the ViewModel to the View.

## Capabilities

### New Capabilities

- `transactions-mvvm`: Structuring the Transactions feature using the MVVM architectural standard.

### Modified Capabilities

None.

## Impact

- **Code Affected**: `sbn-finance-mfe` application, specifically extracting the `TransactionList.tsx` module into a structured `src/pages/transactions/` directory.
- **Systems**: Purely frontend architectural refactoring. No backend changes.
