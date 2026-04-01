## 1. File Structure Setup

- [x] 1.1 Create `dashboard.model.ts` file in the dashboard directory
- [x] 1.2 Create `dashboard.view.tsx` file in the dashboard directory
- [x] 1.3 Create `dashboard.schema.ts` file in the dashboard directory
- [x] 1.4 Create `dashboard.type.ts` file in the dashboard directory

## 2. Types and Schemas Extraction

- [x] 2.1 Migrate existing validation logic and schemas (e.g., Zod) into `dashboard.schema.ts`
- [x] 2.2 Define types and interfaces, including View Props and API abstractions, in `dashboard.type.ts`

## 3. ViewModel (Model) Implementation

- [x] 3.1 Extract all state variables (`useState`, `useReducer`) from the current dashboard page into a `useDashboardModel` hook in `dashboard.model.ts`
- [x] 3.2 Move data fetching, API calls, and side effects to `useDashboardModel`
- [x] 3.3 Expose necessary values and action handlers from the hook, ensuring strict typing matching `dashboard.type.ts`

## 4. View Implementation

- [x] 4.1 Migrate all JSX rendering out of `page.tsx` into a stateless `DashboardView` component in `dashboard.view.tsx`
- [x] 4.2 Update the view component to consume state and dispatch actions purely via its props

## 5. Integration

- [x] 5.1 Refactor `page.tsx` to exclusively act as a connector, invoking `useDashboardModel` and passing its return down to `<DashboardView />`
- [x] 5.2 Validate that the Dashboard functions equivalently to its pre-refactored state with the new MVVM architecture
