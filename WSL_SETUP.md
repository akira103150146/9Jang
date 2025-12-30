# WSL 環境設置指南

## 📋 在 WSL 中安裝 Node.js、npm 和 pnpm

### 方法一：使用 nvm（推薦）

nvm (Node Version Manager) 可以輕鬆管理多個 Node.js 版本。

#### 1. 安裝 nvm

```bash
# 下載並安裝 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重新載入 shell 配置
source ~/.bashrc
# 或
source ~/.zshrc
```

#### 2. 驗證 nvm 安裝

```bash
nvm --version
```

#### 3. 安裝 Node.js（推薦 LTS 版本）

```bash
# 安裝 Node.js 18 LTS
nvm install 18

# 或安裝最新 LTS 版本
nvm install --lts

# 使用特定版本
nvm use 18

# 設置為默認版本
nvm alias default 18
```

#### 4. 驗證 Node.js 和 npm

```bash
node --version
npm --version
```

#### 5. 安裝 pnpm

```bash
# 使用 npm 全局安裝 pnpm
npm install -g pnpm

# 或使用官方安裝腳本（推薦）
curl -fsSL https://get.pnpm.io/install.sh | sh -

# 重新載入 shell
source ~/.bashrc
# 或
source ~/.zshrc
```

#### 6. 驗證 pnpm

```bash
pnpm --version
```

### 方法二：使用 NodeSource 倉庫（直接安裝）

#### 1. 安裝 Node.js

```bash
# 更新系統
sudo apt update

# 安裝 Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 驗證安裝
node --version
npm --version
```

#### 2. 安裝 pnpm

```bash
# 使用官方安裝腳本（推薦）
curl -fsSL https://get.pnpm.io/install.sh | sh -

# 重新載入 shell
source ~/.bashrc
# 或
source ~/.zshrc

# 驗證
pnpm --version
```

### 方法三：使用 pnpm 的 Corepack（Node.js 16.10+）

如果 Node.js 版本 >= 16.10，可以使用內建的 Corepack：

```bash
# 啟用 Corepack
corepack enable

# 安裝 pnpm
corepack prepare pnpm@latest --activate

# 驗證
pnpm --version
```

## 🔧 完整安裝步驟（推薦流程）

### 1. 安裝 nvm

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
```

### 2. 安裝 Node.js 18

```bash
nvm install 18
nvm use 18
nvm alias default 18
```

### 3. 安裝 pnpm

```bash
npm install -g pnpm
# 或
curl -fsSL https://get.pnpm.io/install.sh | sh -
source ~/.bashrc
```

### 4. 驗證安裝

```bash
node --version   # 應該顯示 v18.x.x 或更高
npm --version    # 應該顯示 9.x.x 或更高
pnpm --version   # 應該顯示 8.x.x 或更高
```

## 🚀 在 WSL 中啟動項目

### 1. 進入項目目錄

```bash
cd /mnt/c/Users/User/Github/9Jang
```

### 2. 安裝依賴

```bash
pnpm install
```

### 3. 構建共享包

```bash
pnpm build:shared
```

### 4. 啟動前端

```bash
pnpm dev
```

## ⚠️ 常見問題

### 問題 1：npm 命令找不到

**解決方案：**
```bash
# 確保 Node.js 已正確安裝
which node
which npm

# 如果找不到，重新載入 shell
source ~/.bashrc
```

### 問題 2：pnpm 命令找不到

**解決方案：**
```bash
# 檢查 pnpm 是否在 PATH 中
echo $PATH

# 如果使用官方安裝腳本，檢查 ~/.local/share/pnpm
export PNPM_HOME="$HOME/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"

# 重新載入 shell
source ~/.bashrc
```

### 問題 3：權限問題

**解決方案：**
```bash
# 如果遇到權限問題，使用 sudo（不推薦）或配置 npm 全局目錄
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
source ~/.bashrc
```

### 問題 4：WSL 和 Windows 的 Node.js 衝突

**解決方案：**
- 在 WSL 中使用 WSL 安裝的 Node.js
- 在 Windows PowerShell 中使用 Windows 安裝的 Node.js
- 兩者可以共存，互不影響

## 📝 配置建議

### 添加到 ~/.bashrc 或 ~/.zshrc

```bash
# Node.js (nvm)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# pnpm
export PNPM_HOME="$HOME/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"
```

## 🎯 快速檢查清單

- [ ] nvm 已安裝
- [ ] Node.js 18+ 已安裝
- [ ] npm 可用
- [ ] pnpm 已安裝
- [ ] 可以執行 `pnpm --version`
- [ ] 可以執行 `node --version`
- [ ] 可以執行 `npm --version`

## 🔗 相關資源

- [nvm GitHub](https://github.com/nvm-sh/nvm)
- [Node.js 官網](https://nodejs.org/)
- [pnpm 官網](https://pnpm.io/)
- [pnpm 安裝文檔](https://pnpm.io/installation)






















































































































































