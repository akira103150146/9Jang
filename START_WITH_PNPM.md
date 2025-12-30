# 使用 pnpm 啟動項目

## ⚠️ 重要提示

**建議升級 Node.js 到 >= 18.0.0** 以獲得最佳體驗。

當前 Node.js 版本：v14.17.5（已安裝 pnpm 7.33.7 以兼容）

## 🚀 啟動步驟

### 1. 安裝所有依賴

```powershell
# 在項目根目錄
pnpm install
```

### 2. 構建共享包（首次啟動）

```powershell
pnpm build:shared
```

### 3. 啟動後端（終端 1）

```powershell
cd backend
.\venv\Scripts\activate
python manage.py migrate
python manage.py create_admin  # 首次啟動
python manage.py runserver
```

### 4. 啟動前端（終端 2，在項目根目錄）

```powershell
pnpm dev
```

## 📝 完整命令序列

### PowerShell 終端 1（後端）

```powershell
cd backend
.\venv\Scripts\activate
python manage.py migrate
python manage.py create_admin
python manage.py runserver
```

### PowerShell 終端 2（前端）

```powershell
# 確保在項目根目錄
pnpm install
pnpm build:shared
pnpm dev
```

## 🌐 訪問

- **前端**: http://localhost:5173
- **後端 API**: http://localhost:8000/api
- **登入帳號**: 
  - Email: `sunroad0418@gmail.com`
  - Password: `mph586uut`

## 🔧 升級 Node.js（推薦）

### 使用 nvm-windows（推薦）

1. 下載並安裝 [nvm-windows](https://github.com/coreybutler/nvm-windows/releases)
2. 安裝 Node.js 18 或更高版本：
   ```powershell
   nvm install 18
   nvm use 18
   ```
3. 重新安裝 pnpm：
   ```powershell
   npm install -g pnpm
   ```

### 或直接下載安裝

從 [Node.js 官網](https://nodejs.org/) 下載並安裝 Node.js 18 LTS 或更高版本。

## ⚠️ 當前限制

由於 Node.js 版本較舊（14.17.5），已安裝 pnpm 7.33.7 以兼容。建議升級 Node.js 以獲得：
- 更好的性能
- 最新的 pnpm 功能
- 更好的 TypeScript 支持

