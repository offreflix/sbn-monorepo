## Why

The host app pages (`Dashboard`, `Login`, `Register`, `Settings`, `Landing`, `FinanceRemote`) are single-file components that mix state management, validation, business logic, and rendering. The finance MFE already follows a structured Container → Hook → View pattern that separates these concerns. Aligning the host to the same pattern improves testability, maintainability, and consistency across the monorepo.

## What Changes

- **Restructure all 6 host pages** from single-file components into feature directories following the finance MFE pattern (`page.tsx`, `<feature>.model.ts`, `<feature>.view.tsx`, `<feature>.type.ts`, optional `<feature>.schema.ts`)
- **Extract business logic** into dedicated model hooks that return `{ data, state, setters, actions }`
- **Extract view components** into pure presentational components that receive model output as props
- **Extract types and schemas** into dedicated files per feature
- **Update route imports** in `App.tsx` to point to new `./pages/<feature>/page` paths
- **Delete original single-file page components** after migration

## Capabilities

### New Capabilities

- `page-structure-pattern`: Defines the standard page directory structure, file naming conventions, and separation of concerns (page → model → view → type → schema) for all host app pages.

### Modified Capabilities

_(none — this is a pure structural refactor with no behavior changes)_

## Impact

- **Code**: `apps/host/src/pages/` — all 6 page files replaced by 6 feature directories (~24 new files total)
- **Routing**: `apps/host/src/App.tsx` — import paths updated for all page routes
- **Dependencies**: No new dependencies; existing `zod`, `react-hook-form`, `@repo/ui`, `sonner`, `react-router-dom` usage unchanged
- **APIs**: No API changes — all existing functionality preserved as-is
- **Tests**: Existing tests (if any) will need import path updates; new structure enables easier unit testing of model hooks
