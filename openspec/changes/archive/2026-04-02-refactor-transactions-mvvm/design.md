## Context

The `TransactionList.tsx` component handles presenting lists, displaying modal toggles for "Edit"/"Delete", and executing those interactions directly where the view lives. To unify the application's architecture, we are replicating the MVVM refactoring we applied to the Dashboard.

## Goals / Non-Goals

**Goals:**

- Decouple the UI (View) from the business logic and transaction state (ViewModel).
- Move the `TransactionList` out of `components/` and into `pages/transactions/` mirroring the `pages/dashboard/` flow.
- Follow the exact 5-file requirement specified: `transactions.model.ts`, `transactions.view.tsx`, `transactions.type.ts`, `transactions.schema.ts`, `page.tsx`.

**Non-Goals:**

- Refactoring `CategoryRelative` endpoints or deep backoffice updates.
- Altering the visual design or existing functionality. This remains purely structural.

## Decisions

**1. Modular MVVM via Hooks:**

- **ViewModel (`transactions.model.ts`)**: Encapsulates specific logic previously tied to the TransactionList Component. E.g., modal states, edit toggles, deletion dispatchers, and mapped formats explicitly exposed for UI consumption.
- **View (`transactions.view.tsx`)**: Replaces `TransactionList.tsx`. Receives plain functions (`onDelete`, `onEdit`) and arrays of items from the ViewModel.
- **Types and Schemas (`transactions.type.ts`, `transactions.schema.ts`)**: Strictly typing input shapes. Zod validation regarding transactions will be housed here.

## Risks / Trade-offs

- **Risk**: Increased file tree depth just to render a visual list.
  _Mitigation_: Keeps separation of concerns intact. Long-term maintenance guarantees better isolated testing of the list filtering and formatting logic.
- **Risk**: Prop breaking. If we break up the single fat component, prop chaining could be disjointed.
  _Mitigation_: TypeScript strictly typed contexts (`transactions.type.ts`) provide compile errors instantly if props get disaligned.
