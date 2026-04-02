# Refactor Calendar to MVVM

## What

Refactor the existing `CalendarView` components into the standardized MVVM (Model-View-ViewModel) architecture under `src/pages/calendar/`. This will decouple the complex date calculations and state management from the UI rendering logic.

## Why

Currently, the `CalendarView.tsx` file is monolithic (600 lines), containing all the logic for parsing events, grouping by days, handling memoizations (`useMemo`), and rendering the varying modes (day, week, month, agenda, 4days, year). This violates the separation of concerns and diverges from our established standard (used in the Dashboard, Transactions, and Categories pages). By transitioning to MVVM, we enhance maintainability, testability of the date functions, and code readability.

## Success Criteria

- [ ] A new directory `src/pages/calendar/` exists with `model.ts`, `view.tsx`, `type.ts`, `schema.ts`, and `page.tsx`
- [ ] All state hooks (`useState`), date calculations, and `useMemo` hooks are isolated inside `calendar.model.ts`
- [ ] `calendar.view.tsx` handles only stateless JSX rendering based on data/actions provided by the model
- [ ] Components like `AnnualCalendar` and `YearOverviewChart` are correctly integrated without bloating the main UI layer
- [ ] The `App.tsx` routing is updated to point to the new `page.tsx` entry
- [ ] The old `components/CalendarView.tsx` is completely removed
- [ ] The application builds and functions without regressions
