# Docker 部署方案 - 快速指南

本專案已配置完整的 Docker 容器化方案，支持一鍵部署開發和生產環境。

## 🎯 文件結構

```
.
├── docker-compose.yml              # 主配置文件（開發環境）
├── docker-compose.prod.yml         # 生產環境覆蓋配置
├── docker-start.sh                 # 快速啟動腳本 ⭐
├── .dockerignore                   # Docker 忽略文件
├── backend/
│   ├── Dockerfile                  # 後端多階段構建
│   └── .dockerignore              # 後端忽略文件
├── frontend/
│   ├── Dockerfile                  # 前端多階段構建
│   ├── nginx.conf                  # Nginx 配置（生產環境）
│   └── .dockerignore              # 前端忽略文件
└── DOCKER_GUIDE.md                 # 詳細使用指南 📖
```

## ⚡ 快速開始

### 方式 1: 使用快速啟動腳本（推薦）

```bash
# 一鍵啟動
./docker-start.sh
```

這個腳本會：
- ✅ 檢查 Docker 環境
- ✅ 創建 .env 文件（如果不存在）
- ✅ 檢查端口占用
- ✅ 啟動所有服務
- ✅ 初始化資料庫
- ✅ 顯示訪問資訊

### 方式 2: 手動啟動

```bash
# 1. 複製環境變數
cp .env.example .env

# 2. 編輯 .env（設置密碼和密鑰）
nano .env

# 3. 啟動服務
docker-compose up -d

# 4. 初始化資料庫
docker-compose exec backend pnpm prisma:generate
docker-compose exec backend pnpm prisma:db:push

# 5. 查看狀態
docker-compose ps
```

## 🌐 訪問服務

啟動成功後，您可以訪問：

| 服務 | URL | 說明 |
|------|-----|------|
| 前端 | http://localhost:5173 | Vue 3 應用 |
| 後端 API | http://localhost:3000/api | NestJS REST API |
| 資料庫 | localhost:5432 | PostgreSQL |
| pgAdmin | http://localhost:5050 | 資料庫管理（可選） |

## 🔧 服務說明

### 核心服務

1. **PostgreSQL** - 資料庫
   - 映像: `postgres:15-alpine`
   - 持久化: 數據卷 `postgres_data`
   - 健康檢查: 自動

2. **Backend (NestJS)** - 後端 API
   - 多階段構建
   - 開發模式支持熱重載
   - 自動生成 Prisma Client

3. **Frontend (Vue 3)** - 前端應用
   - 開發: Vite 開發伺服器
   - 生產: Nginx 靜態服務器
   - 支持 SPA 路由

### 可選服務

4. **pgAdmin** - 資料庫管理工具
   ```bash
   docker-compose --profile tools up -d pgadmin
   ```

5. **Redis** - 快取服務
   ```bash
   docker-compose --profile cache up -d redis
   ```

## 📋 常用命令速查

```bash
# 啟動所有服務
docker-compose up -d

# 查看服務狀態
docker-compose ps

# 查看日誌（實時）
docker-compose logs -f

# 查看特定服務日誌
docker-compose logs -f backend

# 停止所有服務
docker-compose down

# 停止並刪除數據卷
docker-compose down -v

# 重啟服務
docker-compose restart

# 重新構建
docker-compose build --no-cache

# 進入容器 shell
docker-compose exec backend sh
docker-compose exec frontend sh
docker-compose exec postgres psql -U postgres -d 9jang_db
```

## 🏗️ 架構特點

### 多階段構建

兩個 Dockerfile 都使用多階段構建：

```dockerfile
# 基礎階段 - 安裝依賴
FROM node:20-alpine AS base

# 開發階段 - 包含開發工具
FROM base AS development

# 構建階段 - 編譯應用
FROM base AS builder

# 生產階段 - 最小化映像
FROM node:20-alpine AS production
```

**優勢**：
- 開發映像包含完整工具鏈
- 生產映像體積小、安全性高
- 構建緩存優化，速度快

### 網路隔離

所有服務在獨立網路 `9jang-network` 中：
- 服務間可通過服務名通信
- 外部只能訪問映射的端口
- 提高安全性

