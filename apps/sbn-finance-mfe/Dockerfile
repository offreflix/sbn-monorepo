FROM node:20-alpine AS builder

WORKDIR /app

COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
# Copy all apps and packages needed for the workspace install
COPY apps/sbn-finance-mfe/package.json ./apps/sbn-finance-mfe/
COPY packages/ ./packages/

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
RUN pnpm install --frozen-lockfile

COPY apps/sbn-finance-mfe ./apps/sbn-finance-mfe

RUN pnpm --filter sbn-finance-mfe build

FROM nginx:alpine

COPY --from=builder /app/apps/sbn-finance-mfe/dist /usr/share/nginx/html
COPY apps/sbn-finance-mfe/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
