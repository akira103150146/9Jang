# 🔧 修復手機登入問題

## 問題描述

- ✅ 手機可以看到網頁 (http://192.168.200.137:5173)
- ❌ 但無法登入（輸入帳號密碼後失敗）
- ✅ 電腦上測試正常

## 原因分析

Frontend 的 API 配置使用 `http://localhost:3000/api`，當手機訪問時：
- Frontend 頁面從 `192.168.200.137:5173` 載入 ✅
- 但 API 請求嘗試連接 `localhost:3000` ❌（手機的 localhost，不是您電腦的）

## ✅ 已修復

已將 Frontend 的 API 配置改為使用您的 Windows IP:
- `VITE_API_BASE_URL=http://192.168.200.137:3000/api`
- `VITE_BACKEND_URL=http://192.168.200.137:3000`

## 🚀 現在需要做的事

### 1. 重啟 Frontend 服務

**重要！** 修改環境變數後必須重啟 Frontend 才會生效。

在運行 Frontend 的終端機中：

1. **按 `Ctrl+C` 停止當前的 Frontend**
2. **重新啟動:**

```bash
./start-frontend.sh
```

或

```bash
pnpm run dev
```

### 2. 確認 Backend 端口轉發

確保在 Windows PowerShell (系統管理員) 中已執行：

```powershell
.\wsl-port-forward.ps1
```

檢查端口轉發規則：

```powershell
netsh interface portproxy show all
```

應該看到：

```
接聽 ipv4:                 連線到 ipv4:

位址            連接埠        位址            連接埠
--------------- ----------    --------------- ----------
0.0.0.0         3000          172.18.69.55    3000
0.0.0.0         5173          172.18.69.55    5173
```

### 3. 測試

1. **在電腦上測試:**
   - http://192.168.200.137:5173 ✅
   - 登入應該正常

2. **在手機上測試:**
   - http://192.168.200.137:5173 ✅
   - 登入應該正常 🎉

---

## 🔄 切換模式腳本

我已經創建了便利的腳本來切換環境：

### 切換到區域網路模式（讓手機可以訪問）

```bash
./switch-to-lan.sh
```

然後重啟 Frontend。

### 切換回本機模式（僅本機測試）

```bash
./switch-to-localhost.sh
```

然後重啟 Frontend。

---

## 🔍 故障排除

### 問題 1: 手機仍然無法登入

**檢查清單:**

1. ✅ Frontend 已重啟？
2. ✅ Windows 端口轉發已設定？（執行 `.\wsl-port-forward.ps1`）
3. ✅ Backend 正在運行？（執行 `./check-network.sh`）
4. ✅ 手機和電腦連到同一個 WiFi？

**查看 Frontend 日誌:**

在 Frontend 終端機中應該會看到 API 請求。如果看到錯誤，記下錯誤訊息。

**在手機瀏覽器中查看錯誤:**

1. 開啟手機瀏覽器的開發者工具（如果支援）
2. 或在電腦上使用 Chrome Remote Debugging

### 問題 2: API 請求失敗 (Network Error)

**可能原因:**
- Backend 端口 3000 沒有正確轉發
- Windows 防火牆阻擋

**解決方案:**

1. **檢查 Backend 是否運行:**
   ```bash
   curl http://localhost:3000/api
   ```

2. **在 Windows 中檢查端口轉發:**
   ```powershell
   netsh interface portproxy show all
   ```

3. **測試從 Windows 訪問:**
   在 Windows 瀏覽器中開啟:
   - http://192.168.200.137:3000/api/docs

4. **重新設定端口轉發:**
   ```powershell
   .\wsl-port-forward-remove.ps1
   .\wsl-port-forward.ps1
   ```

### 問題 3: CORS 錯誤

如果在手機瀏覽器控制台看到 CORS 錯誤：

**檢查 Backend 環境變數:**

```bash
# 在 WSL 中
echo $NODE_ENV
```

應該是空的或 `development`。如果是 `production`，需要修改：

```bash
# 臨時設定
export NODE_ENV=development

# 或修改 backend/.env
# NODE_ENV=development
```

然後重啟 Backend。

---

## 📊 網路架構

```
手機 (192.168.200.x)
    ↓
WiFi 網路 (192.168.200.0/24)
    ↓
Windows 主機 (192.168.200.137)
    ↓
端口轉發:
  - 3000 → WSL:3000 (Backend API)
  - 5173 → WSL:5173 (Frontend)
    ↓
WSL (172.18.69.55)
    ↓
  ┌─────────┴─────────┐
  ↓                   ↓
Backend :3000    Frontend :5173
(NestJS)         (Vite + Vue)
```

### API 請求流程

1. 手機瀏覽器載入: `http://192.168.200.137:5173`
2. Frontend 發送 API 請求到: `http://192.168.200.137:3000/api`
3. Windows 將請求轉發到: `172.18.69.55:3000`
4. Backend 處理請求並回應
5. 回應通過相同路徑返回手機

---

## 📝 重要提示

### 每次 IP 地址改變時

如果您的 Windows IP 地址改變了（例如重新連接 WiFi），需要：

1. **更新配置:**
   ```bash
   # 編輯 switch-to-lan.sh 中的 WINDOWS_IP
   # 或手動修改 frontend/.env
   ```

2. **重新執行:**
   ```bash
   ./switch-to-lan.sh
   ```

3. **重啟 Frontend**

4. **重新執行 Windows 端口轉發:**
   ```powershell
   .\wsl-port-forward.ps1
   ```

### 下課後

建議切換回本機模式：

```bash
./switch-to-localhost.sh
```

重啟 Frontend，然後可以清除端口轉發：

```powershell
.\wsl-port-forward-remove.ps1
```

---

## ✅ 測試清單

上課前測試：

- [ ] Backend 正在運行
- [ ] Frontend 正在運行（已重啟）
- [ ] Windows 端口轉發已設定
- [ ] 電腦瀏覽器可以訪問 http://192.168.200.137:5173
- [ ] 電腦瀏覽器可以登入
- [ ] 手機可以訪問 http://192.168.200.137:5173
- [ ] 手機可以登入 ✅

---

**現在重啟 Frontend，然後用手機測試登入！** 🎉
