## 1. File Structure Setup

- [x] 1.1 Create `categories.model.ts` file in the `src/pages/categories` directory
- [x] 1.2 Create `categories.view.tsx` file in the `src/pages/categories` directory
- [x] 1.3 Create `categories.schema.ts` file in the `src/pages/categories` directory
- [x] 1.4 Create `categories.type.ts` file in the `src/pages/categories` directory
- [x] 1.5 Create `page.tsx` file in the `src/pages/categories` directory

## 2. Types and Schemas Extraction

- [x] 2.1 Define strict prop types passing into the component (`CategoriesProps`) inside `categories.type.ts`
- [x] 2.2 Allocate a space for future categorical Zod validators in `categories.schema.ts`

## 3. ViewModel Implementation

- [x] 3.1 Unpack all `useState` logic handling filtering, editing, and deletion modals from `CategoryGrid` into `categories.model.ts`. 
- [x] 3.2 Ensure `filteredCategories`, `incomeCount`, and `expenseCount` memoized computations run successfully within the ViewModel.
- [x] 3.3 Return highly grouped payload objects mapping directly to `TransactionsModelOutput` conventions.

## 4. View Migration

- [x] 4.1 Assemble the JSX purely as `CategoriesView` mapping onto `categories.view.tsx`.
- [x] 4.2 Use cleanly destructured bindings connecting to the `<CreateCategoryModal />`.

## 5. Integration and Archival

- [x] 5.1 Route `<Route path="categories" />` in `App.tsx` directly into the new `pages/categories/page.tsx` default export.
- [x] 5.2 Assert that Category deletions and standard interactions still visually pass using the updated architecture.
- [x] 5.3 Delete `components/CategoryGrid.tsx`.
