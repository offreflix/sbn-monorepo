## 1. File Structure Setup

- [x] 1.1 Create `transactions.model.ts` file in the `src/pages/transactions` directory
- [x] 1.2 Create `transactions.view.tsx` file in the `src/pages/transactions` directory
- [x] 1.3 Create `transactions.schema.ts` file in the `src/pages/transactions` directory
- [x] 1.4 Create `transactions.type.ts` file in the `src/pages/transactions` directory
- [x] 1.5 Create `page.tsx` file in the `src/pages/transactions` directory

## 2. Types and Schemas Extraction

- [x] 2.1 Migrate any local validation logic inside `TransactionList` or filter parsing into `transactions.schema.ts`
- [x] 2.2 Define types and interfaces, including View Props (`TransactionsProps`) in `transactions.type.ts`

## 3. ViewModel (Model) Implementation

- [x] 3.1 Extract all state variables (e.g. search filters, modal open states, sorting) from `TransactionList.tsx` into a `useTransactionsModel` hook in `transactions.model.ts`
- [x] 3.2 Move UI-triggered side effects or internal computations to `useTransactionsModel`
- [x] 3.3 Expose necessary values and action handlers from the hook, ensuring strict typing matching `transactions.type.ts`

## 4. View Implementation

- [x] 4.1 Migrate all JSX rendering out of `components/TransactionList.tsx` into a stateless `<TransactionsView />` component in `transactions.view.tsx`
- [x] 4.2 Update the view component to consume state and dispatch actions purely via its props

## 5. Integration

- [x] 5.1 Refactor `page.tsx` to act as the primary page component, invoking `useTransactionsModel` and passing its return down to `<TransactionsView />`
- [x] 5.2 Update `App.tsx` routes to point `<Route path="transactions" />` to `pages/transactions/page.tsx`
- [x] 5.3 Validate that the Transactions screen functions equivalently to its pre-refactored state with the new MVVM architecture
- [x] 5.4 Remove the legacy `components/TransactionList.tsx` file
