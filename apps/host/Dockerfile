FROM node:20-alpine AS builder
WORKDIR /app
COPY pnpm-lock.yaml package.json ./
# Copy workspace config
COPY pnpm-workspace.yaml ./
# Copy all apps and packages to allow Install
COPY . .

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
RUN pnpm --filter host build

FROM nginx:alpine
COPY --from=builder /app/apps/host/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
