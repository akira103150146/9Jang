# 最終設置說明

## 🎉 當前狀態

✅ **所有 Docker 容器都在運行！**

```bash
docker-compose ps
```

您應該看到：
- ✅ 9jang-postgres (健康)
- ✅ 9jang-backend (運行中)
- ✅ 9jang-frontend (運行中)

## ⚠️ 資料庫初始化問題

由於 localhost:5432 有本地 PostgreSQL 正在運行，且密碼與 Docker 容器不同，導致無法從本地直接連接 Docker 資料庫。

## ✅ 解決方案：使用 Docker 容器內部初始化

### 方式 1: 一鍵初始化（推薦）

```bash
# 進入 backend 容器並初始化
docker-compose exec backend sh -c '
cd /app/backend
cat > .env << "EOF"
DATABASE_URL=postgresql://postgres:password@postgres:5432/9jang_db
NODE_ENV=development
PORT=3000
EOF
pnpm prisma:generate
pnpm prisma:db:push
echo "✓ 資料庫初始化完成！"
'
```

### 方式 2: 逐步操作

```bash
# 1. 進入 backend 容器
docker-compose exec backend sh

# 2. 進入 backend 目錄
cd /app/backend

# 3. 創建正確的 .env
cat > .env << 'EOF'
DATABASE_URL=postgresql://postgres:password@postgres:5432/9jang_db
NODE_ENV=development
PORT=3000
EOF

# 4. 生成 Prisma Client
pnpm prisma:generate

# 5. 推送 Schema 到資料庫
pnpm prisma:db:push

# 6. 驗證（可選）
pnpm prisma:studio &

# 7. 退出容器
exit
```

### 方式 3: 使用 Docker Run

```bash
docker-compose run --rm backend sh -c '
cd /app/backend
echo "DATABASE_URL=postgresql://postgres:password@postgres:5432/9jang_db" > .env
pnpm prisma:generate
pnpm prisma:db:push
'
```

## 🧪 驗證設置

### 1. 檢查資料庫表

```bash
docker-compose exec postgres psql -U postgres -d 9jang_db -c "\dt"
```

應該看到所有創建的表（account_customuser, cramschool_student 等）。

### 2. 檢查 Backend 日誌

```bash
docker-compose logs backend --tail=50
```

應該沒有錯誤訊息。

### 3. 測試 API

```bash
curl http://localhost:3000/api
```

或訪問瀏覽器：http://localhost:3000/api

### 4. 訪問前端

打開瀏覽器訪問：http://localhost:5173

## 📊 服務狀態檢查

```bash
# 查看所有容器
docker-compose ps

# 查看日誌
docker-compose logs -f

# 查看特定服務
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# 重啟服務
docker-compose restart backend
```

## 🔧 常見問題

### Q: 容器內初始化後，本地還能用嗎？

A: 可以！資料庫在 Docker 容器中，但可以從本地訪問。

如果想從本地訪問，需要：
1. 停止本地 PostgreSQL（占用 5432）
2. 或改用 Docker 暴露的端口

### Q: 如何停止本地 PostgreSQL？

```bash
# Ubuntu/Debian
sudo service postgresql stop

# 或查看進程
ps aux | grep postgres
```

### Q: 如何連接到 Docker 資料庫？

```bash
# 使用 Docker 容器
docker-compose exec postgres psql -U postgres -d 9jang_db

# 或從本地（如果安裝了 psql 且停止了本地 PG）
PGPASSWORD=password psql -h localhost -U postgres -d 9jang_db
```

### Q: 資料會丟失嗎？

A: 不會！資料存儲在 Docker volume `postgres_data` 中，除非執行：
```bash
docker-compose down -v  # 會刪除 volume
```

正常停止不會刪除數據：
```bash
docker-compose down  # 安全，保留數據
```

## 🎯 完整流程（從頭開始）

如果需要重新設置：

```bash
# 1. 停止並清理（保留數據）
docker-compose down

# 2. （可選）完全清理重來
docker-compose down -v
docker system prune -f

# 3. 啟動服務
docker-compose up -d

# 4. 等待資料庫就緒
sleep 10

# 5. 初始化資料庫（使用方式1）
docker-compose exec backend sh -c '
cd /app/backend
cat > .env << "EOF"
DATABASE_URL=postgresql://postgres:password@postgres:5432/9jang_db
EOF
pnpm prisma:generate
pnpm prisma:db:push
'

# 6. 驗證
docker-compose ps
curl http://localhost:3000/api

# 7. 訪問前端
# http://localhost:5173
```

## 🌐 訪問地址

| 服務 | URL | 說明 |
|------|-----|------|
| 前端 | http://localhost:5173 | Vue 3 應用 |
| 後端 API | http://localhost:3000/api | NestJS REST API |
| 資料庫 | localhost:5432 | PostgreSQL (容器內: postgres:5432) |
| Prisma Studio | http://localhost:5555 | 資料庫管理（需手動啟動） |

## 🚀 啟動 Prisma Studio（可選）

```bash
# 在容器內啟動
docker-compose exec backend sh -c 'cd /app/backend && pnpm prisma:studio'

# 訪問 http://localhost:5555
```

## 📚 相關文檔

- **ALL_ISSUES_RESOLVED.md** - 所有問題總覽
- **DOCKER_GUIDE.md** - 完整 Docker 使用手冊
- **DOCKER_MANUAL_SETUP.md** - 手動設置指南
- **DOCKER_ENV_FIX.md** - 環境變數問題

## ✅ 成功標誌

當您完成初始化後：

1. ✅ `docker-compose ps` 顯示所有容器運行
2. ✅ `docker-compose exec postgres psql -U postgres -d 9jang_db -c "\dt"` 顯示表列表
3. ✅ http://localhost:3000/api 返回響應
4. ✅ http://localhost:5173 顯示登入頁面

---

**立即執行**: 複製上面的"方式 1"命令並執行！ 🚀
