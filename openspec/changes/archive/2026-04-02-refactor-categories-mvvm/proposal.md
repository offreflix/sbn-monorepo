## Why

Continuing our initiative to modernize the `sbn-finance-mfe` architectural codebase, we need to bring the Categories page into strict alignment with the new MVVM standard. Currently, `CategoryGrid.tsx` tightly couples visual rendering, state management (e.g. modals, deletions, filtering), and remote data mutation. Refactoring this into an MVVM structure will dramatically improve long-term scalability and decouple responsibilities.

## What Changes

- Refactor the Categories page into a dedicated `pages/categories/` module.
- Break down `CategoryGrid.tsx` into:
  - `categories.model.ts`: Custom hook containing state management and API logic.
  - `categories.schema.ts`: Type validation using Zod for actions.
  - `categories.type.ts`: TypeScript specifications for internal entities and View Models.
  - `categories.view.tsx`: The pure UI components rendering the grids and modals.
  - `page.tsx`: The module's primary router entrypoint.

## Capabilities

### New Capabilities
- `categories-mvvm`: Structuring the Categories page using the standardized MVVM architecture.

### Modified Capabilities
None.

## Impact

- **Code Affected**: Frontend structure, directly mitigating tech-debt in `CategoryGrid.tsx`.
- **Systems**: Safe to mutate, isolated cleanly from external backend layers.
