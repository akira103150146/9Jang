# 🚀 區域網路部署快速指南

## 一、Windows 端設定 (只需執行一次)

### 1. 以系統管理員身分開啟 PowerShell

按 `Win + X`，選擇「Windows PowerShell (系統管理員)」

### 2. 執行端口轉發腳本

```powershell
cd C:\Users\<你的使用者名稱>\github\9Jang
.\wsl-port-forward.ps1
```

**這個腳本會:**
- ✅ 自動設定端口轉發 (3000, 5173)
- ✅ 配置防火牆規則
- ✅ 顯示您的 IP 地址和訪問網址

### 3. 記下您的 Windows IP 地址

例如: `192.168.1.100`

---

## 二、WSL 端啟動服務

### 方法 A: 使用啟動腳本 (推薦)

**開啟兩個 WSL 終端機:**

**終端機 1 - Backend:**
```bash
cd ~/github/9Jang
./start-backend.sh
```

**終端機 2 - Frontend:**
```bash
cd ~/github/9Jang
./start-frontend.sh
```

### 方法 B: 手動啟動

**終端機 1 - Backend:**
```bash
cd ~/github/9Jang
pnpm run dev:backend
```

**終端機 2 - Frontend:**
```bash
cd ~/github/9Jang
pnpm run dev
```

### 方法 C: 查看啟動說明

```bash
cd ~/github/9Jang
./start-lan-server.sh
```

---

## 三、驗證部署

### 在您的電腦上測試:
- 前端: http://localhost:5173
- API 文檔: http://localhost:3000/api/docs

### 在學生的設備上測試:
- 前端: http://192.168.1.100:5173 (替換成您的 IP)

---

## 四、告訴學生的訪問網址

```
http://192.168.1.100:5173
```

**替換 `192.168.1.100` 為您的實際 IP 地址**

---

## 🔧 常見問題

### ❌ 學生無法連接?

1. **確認同一 WiFi:** 學生和您的電腦必須連到同一個 WiFi
2. **重新執行轉發:** 在 Windows PowerShell 中重新執行 `.\wsl-port-forward.ps1`
3. **檢查防火牆:** 確認 Windows 防火牆沒有阻擋
4. **確認服務運行:** 在 WSL 中執行 `./check-network.sh`

### ❌ WSL 重啟後無法訪問?

WSL 的 IP 地址可能改變，需要重新執行:

```powershell
# 在 Windows PowerShell (系統管理員) 中
.\wsl-port-forward.ps1
```

### ❌ 端口被佔用?

**查找佔用端口的程式:**
```powershell
# 在 Windows PowerShell 中
netstat -ano | findstr :3000
netstat -ano | findstr :5173
```

**終止程式:**
```powershell
taskkill /PID <PID號碼> /F
```

---

## 🛑 停止服務

### 停止應用程式:
在 WSL 終端機中按 `Ctrl + C`

### 清除端口轉發 (下課後):
```powershell
# 在 Windows PowerShell (系統管理員) 中
.\wsl-port-forward-remove.ps1
```

---

## 📋 檢查清單

上課前:
- [ ] 執行 `wsl-port-forward.ps1` (Windows)
- [ ] 啟動 Backend 和 Frontend (WSL)
- [ ] 測試本機訪問 (localhost:5173)
- [ ] 用手機測試區域網路訪問
- [ ] 記下 IP 地址告訴學生

下課後:
- [ ] 停止 Backend 和 Frontend (Ctrl+C)
- [ ] 執行 `wsl-port-forward-remove.ps1` (可選)

---

## 🆘 緊急重置

如果一切都不正常:

### 1. 重啟 WSL
```powershell
# 在 Windows PowerShell 中
wsl --shutdown
```

### 2. 重新開始
- 重新執行 `wsl-port-forward.ps1`
- 重新啟動應用程式

---

## 📞 更多資訊

詳細說明請參考: `LAN_DEPLOYMENT_GUIDE.md`
