# 九章補習班管理系統 - 全新專案初始化指南

> **適用情境**: 當您從 Git 克隆專案後,或是在全新環境中首次設定專案時使用

## 📋 前置需求

在開始之前,請確保您的系統已安裝:

- **Node.js** >= 18.x
- **pnpm** >= 8.x (套件管理工具)
- **PostgreSQL** >= 14.x (資料庫)
- **Git** (版本控制)

### 檢查安裝版本

```bash
node --version    # 應顯示 v18.x 或更高
pnpm --version    # 應顯示 8.x 或更高
psql --version    # 應顯示 PostgreSQL 14.x 或更高
```

---

## 🚀 初始化步驟

### 步驟 1: 克隆專案 (如果尚未克隆)

```bash
git clone <repository-url>
cd 9Jang
```

### 步驟 2: 安裝依賴套件

```bash
# 在專案根目錄執行 (會安裝 workspace 內所有套件)
pnpm install
```

這會安裝以下套件:
- `backend/` - NestJS 後端依賴
- `frontend/` - Vue 3 前端依賴
- `shared/` - 共享的 Schema 和類型定義

### 步驟 3: 設定環境變數

#### 3.1 後端環境變數

複製範本並編輯:

```bash
cd backend
cp .env.example .env
```

編輯 `.env` 檔案,設定以下重要變數:

```env
# 資料庫連線 (PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/9jang_db?schema=public"

# JWT 密鑰 (請使用強密碼,可用 openssl rand -base64 32 生成)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# JWT Token 有效期限
JWT_ACCESS_TOKEN_LIFETIME_HOURS="1h"
JWT_REFRESH_TOKEN_LIFETIME_DAYS="7d"

# 應用程式設定
PORT=3000
NODE_ENV=development

# Super Admin 初始帳號 (用於首次初始化)
SUPERADMIN_USERNAME=admin
SUPERADMIN_PASSWORD=ChangeMe123!
SUPERADMIN_EMAIL=admin@example.com
```

#### 3.2 前端環境變數 (可選)

```bash
cd ../frontend
cp .env.example .env
```

編輯 `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

### 步驟 4: 設定 PostgreSQL 資料庫

#### 方案 A: 使用 Docker (推薦)

如果專案有提供 `docker-compose.yml`:

```bash
cd ..  # 回到專案根目錄
docker-compose up -d postgres
```

#### 方案 B: 手動建立資料庫

```bash
# 登入 PostgreSQL
psql -U postgres

# 建立資料庫
CREATE DATABASE 9jang_db;

# 建立使用者 (可選)
CREATE USER 9jang_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE 9jang_db TO 9jang_user;

# 離開
\q
```

### 步驟 5: 執行 Prisma 資料庫遷移

```bash
cd backend

# 生成 Prisma Client
pnpm run prisma:generate

# 執行資料庫遷移 (建立所有資料表)
pnpm run prisma:migrate:dev

# 或者,如果是生產環境
pnpm run prisma:migrate:deploy
```

執行後會建立所有必要的資料表,包括:
- `AccountCustomUser` - 使用者帳號
- `AccountRole` - 角色定義
- `AccountRolePermission` - 角色權限
- `CramschoolStudent` - 學生資料
- `CramschoolTeacher` - 教師資料
- `CramschoolCourse` - 課程資料
- 以及其他相關表格...

### 步驟 6: 匯入初始資料 (使用 CSV Seeder)

```bash
# 確保在 backend 目錄下

# 匯入所有初始資料 (包含角色、權限、範例學生、教師等)
pnpm run seed:csv
```

此步驟會按照依賴關係順序匯入以下資料:
1. `AccountRole` - 系統角色 (SUPERADMIN, TEACHER_FULL, STAFF_ADMIN 等)
2. `AccountRolePermission` - 角色對應的 API 權限
3. `Subject` - 科目資料
4. `Teacher` - 教師資料
5. `Course` - 課程資料
6. `Student` - 學生資料
7. 其他相關資料...

> 💡 **提示**: 如果需要重新匯入,可以先執行 `pnpm run flush:db` 清空資料庫

### 步驟 7: 初始化超級管理員帳號

```bash
# 使用環境變數中設定的帳密建立 Super Admin
pnpm run init:superadmin
```

執行後會顯示:

```
✅ 超級管理員已建立!

