# HoloKit 文档站 Docker 部署指南

## 项目概述

本项目为 pnpm monorepo，部署目标是 `docs/` 目录下的 VitePress 文档站。通过 Docker 多阶段构建，最终以 nginx 静态文件方式部署在 `/holokit/` 子路径下。

## 部署相关文件

| 文件 | 作用 |
|------|------|
| `Dockerfile` | 多阶段构建（Node 22 + pnpm 构建，nginx 运行） |
| `docker-compose.yml` | 容器编排，端口映射 5000:80 |
| `nginx.conf` | nginx 子路径静态文件服务配置 |
| `.dockerignore` | 排除无关文件加速构建 |
| `docs/.vitepress/config.mts` | VitePress 配置，`base: '/holokit/'` |

## 前置条件

- 安装 Docker 和 Docker Compose
- 服务器防火墙/安全组开放目标端口（默认 5000）

## 本地构建与测试

```bash
# 构建镜像
docker compose build

# 启动容器（macOS 本地 5000 端口被 AirPlay 占用，用 5001 测试）
docker run -d -p 5001:80 --name holokit-test holokit-holokit-docs

# 浏览器验证
# 访问 http://localhost:5001/holokit/

# 清理测试容器
docker rm -f holokit-test
```

## 部署到云服务器

### 方式一：服务器上直接构建（推荐）

将项目代码传到服务器后执行：

```bash
docker compose up -d --build
```

访问地址：`http://服务器IP:5000/holokit/`

### 方式二：本地构建镜像后传输

```bash
# 本地导出镜像
docker save holokit-holokit-docs | gzip > holokit-docs.tar.gz

# 传输到服务器
scp holokit-docs.tar.gz user@your-server:/tmp/

# 服务器上加载并运行
docker load < /tmp/holokit-docs.tar.gz
docker run -d -p 5000:80 --name holokit --restart=always holokit-holokit-docs
```

## 常用运维命令

```bash
# 停止容器
docker compose down

# 重启容器
docker compose restart

# 查看日志
docker compose logs -f

# 重新构建并启动（代码更新后）
docker compose up -d --build
```

## 端口说明

- 容器内 nginx 监听 80 端口
- docker-compose.yml 映射为宿主机 5000 端口
- 如需修改外部端口，只需修改 `docker-compose.yml` 中的 `ports` 配置

## 注意事项

- macOS 本地 5000 端口被 AirPlay 占用，本地测试需用其他端口
- 云服务器需开放 5000 端口的安全组/防火墙规则
- 如需域名访问，可在服务器 nginx 中配置反向代理到 5000 端口
- Docker 镜像拉取慢时，可配置镜像加速器（如 `docker.1ms.run`）

## 构建过程中遇到的问题及解决

### 1. pnpm 版本不兼容

**问题**：`corepack prepare pnpm@latest` 拉取 pnpm 11，要求 Node.js 22+，且引入了 `approve-builds` 安全策略。

**解决**：Dockerfile 中锁定 pnpm 版本为 `10.27.0`，与本地一致。

### 2. lockfile 不同步

**问题**：`docs/package.json` 中新增了 `vue@^3.4.0`，但 `pnpm-lock.yaml` 未更新，导致 `--frozen-lockfile` 失败。

**解决**：本地执行 `pnpm install` 更新 lockfile 后重新构建。

### 3. Docker Hub 镜像拉取失败

**问题**：国内网络无法直接拉取 Docker Hub 镜像，或镜像加速器限流。

**解决**：手动从可用镜像源拉取后 tag 为标准名称：

```bash
docker pull docker.1ms.run/library/node:22-alpine
docker tag docker.1ms.run/library/node:22-alpine node:22-alpine

docker pull docker.1ms.run/library/nginx:alpine
docker tag docker.1ms.run/library/nginx:alpine nginx:alpine
```

### 4. nginx 监听端口不匹配

**问题**：nginx.conf 中 `listen 5000` 与容器端口映射 `5000:80` 不匹配，导致连接被拒绝。

**解决**：nginx.conf 中保持 `listen 80`，外部端口由 docker-compose 的 `ports` 映射控制。
