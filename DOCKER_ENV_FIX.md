# Docker 環境變數問題修復

## 🔴 問題

Backend 容器內的資料庫連接失敗：

```
Error: P1000: Authentication failed against database server at `postgres`
```

## 🔍 原因

Docker 容器內的 `.env` 文件不包含正確的 `DATABASE_URL`，或者環境變數沒有正確傳遞。

## ✅ 解決方案

### 方案 1: 使用 docker-compose 環境變數（推薦）

Backend 容器已經通過 `docker-compose.yml` 傳遞了正確的環境變數：

```yaml
backend:
  environment:
    DATABASE_URL: postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-password}@postgres:5432/${POSTGRES_DB:-9jang_db}
```

但容器內可能優先使用了 `.env` 文件。

### 方案 2: 確保 .env 文件正確

確保根目錄的 `.env` 包含：

```env
POSTGRES_PASSWORD=password
POSTGRES_USER=postgres
POSTGRES_DB=9jang_db
```

### 方案 3: 直接在容器內設置環境變數

```bash
docker-compose exec backend sh -c '
export DATABASE_URL="postgresql://postgres:password@postgres:5432/9jang_db"
pnpm prisma:db:push
'
```

## 🔧 快速修復

使用以下命令直接推送 Schema：

```bash
cd /home/akira/github/9Jang

# 方式 1: 直接設置環境變數
docker-compose exec backend sh -c 'DATABASE_URL="postgresql://postgres:password@postgres:5432/9jang_db" pnpm prisma:db:push'

# 方式 2: 使用 docker-compose run（會創建新容器）
docker-compose run --rm -e DATABASE_URL="postgresql://postgres:password@postgres:5432/9jang_db" backend pnpm prisma:db:push
```

## 📝 長期解決方案

### 更新 docker-compose.yml

確保環境變數優先級正確：

```yaml
backend:
  environment:
    NODE_ENV: ${NODE_ENV:-development}
    PORT: ${PORT:-3000}
    # 資料庫連接（覆蓋 .env 文件）
    DATABASE_URL: postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-password}@postgres:5432/${POSTGRES_DB:-9jang_db}
```

這個配置已經存在，應該可以工作。

### 檢查優先級

環境變數優先級（從高到低）：
1. `docker-compose.yml` 中的 `environment`
2. `docker-compose.yml` 中的 `env_file`
3. 容器內的 `.env` 文件
4. Dockerfile 中的 `ENV`

## 🧪 驗證

```bash
# 1. 檢查環境變數
docker-compose exec backend printenv | grep DATABASE_URL

# 2. 測試資料庫連接
docker-compose exec postgres psql -U postgres -c "SELECT 1;"

# 3. 測試 Prisma
docker-compose exec backend sh -c 'DATABASE_URL="postgresql://postgres:password@postgres:5432/9jang_db" npx prisma db pull'
```

## 💡 建議

為了避免這個問題，建議：

1. **不要在 Dockerfile 中 COPY .env**
2. **只通過 docker-compose.yml 傳遞環境變數**
3. **使用 `--env-file` 選項**

### 更新 Dockerfile

在 `backend/Dockerfile` 中，確保不複製 `.env`：

```dockerfile
# ✅ .dockerignore 應該包含
.env
.env.*
```

### 檢查 .dockerignore

```bash
cat backend/.dockerignore | grep env
```

應該包含：
```
.env
.env.*
```

## 📊 環境變數傳遞流程

```
宿主機 .env
    ↓
docker-compose.yml 讀取
    ↓
傳遞給容器 (environment)
    ↓
容器內可用
```

## ✅ 總結

**立即修復**:
```bash
docker-compose exec backend sh -c 'DATABASE_URL="postgresql://postgres:password@postgres:5432/9jang_db" pnpm prisma:db:push'
```

**驗證成功後**，資料庫結構就會創建完成。

---

**測試**: `docker-compose exec backend pnpm test:db` 🚀