╔════════════════════════════════════════════╗
║       請務必記住以下登入資訊                 ║
╠════════════════════════════════════════════╣
║ 使用者名稱: admin                           ║
║ 密碼: ChangeMe123!                         ║
║ Email: admin@example.com                   ║
╚════════════════════════════════════════════╝

🔒 請在首次登入後立即修改密碼!
```

> ⚠️ **安全提醒**: 首次登入後務必立即修改密碼!

### 步驟 8: 啟動開發伺服器

#### 方案 A: 分別啟動前後端

**終端機 1 - 啟動後端**:
```bash
cd backend
pnpm run start:dev
```

後端會在 `http://localhost:3000` 啟動

**終端機 2 - 啟動前端**:
```bash
cd frontend
pnpm run dev
```

前端會在 `http://localhost:5173` 啟動

#### 方案 B: 使用 Monorepo 根目錄啟動 (如果有設定)

```bash
# 在專案根目錄
pnpm run dev
```

### 步驟 9: 驗證安裝

#### 9.1 測試後端 API

```bash
# 測試資料庫連線
curl http://localhost:3000/health

# 測試登入
curl -X POST http://localhost:3000/account/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin",
    "password": "ChangeMe123!"
  }'
```

如果成功,會返回 JWT token 和使用者資訊。

#### 9.2 開啟 Prisma Studio (可視化資料庫管理)

```bash
cd backend
pnpm run prisma:studio
```

會在 `http://localhost:5555` 開啟 Prisma Studio,可以查看和編輯資料庫內容。

#### 9.3 存取前端應用

在瀏覽器開啟 `http://localhost:5173`

使用以下帳號登入:
- **帳號**: `admin`
- **密碼**: `ChangeMe123!`

---

## 📚 進階設定

### 查看所有可用的 NPM Scripts

#### 後端 (backend/package.json)

```bash
# 開發模式
pnpm run start:dev        # 啟動開發伺服器 (熱重載)
pnpm run start:debug      # 啟動除錯模式

# 資料庫相關
pnpm run prisma:generate  # 生成 Prisma Client
pnpm run prisma:migrate:dev    # 執行遷移 (開發環境)
pnpm run prisma:migrate:deploy # 執行遷移 (生產環境)
pnpm run prisma:studio    # 開啟 Prisma Studio
pnpm run prisma:db:push   # 直接同步 schema 到資料庫 (不建立遷移)

# CSV Seeder
pnpm run seed:csv         # 匯入 CSV 資料
pnpm run seed:csv:templates # 生成 CSV 模板
pnpm run flush:db         # 清空資料庫

# RBAC 系統
pnpm run init:superadmin  # 初始化超級管理員

# 測試
pnpm run test             # 執行單元測試
pnpm run test:e2e         # 執行 E2E 測試

# 建置
pnpm run build            # 建置生產版本
pnpm run start:prod       # 啟動生產伺服器
```

#### 前端 (frontend/package.json)

```bash
pnpm run dev              # 啟動開發伺服器
pnpm run build            # 建置生產版本
pnpm run preview          # 預覽生產建置
pnpm run lint             # 執行 ESLint 檢查
```

### 自訂 CSV 初始資料

如果需要匯入自己的資料:

1. **查看 CSV 模板格式**:
   ```bash
   cd backend
   pnpm run seed:csv:templates
   # 查看 backend/fixtures/csv/templates/
   ```

2. **編輯 CSV 檔案**:
   ```bash
   # 編輯 backend/fixtures/csv/data/ 目錄下的檔案
   nano fixtures/csv/data/Student.csv
   ```

3. **重新匯入**:
   ```bash
   pnpm run flush:db   # 清空資料庫
   pnpm run seed:csv   # 重新匯入
   ```

### 管理角色和權限

登入後台後,使用以下 API 管理權限:

