FROM node:20-alpine AS builder

WORKDIR /app

COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY apps/sbn-health-mfe/package.json ./apps/sbn-health-mfe/
COPY packages/ ./packages/

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
RUN pnpm install --frozen-lockfile

COPY apps/sbn-health-mfe ./apps/sbn-health-mfe

ARG MFE_ASSET_PREFIX=http://localhost:9002
ARG VITE_API_BASE=http://localhost:56080
ENV MFE_ASSET_PREFIX=$MFE_ASSET_PREFIX
ENV VITE_API_BASE=$VITE_API_BASE

RUN pnpm --filter sbn-health-mfe build

FROM nginx:alpine

COPY --from=builder /app/apps/sbn-health-mfe/dist /usr/share/nginx/html
COPY apps/sbn-health-mfe/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

