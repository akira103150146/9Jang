# 🎯 開始使用 - 區域網路部署

> **目標:** 讓連接到補習班 WiFi 的學生可以訪問您在 WSL 中運行的應用程式

---

## ⚡ 超快速開始 (4 步驟)

### 步驟 1: 切換到區域網路模式

**在 WSL 中執行:**

```bash
cd ~/github/9Jang
./scripts/network/switch-to-lan.sh
```

這會將 Frontend 配置為使用您的 Windows IP (192.168.200.137)

---

### 步驟 2: Windows 端口轉發 (只需做一次)

**在 Windows PowerShell (以系統管理員身分) 中:**

```powershell
cd C:\Users\<你的使用者名稱>\github\9Jang
.\wsl-port-forward.ps1
```

✅ 記下顯示的 IP 地址 (例如: `192.168.1.100`)

---

### 步驟 3: 啟動服務 (需要兩個終端機)

**WSL 終端機 1:**
```bash
cd ~/github/9Jang
./scripts/development/start-backend.sh
```

**WSL 終端機 2:**
```bash
cd ~/github/9Jang
./scripts/development/start-frontend.sh
```

---

### 步驟 4: 告訴學生網址

```
http://192.168.1.100:5173
```

(替換為您的實際 IP 地址)

---

## ✅ 驗證部署

```bash
./scripts/network/check-network.sh
```

應該看到:
- ✅ Backend 正在運行
- ✅ Frontend 正在運行

---

## 🛑 停止服務

在兩個終端機中按 `Ctrl+C`

---

## ❓ 遇到問題？

### 問題 1: `bad interpreter: /bin/bash^M`

**解決:**
```bash
sed -i 's/\r$//' *.sh
chmod +x *.sh
```

### 問題 2: 學生無法連接

**檢查:**
1. ✅ 學生和您的電腦連到同一個 WiFi
2. ✅ 在 Windows 中重新執行 `.\wsl-port-forward.ps1`
3. ✅ 執行 `./scripts/network/check-network.sh` 確認服務運行中

### 問題 3: WSL 重啟後無法訪問

**解決:**
```powershell
# Windows PowerShell (系統管理員)
.\wsl-port-forward.ps1
```

---

## 📚 詳細文檔

| 文件 | 說明 |
|------|------|
| **[DOCS_INDEX.md](./DOCS_INDEX.md)** | 完整文檔索引 |
| **[scripts/README.md](./scripts/README.md)** | 腳本使用說明 |
| **[LAN_DEPLOYMENT_GUIDE.md](./LAN_DEPLOYMENT_GUIDE.md)** | 完整部署文檔 |
| **[ENV_CONFIGURATION_GUIDE.md](./ENV_CONFIGURATION_GUIDE.md)** | 環境配置指南 |

---

## 🔧 可用腳本

### WSL 腳本

```bash
./scripts/development/start-backend.sh   # 啟動 Backend
./scripts/development/start-frontend.sh  # 啟動 Frontend
./scripts/network/check-network.sh       # 檢查配置
./scripts/network/start-lan-server.sh    # 顯示啟動說明
```

### Windows 腳本

```powershell
.\wsl-port-forward.ps1         # 設定端口轉發
.\wsl-port-forward-remove.ps1  # 清除端口轉發
```

---

## 💡 每日使用流程

### 上課前 (5 分鐘)

1. **設定端口轉發** (如果 WSL 重啟過):
   ```powershell
   # Windows PowerShell (系統管理員)
   .\wsl-port-forward.ps1
   ```

2. **啟動服務**:
   ```bash
   # WSL 終端機 1
   ./scripts/development/start-backend.sh
   
   # WSL 終端機 2
   ./scripts/development/start-frontend.sh
   ```

3. **驗證**:
   ```bash
   ./scripts/network/check-network.sh
   ```

4. **用手機測試連接**

5. **在白板寫下網址給學生**

### 下課後

1. 在兩個終端機按 `Ctrl+C`
2. (可選) 清除端口轉發:
   ```powershell
   .\wsl-port-forward-remove.ps1
   ```

---

## 🎓 給學生的說明

> 同學們，請連接到補習班 WiFi，然後在瀏覽器中開啟:
> 
> **http://192.168.1.100:5173**
> 
> (請替換為實際的 IP 地址)
> 
> 使用您的帳號密碼登入即可。

---

## 🔐 安全提醒

- ✅ 僅在補習班內部 WiFi 使用
- ✅ 下課後停止服務
- ✅ 不要在公共網路開放
- ✅ 確保學生使用正確的帳號登入

---

## 🆘 緊急處理

如果一切都不正常:

```powershell
# 1. 重啟 WSL (Windows PowerShell)
wsl --shutdown

# 2. 重新設定端口轉發
.\wsl-port-forward.ps1
```

```bash
# 3. 重新啟動服務 (WSL)
./scripts/development/start-backend.sh    # 終端機 1
./scripts/development/start-frontend.sh   # 終端機 2
```

---

**準備好了！開始使用吧！** 🚀

有問題請查看 [DOCS_INDEX.md](./DOCS_INDEX.md) 或 [scripts/README.md](./scripts/README.md)
