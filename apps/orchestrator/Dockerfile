FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/orchestrator/package.json ./apps/orchestrator/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY apps/orchestrator ./apps/orchestrator
WORKDIR /app/apps/orchestrator
RUN pnpm build

FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

COPY --from=builder /app/apps/orchestrator/node_modules ./node_modules
COPY --from=builder /app/apps/orchestrator/dist ./dist
COPY --from=builder /app/apps/orchestrator/package.json ./

EXPOSE 3000

CMD ["pnpm", "start:prod"]
