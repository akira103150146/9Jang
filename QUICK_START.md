# 快速啟動指南（pnpm Monorepo）

## 🚀 一鍵啟動

### 1. 安裝所有依賴

```bash
# 在項目根目錄
pnpm install
```

### 2. 構建共享包（首次啟動）

```bash
pnpm build:shared
```

### 3. 啟動後端

```bash
# 終端 1：啟動 Django 後端
cd backend
.\venv\Scripts\activate  # Windows
python manage.py migrate
python manage.py create_admin  # 首次啟動
python manage.py runserver
```

### 4. 啟動前端

```bash
# 終端 2：啟動 Vue 前端（在項目根目錄）
pnpm dev
```

## 📝 完整步驟

### 後端設置

```bash
# 1. 進入後端目錄
cd backend

# 2. 激活虛擬環境（Windows）
.\venv\Scripts\activate

# 3. 安裝 Python 依賴（如果還沒安裝）
pip install -r requirements.txt

# 4. 運行數據庫遷移
python manage.py migrate

# 5. 創建管理員帳號（首次啟動）
python manage.py create_admin

# 6. 啟動服務器
python manage.py runserver
```

### 前端設置

```bash
# 1. 在項目根目錄安裝所有依賴
pnpm install

# 2. 構建共享包（packages/shared）
pnpm build:shared

# 3. 啟動前端開發服務器
pnpm dev
```

## 🌐 訪問

- **前端**: http://localhost:5173
- **後端 API**: http://localhost:8000/api
- **登入帳號**: 
  - Email: `sunroad0418@gmail.com`
  - Password: `mph586uut`

## 🔧 常用命令

### Monorepo 命令（根目錄）

```bash
# 安裝所有依賴
pnpm install

# 構建共享包
pnpm build:shared

# 啟動前端開發服務器
pnpm dev

# 構建前端
pnpm build:frontend

# 類型檢查（所有包）
pnpm type-check

# 構建所有包
pnpm build
```

### 前端命令（frontend 目錄）

```bash
cd frontend

# 開發模式
pnpm dev

# 類型檢查
pnpm type-check

# 構建
pnpm build

# 測試
pnpm test
```

### 共享包命令（packages/shared 目錄）

```bash
cd packages/shared

# 構建
pnpm build

# 監視模式構建
pnpm dev
```

## ⚠️ 注意事項

1. **首次啟動必須構建共享包**：`pnpm build:shared`
2. **共享包更新後需要重新構建**：如果修改了 `packages/shared` 中的類型定義
3. **使用 pnpm，不要使用 npm**：項目配置為使用 pnpm
4. **確保 Node.js >= 18.0.0 和 pnpm >= 8.0.0**

