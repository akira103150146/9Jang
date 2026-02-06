# 9Jang 補習班管理系統

> 全功能補習班管理系統 - NestJS + Vue 3 + PostgreSQL

---

## 🚀 快速開始

### 本機開發

```bash
# 安裝依賴
pnpm install

# 啟動 Backend (終端機 1)
pnpm run dev:backend

# 啟動 Frontend (終端機 2)
pnpm run dev
```

### 📡 區域網路部署 (補習班使用)

**讓學生透過 WiFi 訪問您的應用程式:**

👉 **[開始使用 - START_HERE.md](./START_HERE.md)** 👈

或查看詳細文檔:
- [快速開始指南](./QUICK_START_LAN.md)
- [腳本使用說明](./SCRIPTS_USAGE.md)
- [完整部署文檔](./LAN_DEPLOYMENT_GUIDE.md)

---

## 📋 功能特色

- ✅ 學生管理
- ✅ 教師管理
- ✅ 課程管理
- ✅ 題庫系統
- ✅ 錯題本
- ✅ 訂正本
- ✅ 出缺席管理
- ✅ 費用管理
- ✅ 訂餐系統
- ✅ PDF 匯入功能
- ✅ 身份驗證與授權

---

## 🛠️ 技術棧

### Backend
- **框架:** NestJS
- **資料庫:** PostgreSQL + Prisma ORM
- **驗證:** JWT + Passport
- **API 文檔:** Swagger
- **驗證:** Zod

### Frontend
- **框架:** Vue 3 + Vite
- **語言:** TypeScript
- **狀態管理:** Pinia
- **樣式:** Tailwind CSS
- **HTTP:** Axios

### 共享
- **類型定義:** TypeScript
- **驗證 Schema:** Zod

---

## 📁 專案結構

```
9Jang/
├── backend/          # NestJS 後端
├── frontend/         # Vue 3 前端
├── shared/           # 共享類型和 Schema
├── *.sh              # WSL/Linux 腳本
├── *.ps1             # Windows PowerShell 腳本
└── *.md              # 文檔
```

---

## 🔧 開發指令

```bash
# 開發
pnpm run dev              # 啟動 Frontend
pnpm run dev:backend      # 啟動 Backend

# 建置
pnpm run build            # 建置所有專案
pnpm run build:frontend   # 建置 Frontend
pnpm run build:backend    # 建置 Backend

# 測試
pnpm run test             # 執行測試
pnpm run test:cov         # 測試覆蓋率

# 資料庫
pnpm --filter @9jang/backend prisma:studio    # Prisma Studio
pnpm --filter @9jang/backend prisma:migrate:dev  # 執行遷移
```

---

## 🌐 區域網路部署腳本

### WSL/Linux 腳本

```bash
./start-backend.sh      # 啟動 Backend
./start-frontend.sh     # 啟動 Frontend
./check-network.sh      # 檢查網路配置
```

### Windows PowerShell 腳本

```powershell
.\wsl-port-forward.ps1         # 設定端口轉發
.\wsl-port-forward-remove.ps1  # 清除端口轉發
```

---

## 📚 文檔

### 部署相關
- **[START_HERE.md](./START_HERE.md)** - 區域網路部署快速開始 ⭐
- **[QUICK_START_LAN.md](./QUICK_START_LAN.md)** - 快速部署指南
- **[SCRIPTS_USAGE.md](./SCRIPTS_USAGE.md)** - 腳本使用說明
- **[LAN_DEPLOYMENT_GUIDE.md](./LAN_DEPLOYMENT_GUIDE.md)** - 完整部署文檔
- **[LAN_DEPLOYMENT_README.md](./LAN_DEPLOYMENT_README.md)** - 文件索引

### 功能相關
- **[FRONTEND_PDF_GUIDE.md](./FRONTEND_PDF_GUIDE.md)** - PDF 功能使用指南
- **[PDF_FEATURE_COMPLETE.md](./PDF_FEATURE_COMPLETE.md)** - PDF 功能完整說明

### Docker 相關
- **[DOCKER_QUICK_START.md](./DOCKER_QUICK_START.md)** - Docker 快速開始
- **[DOCKER_GUIDE.md](./DOCKER_GUIDE.md)** - Docker 完整指南

### 開發相關
- **[ENV_CONFIGURATION_GUIDE.md](./ENV_CONFIGURATION_GUIDE.md)** - 環境變數配置
- **[SWAGGER_SETUP_COMPLETE.md](./SWAGGER_SETUP_COMPLETE.md)** - Swagger 設定

---

## 🔐 環境變數

### Backend (.env)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/9jang"
JWT_SECRET="your-secret-key"
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
```

### Frontend (.env)

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_FRONTEND_PORT=5173
VITE_FRONTEND_HOST=0.0.0.0
```

---

## 🚀 部署

### 本機開發
```bash
pnpm install
pnpm run dev:backend    # 終端機 1
pnpm run dev            # 終端機 2
```

### 區域網路部署 (WSL)
```bash
# 1. Windows PowerShell (系統管理員)
.\wsl-port-forward.ps1

# 2. WSL 終端機
./start-backend.sh      # 終端機 1
./start-frontend.sh     # 終端機 2
```

### Docker 部署
```bash
docker-compose up -d
```

---

## 📞 訪問

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api
- **Swagger 文檔:** http://localhost:3000/api/docs
- **Prisma Studio:** http://localhost:5555

### 區域網路訪問 (學生)
- **Frontend:** http://\<您的IP\>:5173

---

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

---

## 📄 授權

ISC

---

## 🆘 需要幫助？

- 區域網路部署: 查看 [START_HERE.md](./START_HERE.md)
- 腳本問題: 查看 [SCRIPTS_USAGE.md](./SCRIPTS_USAGE.md)
- 功能問題: 查看相關功能文檔
- 其他問題: 提交 Issue

---

**開始使用:** [START_HERE.md](./START_HERE.md) 🚀
