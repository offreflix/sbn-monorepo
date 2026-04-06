FROM node:20-alpine AS builder

WORKDIR /app

COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
# Copy all apps and packages needed for the workspace install
COPY apps/host/package.json ./apps/host/
COPY packages/ ./packages/

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
RUN pnpm install --frozen-lockfile

COPY apps/host ./apps/host

RUN pnpm --filter host build

FROM nginx:alpine

COPY --from=builder /app/apps/host/dist /usr/share/nginx/html
COPY apps/host/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
