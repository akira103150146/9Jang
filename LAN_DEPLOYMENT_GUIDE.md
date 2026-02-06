# 區域網路部署指南 (WSL)

本指南說明如何在 WSL 環境中部署應用程式，讓連接到補習班 WiFi 的學生可以訪問。

## 📋 前置準備

1. **確認您的 Windows IP 地址**
   - 在 Windows PowerShell 或命令提示字元中執行: `ipconfig`
   - 找到 WiFi 適配器的 IPv4 地址 (例如: `192.168.1.100`)

2. **確認防火牆已關閉或正確配置**
   - Windows Defender 防火牆需要允許端口 3000 和 5173

## 🚀 部署步驟

### 步驟 1: 配置 WSL 端口轉發

**在 Windows PowerShell (以系統管理員身分執行) 中:**

```powershell
cd C:\path\to\9Jang  # 切換到專案目錄
.\wsl-port-forward.ps1
```

這個腳本會:
- 自動偵測 WSL 和 Windows 的 IP 地址
- 設定端口 3000 (Backend) 和 5173 (Frontend) 的轉發
- 配置 Windows 防火牆規則
- 顯示學生可以使用的訪問網址

### 步驟 2: 啟動應用程式

**在 WSL 終端機中:**

```bash
# 啟動 Backend (在一個終端機)
pnpm run dev:backend

# 啟動 Frontend (在另一個終端機)
pnpm run dev
```

### 步驟 3: 驗證部署

1. **在您的 Windows 電腦上測試:**
   - 前端: `http://localhost:5173`
   - 後端 API: `http://localhost:3000/api`
   - Swagger 文檔: `http://localhost:3000/api/docs`

2. **在其他設備上測試:**
   - 前端: `http://192.168.1.100:5173` (替換成您的 IP)
   - 後端 API: `http://192.168.1.100:3000/api`
   - Swagger 文檔: `http://192.168.1.100:3000/api/docs`

## 📱 學生訪問方式

告訴學生使用以下網址 (替換成您的實際 IP 地址):

```
http://192.168.1.100:5173
```

## 🔧 常見問題排除

### 問題 1: 學生無法連接

**解決方案:**
1. 確認學生和您的電腦連接到同一個 WiFi 網路
2. 檢查 Windows 防火牆是否阻擋連接
3. 重新執行 `wsl-port-forward.ps1` 腳本
4. 確認應用程式正在運行

### 問題 2: WSL IP 地址改變

每次重啟 WSL 後，IP 地址可能會改變。需要重新執行端口轉發腳本:

```powershell
.\wsl-port-forward.ps1
```

### 問題 3: 端口被佔用

如果端口 3000 或 5173 被其他程式佔用:

**在 Windows PowerShell (系統管理員) 中查找佔用端口的程式:**
```powershell
netstat -ano | findstr :3000
netstat -ano | findstr :5173
```

**終止佔用端口的程式:**
```powershell
taskkill /PID <PID號碼> /F
```

### 問題 4: CORS 錯誤

Backend 已配置為開發環境下允許所有來源。如果仍有 CORS 問題:

1. 檢查 `backend/src/main.ts` 中的 CORS 設定
2. 確認 `NODE_ENV` 環境變數未設為 `production`

## 🛑 停止部署

### 方法 1: 保留端口轉發，只停止應用程式

在 WSL 終端機中按 `Ctrl+C` 停止 Backend 和 Frontend

### 方法 2: 完全清除端口轉發規則

**在 Windows PowerShell (系統管理員) 中:**

```powershell
.\wsl-port-forward-remove.ps1
```

## 📝 手動配置 (進階)

如果自動腳本無法運作，可以手動設定:

### 手動設定端口轉發

**1. 獲取 WSL IP:**
```bash
# 在 WSL 中執行
hostname -I
```

**2. 在 Windows PowerShell (系統管理員) 中設定轉發:**
```powershell
# 替換 <WSL_IP> 為實際的 WSL IP 地址
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=<WSL_IP>
netsh interface portproxy add v4tov4 listenport=5173 listenaddress=0.0.0.0 connectport=5173 connectaddress=<WSL_IP>
```

### 手動配置防火牆

**在 Windows PowerShell (系統管理員) 中:**
```powershell
New-NetFirewallRule -DisplayName "WSL-9Jang-Port-3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "WSL-9Jang-Port-5173" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
```

### 查看目前的端口轉發規則

```powershell
netsh interface portproxy show all
```

### 刪除特定端口轉發

```powershell
netsh interface portproxy delete v4tov4 listenport=3000 listenaddress=0.0.0.0
netsh interface portproxy delete v4tov4 listenport=5173 listenaddress=0.0.0.0
```

## 🔐 安全性建議

1. **僅在受信任的網路中使用** - 補習班內部 WiFi
2. **使用完畢後清除端口轉發規則** - 執行 `wsl-port-forward-remove.ps1`
3. **不要在公共網路中開放這些端口**
4. **考慮添加身份驗證** - 應用程式已有登入功能，確保學生使用正確的帳號

## 📊 效能優化建議

1. **使用有線網路** - 如果可能，將您的電腦連接到有線網路以獲得更穩定的連接
2. **關閉不必要的應用程式** - 釋放系統資源
3. **監控資源使用** - 使用 `htop` (WSL) 和工作管理員 (Windows) 監控

## 🆘 緊急處理

如果遇到無法解決的問題:

1. **重啟 WSL:**
   ```powershell
   # 在 Windows PowerShell 中
   wsl --shutdown
   ```

2. **重新執行設定:**
   - 重新執行 `wsl-port-forward.ps1`
   - 重新啟動應用程式

3. **檢查日誌:**
   - Backend 日誌會顯示在執行 `pnpm run dev:backend` 的終端機
   - Frontend 日誌會顯示在執行 `pnpm run dev` 的終端機

## 📞 技術支援

如果需要進一步協助，請檢查:
- Backend 配置: `backend/src/main.ts`
- Frontend 配置: `frontend/vite.config.ts`
- 環境變數: `backend/.env` 和 `frontend/.env`
