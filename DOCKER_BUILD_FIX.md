# Docker 構建問題修復

## 🔴 問題

Docker 構建失敗，錯誤訊息：
```
failed to solve: failed to compute cache key: failed to calculate checksum of ref e70f2129-13d9-4cc1-8a9e-16dc996689bb::oq5nwv6esu1yeo2qhs7vv569t: "/shared": not found
```

## 🔍 原因分析

專案使用 **pnpm workspace monorepo** 結構：
```
9Jang/
├── backend/
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── Dockerfile
│   └── package.json
├── shared/           # 共享代碼庫
│   └── package.json
└── pnpm-workspace.yaml
```

原始的 `docker-compose.yml` 配置：
```yaml
backend:
  build:
    context: ./backend      # ❌ 錯誤：上下文只在 backend 目錄
    dockerfile: Dockerfile
```

但 `backend/Dockerfile` 需要訪問父目錄的文件：
```dockerfile
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/    # ❌ shared 在父目錄
```

由於構建上下文是 `./backend`，Docker 無法訪問 `../shared`。

## ✅ 解決方案

### 修改構建上下文

將構建上下文從子目錄改為根目錄：

```yaml
backend:
  build:
    context: .                    # ✅ 根目錄
    dockerfile: ./backend/Dockerfile  # ✅ 指定 Dockerfile 路徑
    target: development

frontend:
  build:
    context: .                    # ✅ 根目錄
    dockerfile: ./frontend/Dockerfile # ✅ 指定 Dockerfile 路徑
    target: development
```

### 為什麼這樣可以

1. **構建上下文是根目錄**：Docker 可以訪問所有子目錄
2. **Dockerfile 路徑正確**：通過 `dockerfile` 參數指定
3. **COPY 指令正確**：現在可以訪問 `backend/`, `frontend/`, `shared/`

## 📝 已修改的文件

✅ `docker-compose.yml` - 更新 backend 和 frontend 的構建上下文
✅ `docker-compose.prod.yml` - 更新生產環境配置

## 🧪 驗證

```bash
# 驗證配置
docker-compose config --quiet && echo "✓ 配置正確"

# 測試構建（不啟動）
docker-compose build backend

# 完整啟動
docker-compose up -d
```

## 📊 Monorepo 最佳實踐

### 方案對比

| 方案 | 優點 | 缺點 |
|------|------|------|
| 子目錄上下文 | 構建快（只複製需要的文件） | 無法訪問 shared 代碼 |
| 根目錄上下文 | 可訪問所有 workspace | 構建上下文較大 |
| 多階段 + 根上下文 | 平衡：訪問所有文件 + 優化構建 | 配置複雜度中等 |

### 我們的選擇

✅ **根目錄上下文 + 多階段構建** - 最適合 pnpm workspace

優勢：
1. 支持 workspace 依賴
2. 可共享 shared 代碼
3. 多階段構建優化映像大小
4. .dockerignore 排除不必要文件

## 🎯 構建上下文說明

### 構建上下文 vs Dockerfile 位置

```yaml
build:
  context: .                        # 構建上下文（Docker 可訪問的文件範圍）
  dockerfile: ./backend/Dockerfile  # Dockerfile 的位置
```

**重點**：
- `context` 決定 COPY 指令可以訪問哪些文件
- `dockerfile` 只是指定使用哪個 Dockerfile
- 兩者可以獨立配置

### 示例

```dockerfile
# 在 backend/Dockerfile 中
# context: . （根目錄）

COPY package.json ./              # 從根目錄複製
COPY backend/ ./backend/          # 從根目錄複製 backend/
COPY shared/ ./shared/            # 從根目錄複製 shared/ ✅ 可以訪問
```

## 🔒 安全考慮

### .dockerignore 很重要

雖然使用根目錄上下文，但通過 `.dockerignore` 排除敏感文件：

```gitignore
# .dockerignore
.git
.env
.env.*
node_modules
*.md
```

這確保：
1. 構建速度快（排除大文件）
2. 安全（排除敏感文件）
3. 映像小（只包含必要文件）

## 📚 相關資源

- [Docker Build Context 文檔](https://docs.docker.com/build/building/context/)
- [Docker Compose Build 配置](https://docs.docker.com/compose/compose-file/build/)
- [pnpm Workspace 文檔](https://pnpm.io/workspaces)

## 💡 其他解決方案（參考）

### 方案 1: 分離的 Dockerfile（不推薦）

為每個服務創建獨立的 Dockerfile，不共享代碼。

❌ **缺點**：無法使用 shared 代碼庫

### 方案 2: 構建時複製 shared（不推薦）

在構建前將 shared 複製到 backend/frontend。

❌ **缺點**：增加構建複雜度，數據重複

### 方案 3: 使用 Docker BuildKit（進階）

```yaml
build:
  context: .
  dockerfile: ./backend/Dockerfile
  additional_contexts:
    shared: ./shared
```

✅ **優點**：更精確的構建上下文控制
⚠️ **需要**：Docker BuildKit（較新版本）

## ✅ 總結

| 項目 | 狀態 |
|------|------|
| 問題診斷 | ✅ 完成 |
| 配置修復 | ✅ 完成 |
| 驗證測試 | ✅ 通過 |
| 文檔更新 | ✅ 完成 |

**現在可以正常構建和啟動 Docker 容器了！** 🎉

---

**開始使用**: `./docker-start.sh` 或 `docker-compose up -d` 🚀
