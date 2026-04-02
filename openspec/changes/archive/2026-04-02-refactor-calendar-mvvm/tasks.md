## 1. Scaffold MVVM Directory

- [x] 1.1 Create `src/pages/calendar/` directory.
- [x] 1.2 Generate `calendar.type.ts` importing global `Transaction` and structurally replicating former `CalendarViewProps`.
- [x] 1.3 Initialize `calendar.schema.ts` as an empty schema export for standardization.
- [x] 1.4 Stage empty `calendar.model.ts` and `calendar.view.tsx`.
- [x] 1.5 Scaffold `page.tsx`.

## 2. Implement the ViewModel

- [x] 2.1 Copy the 170+ lines of internal Hook State management (`useState`, `useMemo`, `useEffect`) from `components/CalendarView.tsx` into `calendar.model.ts`.
- [x] 2.2 Re-hook the API `financeApi.dashboard.year` call into the `useEffect` handling the "year" mode switch.
- [x] 2.3 Pack and export `CalendarModelOutput` payload encapsulating data matrices, loading states, and setter functions.

## 3. Extract the View Render

- [x] 3.1 Migrate the entire DOM representation into `calendar.view.tsx`.
- [x] 3.2 Unpack properties recursively from the destructured `CalendarModelOutput`.
- [x] 3.3 Ensure the sub-components `AnnualCalendar` and `YearOverviewChart` are strictly referenced without circular dependencies.

## 4. Re-link Routes and Cleanup

- [x] 4.1 Update `App.tsx` replacing `<CalendarView />` import origins with `import { CalendarView } from "./pages/calendar/page"`.
- [x] 4.2 Delete legacy `src/components/CalendarView.tsx`.
- [x] 4.3 Validate and compile the target. Build via `pnpm build`.
