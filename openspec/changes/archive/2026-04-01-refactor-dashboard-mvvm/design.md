## Context

The `sbn-finance-mfe` application currently has architectural issues where business logic, state management, and UI rendering are tightly coupled. This makes writing unit tests difficult, reduces code readability, and hampers scalability. To solve this, we are gradually migrating the frontend to an MVVM (Model-View-ViewModel) approach. This design focuses on isolating these responsibilities for the Dashboard page as the initial proof of concept and standard-setter.

## Goals / Non-Goals

**Goals:**

- Decouple the UI (View) from the business logic and state retrieval (ViewModel).
- Establish a clear, standard set of file responsibilities to improve testability and maintainability.
- Refactor the existing Dashboard page to adhere completely to the new pattern using the specified file structure (`.model.ts`, `.schema.ts`, `.type.ts`, `.view.tsx`, `page.tsx`).

**Non-Goals:**

- Refactoring the entire `sbn-finance-mfe` in this single change. We are strictly focusing on the Dashboard page first.
- Modifying backend services, database schemas, or API contracts.
- Altering the visual design or user flows of the Dashboard (this is a purely structural refactor).

## Decisions

**1. MVVM Implementation via React Hooks:**

- **View (`dashboard.view.tsx`)**: A pure, stateless functional component. It receives data and action callbacks via props and handles only visual rendering.
- **ViewModel (`dashboard.model.ts`)**: A custom React hook (e.g., `useDashboardModel`). It manages all state, orchestrates calls to services/APIs, and handles business logic. It returns exactly what the View needs.
- **Entry Point (`page.tsx`)**: The Next.js page component. Its sole responsibility is to call the ViewModel hook and pass the resulting data to the View component.

**2. strict file responsibilities:**

- `dashboard.schema.ts`: Centralizes all data validation rules (e.g., Zod schemas) for API responses or form inputs on the dashboard.
- `dashboard.type.ts`: Defines all TypeScript interfaces, specifically the return type of the ViewModel and the props of the View, ensuring type safety across the boundary.

## Risks / Trade-offs

- **Risk: Increased Boilerplate.** Splitting a page into 5 distinct files increases the file count and initial setup time.
  _Mitigation_: The predictability, ease of testing, and isolation gained for complex pages like the Dashboard far outweigh the boilerplate cost.
- **Risk: Prop Heavy Views.** Passing all state from the Model hook to the View component might lead to a bloated prop signature.
  _Mitigation_: The ViewModel should group related state into cohesive objects rather than passing dozens of primitive values.