```bash
# 取得所有角色
GET /account/roles

# 建立新角色
POST /account/roles

# 取得所有 API 資源 (用於配置權限)
GET /account/api-resources/tree

# 為角色設定權限
PUT /account/roles/:id/permissions
```

詳細 API 文件請參考 `http://localhost:3000/api` (Swagger 文件)

---

## 🐛 常見問題排除

### 問題 1: `DATABASE_URL` 連線錯誤

**錯誤訊息**:
```
Error: P1001: Can't reach database server at `localhost:5432`
```

**解決方式**:
1. 確認 PostgreSQL 服務已啟動
2. 檢查 `.env` 中的 `DATABASE_URL` 是否正確
3. 確認防火牆沒有阻擋 5432 port

### 問題 2: Prisma Client 未生成

**錯誤訊息**:
```
Error: Cannot find module '@prisma/client'
```

**解決方式**:
```bash
cd backend
pnpm run prisma:generate
```

### 問題 3: Port 已被佔用

**錯誤訊息**:
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解決方式**:
```bash
# 找出佔用 port 的程序
lsof -ti:3000

# 終止程序
kill -9 $(lsof -ti:3000)

# 或者,修改 .env 中的 PORT
```

### 問題 4: CSV 匯入失敗

**錯誤訊息**:
```
Error: Foreign key constraint failed
```

**解決方式**:
1. 確保按照正確順序匯入 (系統會自動處理)
2. 檢查 CSV 檔案中的外鍵引用格式是否正確
3. 使用 `@ModelName:field:value` 格式引用其他表格

### 問題 5: pnpm 指令找不到

**解決方式**:
```bash
# 全域安裝 pnpm
npm install -g pnpm

# 或使用 npx
npx pnpm install
```

---

## 🔄 重置專案 (重新開始)

如果需要完全重置專案到初始狀態:

```bash
# 1. 停止所有服務
# Ctrl+C 終止所有執行中的 terminal

# 2. 清空資料庫
cd backend
pnpm run flush:db

# 3. 刪除 node_modules (可選)
cd ..
rm -rf node_modules
rm -rf backend/node_modules
rm -rf frontend/node_modules
rm -rf shared/node_modules

# 4. 重新安裝
pnpm install

# 5. 重新執行初始化步驟 (從步驟 5 開始)
cd backend
pnpm run prisma:migrate:dev
pnpm run seed:csv
pnpm run init:superadmin
```

---

## 📖 相關文件

- [CSV Seeder 完整指南](./CSV_SEEDER_COMPLETE.md)
- [RBAC 權限系統實作](./RBAC_IMPLEMENTATION_COMPLETE.md)
- [專案架構說明](./README.md)
- [API 文件](http://localhost:3000/api) (需先啟動後端)

---

## 🎯 完成檢查清單

在開始開發前,請確認:

- [ ] PostgreSQL 資料庫已建立並可連線
- [ ] 後端 `.env` 檔案已設定完成
- [ ] 執行 `pnpm install` 成功
- [ ] 執行 `prisma:migrate:dev` 成功
- [ ] 執行 `seed:csv` 成功匯入資料
- [ ] 執行 `init:superadmin` 成功建立管理員
- [ ] 後端可以啟動並回應 API 請求
- [ ] 前端可以啟動並顯示登入頁面
- [ ] 可以使用 admin 帳號成功登入
- [ ] Prisma Studio 可以正常開啟並查看資料

---

## 💡 下一步

完成初始化後,您可以:

1. **瀏覽資料**: 使用 Prisma Studio (`pnpm run prisma:studio`)
2. **查看 API 文件**: 訪問 Swagger UI (`http://localhost:3000/api`)
3. **管理權限**: 使用角色管理 API 配置不同角色的權限
4. **開始開發**: 參考專案架構文件開始開發新功能

---

## 🆘 需要幫助?

如果遇到問題:

1. 檢查 [常見問題排除](#-常見問題排除) 章節
2. 查看終端機的錯誤訊息
3. 參考相關文件
4. 聯繫專案維護者

祝您開發順利! 🚀
