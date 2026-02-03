# 資料庫連接問題解決方案

## 🔴 當前問題

您遇到了 PostgreSQL 認證失敗的錯誤：

```
Authentication failed against database server at `localhost`,
the provided database credentials for `postgres` are not valid.
```

## 🚀 快速解決方案（三選一）

### ⚡ 方案 1: 快速自動修復（最快）

自動嘗試常見密碼並配置資料庫：

```bash
./quick-db-fix.sh
```

這個腳本會：
- 自動嘗試常見的密碼組合
- 檢查並創建資料庫（如果不存在）
- 自動更新 `.env` 檔案
- **適合：不記得密碼或使用預設配置的情況**

---

### 🛠️ 方案 2: 完整設置（最可靠）

互動式設置，讓您輸入正確的連接資訊：

```bash
./setup-database-connection.sh
```

這個腳本會：
- 提示您輸入資料庫連接資訊
- 測試連接是否成功
- 自動更新配置檔案
- **適合：知道密碼或需要自訂配置的情況**

---

### 📝 方案 3: 手動設置

如果您偏好手動操作：

#### 步驟 1: 找出或重設密碼

```bash
# 重設 postgres 使用者密碼
sudo -u postgres psql
```

在 psql 中執行：
```sql
ALTER USER postgres WITH PASSWORD 'your_new_password';
\q
```

#### 步驟 2: 創建資料庫

```bash
sudo -u postgres createdb 9jang_db
```

#### 步驟 3: 更新 backend/.env

編輯 `backend/.env`，修改 `DATABASE_URL`：

```env
DATABASE_URL=postgresql://postgres:your_new_password@localhost:5432/9jang_db
```

#### 步驟 4: 測試連接

```bash
cd backend
npm run test:db
```

---

## 📋 設置完成後的操作

資料庫連接成功後，執行以下命令：

```bash
# 1. 進入 backend 目錄
cd backend

# 2. 生成 Prisma Client
npm run prisma:generate

# 3. 將 Schema 推送到資料庫（創建所有表）
npm run prisma:db:push

# 4. （可選）查看資料庫
npm run prisma:studio

# 5. 啟動後端服務
npm run start:dev
```

## 🎯 驗證設置

### 檢查資料庫連接

```bash
cd backend
npm run test:db
```

應該看到：
```
✅ 資料庫連接成功
✅ 所有表結構已正確映射
```

### 檢查後端服務

```bash
cd backend
npm run start:dev
```

應該看到：
```
Application is running on: http://localhost:3000
```

### 檢查前端連接

```bash
cd frontend
npm run dev
```

訪問 `http://localhost:5173` 並嘗試登入。

## 🐛 常見問題

### Q: 執行腳本時提示權限不足？

```bash
chmod +x quick-db-fix.sh setup-database-connection.sh
```

### Q: PostgreSQL 未運行？

```bash
# 啟動 PostgreSQL
sudo service postgresql start

# 檢查狀態
sudo service postgresql status

# 檢查端口
ss -tln | grep 5432
```

### Q: 腳本找不到 psql 命令？

安裝 PostgreSQL 客戶端工具：

```bash
# Ubuntu/Debian
sudo apt-get install postgresql-client

# 或安裝完整的 PostgreSQL
sudo apt-get install postgresql
```

### Q: 資料庫連接成功但表不存在？

運行 Prisma 推送：

```bash
cd backend
npm run prisma:db:push
```

### Q: 如何查看當前的資料庫連接配置？

```bash
# 查看 backend/.env
grep "^DATABASE_URL" backend/.env

# 不顯示密碼
grep "^DATABASE_URL" backend/.env | sed 's/:.*@/:****@/'
```

## 📊 連接配置範例

### 本地開發（有密碼）

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/9jang_db
```

### 本地開發（無密碼）

```env
DATABASE_URL=postgresql://postgres@localhost:5432/9jang_db
```

### 遠端資料庫

```env
DATABASE_URL=postgresql://user:password@192.168.1.100:5432/9jang_db
```

### Cloud SQL (GCP)

```env
DATABASE_URL=postgresql://user:password@/9jang_db?host=/cloudsql/project:region:instance
```

## 🔐 安全提醒

1. **開發環境**: 可以使用簡單密碼（如 `password`）
2. **生產環境**: 必須使用強密碼
3. **版本控制**: 確保 `.env` 已在 `.gitignore` 中
4. **備份**: 腳本會自動備份您的 `.env` 檔案

## 📚 相關文檔

- [DATABASE_SETUP_GUIDE.md](./DATABASE_SETUP_GUIDE.md) - 詳細的資料庫設置指南
- [ENV_CONFIGURATION_GUIDE.md](./ENV_CONFIGURATION_GUIDE.md) - 環境變數配置指南
- [backend/PRISMA_COMMANDS.md](./backend/PRISMA_COMMANDS.md) - Prisma 命令參考

## 💡 推薦流程

**首次設置時**:
```bash
./quick-db-fix.sh           # 快速修復
cd backend
npm run prisma:generate      # 生成 Client
npm run prisma:db:push       # 創建表結構
npm run test:db              # 驗證連接
npm run start:dev            # 啟動服務
```

**遇到問題時**:
1. 先看錯誤訊息
2. 查閱 [DATABASE_SETUP_GUIDE.md](./DATABASE_SETUP_GUIDE.md)
3. 執行 `./setup-database-connection.sh` 重新設置
4. 如果還不行，檢查 PostgreSQL 日誌

---

**立即開始**: 執行 `./quick-db-fix.sh` 🚀
