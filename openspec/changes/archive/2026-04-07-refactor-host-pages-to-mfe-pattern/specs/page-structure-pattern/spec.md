## ADDED Requirements

### Requirement: Each host page SHALL be a feature directory
Every page in `apps/host/src/pages/` SHALL be organized as a directory containing separated files for orchestration, logic, presentation, and types. The directory name SHALL use lowercase kebab-case matching the feature name.

#### Scenario: Page directory structure
- **WHEN** a page feature exists in the host app
- **THEN** it SHALL be a directory under `src/pages/<feature>/` containing at minimum: `page.tsx`, `<feature>.model.ts`, `<feature>.view.tsx`, `<feature>.type.ts`

#### Scenario: Optional schema file
- **WHEN** a page feature uses Zod validation (forms)
- **THEN** it SHALL also contain a `<feature>.schema.ts` file with the Zod schemas and inferred types

### Requirement: page.tsx SHALL be a thin orchestrator
The `page.tsx` file SHALL only instantiate the model hook and render the view component. It SHALL NOT contain business logic, state management, or complex JSX.

#### Scenario: Page component structure
- **WHEN** `page.tsx` is rendered
- **THEN** it SHALL call `use<Feature>Model(props)` and pass the result to `<Feature>View` via spread props

#### Scenario: Page exports
- **WHEN** `page.tsx` is defined
- **THEN** it SHALL export both a named export and a default export of the page component

### Requirement: Model hook SHALL centralize business logic
The `<feature>.model.ts` file SHALL export a custom hook `use<Feature>Model` that centralizes all state, effects, API calls, and event handlers for the page.

#### Scenario: Model hook return shape
- **WHEN** `use<Feature>Model` is called
- **THEN** it SHALL return an object with named sections from: `data` (fetched/computed values), `state` (UI flags), `setters` (state mutation functions), `actions` (event handlers and async operations)

#### Scenario: Model output type export
- **WHEN** `<feature>.model.ts` is defined
- **THEN** it SHALL export a type `<Feature>ModelOutput` equal to `ReturnType<typeof use<Feature>Model>`

### Requirement: View component SHALL be purely presentational
The `<feature>.view.tsx` file SHALL export a `<Feature>View` component that receives the model output as props and renders JSX. It SHALL NOT contain hooks, API calls, or state management.

#### Scenario: View receives model output
- **WHEN** `<Feature>View` is rendered
- **THEN** it SHALL destructure `{ data, state, setters, actions }` (or applicable subset) from the model output props

#### Scenario: View has no side effects
- **WHEN** `<Feature>View` is defined
- **THEN** it SHALL NOT use `useState`, `useEffect`, `useCallback`, or any data-fetching hooks directly

### Requirement: Type file SHALL define feature contracts
The `<feature>.type.ts` file SHALL define TypeScript interfaces and types used by the page's model, view, and page files.

#### Scenario: Type file contents
- **WHEN** `<feature>.type.ts` is defined
- **THEN** it SHALL export at minimum the page props interface (e.g., `<Feature>Props`) and any domain types specific to the feature

### Requirement: Schema file SHALL contain Zod validation
When present, the `<feature>.schema.ts` file SHALL contain Zod schemas and their inferred TypeScript types for form validation.

#### Scenario: Schema with inferred types
- **WHEN** `<feature>.schema.ts` is defined
- **THEN** it SHALL export the Zod schema object and a `FormValues` type (or equivalent) using `z.infer<typeof schema>`

### Requirement: All 6 host pages SHALL be migrated
The following pages SHALL be restructured into feature directories: `dashboard`, `finance-remote`, `landing`, `login`, `register`, `settings`.

#### Scenario: Dashboard migration
- **WHEN** `src/pages/dashboard/` is created
- **THEN** it SHALL contain `page.tsx`, `dashboard.model.ts`, `dashboard.view.tsx`, `dashboard.type.ts` with the existing reload-to-dashboard behavior preserved

#### Scenario: FinanceRemote migration
- **WHEN** `src/pages/finance-remote/` is created
- **THEN** it SHALL contain `page.tsx`, `finance-remote.model.ts`, `finance-remote.view.tsx`, `finance-remote.type.ts` with the existing lazy-loading Module Federation behavior preserved

#### Scenario: Landing migration
- **WHEN** `src/pages/landing/` is created
- **THEN** it SHALL contain `page.tsx`, `landing.model.ts`, `landing.view.tsx`, `landing.type.ts` with the existing hero, features, tech stack, and CTA sections preserved

#### Scenario: Login migration
- **WHEN** `src/pages/login/` is created
- **THEN** it SHALL contain `page.tsx`, `login.model.ts`, `login.view.tsx`, `login.type.ts`, `login.schema.ts` with the existing Zod validation, react-hook-form, and auth flow preserved

#### Scenario: Register migration
- **WHEN** `src/pages/register/` is created
- **THEN** it SHALL contain `page.tsx`, `register.model.ts`, `register.view.tsx`, `register.type.ts`, `register.schema.ts` with the existing Zod validation, react-hook-form, and auth flow preserved

#### Scenario: Settings migration
- **WHEN** `src/pages/settings/` is created
- **THEN** it SHALL contain `page.tsx`, `settings.model.ts`, `settings.view.tsx`, `settings.type.ts`, `settings.schema.ts` with the existing API key management, modals, and clipboard functionality preserved

### Requirement: App.tsx route imports SHALL be updated
After migration, `apps/host/src/App.tsx` SHALL import all page components from their new directory paths.

#### Scenario: Updated import paths
- **WHEN** all pages are migrated
- **THEN** `App.tsx` SHALL import each page from `./pages/<feature>/page` instead of `./pages/<PascalCaseName>`

#### Scenario: Original files removed
- **WHEN** all pages are migrated and imports updated
- **THEN** the original single-file page components (`Dashboard.tsx`, `FinanceRemote.tsx`, `Landing.tsx`, `Login.tsx`, `Register.tsx`, `Settings.tsx`) SHALL be deleted from `src/pages/`
