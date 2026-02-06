# 📡 區域網路部署 - 文件索引

本專案已配置完成，可在區域網路中部署，讓連接到補習班 WiFi 的學生訪問。

## 📚 文件清單

### 🚀 快速開始
- **[QUICK_START_LAN.md](./QUICK_START_LAN.md)** - 快速部署指南 (推薦先看這個!)
  - 簡潔的步驟說明
  - 常見問題快速解答
  - 檢查清單

### 📖 完整指南
- **[LAN_DEPLOYMENT_GUIDE.md](./LAN_DEPLOYMENT_GUIDE.md)** - 完整部署文檔
  - 詳細的配置說明
  - 進階故障排除
  - 手動配置方法
  - 安全性建議

## 🛠️ 工具腳本

### Windows PowerShell 腳本 (需要系統管理員權限)

| 腳本 | 用途 | 使用時機 |
|------|------|----------|
| `wsl-port-forward.ps1` | 設定端口轉發和防火牆 | 每次 WSL 重啟後 |
| `wsl-port-forward-remove.ps1` | 清除端口轉發規則 | 下課後 (可選) |

### WSL Bash 腳本

| 腳本 | 用途 | 使用時機 |
|------|------|----------|
| `start-lan-server.sh` | 快速啟動應用程式 | 每次上課前 |
| `check-network.sh` | 檢查網路配置 | 故障排除時 |

## 🎯 使用流程

### 第一次設定 (只需做一次)

1. **閱讀文檔:**
   ```bash
   # 快速了解
   cat QUICK_START_LAN.md
   
   # 詳細了解
   cat LAN_DEPLOYMENT_GUIDE.md
   ```

2. **配置代碼:** (已完成 ✅)
   - ✅ Backend 已設定監聽 `0.0.0.0`
   - ✅ Frontend 已設定監聽 `0.0.0.0`
   - ✅ CORS 已配置為開發環境允許所有來源

3. **設定 Windows 端口轉發:**
   ```powershell
   # 在 Windows PowerShell (系統管理員) 中
   .\wsl-port-forward.ps1
   ```

### 每次上課前

1. **啟動端口轉發** (如果 WSL 重啟過):
   ```powershell
   # Windows PowerShell (系統管理員)
   .\wsl-port-forward.ps1
   ```

2. **啟動應用程式:**
   ```bash
   # WSL
   ./start-lan-server.sh
   ```

3. **驗證並告訴學生網址:**
   ```bash
   # WSL
   ./check-network.sh
   ```

### 每次下課後

1. **停止應用程式:**
   - 在 WSL 終端機按 `Ctrl+C`

2. **清除端口轉發** (可選):
   ```powershell
   # Windows PowerShell (系統管理員)
   .\wsl-port-forward-remove.ps1
   ```

## 🔍 故障排除

### 快速檢查

```bash
# WSL 中執行
./check-network.sh
```

### 常見問題

| 問題 | 解決方案 | 文檔位置 |
|------|----------|----------|
| 學生無法連接 | 檢查 WiFi、重新執行轉發腳本 | QUICK_START_LAN.md |
| WSL IP 改變 | 重新執行 `wsl-port-forward.ps1` | QUICK_START_LAN.md |
| 端口被佔用 | 使用 `netstat` 查找並終止程式 | LAN_DEPLOYMENT_GUIDE.md |
| CORS 錯誤 | 檢查 NODE_ENV 環境變數 | LAN_DEPLOYMENT_GUIDE.md |

## 📊 架構說明

```
學生設備 (192.168.1.x)
    ↓
WiFi 網路
    ↓
Windows 主機 (192.168.1.100)
    ↓ (端口轉發: 3000, 5173)
WSL (172.x.x.x)
    ↓
Backend (NestJS) :3000
Frontend (Vite) :5173
```

## 🔐 安全性注意事項

1. **僅在受信任的網路使用** - 補習班內部 WiFi
2. **使用完畢後清除規則** - 執行 `wsl-port-forward-remove.ps1`
3. **不要在公共網路開放** - 避免安全風險
4. **確保學生使用正確帳號** - 應用程式有登入驗證

## 📝 技術細節

### 已修改的檔案

1. **backend/src/main.ts**
   - 修改為監聽 `0.0.0.0` (所有網路介面)
   - CORS 設定為開發環境允許所有來源

2. **frontend/vite.config.ts**
   - 修改為監聽 `0.0.0.0` (所有網路介面)
   - 保持 API 代理配置

### 端口使用

| 服務 | 端口 | 用途 |
|------|------|------|
| Backend | 3000 | NestJS API 服務 |
| Frontend | 5173 | Vite 開發伺服器 |
| Database | 5432 | PostgreSQL (僅內部) |

### 環境變數

可以透過環境變數自訂:

```bash
# Backend
PORT=3000
HOST=0.0.0.0
NODE_ENV=development

# Frontend
VITE_FRONTEND_PORT=5173
VITE_FRONTEND_HOST=0.0.0.0
VITE_BACKEND_URL=http://localhost:3000
```

## 🎓 教學建議

### 上課前準備

1. 提前 10 分鐘啟動服務
2. 用自己的手機測試連接
3. 在白板上寫下訪問網址
4. 準備好故障排除腳本

### 課堂中

1. 讓學生先連接 WiFi
2. 提供訪問網址
3. 協助無法連接的學生
4. 監控服務運行狀態

### 下課後

1. 停止服務
2. 檢查是否有錯誤日誌
3. 清除端口轉發 (可選)

## 📞 獲取幫助

如果遇到問題:

1. **查看快速指南:** `QUICK_START_LAN.md`
2. **查看完整文檔:** `LAN_DEPLOYMENT_GUIDE.md`
3. **執行檢查腳本:** `./check-network.sh`
4. **檢查應用程式日誌:** 終端機輸出

## 🔄 更新日誌

### 2026-02-06
- ✅ 配置 Backend 監聽所有網路介面
- ✅ 配置 Frontend 監聽所有網路介面
- ✅ 創建 Windows 端口轉發腳本
- ✅ 創建 WSL 快速啟動腳本
- ✅ 創建網路檢查腳本
- ✅ 撰寫完整部署文檔

---

**準備好了！現在您可以在區域網路中部署應用程式了！** 🎉

從 `QUICK_START_LAN.md` 開始吧！
