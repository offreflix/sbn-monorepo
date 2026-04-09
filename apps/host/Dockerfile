FROM node:20-alpine AS builder

WORKDIR /app

COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
# Copy all apps and packages needed for the workspace install
COPY apps/host/package.json ./apps/host/
COPY packages/ ./packages/

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
RUN pnpm install --frozen-lockfile

COPY apps/host ./apps/host

ARG VITE_API_BASE=http://localhost:56080
ARG VITE_FINANCE_MFE_URL=http://localhost:9001
ARG VITE_HEALTH_MFE_URL=http://localhost:9002
ENV VITE_API_BASE=$VITE_API_BASE
ENV VITE_FINANCE_MFE_URL=$VITE_FINANCE_MFE_URL
ENV VITE_HEALTH_MFE_URL=$VITE_HEALTH_MFE_URL

RUN pnpm --filter host build

FROM nginx:alpine

COPY --from=builder /app/apps/host/dist /usr/share/nginx/html
COPY apps/host/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
