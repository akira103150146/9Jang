# ✅ 手機登入問題已修復

## 📋 問題總結

**原始問題:**
- ✅ 手機可以看到網頁 (http://192.168.200.137:5173)
- ❌ 無法登入（輸入帳號密碼後失敗）
- ✅ 電腦上測試正常

**根本原因:**
Frontend 的 API 配置使用 `localhost:3000`，手機無法訪問您電腦的 localhost。

---

## ✅ 已完成的修復

### 1. 修改 Frontend 配置

已將 `frontend/.env` 中的 API URL 改為使用您的 Windows IP:

```env
# 修改前
VITE_API_BASE_URL=http://localhost:3000/api
VITE_BACKEND_URL=http://localhost:3000

# 修改後
VITE_API_BASE_URL=http://192.168.200.137:3000/api
VITE_BACKEND_URL=http://192.168.200.137:3000
```

### 2. 創建便利腳本

**切換到區域網路模式:**
```bash
./switch-to-lan.sh
```

**切換回本機模式:**
```bash
./switch-to-localhost.sh
```

### 3. 更新文檔

- ✅ 更新 `START_HERE.md` - 增加切換模式步驟
- ✅ 創建 `FIX_MOBILE_LOGIN.md` - 詳細故障排除指南
- ✅ 創建 `MOBILE_LOGIN_FIXED.md` - 本文件

---

## 🚀 現在需要做什麼

### ⚠️ 重要：必須重啟 Frontend！

修改環境變數後，**必須重啟 Frontend** 才會生效。

**在運行 Frontend 的終端機中:**

1. 按 `Ctrl+C` 停止
2. 重新啟動:

```bash
cd ~/github/9Jang
./start-frontend.sh
```

或

```bash
pnpm run dev
```

### 確認 Backend 端口轉發

確保在 Windows PowerShell (系統管理員) 中已執行：

```powershell
.\wsl-port-forward.ps1
```

---

## 🧪 測試步驟

### 1. 電腦測試

在電腦瀏覽器中開啟:
- http://192.168.200.137:5173
- 輸入帳號: `akira`
- 輸入密碼: `akira`
- 應該可以成功登入 ✅

### 2. 手機測試

在手機瀏覽器中開啟:
- http://192.168.200.137:5173
- 輸入帳號: `akira`
- 輸入密碼: `akira`
- 應該可以成功登入 ✅🎉

---

## 📊 完整部署流程

### 上課前準備 (每次)

```bash
# 1. 切換到區域網路模式
./switch-to-lan.sh

# 2. 啟動 Backend (終端機 1)
./start-backend.sh

# 3. 啟動 Frontend (終端機 2)
./start-frontend.sh

# 4. 檢查配置
./check-network.sh
```

```powershell
# 5. 在 Windows PowerShell (系統管理員) 中
.\wsl-port-forward.ps1
```

### 下課後清理 (可選)

```bash
# 切換回本機模式
./switch-to-localhost.sh

# 停止服務 (在兩個終端機中按 Ctrl+C)
```

```powershell
# 清除端口轉發 (Windows PowerShell)
.\wsl-port-forward-remove.ps1
```

---

## 🔧 故障排除

### 如果手機仍然無法登入

**檢查清單:**

1. ✅ Frontend 已重啟？
2. ✅ Backend 正在運行？
3. ✅ Windows 端口轉發已設定？
4. ✅ 手機和電腦連到同一個 WiFi？

**詳細診斷:**

```bash
# 檢查服務狀態
./check-network.sh

# 查看 Frontend 配置
grep VITE_API_BASE_URL frontend/.env
grep VITE_BACKEND_URL frontend/.env
```

應該看到:
```
VITE_API_BASE_URL=http://192.168.200.137:3000/api
VITE_BACKEND_URL=http://192.168.200.137:3000
```

**測試 Backend API:**

在電腦瀏覽器中開啟:
- http://192.168.200.137:3000/api/docs

應該可以看到 Swagger 文檔。

---

## 📝 重要提示

### IP 地址改變時

如果您的 Windows IP 地址改變（例如重新連接 WiFi）:

1. 編輯 `switch-to-lan.sh`，修改 `WINDOWS_IP` 變數
2. 重新執行 `./switch-to-lan.sh`
3. 重啟 Frontend
4. 重新執行 Windows 端口轉發

### 本機開發時

如果只在本機開發（不需要手機訪問）:

```bash
./switch-to-localhost.sh
```

然後重啟 Frontend。這樣可以使用 `localhost`，速度更快。

---

## 📚 相關文檔

- **[FIX_MOBILE_LOGIN.md](./FIX_MOBILE_LOGIN.md)** - 詳細故障排除指南
- **[START_HERE.md](./START_HERE.md)** - 快速開始指南
- **[QUICK_START_LAN.md](./QUICK_START_LAN.md)** - 快速部署指南
- **[LAN_DEPLOYMENT_GUIDE.md](./LAN_DEPLOYMENT_GUIDE.md)** - 完整部署文檔

---

## ✅ 總結

### 已修復
- ✅ Frontend API 配置改為使用 Windows IP
- ✅ 創建便利的切換腳本
- ✅ 更新所有相關文檔

### 需要做的
- ⚠️ **重啟 Frontend** (最重要！)
- ✅ 確認 Windows 端口轉發已設定
- ✅ 測試手機登入

---

**現在重啟 Frontend，然後用手機測試登入！應該可以正常使用了！** 🎉
