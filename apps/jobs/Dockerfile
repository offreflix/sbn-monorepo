FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/jobs/package.json ./apps/jobs/

RUN pnpm install --frozen-lockfile

COPY apps/jobs ./apps/jobs

WORKDIR /app/apps/jobs
RUN pnpm build

WORKDIR /app
RUN pnpm deploy --filter=@sbn/jobs --prod /prod/jobs

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /prod/jobs/node_modules ./node_modules
COPY --from=builder /app/apps/jobs/dist ./dist
COPY --from=builder /app/apps/jobs/package.json ./

CMD ["node", "dist/main"]
