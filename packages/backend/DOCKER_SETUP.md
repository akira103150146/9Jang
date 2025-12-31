# Docker 本地開發環境設置

## 使用 Docker Compose 運行 PostgreSQL

### 快速開始

1. **啟動 PostgreSQL 容器**：

```bash
# 在項目根目錄執行
docker-compose up -d postgres
```

2. **檢查容器狀態**：

```bash
docker-compose ps
```

3. **配置 NestJS 後端環境變數**：

```bash
cd packages/backend
# 複製 Docker 環境變數配置
cp .env.docker .env
# 或手動編輯 .env，設置 DATABASE_URL=postgresql://postgres:postgres@localhost:5432/9jang_db
```

4. **生成 Prisma Client**：

```bash
cd packages/backend
pnpm prisma:generate
```

5. **運行 NestJS 後端**：

```bash
pnpm start:dev
```

### 常用命令

#### 啟動服務

```bash
# 啟動 PostgreSQL（後台運行）
docker-compose up -d postgres

# 查看日誌
docker-compose logs -f postgres
```

#### 停止服務

```bash
# 停止容器（保留數據）
docker-compose stop postgres

# 停止並刪除容器（保留數據卷）
docker-compose down

# 停止並刪除容器和數據卷（⚠️ 會刪除所有數據）
docker-compose down -v
```

#### 數據庫管理

```bash
# 連接到 PostgreSQL
docker-compose exec postgres psql -U postgres -d 9jang_db

# 或使用本地 psql（如果已安裝）
psql -h localhost -U postgres -d 9jang_db
```

#### 查看數據庫

```bash
# 使用 Prisma Studio
cd packages/backend
pnpm prisma:studio
```

### 數據持久化

數據存儲在 Docker volume `postgres_data` 中，即使容器停止或刪除，數據也會保留。

要完全清除數據：

```bash
docker-compose down -v
```

### 環境變數配置

#### 開發環境（Docker）

使用 `.env.docker` 或手動設置：

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/9jang_db
```

#### 生產環境

根據實際部署環境配置：

```env
# 本地 PostgreSQL（非 Docker）
DATABASE_URL=postgresql://user:password@localhost:5432/9jang_db

# Cloud SQL (GCP)
DATABASE_URL=postgresql://user:password@/9jang_db?host=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME
```

### 故障排除

#### 端口已被佔用

如果 5432 端口已被佔用，可以修改 `docker-compose.yml`：

```yaml
ports:
  - "5433:5432"  # 使用 5433 端口
```

然後更新 `.env` 中的 `DATABASE_URL`：

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/9jang_db
```

#### 連接失敗

1. 檢查容器是否運行：
   ```bash
   docker-compose ps
   ```

2. 檢查容器日誌：
   ```bash
   docker-compose logs postgres
   ```

3. 檢查健康狀態：
   ```bash
   docker-compose exec postgres pg_isready -U postgres
   ```

#### 重置數據庫

```bash
# 停止並刪除容器和數據
docker-compose down -v

# 重新啟動
docker-compose up -d postgres

# 重新生成 Prisma Client
cd packages/backend
pnpm prisma:generate
```

### 不使用 Docker 的替代方案

如果你不想使用 Docker，可以：

1. **本地安裝 PostgreSQL**：

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# macOS (使用 Homebrew)
brew install postgresql
brew services start postgresql

# 創建數據庫
createdb 9jang_db
```

2. **使用雲端資料庫**（如 Supabase、Neon 等）

3. **使用 SQLite**（需要修改 Prisma Schema，移除 Decimal 和 Json 類型）

### 推薦工作流程

1. 開發環境：使用 Docker Compose（簡單、一致）
2. 測試環境：使用 Docker Compose 或 CI/CD 提供的 PostgreSQL
3. 生產環境：使用 GCP Cloud SQL 或其他託管 PostgreSQL

### 與 Django 後端共享數據庫

如果 Django 後端也在本地運行，可以：

1. **使用相同的 Docker Compose 配置**（推薦）
2. **或讓 Django 和 NestJS 都連接到同一個 PostgreSQL 實例**

確保兩個後端使用相同的：
- 數據庫名稱
- 用戶名和密碼
- 端口

這樣可以實現無縫遷移和測試。