### 數據持久化

使用命名卷存儲重要數據：
- `postgres_data` - 資料庫數據
- `backend_media` - 上傳的媒體文件
- `pgadmin_data` - pgAdmin 配置
- `redis_data` - Redis 數據（可選）

## 🔐 環境配置

### 必須設置的變數

```env
# .env 文件
POSTGRES_PASSWORD=your_secure_password    # 資料庫密碼
JWT_SECRET=your_jwt_secret_key           # JWT 密鑰
```

### 常用配置

```env
# 端口配置
BACKEND_PORT=3000
FRONTEND_PORT=5173
POSTGRES_PORT=5432

# 資料庫配置
POSTGRES_USER=postgres
POSTGRES_DB=9jang_db

# CORS 配置
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

完整配置請參考：
- `.env.example` - 根目錄
- `backend/.env.example` - 後端
- `frontend/.env.example` - 前端

## 🚀 部署場景

### 本地開發

```bash
# 使用開發配置
docker-compose up -d

# 代碼自動熱重載
# 無需重啟容器
```

### 生產環境

```bash
# 使用生產配置
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 特點：
# - 優化的構建
# - 資源限制
# - 健康檢查
# - 自動重啟
```

### CI/CD 集成

```bash
# 在 CI 流程中
docker-compose build
docker-compose run --rm backend pnpm test
docker-compose run --rm frontend pnpm test

# 部署
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 🐛 故障排除

### 容器無法啟動

```bash
# 查看詳細日誌
docker-compose logs

# 重新構建
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 端口衝突

```bash
# 修改 .env 中的端口
BACKEND_PORT=3001
FRONTEND_PORT=5174

# 重啟服務
docker-compose down
docker-compose up -d
```

### 資料庫連接失敗

```bash
# 檢查資料庫狀態
docker-compose exec postgres pg_isready

# 查看資料庫日誌
docker-compose logs postgres

# 重啟資料庫
docker-compose restart postgres
```

### 清理空間

```bash
# 清理未使用的映像和容器
docker system prune -a

# 清理未使用的卷
docker volume prune
```

## 📊 性能優化

### 構建優化

- ✅ 多階段構建減少映像大小
- ✅ .dockerignore 排除不必要文件
- ✅ 分層緩存優化構建速度
- ✅ pnpm 提高依賴安裝速度

### 運行時優化

- ✅ 健康檢查確保服務可用
- ✅ 資源限制防止過度使用
- ✅ 重啟策略保證高可用
- ✅ 網路優化降低延遲

## 🔒 安全建議

### 開發環境

- ✅ 使用 `.env` 管理配置
- ✅ 不要提交 `.env` 到版本控制
- ✅ 使用簡單密碼即可

### 生產環境

- ⚠️ 使用強密碼和密鑰
- ⚠️ 不要暴露資料庫端口
- ⚠️ 啟用 HTTPS
- ⚠️ 配置防火牆規則
- ⚠️ 定期備份數據
- ⚠️ 定期更新映像

## 📚 更多資源

- 📖 [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) - 完整使用指南
- 📖 [ENV_CONFIGURATION_GUIDE.md](./ENV_CONFIGURATION_GUIDE.md) - 環境變數指南
- 📖 [DATABASE_SETUP_GUIDE.md](./DATABASE_SETUP_GUIDE.md) - 資料庫設置指南
- 🌐 [Docker 官方文檔](https://docs.docker.com/)
- 🌐 [Docker Compose 文檔](https://docs.docker.com/compose/)

## 💡 提示

1. **首次啟動較慢**：需要下載映像和構建容器
2. **重啟很快**：利用緩存，後續啟動秒級完成
3. **數據持久化**：除非使用 `-v` 標誌，否則數據不會丟失
4. **開發友好**：修改代碼自動重載，無需重啟容器

## 🆘 獲取幫助

遇到問題？

1. 查看 [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) 的故障排除章節
2. 檢查容器日誌: `docker-compose logs`
3. 驗證配置: `docker-compose config`
4. 查看容器狀態: `docker-compose ps`

---

**立即開始**: `./docker-start.sh` 🚀

**需要更多細節**: 閱讀 [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) 📖
