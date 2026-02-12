FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/finance/package.json ./apps/finance/
COPY apps/finance/prisma ./apps/finance/prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY apps/finance ./apps/finance
WORKDIR /app/apps/finance
RUN pnpm prisma:generate
RUN pnpm build

FROM node:20-alpine

RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

COPY --from=builder /app/apps/finance/node_modules ./node_modules
COPY --from=builder /app/apps/finance/dist ./dist
COPY --from=builder /app/apps/finance/prisma ./prisma
COPY --from=builder /app/apps/finance/package.json ./

EXPOSE 3002

CMD ["pnpm", "start:prod"]
