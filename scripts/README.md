# 腳本管理目錄

此目錄包含所有專案使用的 Shell 腳本，已依功能分類整理。

## 📁 目錄結構

```
scripts/
├── deployment/     # 部署相關腳本
├── development/    # 開發環境腳本
├── network/        # 網路配置腳本
└── utils/          # 工具類腳本
```

## 📂 分類說明

### 🚀 deployment/
部署和容器化相關腳本

- **docker-start.sh** - Docker 快速啟動腳本，自動檢查環境並啟動 Docker Compose

### 💻 development/
本地開發環境啟動腳本

- **start-backend.sh** - 啟動 Backend (NestJS) 服務
- **start-frontend.sh** - 啟動 Frontend (Vite + Vue) 服務

### 🌐 network/
網路配置和切換腳本

- **check-network.sh** - 檢查網路配置和服務狀態
- **switch-to-lan.sh** - 切換到區域網路模式（讓其他設備訪問）
- **switch-to-localhost.sh** - 切換回本機模式
- **start-lan-server.sh** - 區域網路部署快速啟動

### 🛠️ utils/
工具和輔助腳本

- **verify-scripts.sh** - 驗證所有 Shell 腳本的行結束符和語法
- **update-controllers.sh** - 批次更新 Controller 檔案（加入權限守衛）

## 🎯 快速使用

### 開發模式啟動

```bash
# 方法 1: 使用兩個終端機 (推薦)
# 終端機 1
./scripts/development/start-backend.sh

# 終端機 2
./scripts/development/start-frontend.sh
```

### Docker 啟動

```bash
./scripts/deployment/docker-start.sh
```

### 網路配置切換

```bash
# 切換到區域網路模式（學生可訪問）
./scripts/network/switch-to-lan.sh

# 切換回本機模式
./scripts/network/switch-to-localhost.sh

# 檢查當前網路狀態
./scripts/network/check-network.sh
```

### 腳本驗證

```bash
./scripts/utils/verify-scripts.sh
```

## 📝 注意事項

1. **執行權限**：所有腳本已設置執行權限 (`chmod +x`)
2. **工作目錄**：大多數腳本需要在專案根目錄執行
3. **依賴檢查**：腳本會自動檢查必要的依賴（如 pnpm、Docker）
4. **WSL 環境**：網路相關腳本針對 WSL 環境優化

## 🔧 維護指南

### 添加新腳本

1. 根據功能放入對應分類目錄
2. 設置執行權限：`chmod +x 腳本名稱.sh`
3. 更新此 README 文件
4. 使用 `./scripts/utils/verify-scripts.sh` 驗證腳本

### 腳本規範

- 使用 `#!/bin/bash` 作為 shebang
- 添加簡潔的功能說明註解
- 使用顏色輸出增強可讀性
- 包含錯誤檢查和友好的錯誤訊息
- 使用 LF 行結束符（而非 CRLF）

## 📚 相關文檔

- [Docker 使用指南](../DOCKER_QUICK_START.md)
- [配置說明](../CONFIG_FINAL_REPORT.md)
- [專案根目錄 README](../README.md)
