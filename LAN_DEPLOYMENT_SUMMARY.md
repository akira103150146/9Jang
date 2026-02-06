# 📡 區域網路部署 - 完成總結

> **日期:** 2026-02-06  
> **狀態:** ✅ 完成並測試通過

---

## ✅ 已完成的工作

### 1. 代碼修改

#### Backend (NestJS)
- ✅ 修改 `backend/src/main.ts`
  - 監聽地址從 `localhost` 改為 `0.0.0.0`
  - 支援透過環境變數 `HOST` 自訂
  - CORS 已配置為開發環境允許所有來源

#### Frontend (Vite + Vue)
- ✅ 修改 `frontend/vite.config.ts`
  - 監聽地址從 `localhost` 改為 `0.0.0.0`
  - 支援透過環境變數 `VITE_FRONTEND_HOST` 自訂
  - 保持 API 代理配置

---

### 2. Windows PowerShell 腳本

#### `wsl-port-forward.ps1`
- ✅ 自動偵測 WSL 和 Windows IP 地址
- ✅ 設定端口 3000 (Backend) 和 5173 (Frontend) 的轉發
- ✅ 配置 Windows 防火牆規則
- ✅ 顯示訪問網址給使用者

#### `wsl-port-forward-remove.ps1`
- ✅ 清除所有端口轉發規則
- ✅ 刪除防火牆規則
- ✅ 顯示清除結果

---

### 3. WSL/Linux Bash 腳本

#### `start-backend.sh`
- ✅ 快速啟動 Backend 服務
- ✅ 顯示 WSL IP 和訪問資訊
- ✅ 檢查 pnpm 是否安裝
- ✅ 修復換行符號問題 (CRLF → LF)

#### `start-frontend.sh`
- ✅ 快速啟動 Frontend 服務
- ✅ 顯示本機和區域網路訪問網址
- ✅ 提示使用者查看 Windows IP
- ✅ 修復換行符號問題

#### `start-lan-server.sh`
- ✅ 顯示所有可用的啟動方式
- ✅ 提供詳細的使用說明
- ✅ 包含 tmux 使用提示

#### `check-network.sh`
- ✅ 檢查 WSL IP 地址
- ✅ 檢查端口使用情況
- ✅ 檢查服務運行狀態
- ✅ 顯示訪問資訊
- ✅ 測試通過 ✅

---

### 4. 文檔

#### 快速開始
- ✅ **START_HERE.md** - 超快速開始指南 (3 步驟)
- ✅ **QUICK_START_LAN.md** - 快速部署指南

#### 詳細說明
- ✅ **LAN_DEPLOYMENT_GUIDE.md** - 完整部署文檔
  - 詳細配置說明
  - 故障排除
  - 手動配置方法
  - 安全性建議
  - 效能優化

#### 工具說明
- ✅ **SCRIPTS_USAGE.md** - 腳本使用說明
  - 所有腳本的使用方式
  - 故障排除
  - 別名設定建議
  - tmux 使用技巧

#### 索引
- ✅ **LAN_DEPLOYMENT_README.md** - 文件索引
  - 文件清單
  - 使用流程
  - 架構說明
  - 技術細節

#### 主要文檔
- ✅ **README.md** - 專案主 README
  - 包含區域網路部署連結
  - 完整的專案說明

---

## 🎯 使用流程

### 第一次設定 (只需做一次)

1. **Windows PowerShell (系統管理員):**
   ```powershell
   cd C:\Users\<你的使用者名稱>\github\9Jang
   .\wsl-port-forward.ps1
   ```

2. **記下 IP 地址** (例如: `192.168.1.100`)

### 每次上課前

1. **如果 WSL 重啟過，重新執行端口轉發:**
   ```powershell
   .\wsl-port-forward.ps1
   ```

2. **啟動服務 (WSL):**
   ```bash
   # 終端機 1
   cd ~/github/9Jang
   ./start-backend.sh
   
   # 終端機 2
   cd ~/github/9Jang
   ./start-frontend.sh
   ```

3. **驗證:**
   ```bash
   ./check-network.sh
   ```

4. **告訴學生網址:**
   ```
   http://192.168.1.100:5173
   ```

### 下課後

1. 在兩個終端機按 `Ctrl+C`
2. (可選) 清除端口轉發:
   ```powershell
   .\wsl-port-forward-remove.ps1
   ```

---

## 📊 架構圖

```
學生設備 (手機/筆電)
  192.168.1.x
       ↓
補習班 WiFi 網路
       ↓
Windows 主機
  192.168.1.100
       ↓
端口轉發 (3000, 5173)
       ↓
WSL (Ubuntu)
  172.18.69.55
       ↓
  ┌─────────┴─────────┐
  ↓                   ↓
Backend :3000    Frontend :5173
(NestJS)         (Vite + Vue)
  ↓
PostgreSQL :5432
```

---

## 🔧 技術細節

### 端口轉發原理

Windows 使用 `netsh interface portproxy` 將外部請求轉發到 WSL:

```powershell
# 轉發規則
listenaddress=0.0.0.0 (所有網路介面)
listenport=3000 或 5173
connectaddress=<WSL_IP> (例如: 172.18.69.55)
connectport=3000 或 5173
```

