# Docker 手動設置指南

Docker 容器已成功啟動！但由於環境變數配置問題，需要手動初始化資料庫。

## ✅ 當前狀態

所有容器都在運行：
```bash
docker-compose ps
```

應該看到：
- ✅ 9jang-postgres (健康)
- ✅ 9jang-backend (運行中)
- ✅ 9jang-frontend (運行中)

## 🔧 手動初始化資料庫

### 方式 1: 使用本地 Prisma CLI（推薦）

如果您的本地環境已配置好：

```bash
cd backend

# 1. 確保 .env 包含正確的 DATABASE_URL
echo "DATABASE_URL=postgresql://postgres:password@localhost:5432/9jang_db" > .env

# 2. 生成 Prisma Client
pnpm prisma:generate

# 3. 推送 Schema 到資料庫
pnpm prisma:db:push

# 4. (可選) 查看資料庫
pnpm prisma:studio
```

### 方式 2: 進入 Docker 容器手動操作

```bash
# 1. 進入 backend 容器
docker-compose exec backend sh

# 2. 在容器內執行
cd /app/backend

# 3. 創建正確的 .env
cat > .env << 'EOF'
DATABASE_URL=postgresql://postgres:password@postgres:5432/9jang_db
NODE_ENV=development
PORT=3000
EOF

# 4. 生成 Prisma Client
pnpm prisma:generate

# 5. 推送 Schema
pnpm prisma:db:push

# 6. 退出容器
exit
```

### 方式 3: 直接執行 SQL

如果前兩種方式都失敗，可以手動創建表：

```bash
# 進入 postgres 容器
docker-compose exec postgres psql -U postgres -d 9jang_db

# 然後手動執行 SQL（從 Prisma schema 生成）
# 這個方式比較複雜，不推薦
```

## 🧪 驗證

### 1. 檢查服務狀態

```bash
docker-compose ps
```

所有服務應該是 `Up` 狀態。

### 2. 檢查資料庫連接

```bash
docker-compose exec postgres psql -U postgres -d 9jang_db -c "\dt"
```

應該看到所有創建的表。

### 3. 檢查 Backend API

```bash
curl http://localhost:3000/api
```

### 4. 訪問前端

打開瀏覽器訪問: http://localhost:5173

## 📋 服務訪問

| 服務 | URL | 說明 |
|------|-----|------|
| 前端 | http://localhost:5173 | Vue 3 應用 |
| 後端 API | http://localhost:3000/api | NestJS REST API |
| 資料庫 | localhost:5432 | PostgreSQL (用戶: postgres, 密碼: password) |

## 🔍 故障排除

### 問題: Backend 無法連接資料庫

**檢查 DATABASE_URL**:
```bash
docker-compose exec backend printenv | grep DATABASE_URL
```

應該輸出:
```
DATABASE_URL=postgresql://postgres:password@postgres:5432/9jang_db
```

### 問題: 資料庫連接失敗

**測試連接**:
```bash
docker-compose exec postgres psql -U postgres -c "SELECT 1;"
```

### 問題: 容器無法啟動

**查看日誌**:
```bash
docker-compose logs backend
docker-compose logs postgres
docker-compose logs frontend
```

### 問題: 端口被占用

**修改 .env**:
```env
BACKEND_PORT=3001
FRONTEND_PORT=5174
POSTGRES_PORT=5433
```

然後重啟:
```bash
docker-compose down
docker-compose up -d
```

## 💡 建議的完整流程

```bash
# 1. 停止並清理
docker-compose down -v

# 2. 確保 .env 正確
cat .env | grep POSTGRES

# 3. 啟動服務
docker-compose up -d

# 4. 等待資料庫就緒
sleep 10

# 5. 使用本地 Prisma 初始化（推薦）
cd backend
echo "DATABASE_URL=postgresql://postgres:password@localhost:5432/9jang_db" > .env
pnpm prisma:generate
pnpm prisma:db:push
cd ..

# 6. 驗證
docker-compose ps
docker-compose logs backend | tail -20

# 7. 訪問應用
# 前端: http://localhost:5173
# 後端: http://localhost:3000/api
```

## 📚 相關文檔

- [DOCKER_QUICK_START.md](./DOCKER_QUICK_START.md) - 快速啟動
- [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) - 完整手冊
- [DOCKER_ENV_FIX.md](./DOCKER_ENV_FIX.md) - 環境變數問題
- [ALL_ISSUES_RESOLVED.md](./ALL_ISSUES_RESOLVED.md) - 所有問題總覽

## ✅ 成功標誌

當您看到以下內容時，表示設置成功：

1. ✅ `docker-compose ps` 顯示所有容器都在運行
2. ✅ http://localhost:3000/api 返回 API 響應
3. ✅ http://localhost:5173 顯示前端頁面
4. ✅ 可以登入系統

---

**需要幫助?** 查看日誌: `docker-compose logs -f` 🔍
