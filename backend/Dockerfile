# ============================================
# 多階段構建 - NestJS Backend
# ============================================

# ----------------------------------------
# 基礎階段 - 安裝依賴
# ----------------------------------------
FROM node:20-alpine AS base

# 安裝系統依賴（包括 OpenSSL 和構建工具）
RUN apk add --no-cache \
    openssl \
    openssl-dev \
    libc6-compat \
    python3 \
    make \
    g++

# 安裝 pnpm
RUN npm install -g pnpm

# 設置工作目錄
WORKDIR /app

# 複製 pnpm workspace 配置
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/

# ----------------------------------------
# 開發階段
# ----------------------------------------
FROM base AS development

# 複製 Prisma schema 文件（在安裝依賴前）
COPY backend/prisma ./backend/prisma

# 安裝所有依賴（包括 devDependencies）
RUN pnpm install --frozen-lockfile

# 複製源代碼
COPY backend ./backend
COPY shared ./shared

# 設置工作目錄為 backend
WORKDIR /app/backend

# 手動生成 Prisma Client
RUN pnpm prisma:generate

# 手動安裝 bcrypt native binding（pnpm rebuild 無法正確處理）
RUN cd /app/node_modules/.pnpm/bcrypt@5.1.1/node_modules/bcrypt && npm run install

# 暴露端口
EXPOSE 3000

# 開發模式啟動
CMD ["pnpm", "run", "start:dev"]

# ----------------------------------------
# 構建階段
# ----------------------------------------
FROM base AS builder

# 複製 Prisma schema 文件（在安裝依賴前）
COPY backend/prisma ./backend/prisma

# 安裝所有依賴
RUN pnpm install --frozen-lockfile

# 複製源代碼
COPY backend ./backend
COPY shared ./shared

WORKDIR /app/backend

# 手動生成 Prisma Client
RUN pnpm prisma:generate

# 構建應用
RUN pnpm run build

# 清理 devDependencies
RUN cd /app && pnpm install --prod --frozen-lockfile

# 再次生成 Prisma Client（生產環境）
RUN cd /app/backend && pnpm prisma:generate

# ----------------------------------------
# 生產階段
# ----------------------------------------
FROM node:20-alpine AS production

# 安裝必要的運行時工具（包括 OpenSSL）
RUN apk add --no-cache \
    curl \
    openssl \
    openssl-dev \
    libc6-compat

# 創建非 root 用戶
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# 設置工作目錄
WORKDIR /app

# 從 builder 階段複製必要文件
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/backend/dist ./backend/dist
COPY --from=builder --chown=nestjs:nodejs /app/backend/prisma ./backend/prisma
COPY --from=builder --chown=nestjs:nodejs /app/backend/package.json ./backend/

# 創建媒體文件目錄
RUN mkdir -p /app/backend/media && \
    chown -R nestjs:nodejs /app/backend/media

WORKDIR /app/backend

# 切換到非 root 用戶
USER nestjs

# 暴露端口
EXPOSE 3000

# 健康檢查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api || exit 1

# 生產模式啟動
CMD ["node", "dist/main.js"]
