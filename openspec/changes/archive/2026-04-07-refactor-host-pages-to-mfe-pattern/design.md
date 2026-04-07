## Context

The `apps/host` application currently has 6 page components as single files under `src/pages/`: `Dashboard.tsx`, `FinanceRemote.tsx`, `Landing.tsx`, `Login.tsx`, `Register.tsx`, and `Settings.tsx`. These files mix state management, API calls, form validation, and rendering in one place.

The `apps/sbn-finance-mfe` already follows a well-established pattern where each page is a directory with separated concerns: `page.tsx` (thin orchestrator), `<feature>.model.ts` (logic hook), `<feature>.view.tsx` (pure UI), `<feature>.type.ts` (types), and optionally `<feature>.schema.ts` (Zod validation). This pattern is documented in `apps/host/ARCHITECTURE_PAGE_PATTERN.md`.

## Goals / Non-Goals

**Goals:**

- Apply the finance MFE page pattern consistently to all 6 host pages
- Separate business logic, UI rendering, types, and validation into dedicated files
- Update route imports in `App.tsx` to reference the new directory structure
- Maintain 100% functional parity — no behavior changes

**Non-Goals:**

- Refactoring shared components (`Header`, `MoneyInput`) — they stay as-is
- Adding new features or changing existing behavior
- Creating shared abstractions or base classes for the pattern
- Migrating the App Shell (`App.tsx`) itself to the model/view pattern
- Writing tests as part of this change (though the new structure enables easier testing)

## Decisions

### 1. Directory naming: lowercase kebab-case matching feature name

Each page directory uses lowercase names matching the feature: `dashboard/`, `finance-remote/`, `landing/`, `login/`, `register/`, `settings/`.

**Rationale**: Matches the convention in `sbn-finance-mfe` (e.g., `dashboard/`, `wishlist-detail/`). Consistent with common React project conventions.

**Alternative considered**: PascalCase directories (e.g., `Dashboard/`) — rejected for consistency with the existing finance MFE pattern.

### 2. Model hook return structure: `{ data, state, setters, actions }`

All model hooks SHALL return an object with up to 4 named sections: `data` (fetched/computed data), `state` (UI state flags), `setters` (state mutation functions), `actions` (event handlers, async operations).

**Rationale**: This is the exact contract used in finance MFE pages. A standardized shape makes it easy to understand any page's model at a glance.

**Alternative considered**: Flat return object — rejected because grouping by responsibility improves readability and makes destructuring in views self-documenting.

### 3. Schema files only where Zod validation exists

Only `Login`, `Register`, and `Settings` get `.schema.ts` files since they have Zod schemas. `Dashboard`, `FinanceRemote`, and `Landing` skip this file.

**Rationale**: Avoid creating empty or placeholder files. The pattern doc says schema is optional — "quando necessário".

### 4. Type file always present, even if minimal

Every page gets a `.type.ts` file, even if it only exports the model output type and page props interface.

**Rationale**: Consistency across all pages. Even simple pages benefit from having a clear type contract. The `ModelOutput` type export is always needed.

### 5. Migration order: simple pages first, complex pages last

Order: FinanceRemote → Dashboard → Landing → Login → Register → Settings.

**Rationale**: Start with the simplest pages (FinanceRemote is ~26 lines) to establish the pattern with minimal risk, then tackle pages with forms and complex state last. This allows incremental validation.

### 6. Update App.tsx imports at the end

All route imports in `App.tsx` are updated in a single task after all pages are migrated, and the original single-file components are deleted.

**Rationale**: Avoids broken imports mid-migration. Changing all imports at once is cleaner and easier to review.

## Risks / Trade-offs

- **[Increased file count]** → 6 files become ~26 files. Mitigated by clear naming conventions and the fact that each file has a single responsibility, making navigation easier despite the count.
- **[Over-engineering for simple pages]** → `FinanceRemote` and `Dashboard` are very thin and the model/view split may feel heavy. Mitigated by keeping the model minimal (can be just a few lines) — consistency across the codebase outweighs the minor overhead.
- **[Landing page view size]** → The Landing view will be ~300+ lines of JSX since it's mostly static content. This is acceptable — the view file is purely presentational and doesn't need further splitting.
- **[Import path breakage]** → Any external code importing from `pages/Dashboard` will break. Mitigated by verifying all import sites in `App.tsx` are updated, and no other files import pages directly.
