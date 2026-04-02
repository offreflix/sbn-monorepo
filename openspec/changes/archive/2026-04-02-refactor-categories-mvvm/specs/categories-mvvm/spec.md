## ADDED Requirements

### Requirement: Categories MVVM separation of concerns
The Categories feature module SHALL extract state mutation arrays, deletion prompts and remote invocations entirely out of its View into a custom ViewModel.

#### Scenario: Display rendering isolation
- **WHEN** the `<CategoriesView />` is evaluated via JSX
- **THEN** it strictly implements stateless loops relying entirely on props passed down by its respective model integration point (`page.tsx`).

### Requirement: ViewModel state containment
The `useCategoriesModel` SHALL harbor isolated boolean flags corresponding to specific dialog toggles (like "Open New Category", "Open Editing Category") and filter types (`Receita` / `Despesa`).

#### Scenario: Filter state change
- **WHEN** a user adjusts the category list filter
- **THEN** the filter logic is captured within the View Model which returns the cleanly scoped subset of `filteredCategories` dynamically via memoized processes, ensuring minimal re-renders.
