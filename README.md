# SBN Monorepo

Personal finance management system built with microservices architecture (NestJS) and microfrontend architecture (React + Module Federation).

## Architecture

This is a unified monorepo consolidating 4 previously separate repositories.

For complete documentation, see [CLAUDE.md](./CLAUDE.md)

## Quick Start

### Prerequisites
- Node.js >= 18
- pnpm >= 9.0.0
- Docker & Docker Compose

### Installation
```bash
pnpm install
pnpm prisma:generate
```

### Development
```bash
# Start infrastructure
docker-compose up -d postgres redis

# Start all services
pnpm dev

# Or start specific groups
pnpm dev:backend    # Backend only
pnpm dev:frontend   # Frontend only
```

## Services

- **Frontend (Host)**: http://localhost:9000
- **Finance MFE**: http://localhost:9001
- **Orchestrator**: http://localhost:3000
- **Auth Service**: http://localhost:3001
- **Finance Service**: http://localhost:3002

## Migration History

This monorepo preserves full Git history from 4 repositories via git subtree merge:
- sbn-auth: 7 commits → apps/auth/
- sbn-finance: 10 commits → apps/finance/
- sbn-orchestrator: 7 commits → apps/orchestrator/
- sbn-mfe-repo: 28 commits (base)

Total: 52+ commits with complete history preserved.
