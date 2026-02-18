# Docker 快速啟動指南

## ✅ 問題已修復

您遇到的 `bad interpreter: /bin/bash^M` 錯誤已經解決！

這是由於 Windows 風格的行結束符（CRLF）導致的。現在所有腳本都已經轉換為 Unix 風格（LF）。

## 🚀 立即開始

### 1. 快速啟動（互動式）

```bash
./scripts/deployment/docker-start.sh
```

這個腳本會引導您：
- 選擇啟動模式（開發/生產/僅資料庫）
- 自動檢查環境
- 初始化資料庫
- 顯示訪問資訊

### 2. 直接啟動（開發模式）

```bash
# 啟動所有服務
docker-compose up -d

# 查看日誌
docker-compose logs -f

# 初始化資料庫
docker-compose exec backend pnpm prisma:generate
docker-compose exec backend pnpm prisma:db:push
```

### 3. 訪問服務

- 🌐 **前端**: http://localhost:5173
- 🔧 **後端 API**: http://localhost:3000/api
- 📊 **資料庫**: localhost:5432

## 📋 常用命令

```bash
# 查看服務狀態
docker-compose ps

# 查看日誌
docker-compose logs -f

# 停止服務
docker-compose down

# 重啟服務
docker-compose restart

# 進入後端容器
docker-compose exec backend sh

# 進入前端容器
docker-compose exec frontend sh
```

## 🔧 環境配置

確保 `.env` 文件已正確設置：

```env
# 必須設置
POSTGRES_PASSWORD=your_password
JWT_SECRET=your_jwt_secret

# 可選配置
BACKEND_PORT=3000
FRONTEND_PORT=5173
POSTGRES_PORT=5432
```

## 🐛 常見問題

### Q: 端口被占用？

編輯 `.env` 修改端口：
```env
BACKEND_PORT=3001
FRONTEND_PORT=5174
```

### Q: 如何重新構建？

```bash
docker-compose build --no-cache
docker-compose up -d
```

### Q: 如何清理所有容器和數據？

```bash
# 停止並刪除容器、網路
docker-compose down

# 同時刪除數據卷
docker-compose down -v
```

### Q: 如何查看資料庫？

```bash
# 使用 Prisma Studio
docker-compose exec backend pnpm prisma:studio

# 或啟用 pgAdmin
docker-compose --profile tools up -d pgadmin
# 訪問 http://localhost:5050
```

## 📚 詳細文檔

- 📖 [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) - 完整使用指南
- 📖 [DOCKER_README.md](./DOCKER_README.md) - 架構說明
- 📖 [ENV_CONFIGURATION_GUIDE.md](./ENV_CONFIGURATION_GUIDE.md) - 環境變數配置

## ✨ 啟動模式

### 開發模式（預設）
```bash
docker-compose up -d
```
- 支持熱重載
- 包含開發工具
- 實時編譯

### 生產模式
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```
- 優化的構建
- Nginx 靜態服務
- 資源限制

### 僅資料庫
```bash
docker-compose up -d postgres
```
- 只啟動 PostgreSQL
- 適合本地開發

### 開發 + 管理工具
```bash
docker-compose --profile tools up -d
```
- 包含 pgAdmin
- 資料庫管理界面

## 🎯 驗證安裝

```bash
# 1. 檢查 Docker
docker --version
docker-compose --version

# 2. 驗證配置
docker-compose config --quiet && echo "✓ 配置正確"

# 3. 測試腳本
./docker-start.sh  # Ctrl+C 取消

# 4. 啟動服務
docker-compose up -d

# 5. 檢查狀態
docker-compose ps
```

所有服務應顯示為 `Up` 狀態。

## 🔐 安全提醒

開發環境：
- ✅ 可以使用簡單密碼
- ✅ .env 已在 .gitignore

生產環境：
- ⚠️ 必須使用強密碼
- ⚠️ 不要暴露資料庫端口
- ⚠️ 配置 HTTPS

## 💡 小提示

1. **首次啟動較慢**（需要下載映像）
2. **後續啟動很快**（利用緩存）
3. **數據會持久化**（除非使用 `-v` 刪除）
4. **代碼自動重載**（無需重啟容器）

---

**現在就開始**: `./scripts/deployment/docker-start.sh` 🚀
