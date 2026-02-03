# Docker 使用指南

本專案提供完整的 Docker 和 Docker Compose 配置，支持開發和生產環境。

## 📦 架構概覽

```
┌─────────────────────────────────────────────────────────┐
│                     Docker Compose                       │
├─────────────┬─────────────┬─────────────┬──────────────┤
│  Frontend   │   Backend   │  PostgreSQL │   Optional   │
│  (Vue 3)    │  (NestJS)   │    (DB)     │ (Redis/      │
│  Port:5173  │  Port:3000  │  Port:5432  │  PgAdmin)    │
└─────────────┴─────────────┴─────────────┴──────────────┘
```

## 🚀 快速開始

### 前置需求

- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB+ 可用記憶體

檢查安裝：
```bash
docker --version
docker-compose --version
```

### 開發環境

#### 1. 設置環境變數

```bash
# 複製環境變數範例
cp .env.example .env

# 編輯 .env（至少修改資料庫密碼）
nano .env
```

最小配置：
```env
POSTGRES_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_key
```

#### 2. 啟動所有服務

```bash
# 啟動所有服務（開發模式）
docker-compose up -d

# 查看日誌
docker-compose logs -f

# 查看特定服務日誌
docker-compose logs -f backend
```

#### 3. 初始化資料庫

```bash
# 進入 backend 容器
docker-compose exec backend sh

# 生成 Prisma Client
pnpm prisma:generate

# 推送 Schema 到資料庫
pnpm prisma:db:push

# 退出容器
exit
```

#### 4. 訪問服務

- 🌐 前端: http://localhost:5173
- 🔧 後端 API: http://localhost:3000/api
- 📊 資料庫: localhost:5432

### 生產環境

```bash
# 使用生產配置啟動
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 查看狀態
docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps
```

## 📋 常用命令

### 服務管理

```bash
# 啟動所有服務
docker-compose up -d

# 停止所有服務
docker-compose down

# 重啟服務
docker-compose restart

# 停止並移除所有容器、網路（保留數據卷）
docker-compose down

# 停止並移除所有容器、網路、數據卷
docker-compose down -v
```

### 服務操作

```bash
# 查看服務狀態
docker-compose ps

# 查看服務日誌
docker-compose logs -f [service_name]

# 進入容器 shell
docker-compose exec backend sh
docker-compose exec frontend sh
docker-compose exec postgres sh

# 重啟特定服務
docker-compose restart backend

# 重新構建服務
docker-compose build backend
docker-compose up -d --build backend
```

### 資料庫操作

```bash
# 連接到 PostgreSQL
docker-compose exec postgres psql -U postgres -d 9jang_db

# 備份資料庫
docker-compose exec postgres pg_dump -U postgres 9jang_db > backup.sql

# 恢復資料庫
docker-compose exec -T postgres psql -U postgres 9jang_db < backup.sql

# 查看資料庫列表
docker-compose exec postgres psql -U postgres -c "\l"
```

### Prisma 操作

```bash
# 進入 backend 容器
docker-compose exec backend sh

# 生成 Prisma Client
pnpm prisma:generate

# 推送 Schema
pnpm prisma:db:push

# 查看資料庫（Prisma Studio）
pnpm prisma:studio

# 創建遷移
pnpm prisma:migrate:dev

# 應用遷移（生產環境）
pnpm prisma:migrate:deploy
```

## 🛠️ 可選服務

### 啟用 pgAdmin（資料庫管理工具）

```bash
# 啟動 pgAdmin
docker-compose --profile tools up -d pgadmin

# 訪問 pgAdmin
# URL: http://localhost:5050
# Email: admin@9jang.local
# Password: admin（在 .env 中設置）
```

在 pgAdmin 中添加伺服器：
- Host: postgres
- Port: 5432
- Username: postgres
- Password: 你在 .env 中設置的密碼

### 啟用 Redis（快取）

```bash
# 啟動 Redis
docker-compose --profile cache up -d redis

# 測試 Redis
docker-compose exec redis redis-cli ping
```

## 🔧 開發工作流

### 熱重載開發

開發模式下，代碼變更會自動重載：

```bash
# 啟動開發環境
docker-compose up -d

# 前端和後端會自動監聽文件變更
# 修改 frontend/src 下的文件 → 前端自動重載
# 修改 backend/src 下的文件 → 後端自動重啟
```

### 更新依賴

```bash
# 更新後端依賴
docker-compose exec backend pnpm install <package>

# 更新前端依賴
docker-compose exec frontend pnpm install <package>

# 重新構建服務
docker-compose build
docker-compose up -d
```

### 運行測試

