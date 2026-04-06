FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy workspace files needed for pnpm install
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/finance/package.json ./apps/finance/
COPY apps/finance/prisma ./apps/finance/prisma/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY apps/finance ./apps/finance

WORKDIR /app/apps/finance
RUN pnpm prisma:generate
RUN pnpm build

# Create self-contained production deployment (resolves pnpm symlinks)
WORKDIR /app
RUN pnpm deploy --filter=@sbn/finance --prod /prod/finance

FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

# node_modules from pnpm deploy (real files, no symlinks)
COPY --from=builder /prod/finance/node_modules ./node_modules
# Generated Prisma client (output path in schema: ../../../node_modules/@prisma/client-finance)
# pnpm deploy does not include generated artifacts — must be copied explicitly
COPY --from=builder /app/node_modules/@prisma/client-finance ./node_modules/@prisma/client-finance
# Built output (not copied by pnpm deploy since dist is gitignored)
COPY --from=builder /app/apps/finance/dist ./dist
# Prisma schema needed at runtime
COPY --from=builder /app/apps/finance/prisma ./prisma
COPY --from=builder /app/apps/finance/package.json ./

EXPOSE 56082

CMD ["node", "dist/main"]
