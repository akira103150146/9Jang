# Docker 開發環境快速指南

## 快速啟動

### 1. 啟動 PostgreSQL

```bash
# 在項目根目錄
docker-compose up -d postgres
```

### 2. 配置 NestJS 後端

```bash
cd packages/backend
cp .env.docker .env
# 或手動編輯 .env，確保 DATABASE_URL 指向 Docker 中的 PostgreSQL
```

### 3. 生成 Prisma Client

```bash
cd packages/backend
pnpm prisma:generate
```

### 4. 啟動 NestJS 後端

```bash
cd packages/backend
pnpm start:dev
```

## 數據庫連接信息

- **主機**: `localhost`
- **端口**: `5432`
- **數據庫名**: `9jang_db`
- **用戶名**: `postgres`
- **密碼**: `postgres`

連接字符串：
```
postgresql://postgres:postgres@localhost:5432/9jang_db
```

## 常用命令

```bash
# 啟動
docker-compose up -d postgres

# 停止
docker-compose stop postgres

# 查看日誌
docker-compose logs -f postgres

# 連接到數據庫
docker-compose exec postgres psql -U postgres -d 9jang_db

# 完全清除（包括數據）
docker-compose down -v
```

## 詳細文檔

查看 `packages/backend/DOCKER_SETUP.md` 獲取完整說明。
