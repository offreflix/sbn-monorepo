FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy workspace files needed for pnpm install
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/orchestrator/package.json ./apps/orchestrator/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY apps/orchestrator ./apps/orchestrator

WORKDIR /app/apps/orchestrator
RUN pnpm build

# Create self-contained production deployment (resolves pnpm symlinks)
WORKDIR /app
RUN pnpm deploy --filter=@sbn/orchestrator --prod /prod/orchestrator

FROM node:20-alpine

WORKDIR /app

# node_modules from pnpm deploy (real files, no symlinks)
COPY --from=builder /prod/orchestrator/node_modules ./node_modules
# Built output (not copied by pnpm deploy since dist is gitignored)
COPY --from=builder /app/apps/orchestrator/dist ./dist
COPY --from=builder /app/apps/orchestrator/package.json ./

EXPOSE 56080

CMD ["node", "dist/main"]
