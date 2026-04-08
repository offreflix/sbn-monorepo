FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy workspace files needed for pnpm install
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/health/package.json ./apps/health/
COPY apps/health/prisma ./apps/health/prisma/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY apps/health ./apps/health

WORKDIR /app/apps/health
RUN pnpm prisma:generate
RUN pnpm build

# Create self-contained production deployment (resolves pnpm symlinks)
WORKDIR /app
RUN pnpm deploy --filter=@sbn/health --prod /prod/health

FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

# node_modules from pnpm deploy (real files, no symlinks)
COPY --from=builder /prod/health/node_modules ./node_modules
# Generated Prisma client (output path in schema: ../../../node_modules/@prisma/client-health)
COPY --from=builder /app/node_modules/@prisma/client-health ./node_modules/@prisma/client-health
# Built output
COPY --from=builder /app/apps/health/dist ./dist
# Prisma schema needed at runtime
COPY --from=builder /app/apps/health/prisma ./prisma
COPY --from=builder /app/apps/health/package.json ./

EXPOSE 56083

CMD ["node", "dist/main"]