```bash
# 後端測試
docker-compose exec backend pnpm test

# E2E 測試
docker-compose exec backend pnpm test:e2e

# 前端測試
docker-compose exec frontend pnpm test
```

## 📊 服務端口

| 服務 | 容器端口 | 主機端口 | 說明 |
|------|---------|---------|------|
| Frontend | 5173/80 | 5173 | Vue.js 開發伺服器 |
| Backend | 3000 | 3000 | NestJS API 伺服器 |
| PostgreSQL | 5432 | 5432 | 資料庫 |
| pgAdmin | 80 | 5050 | 資料庫管理（可選） |
| Redis | 6379 | 6379 | 快取伺服器（可選） |

## 🐛 故障排除

### 問題：容器無法啟動

```bash
# 查看詳細錯誤
docker-compose logs

# 檢查容器狀態
docker-compose ps

# 重新構建並啟動
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 問題：資料庫連接失敗

```bash
# 檢查 PostgreSQL 是否健康
docker-compose ps postgres

# 查看資料庫日誌
docker-compose logs postgres

# 測試連接
docker-compose exec postgres psql -U postgres -d 9jang_db -c "SELECT 1;"
```

### 問題：端口被占用

```bash
# 查看占用的端口
netstat -tulpn | grep :3000
ss -tulpn | grep :5173

# 修改 .env 中的端口配置
BACKEND_PORT=3001
FRONTEND_PORT=5174
```

### 問題：磁碟空間不足

```bash
# 清理未使用的容器和映像
docker system prune -a

# 清理未使用的數據卷
docker volume prune

# 查看磁碟使用
docker system df
```

### 問題：前端無法連接後端

檢查 CORS 設置：
```bash
# 確保 .env 中包含前端 URL
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 問題：熱重載不工作

確保正確掛載了源代碼目錄：
```bash
# 檢查掛載點
docker-compose config

# 重啟服務
docker-compose restart backend frontend
```

## 🔒 安全最佳實踐

### 開發環境

1. 使用 `.env` 文件管理配置
2. 不要在代碼中硬編碼密碼
3. 定期更新依賴和映像

### 生產環境

1. **使用強密碼**
   ```env
   POSTGRES_PASSWORD=<strong-random-password>
   JWT_SECRET=<strong-random-secret>
   ```

2. **不要暴露資料庫端口**
   ```yaml
   postgres:
     ports: []  # 移除端口映射
   ```

3. **使用 HTTPS**
   - 配置 Nginx 反向代理
   - 使用 Let's Encrypt SSL 證書

4. **資源限制**
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '2'
         memory: 2G
   ```

5. **定期備份**
   ```bash
   # 自動備份腳本
   docker-compose exec postgres pg_dump -U postgres 9jang_db > backup_$(date +%Y%m%d).sql
   ```

## 📈 性能優化

### 構建優化

```bash
# 使用 BuildKit
export DOCKER_BUILDKIT=1
docker-compose build

# 多階段構建已啟用
# 生產映像只包含必要文件
```

### 運行時優化

```yaml
# docker-compose.yml 中已配置：
- 健康檢查
- 資源限制
- 重啟策略
- 數據卷優化
```

## 📚 進階主題

### 使用 Docker Swarm（生產集群）

```bash
# 初始化 Swarm
docker swarm init

# 部署 Stack
docker stack deploy -c docker-compose.yml -c docker-compose.prod.yml 9jang

# 查看服務
docker service ls
```

### 使用 Kubernetes

可以使用 Kompose 將 Docker Compose 轉換為 Kubernetes 配置：

```bash
# 安裝 Kompose
curl -L https://github.com/kubernetes/kompose/releases/download/v1.28.0/kompose-linux-amd64 -o kompose
chmod +x kompose
sudo mv kompose /usr/local/bin/

# 轉換配置
kompose convert -f docker-compose.yml
```

### 監控和日誌

添加監控服務（可選）：

```yaml
# docker-compose.monitoring.yml
services:
  prometheus:
    image: prom/prometheus
    # 配置 Prometheus
  
  grafana:
    image: grafana/grafana
    # 配置 Grafana
```

## 🆘 需要協助？

- 📖 查看 [Docker 官方文檔](https://docs.docker.com/)
- 📖 查看 [Docker Compose 文檔](https://docs.docker.com/compose/)
- 🐛 檢查容器日誌: `docker-compose logs`
- 💬 聯繫團隊獲取支持

## 📝 環境變數參考

完整的環境變數列表請參考：
- `.env.example` - 根目錄配置
- `backend/.env.example` - 後端配置
- `frontend/.env.example` - 前端配置

---

**開始使用**: `docker-compose up -d` 🚀
