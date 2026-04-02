# Component Design: Calendar MVVM

## Overview

The `CalendarView` module will be functionally equivalent to the existing implementation but will strictly adhere to the MVVM layer division. It parses daily and monthly transactions dynamically to fulfill a six-mode visual spectrum: daily, weekly, monthly, 4-days, agenda, and yearly. 

We will port the core elements to `src/pages/calendar/` yielding five standard files.

## Files to Create

1. **`calendar.type.ts`**
   - Declares `CalendarProps` expecting an array of `Transaction`s, `currentMonth`, and `currentYear`.
   - Exports sub-types such as `CalendarMode` (`"day" | "week" | "month" | "agenda" | "4days" | "year"`).
   - Maps structure definitions for the grouped daily entries (`DailyTransactionData`).

2. **`calendar.model.ts`**
   - Implements `useCalendarModel({ transactions, currentMonth, currentYear })`.
   - Internalizes the `view` state bound to `localStorage`.
   - Computes complex `useMemo` properties originally in the monolithic view (e.g., `monthDate`, `daysInMonth`, `weekRange`, `fourDays`, and the `dailyData` Map).
   - Handles the Fetch Effect (`useEffect`) required when `view === "year"` to asynchronously retrieve the `DashboardYearOverview`.
   - Surfaces grouped state, setters, pre-calculated datasets, and flags exactly as an output payload typified as `CalendarModelOutput`.

3. **`calendar.view.tsx`**
   - Operates purely on `CalendarModelOutput` destructured from props.
   - Preserves all visual integrity including dynamic sub-components (`AnnualCalendar` and `YearOverviewChart`). Map functions will securely traverse `dailyData` structures provided from the top down.

4. **`calendar.schema.ts`**
   - A boilerplate space anticipating upcoming client-side input validations (should mutations be introduced).

5. **`page.tsx`**
   - Binds `useCalendarModel` into `CalendarView` establishing the fully sealed Page Module.

## Open Questions

- Since `AnnualCalendar` and `YearOverviewChart` are isolated child display components, they will remain inside `src/components/` and be imported seamlessly by `calendar.view.tsx`. Is this acceptable, or should they be clustered into a sub-components array inside the `/calendar` module? (Assuming yes, keeping them in `components` is the default).
