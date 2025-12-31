# 資料庫設置指南

## 情況說明

Docker 中的 PostgreSQL 是一個全新的空數據庫，需要從現有的 Django 數據庫遷移數據和表結構。

## 快速開始（推薦）

如果你已經有正確的 `schema.prisma`，最快的方式是使用 Prisma：

```bash
# 1. 確保 PostgreSQL 運行
./scripts/start-postgres.sh

# 2. 推送 Schema 到數據庫（創建表結構）
cd packages/backend
pnpm prisma:db:push

# 3. 初始化資料
pnpm seed:data
```

詳見 [Prisma 命令參考](./PRISMA_COMMANDS.md)

## 選項 1: 從現有 Django 數據庫遷移（推薦）

如果你已經有 Django 數據庫（SQLite 或 PostgreSQL），可以：

### 步驟 1: 導出 Django 數據庫結構和數據

```bash
# 如果 Django 使用 PostgreSQL
pg_dump -h localhost -U postgres -d your_django_db > django_dump.sql

# 如果 Django 使用 SQLite
sqlite3 backend/db.sqlite3 .dump > django_dump.sql
```

### 步驟 2: 導入到 Docker PostgreSQL

```bash
# 確保 Docker PostgreSQL 正在運行
docker-compose up -d postgres

# 導入數據
docker-compose exec -T postgres psql -U postgres -d 9jang_db < django_dump.sql

# 或從文件導入
cat django_dump.sql | docker-compose exec -T postgres psql -U postgres -d 9jang_db
```

### 步驟 3: 驗證

```bash
cd packages/backend
pnpm test:db
```

## 選項 2: 運行 Django Migrations（推薦用於新設置）

如果你有 Django 項目，可以在 Docker PostgreSQL 上運行 migrations：

### 快速設置（使用腳本）

```bash
# 自動運行 migrations
./scripts/setup-database.sh
```

### 手動設置

```bash
# 1. 更新 Django .env 指向 Docker PostgreSQL
# 在 backend/.env 中添加或更新：
# DATABASE_ENGINE=django.db.backends.postgresql
# DATABASE_NAME=9jang_db
# DATABASE_USER=postgres
# DATABASE_PASSWORD=postgres
# DATABASE_HOST=localhost
# DATABASE_PORT=5432

# 2. 運行 Django migrations
cd backend
../venv/bin/python manage.py migrate
# 或
python manage.py migrate  # 如果已激活虛擬環境
```

## 選項 3: 使用 Prisma DB Push（推薦用於快速設置）

Prisma 提供了 `db push` 命令，可以直接根據 `schema.prisma` 創建表結構：

```bash
cd packages/backend
pnpm prisma:db:push
```

**優點**：
- 快速簡單，不需要創建遷移文件
- 直接根據 schema.prisma 創建表結構
- 適合開發環境

**注意**：
- 確保 `schema.prisma` 與 Django 的表結構一致
- 如果表已存在，會嘗試同步結構（可能會有差異）

## 選項 4: 使用 Prisma Migrate（適合生產環境）

如果需要版本控制的遷移文件：

```bash
cd packages/backend
pnpm prisma:migrate:dev --name init
```

⚠️ **注意**：這會創建新的表結構，可能與 Django 不完全一致。建議先用 `prisma db pull` 從 Django 數據庫拉取 schema。

## 選項 5: 從現有數據庫生成 Schema（如果表已存在）

如果你已經有數據庫表：

```bash
cd packages/backend
# 從現有數據庫拉取 schema（會覆蓋現有 schema.prisma）
pnpm prisma:db:pull

# 重新生成 Prisma Client
pnpm prisma:generate
```

## 推薦工作流程

### 開發環境設置

1. **啟動 Docker PostgreSQL**：
   ```bash
   ./scripts/start-postgres.sh
   ```

2. **從 Django 數據庫遷移**：
   ```bash
   # 導出 Django 數據庫
   pg_dump -h localhost -U postgres -d django_db > /tmp/django_dump.sql
   
   # 導入到 Docker PostgreSQL
   cat /tmp/django_dump.sql | docker-compose exec -T postgres psql -U postgres -d 9jang_db
   ```

3. **驗證連接**：
   ```bash
   cd packages/backend
   pnpm test:db
   ```

### 與 Django 共享數據庫

如果你想讓 Django 和 NestJS 使用同一個數據庫：

1. **更新 Django `.env`**：
   ```env
   DATABASE_ENGINE=django.db.backends.postgresql
   DATABASE_NAME=9jang_db
   DATABASE_USER=postgres
   DATABASE_PASSWORD=postgres
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   ```

2. **運行 Django migrations**（如果還沒運行）：
   ```bash
   cd backend
   python manage.py migrate
   ```

3. **NestJS 可以直接使用現有表**（Prisma Schema 已映射）

## 故障排除

### 表不存在錯誤

如果看到 `table does not exist` 錯誤：

1. 檢查數據庫是否有表：
   ```bash
   docker-compose exec postgres psql -U postgres -d 9jang_db -c "\dt"
   ```

2. 如果表不存在，需要先遷移數據或運行 migrations

### 連接失敗

1. 檢查容器是否運行：
   ```bash
   docker ps | grep 9jang-postgres
   ```

2. 檢查端口是否被佔用：
   ```bash
   lsof -i :5432
   ```

3. 檢查環境變數：
   ```bash
   cd packages/backend
   grep DATABASE_URL .env
   ```

## 當前狀態

✅ Docker PostgreSQL 已啟動並運行
✅ 數據庫連接成功
⚠️ 數據庫是空的，需要遷移數據或運行 migrations
