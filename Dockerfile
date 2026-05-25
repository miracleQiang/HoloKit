# 阶段1: 构建
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.27.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ ./packages/
COPY docs/package.json ./docs/

RUN pnpm install --frozen-lockfile

COPY tsconfig.base.json tsconfig.json ./
COPY docs/ ./docs/

RUN pnpm --filter @holokit/docs build

# 阶段2: 运行
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/docs/.vitepress/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
