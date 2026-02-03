# ============================================
# 多階段構建 - Vue.js Frontend
# ============================================

# ----------------------------------------
# 基礎階段 - 安裝依賴
# ----------------------------------------
FROM node:20-alpine AS base

# 安裝 pnpm
RUN npm install -g pnpm

# 設置工作目錄
WORKDIR /app

# 複製 pnpm workspace 配置
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY frontend/package.json ./frontend/
COPY shared/package.json ./shared/

# ----------------------------------------
# 開發階段
# ----------------------------------------
FROM base AS development

# 安裝所有依賴
RUN pnpm install --frozen-lockfile

# 複製源代碼
COPY frontend ./frontend
COPY shared ./shared

# 設置工作目錄為 frontend
WORKDIR /app/frontend

# 暴露端口
EXPOSE 5173

# 開發模式啟動
CMD ["pnpm", "run", "dev", "--", "--host", "0.0.0.0"]

# ----------------------------------------
# 構建階段
# ----------------------------------------
FROM base AS builder

# 安裝所有依賴
RUN pnpm install --frozen-lockfile

# 複製源代碼
COPY frontend ./frontend
COPY shared ./shared

WORKDIR /app/frontend

# 構建生產版本
ARG VITE_API_BASE_URL
ARG VITE_BACKEND_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

RUN pnpm run build

# ----------------------------------------
# 生產階段 - Nginx
# ----------------------------------------
FROM nginx:alpine AS production

# 安裝必要的運行時工具
RUN apk add --no-cache curl

# 複製自定義 Nginx 配置
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# 從 builder 階段複製構建產物
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# 創建非 root 用戶（Nginx 已有 nginx 用戶）
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 健康檢查
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# 啟動 Nginx
CMD ["nginx", "-g", "daemon off;"]
