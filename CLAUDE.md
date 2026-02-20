# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Install dependencies (pnpm 9.0.0 required)
pnpm install

# Generate Prisma clients (required before first run)
pnpm prisma:generate

# Start infrastructure (PostgreSQL on 5433, Redis on 6379)
docker-compose up -d postgres redis

# Development
pnpm dev              # All services (Turborepo)
pnpm dev:backend      # Auth + Finance + Orchestrator only
pnpm dev:frontend     # Host + Finance MFE only

# Build
pnpm build            # Build all packages

# Code quality
pnpm lint             # ESLint across all packages
pnpm format           # Prettier
pnpm check-types      # TypeScript type checking
```

## Testing

```bash
pnpm test             # All unit tests (Jest for backend, Vitest for frontend)
pnpm test:e2e         # E2E tests (uses Testcontainers)

# Run a single backend test
cd apps/auth && pnpm jest -- --testPathPattern=auth.service.spec

# Run a single frontend test
cd apps/host && pnpm vitest run src/api/auth.test.ts

# Integration tests (Python, separate from pnpm)
cd tests/integration && pip install -r requirements.txt && pytest
```

## Architecture

**Monorepo managed by Turborepo + pnpm workspaces** with `apps/*` and `packages/*`.

### Backend — NestJS Microservices

Three NestJS services communicating via HTTP/REST:

- **Orchestrator** (`:56080`) — API Gateway/BFF. Proxies requests to auth and finance services. Validates JWT tokens.
- **Auth** (`:56081`) — User authentication (JWT + refresh tokens via HTTP-only cookies), Redis session management, API key management.
- **Finance** (`:56082`) — Business logic: wallets, transactions, categories, recurrences, projections, wishlist, dashboard analytics.

Each backend service follows NestJS module structure: `src/<domain>/` with `controller`, `service`, `dto`, `module` files.

### Frontend — React Micro-Frontends (Module Federation)

- **Host** (`:9000`) — Shell application. Handles auth flow (login/register), dashboard, settings. Dynamically loads finance MFE.
- **sbn-finance-mfe** (`:9001`) — Remote MFE exposing `./App`. Finance dashboard, transactions, categories, calendar view, charts.

Built with **Rsbuild** (Rspack). Module Federation shares `react`, `react-dom`, `react-router-dom` as singletons.

### Shared Packages

- **`@repo/ui`** — React component library (Radix UI primitives + Tailwind CSS 4 + CVA). Import components from `@repo/ui` and utils from `@repo/ui/lib/utils`.
- **`@repo/eslint-config`** — Shared ESLint flat configs (`base.js`, `react-internal.js`).
- **`@repo/typescript-config`** — Shared tsconfig bases (`base.json`, `react-library.json`).

### Database — Prisma Multi-Schema

Single PostgreSQL instance with two schemas, each with its own Prisma client:

- `apps/auth/prisma/schema.prisma` → generates `@prisma/client-auth` (models: User, ApiKey)
- `apps/finance/prisma/schema.prisma` → generates `@prisma/client-finance` (models: Wallet, Category, Transaction, Recurrence, Projection, WishlistItem)

After schema changes: run `pnpm prisma:generate`, then create migrations in the respective `apps/<service>/` directory.

### MCP Server

`apps/sbn-mcp/` — Python MCP server exposing SBN Finance tools to AI assistants. Uses httpx + pydantic. Separate from the Node.js ecosystem.

## Key Conventions

- **Backend TypeScript:** CommonJS, ES2021, decorators enabled, relaxed strictness. ESLint legacy config (`.eslintrc.js`).
- **Frontend TypeScript:** ESNext, bundler module resolution, strict mode. ESLint flat config (`eslint.config.js`) using `@repo/eslint-config/react-internal`.
- **Styling:** Tailwind CSS 4 + PostCSS. Single quotes, trailing commas (Prettier).
- **Auth flow:** JWT access + refresh tokens. Cookies for browser clients, Bearer tokens for API clients. Redis for session storage.
- **Environment:** Each service needs its own `.env` file. See `.env.example` at root. `JWT_SECRET` must match between auth and orchestrator.

## Service Ports

| Service          | Port  |
| ---------------- | ----- |
| Host (frontend)  | 9000  |
| Finance MFE      | 9001  |
| Orchestrator API | 56080 |
| Auth Service     | 56081 |
| Finance Service  | 56082 |
| PostgreSQL       | 5433  |
| Redis            | 6379  |
