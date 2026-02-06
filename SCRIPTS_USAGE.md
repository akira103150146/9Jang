# 📜 腳本使用說明

## 🐚 Bash 腳本 (WSL/Linux)

所有腳本都已修復換行符號問題，可以在 zsh 和 bash 中正常運行。

### 啟動服務

#### 方法 1: 使用獨立腳本 (推薦)

開啟兩個終端機:

**終端機 1:**
```bash
cd ~/github/9Jang
./start-backend.sh
```

**終端機 2:**
```bash
cd ~/github/9Jang
./start-frontend.sh
```

#### 方法 2: 查看啟動說明

```bash
./start-lan-server.sh
```

這會顯示所有可用的啟動方式。

### 檢查網路配置

```bash
./check-network.sh
```

這會顯示:
- WSL IP 地址
- 端口使用情況
- 服務運行狀態
- 訪問網址

---

## 💻 PowerShell 腳本 (Windows)

### 設定端口轉發

**以系統管理員身分開啟 PowerShell:**

```powershell
cd C:\Users\<你的使用者名稱>\github\9Jang
.\wsl-port-forward.ps1
```

### 清除端口轉發

```powershell
.\wsl-port-forward-remove.ps1
```

---

## 🔧 故障排除

### 問題: `bad interpreter: /bin/bash^M`

**原因:** Windows 換行符號 (CRLF) 問題

**解決方案:**

```bash
# 方法 1: 使用 sed 修復
sed -i 's/\r$//' *.sh

# 方法 2: 使用 dos2unix (如果已安裝)
dos2unix *.sh

# 方法 3: 安裝 dos2unix
sudo apt install dos2unix
dos2unix *.sh
```

### 問題: 權限不足

**解決方案:**

```bash
chmod +x *.sh
```

### 問題: 腳本找不到

**確認您在專案根目錄:**

```bash
cd ~/github/9Jang
pwd  # 應該顯示 /home/akira/github/9Jang
ls *.sh  # 應該看到所有腳本
```

---

## 📋 腳本清單

### WSL/Linux 腳本

| 腳本 | 用途 | 使用方式 |
|------|------|----------|
| `start-backend.sh` | 啟動 Backend | `./start-backend.sh` |
| `start-frontend.sh` | 啟動 Frontend | `./start-frontend.sh` |
| `start-lan-server.sh` | 顯示啟動說明 | `./start-lan-server.sh` |
| `check-network.sh` | 檢查網路配置 | `./check-network.sh` |

### Windows PowerShell 腳本

| 腳本 | 用途 | 使用方式 |
|------|------|----------|
| `wsl-port-forward.ps1` | 設定端口轉發 | 以系統管理員執行 |
| `wsl-port-forward-remove.ps1` | 清除端口轉發 | 以系統管理員執行 |

---

## 🚀 快速開始流程

### 1. 第一次設定

```powershell
# Windows PowerShell (系統管理員)
.\wsl-port-forward.ps1
```

### 2. 每次上課前

```bash
# WSL 終端機 1
./start-backend.sh

# WSL 終端機 2
./start-frontend.sh
```

### 3. 驗證

```bash
# WSL
./check-network.sh
```

### 4. 下課後

在兩個終端機中按 `Ctrl+C` 停止服務

---

## 💡 提示

### 使用別名 (可選)

在 `~/.zshrc` 或 `~/.bashrc` 中添加:

```bash
alias 9jang-backend='cd ~/github/9Jang && ./start-backend.sh'
alias 9jang-frontend='cd ~/github/9Jang && ./start-frontend.sh'
alias 9jang-check='cd ~/github/9Jang && ./check-network.sh'
```

重新載入配置:

```bash
source ~/.zshrc  # 或 source ~/.bashrc
```

之後可以直接使用:

```bash
9jang-backend
9jang-frontend
9jang-check
```

### 使用 tmux (進階)

如果您熟悉 tmux:

```bash
# 創建新 session
tmux new -s 9jang

# 啟動 backend
pnpm run dev:backend

# 分割視窗 (Ctrl+B 然後按 %)
# 在新窗格啟動 frontend
pnpm run dev

# 離開 tmux: Ctrl+B 然後按 D
# 重新連接: tmux attach -t 9jang
# 終止 session: tmux kill-session -t 9jang
```

---

## 📞 需要幫助？

查看完整文檔:
- **快速開始:** `QUICK_START_LAN.md`
- **完整指南:** `LAN_DEPLOYMENT_GUIDE.md`
- **文件索引:** `LAN_DEPLOYMENT_README.md`
