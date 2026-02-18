# 📚 九章補習班管理系統 - 文檔目錄

歡迎使用九章補習班管理系統！此文檔將幫助您快速上手。

## 🚀 快速開始

### 新手入門
- **[START_HERE.md](./START_HERE.md)** - 區域網路部署快速指南（推薦從這裡開始）

### 部署方式

#### 方式 1: 本地開發（推薦）
使用腳本快速啟動開發環境：

```bash
# 終端機 1
./scripts/development/start-backend.sh

# 終端機 2
./scripts/development/start-frontend.sh
```

#### 方式 2: Docker 部署
使用 Docker 容器化部署：

```bash
./scripts/deployment/docker-start.sh
```

詳細說明請參考：
- **[DOCKER_QUICK_START.md](./DOCKER_QUICK_START.md)** - Docker 快速啟動
- **[DOCKER_GUIDE.md](./DOCKER_GUIDE.md)** - Docker 完整指南

## 📖 使用指南

### 環境配置
- **[ENV_CONFIGURATION_GUIDE.md](./ENV_CONFIGURATION_GUIDE.md)** - 環境變數配置說明

### 區域網路部署
- **[LAN_DEPLOYMENT_GUIDE.md](./LAN_DEPLOYMENT_GUIDE.md)** - WSL 區域網路部署完整指南
- **[START_HERE.md](./START_HERE.md)** - 區域網路部署快速步驟

### 腳本使用
- **[scripts/README.md](./scripts/README.md)** - 所有腳本的使用說明

### 功能說明
- **[PDF_FEATURE_README.md](./PDF_FEATURE_README.md)** - PDF 功能使用指南
- **[PDF_TESTING_GUIDE.md](./PDF_TESTING_GUIDE.md)** - PDF 測試指南
- **[FRONTEND_PDF_GUIDE.md](./FRONTEND_PDF_GUIDE.md)** - 前端 PDF 功能

### 開發指南
- **[BACKEND_STRICT_QUICK_GUIDE.md](./BACKEND_STRICT_QUICK_GUIDE.md)** - Backend TypeScript 嚴格模式快速指南

## 📂 專案結構

```
9Jang/
├── backend/              # NestJS 後端
├── frontend/             # Vue 3 前端
├── scripts/              # 部署和開發腳本
│   ├── deployment/       # 部署腳本（Docker）
│   ├── development/      # 開發環境腳本
│   ├── network/          # 網路配置腳本
│   └── utils/            # 工具腳本
├── .env                  # 環境變數配置
└── 文檔文件（本層級）
```

## 🎯 常見任務

### 本地開發
```bash
# 啟動後端
./scripts/development/start-backend.sh

# 啟動前端
./scripts/development/start-frontend.sh

# 檢查網路狀態
./scripts/network/check-network.sh
```

### 區域網路部署（讓學生訪問）
```bash
# 1. 切換到區域網路模式
./scripts/network/switch-to-lan.sh

# 2. 在 Windows PowerShell (系統管理員) 執行
.\wsl-port-forward.ps1

# 3. 啟動服務（使用上面的本地開發命令）
```

### Docker 部署
```bash
# 快速啟動
./scripts/deployment/docker-start.sh

# 或手動啟動
docker-compose up -d

# 查看日誌
docker-compose logs -f

# 停止服務
docker-compose down
```

## 🔧 常用連結

### 本機訪問
- 前端：http://localhost:5173
- 後端 API：http://localhost:3000/api
- Swagger 文檔：http://localhost:3000/api/docs

### 區域網路訪問（學生）
- 前端：http://[您的IP]:5173
- 後端 API：http://[您的IP]:3000/api

## 🆘 遇到問題？

### 常見問題

#### 1. 腳本無法執行
```bash
# 修復行結束符
./scripts/utils/verify-scripts.sh

# 或手動修復
find scripts -name "*.sh" -exec sed -i 's/\r$//' {} \;
chmod +x scripts/**/*.sh
```

#### 2. 學生無法連接
- 確認學生和您的電腦在同一個 WiFi
- 在 Windows 重新執行 `wsl-port-forward.ps1`
- 檢查防火牆設置

#### 3. 端口被占用
```bash
# 檢查端口使用情況
./scripts/network/check-network.sh

# 或修改 .env 中的端口配置
```

#### 4. Docker 相關問題
請參考 [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) 的常見問題章節

## 💡 推薦閱讀順序

1. **[START_HERE.md](./START_HERE.md)** - 快速開始
2. **[scripts/README.md](./scripts/README.md)** - 腳本說明
3. **[ENV_CONFIGURATION_GUIDE.md](./ENV_CONFIGURATION_GUIDE.md)** - 環境配置
4. **[LAN_DEPLOYMENT_GUIDE.md](./LAN_DEPLOYMENT_GUIDE.md)** - 詳細部署說明
5. **[DOCKER_GUIDE.md](./DOCKER_GUIDE.md)** - Docker 使用（可選）

## 📞 技術支援

如需更多幫助，請查看對應的詳細文檔，或檢查專案的 GitHub Issues。

---

**立即開始**：執行 `./scripts/development/start-backend.sh` 和 `./scripts/development/start-frontend.sh` 🚀
