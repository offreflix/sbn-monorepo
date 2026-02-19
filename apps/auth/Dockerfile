FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/auth/package.json ./apps/auth/
COPY apps/auth/prisma ./apps/auth/prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY apps/auth ./apps/auth
WORKDIR /app/apps/auth
RUN pnpm prisma:generate
RUN pnpm build

FROM node:20-alpine

RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

COPY --from=builder /app/apps/auth/node_modules ./node_modules
COPY --from=builder /app/apps/auth/dist ./dist
COPY --from=builder /app/apps/auth/prisma ./prisma
COPY --from=builder /app/apps/auth/package.json ./

EXPOSE 3001

CMD ["pnpm", "start:prod"]
