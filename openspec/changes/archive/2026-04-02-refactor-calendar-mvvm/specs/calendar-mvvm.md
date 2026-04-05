---
type: implementation-spec
category: mvvm-migration
status: draft
---

# Calendar MVVM Specification

## System Context

The Calendar feature within `sbn-finance-mfe` converts a chronological array of transaction logs into a highly visual schedule ranging across distinct temporal intervals. It processes `Transaction` inputs and plots sums. Porting this out of the global monolithic node into `/pages/calendar` seals the MVVM architectural contract universally in the local tree.

## Technical Requirements

- Output module directory: `src/pages/calendar`
- Component to dismantle: `src/components/CalendarView.tsx`

### Interface Standard

```typescript
import type { Transaction } from "../../pages/transactions/transactions.type";

export type CalendarMode =
  | "day"
  | "week"
  | "month"
  | "agenda"
  | "4days"
  | "year";

export interface CalendarProps {
  transactions: Transaction[];
  currentMonth: number;
  currentYear: number;
}
```

### Hooks Payload Standard

- `CalendarModelOutput` must map three exact segments:
  1. **`data`**: Exposes the `dailyData` Map, `daysInMonth`, `monthDate`, `weekRange`, `fourDays`, `selectedDay`, `yearData`.
  2. **`state`**: Maps `view` and `yearLoading`.
  3. **`setters`**: Maps `setView`.

### Error Boundaries and Loading States

- Keep `yearLoading` flags consistent. It must securely manage conditional `financeApi.dashboard.year` awaits internally within the ViewModel exactly as the old component did.

## Security & Constraints

- We must respect existing timezone offsets calculated within `date-fns`. `useMemo` optimizations must be conserved perfectly using identical dependency arrays to prevent performance looping when plotting large multi-year transaction densities.
