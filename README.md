# SBN Monorepo

Personal finance management system built with microservices architecture (NestJS) and micro-frontend architecture (React + Module Federation).

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend                         │
│  ┌──────────────┐       ┌────────────────────────┐  │
│  │  Host :9000  │──MF──▶│  Finance MFE :9001     │  │
│  │  (Shell App) │       │  (Transactions, Charts)│  │
│  └──────┬───────┘       └────────────┬───────────┘  │
│         │          @repo/ui          │              │
└─────────┼────────────────────────────┼──────────────┘
          │                            │
          ▼                            ▼
┌─────────────────────────────────────────────────────┐
│              Orchestrator :56080                    │
│              (API Gateway / BFF)                    │
└────────┬────────────────────────────┬───────────────┘
         │                            │
         ▼                            ▼
┌──────────────────┐       ┌────────────────────────┐
│  Auth :56081     │       │  Finance :56082        │
│  (JWT, Sessions) │       │  (Wallets, Txns, etc.) │
└────────┬─────────┘       └────────────┬───────────┘
         │                              │
         ▼                              ▼
┌──────────────────┐       ┌────────────────────────┐
│  PostgreSQL      │       │  PostgreSQL            │
│  (auth schema)   │       │  (finance schema)      │
└──────────────────┘       └────────────────────────┘
         │
         ▼
   ┌───────────┐
   │  Redis    │
   │ (Sessions)│
   └───────────┘
```

**Monorepo** managed by **Turborepo + pnpm workspaces** (`apps/*` and `packages/*`).

| Layer    | App                        | Tech                                 | Port  |
| -------- | -------------------------- | ------------------------------------ | ----- |
| Frontend | Host (Shell)               | React 19, Rsbuild, Module Federation | 9000  |
| Frontend | Finance MFE                | React 19, Rsbuild, Recharts          | 9001  |
| Backend  | Orchestrator (API Gateway) | NestJS 10                            | 56080 |
| Backend  | Auth Service               | NestJS 10, Passport, JWT, Redis      | 56081 |
| Backend  | Finance Service            | NestJS 10, Prisma                    | 56082 |
| Shared   | `@repo/ui`                 | Radix UI, Tailwind CSS 4, CVA        | —     |
| Tooling  | MCP Server                 | Python, MCP protocol                 | —     |
| Infra    | PostgreSQL 15              | Multi-schema (auth + finance)        | 5433  |
| Infra    | Redis 7                    | Session storage                      | 6379  |

For detailed developer guidance, see [CLAUDE.md](./CLAUDE.md).

## Quick Start

### Prerequisites

- Node.js >= 18
- pnpm >= 9.0.0
- Docker & Docker Compose

### Setup

```bash
# Install dependencies
pnpm install

# Generate Prisma clients
pnpm prisma:generate

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your values (JWT_SECRET, DATABASE_URL, etc.)
```

### Development

```bash
# Start infrastructure
docker-compose up -d postgres redis

# Start all services
pnpm dev

# Or start specific groups
pnpm dev:backend    # Auth + Finance + Orchestrator
pnpm dev:frontend   # Host + Finance MFE
```

### Common Commands

```bash
pnpm build          # Build all packages
pnpm test           # Run all unit tests
pnpm test:e2e       # Run E2E tests (Testcontainers)
pnpm lint           # Lint all packages
pnpm format         # Format with Prettier
pnpm check-types    # TypeScript type checking
pnpm prisma:generate # Regenerate Prisma clients after schema changes
```

## Docker

```bash
# Run everything in containers
docker-compose --profile all up -d

# Backend only (services + infra)
docker-compose --profile backend up -d

# Frontend only
docker-compose --profile frontend up -d
```

## Migration History

This monorepo preserves full Git history from 4 repositories via git subtree merge:

- sbn-auth: 7 commits → `apps/auth/`
- sbn-finance: 10 commits → `apps/finance/`
- sbn-orchestrator: 7 commits → `apps/orchestrator/`
- sbn-mfe-repo: 28 commits (base)

Total: 52+ commits with complete history preserved.
