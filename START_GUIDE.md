# 啟動指南

## 📋 前置需求

- Python 3.x
- Node.js 和 **pnpm**（>= 8.0.0）
- 虛擬環境（Python）

## 🚀 快速啟動步驟

> **注意**：這是一個 **pnpm monorepo** 項目，建議從根目錄執行命令。

### 1. 啟動後端（Django）

#### 1.1 進入後端目錄並激活虛擬環境

```bash
# Windows
cd backend
.\venv\Scripts\activate

# Linux/Mac
cd backend
source venv/bin/activate
```

#### 1.2 安裝依賴（如果還沒安裝）

```bash
pip install -r requirements.txt
```

#### 1.3 運行數據庫遷移

```bash
python manage.py migrate
```

#### 1.4 創建管理員帳號（首次啟動）

```bash
python manage.py create_admin
```

這會創建一個預設管理員帳號：
- **Email**: `sunroad0418@gmail.com`
- **Password**: `mph586uut`
- **角色**: ADMIN

#### 1.5 啟動 Django 開發服務器

```bash
python manage.py runserver
```

後端將在 **http://localhost:8000** 運行

### 2. 啟動前端（Vue 3）

#### 2.1 安裝依賴（在項目根目錄）

```bash
# 在項目根目錄執行（會安裝所有包的依賴）
pnpm install
```

#### 2.2 構建共享包（首次啟動或共享包有更新時）

```bash
# 構建 packages/shared（包含類型定義和 Zod schemas）
pnpm build:shared
```

#### 2.3 啟動前端開發服務器

**方式一：從根目錄使用 monorepo 命令（推薦）**

```bash
# 在項目根目錄
pnpm dev
```

**方式二：從前端目錄啟動**

```bash
cd frontend
pnpm dev
```

前端將在 **http://localhost:5173** 運行

前端將在 **http://localhost:5173** 運行

## 🌐 訪問應用

1. 打開瀏覽器訪問：**http://localhost:5173**
2. 系統會自動跳轉到登入頁面（如果未登入）
3. 使用管理員帳號登入：
   - Email: `sunroad0418@gmail.com`
   - Password: `mph586uut`

## 📝 注意事項

### 環境變數配置

如果遇到 API 連接問題，請檢查：

1. **前端環境變數** (`frontend/.env`)：
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   VITE_BACKEND_URL=http://localhost:8000
   ```

2. **後端 CORS 設置** (`backend/config/settings.py`)：
   - 確保允許前端來源：`http://localhost:5173`

### 常見問題

#### 後端無法啟動
- 檢查虛擬環境是否已激活
- 確認所有依賴已安裝：`pip install -r requirements.txt`
- 檢查數據庫遷移是否完成：`python manage.py migrate`

#### 前端無法連接後端
- 確認後端服務器正在運行（http://localhost:8000）
- 檢查 `frontend/.env` 中的 API URL 配置
- 檢查瀏覽器控制台是否有 CORS 錯誤

#### 無法登入
- 確認已創建管理員帳號：`python manage.py create_admin`
- 檢查後端日誌是否有錯誤訊息
- 清除瀏覽器 cookies 後重試

## 🔧 開發命令

### 後端命令

```bash
# 運行開發服務器
python manage.py runserver

# 創建數據庫遷移
python manage.py makemigrations

# 應用數據庫遷移
python manage.py migrate

# 創建管理員帳號
python manage.py create_admin

# Django shell
python manage.py shell
```

### 前端命令

```bash
# 開發模式（在 frontend 目錄）
pnpm dev

# 或從根目錄使用 monorepo 命令
pnpm dev

# 類型檢查
pnpm type-check

# 建置生產版本
pnpm build

# 建置共享包（packages/shared）
pnpm build:shared

# 建置前端
pnpm build:frontend

# 預覽生產版本
pnpm preview

# 運行測試
pnpm test
```

## 📚 相關文檔

- `LOGIN_SETUP.md` - 登入系統詳細設置
- `ENV_SETUP.md` - 環境變數配置說明
- `frontend/README.md` - 前端開發文檔
- `API_DOCUMENTATION.md` - API 文檔

