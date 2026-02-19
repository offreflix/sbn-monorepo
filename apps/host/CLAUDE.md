# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev              # Start dev server on :9000 (auto-opens browser)
pnpm build            # Production build via Rsbuild
pnpm preview          # Preview production build
pnpm test             # Run Vitest (watch mode)
pnpm vitest run       # Run tests once (CI mode)

# Run a single test file
pnpm vitest run src/api/auth.test.ts
```

## Architecture

This is the **Host** shell application in an SBN monorepo micro-frontend architecture. It serves as the main entry point at port 9000, handling auth, routing, theming, and lazy-loading the finance MFE via Module Federation.

### Build & Bundling

- **Rsbuild** (Rspack-based) with Module Federation plugin
- Finance MFE loaded as remote: `sbn_finance_mfe@http://localhost:9001/mf-manifest.json`
- Shared singletons: `react`, `react-dom`, `react-router-dom` (eager)
- MFE type declarations in `src/env.d.ts` and `@mf-types/` directory
- Docs: [Rsbuild](https://rsbuild.rs/llms.txt), [Rspack](https://rspack.rs/llms.txt)

### Source Structure

```
src/
├── api/          # Typed API modules (auth, finance, wishlist, apiKeys)
├── auth/         # AuthProvider context (JWT session, token refresh)
├── components/   # Shared components (Header, modals)
├── lib/          # Utilities (cn() for className merging)
├── pages/        # Route-level page components
├── theme/        # ThemeProvider (light/dark/system)
└── types/        # TypeScript type definitions
```

### Routing (React Router v7)

- `/login`, `/register` — public pages
- `/dashboard`, `/finance/*`, `/wishlist`, `/settings` — protected (wrapped in `<Protected>`)
- `/` redirects to `/dashboard`, unknown routes also redirect there
- Finance MFE loaded lazily at `/finance/*` via `React.lazy(() => import("sbn_finance_mfe/App"))`

### State Management

No external state library. Uses React Context:

- **AuthProvider** — user session, tokens, login/register/logout, `authFetch()` with automatic 401 retry + token refresh (deduplication via ref). Session persisted to `localStorage` key `sbn-auth-session`.
- **ThemeProvider** — light/dark/system mode, persisted to `localStorage` key `theme`, applied via `.dark` CSS class on document root.

### API Layer

All API calls go through the Orchestrator at `import.meta.env.VITE_API_BASE` (default `http://localhost:56080`).

- `api/auth.ts` — public endpoints (no token)
- `api/finance.ts`, `api/wishlist.ts`, `api/apiKeys.ts` — Bearer token from localStorage session
- Error handling via `handle()` helper that extracts server error messages from JSON responses

## Key Conventions

- **Components:** PascalCase filenames, functional components with hooks, named exports for pages
- **TypeScript:** Strict mode, bundler module resolution, `verbatimModuleSyntax` enabled
- **Styling:** Tailwind CSS 4 + PostCSS. Use `cn()` from `lib/utils.ts` for conditional classes. Design tokens from `@repo/ui` theme.
- **UI components:** Import from `@repo/ui` (Radix UI + Tailwind + CVA). Icons from `lucide-react`.
- **Forms:** React Hook Form + Zod validation
- **Tests:** Vitest + `@testing-library/react`. Test files colocated as `*.test.ts(x)`. Mocking with `vi.mock()`.
- **Locale:** Brazilian Portuguese (`pt-BR`) for date formatting and UI text (e.g., "Carregando remote de finanças...")