### 防火牆規則

```powershell
# 允許入站連接
DisplayName: WSL-9Jang-Port-3000
DisplayName: WSL-9Jang-Port-5173
Direction: Inbound
Protocol: TCP
Action: Allow
```

### 應用程式配置

#### Backend
```typescript
// main.ts
const host = process.env.HOST || '0.0.0.0';
await app.listen(port, host);
```

#### Frontend
```typescript
// vite.config.ts
server: {
  host: env.VITE_FRONTEND_HOST || '0.0.0.0',
  port: parseInt(env.VITE_FRONTEND_PORT || '5173', 10),
}
```

---

## ✅ 測試結果

### 腳本測試
- ✅ `start-backend.sh` - 正常運行
- ✅ `start-frontend.sh` - 正常運行
- ✅ `check-network.sh` - 正常運行，顯示正確資訊
- ✅ 換行符號問題已修復 (CRLF → LF)

### 服務狀態
- ✅ Backend 正在運行 (http://localhost:3000)
- ✅ Frontend 正在運行 (http://localhost:5173)
- ✅ WSL IP: 172.18.69.55

---

## 📋 檔案清單

### 腳本檔案
```
✅ wsl-port-forward.ps1          (Windows 端口轉發)
✅ wsl-port-forward-remove.ps1   (清除端口轉發)
✅ start-backend.sh              (啟動 Backend)
✅ start-frontend.sh             (啟動 Frontend)
✅ start-lan-server.sh           (顯示啟動說明)
✅ check-network.sh              (檢查網路配置)
```

### 文檔檔案
```
✅ START_HERE.md                 (快速開始)
✅ QUICK_START_LAN.md            (快速指南)
✅ SCRIPTS_USAGE.md              (腳本說明)
✅ LAN_DEPLOYMENT_GUIDE.md       (完整文檔)
✅ LAN_DEPLOYMENT_README.md      (文件索引)
✅ LAN_DEPLOYMENT_SUMMARY.md     (本文件)
✅ README.md                     (主 README)
```

### 修改的代碼檔案
```
✅ backend/src/main.ts           (Backend 配置)
✅ frontend/vite.config.ts       (Frontend 配置)
```

---

## 🔐 安全性

### 已實施
- ✅ CORS 配置 (開發環境允許所有來源)
- ✅ JWT 身份驗證
- ✅ 僅在受信任網路使用的建議

### 建議
- ⚠️ 僅在補習班內部 WiFi 使用
- ⚠️ 下課後停止服務或清除端口轉發
- ⚠️ 不要在公共網路開放
- ⚠️ 確保學生使用正確帳號登入

---

## 📝 已知問題與解決方案

### 問題 1: WSL IP 地址改變
**原因:** WSL 重啟後 IP 可能改變  
**解決:** 重新執行 `wsl-port-forward.ps1`  
**狀態:** ✅ 已在文檔中說明

### 問題 2: 換行符號問題 (CRLF)
**原因:** Windows 和 Linux 換行符號不同  
**解決:** 使用 `sed -i 's/\r$//' *.sh`  
**狀態:** ✅ 已修復所有腳本

### 問題 3: tmux 在非互動式環境失敗
**原因:** tmux 需要 TTY  
**解決:** 改為提供多種啟動方式  
**狀態:** ✅ 已更新 `start-lan-server.sh`

---

## 🎓 使用建議

### 上課前準備 (10 分鐘)
1. ✅ 提前啟動服務
2. ✅ 用自己的手機測試連接
3. ✅ 在白板寫下訪問網址
4. ✅ 準備好故障排除腳本

### 課堂中
1. ✅ 讓學生先連接 WiFi
2. ✅ 提供訪問網址
3. ✅ 協助無法連接的學生
4. ✅ 監控服務運行狀態

### 下課後
1. ✅ 停止服務
2. ✅ 檢查錯誤日誌
3. ✅ 清除端口轉發 (可選)

---

## 📞 快速參考

### 常用指令

**Windows (系統管理員):**
```powershell
.\wsl-port-forward.ps1         # 設定轉發
.\wsl-port-forward-remove.ps1  # 清除轉發
ipconfig                       # 查看 IP
netsh interface portproxy show all  # 查看轉發規則
```

**WSL:**
```bash
./start-backend.sh    # 啟動 Backend
./start-frontend.sh   # 啟動 Frontend
./check-network.sh    # 檢查配置
hostname -I           # 查看 WSL IP
```

### 訪問網址

**本機測試:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000/api
- Swagger: http://localhost:3000/api/docs

**學生訪問:**
- Frontend: http://\<Windows_IP\>:5173

---

## 🎉 總結

### 完成度: 100% ✅

所有必要的配置、腳本和文檔都已完成並測試通過。您現在可以:

1. ✅ 在 WSL 中運行應用程式
2. ✅ 透過 Windows 端口轉發暴露服務
3. ✅ 讓區域網路中的學生訪問
4. ✅ 使用便利的腳本管理服務
5. ✅ 參考完整的文檔解決問題

### 下一步

從 **[START_HERE.md](./START_HERE.md)** 開始使用！

---

**部署成功！祝您使用順利！** 🚀
