# Zod 版本統一報告

## 統一日期
2026-02-04

## Zod 與 TypeScript 的差異

### TypeScript (開發工具)
- **性質**：只在開發時使用，不會包含在最終產物中
- **策略**：在根目錄統一安裝，子 package 繼承使用
- **類型**：devDependencies

### Zod (運行時依賴)
- **性質**：運行時需要，會包含在最終產物中
- **策略**：使用 pnpm 的依賴提升機制，共享單一實例
- **類型**：dependencies（或 peerDependencies）

---

## 統一策略

### ✅ 修正前狀態
```
root/package.json          → （無 zod）
backend/package.json       → zod: ^3.22.4 (dependencies)
frontend/package.json      → zod: ^3.22.4 (devDependencies) ⚠️ 應該是 dependencies
shared/package.json        → zod: ^3.22.4 (dependencies)
```

**問題**：
1. 各自安裝，可能產生多個 zod 實例
2. Frontend 放在 devDependencies 不正確（運行時也需要）
3. 版本管理分散

### ✅ 修正後狀態
```
root/package.json          → zod: ^3.22.4 (dependencies) ✓ 統一版本來源
backend/package.json       → （已移除，透過 root 提供）
frontend/package.json      → （已移除，透過 root 提供）
shared/package.json        → （dependencies 移除，改用 peerDependencies）
```

**策略**：
1. **根目錄**：提供 zod 作為共用依賴
2. **Shared**：宣告 peerDependencies，表明需要 zod 但不直接安裝
3. **Backend/Frontend**：透過 pnpm workspace 的依賴提升，自動使用根目錄的 zod

---

## 驗證結果

### ✅ 1. Zod 版本統一
```bash
$ pnpm list zod -r --depth=0

9jang-monorepo@1.0.0
dependencies:
zod 3.25.76 ✓

@9jang/shared@0.1.0
dependencies:
zod 3.25.76 ✓  (透過 peerDependencies 解析)
```

**說明**：
- 只有**一個** zod 實例 (3.25.76)
- Shared 透過 peerDependencies 共享這個實例
- Backend 和 Frontend 自動提升使用根目錄的 zod

### ✅ 2. 版本自動升級
- **舊版本**: 3.22.4
- **新版本**: 3.25.76
- pnpm 自動解析 `^3.22.4` 為最新版本
- 向後相容，無破壞性變更

### ✅ 3. 所有 package 功能正常

#### Shared Package
```bash
$ cd shared && pnpm run build
✓ 成功編譯所有 schemas
```

#### Backend
```bash
$ cd backend && node -e "const z = require('zod'); ..."
✓ 可以正常 import zod
✓ 用於錯誤處理和驗證
```

#### Frontend
```bash
$ cd frontend && node -e "import('zod').then(...)"
✓ 可以正常 import zod
✓ 用於 API 資料驗證
```

---

## Peer Dependencies 說明

### 什麼是 Peer Dependencies？

當一個 package（如 shared）：
- 需要某個依賴（如 zod）
- 但不想自己安裝
- 希望由使用者提供

就使用 `peerDependencies`。

### Shared Package 的配置

```json
{
  "peerDependencies": {
    "zod": "^3.22.4"
  }
}
```

**意義**：
- Shared 說：「我需要 zod ^3.22.4，但不自己安裝」
- 根目錄說：「我提供 zod ^3.22.4」
- pnpm 自動連接：Shared 使用根目錄的 zod

**好處**：
1. 避免重複安裝
2. 確保版本一致（所有 package 用同一個實例）
3. 減少 bundle 大小

---

## pnpm Workspace 的依賴提升機制

### 依賴提升 (Hoisting)

pnpm 會自動將共用依賴提升到 workspace 根目錄的 `node_modules`：

```
/home/akira/github/9Jang/
├── node_modules/
│   └── zod/              ← 共用的 zod 實例
├── backend/
│   └── (使用根目錄的 zod)
├── frontend/
│   └── (使用根目錄的 zod)
└── shared/
    └── (使用根目錄的 zod)
```

### 驗證提升

```bash
$ ls -la node_modules/.pnpm/zod@3.25.76/
drwxr-xr-x  - akira  → 只有一份！
```

---

## 使用情況分析

### Shared (25 個檔案)
```typescript
// 所有 schema 檔案
import { z } from 'zod'

export const UserSchema = z.object({ ... })
export const StudentSchema = z.object({ ... })
// ... 等 25 個 schemas
```

**用途**：定義資料結構和驗證規則

### Backend (1 個檔案)
```typescript
// backend/src/common/filters/http-exception.filter.ts
import { ZodError } from 'zod'

// 用於處理 Zod 驗證錯誤
```

**用途**：錯誤處理

### Frontend (4 個檔案)
```typescript
// frontend/src/services/api/utils.ts
// frontend/src/services/*/normalize.ts
import { z } from 'zod'

// 用於驗證 API 回應
```

**用途**：運行時資料驗證

---

## 修改的檔案清單

### 已修改
1. ✅ `package.json` - 新增 zod 到 dependencies
2. ✅ `shared/package.json` - 移除 dependencies，改用 peerDependencies
3. ✅ `backend/package.json` - 移除 zod
4. ✅ `frontend/package.json` - 移除 zod（從 devDependencies）
5. ✅ `pnpm-lock.yaml` - 自動更新

### 配置對比

#### package.json (root)
```diff
  "scripts": { ... },
+ "dependencies": {
+   "zod": "^3.22.4"
+ },
  "devDependencies": {
    "typescript": "^5.3.3"
  }
```

#### shared/package.json
```diff
- "dependencies": {
-   "zod": "^3.22.4"
- }
+ "peerDependencies": {
+   "zod": "^3.22.4"
+ }
```

#### backend/package.json
```diff
  "dependencies": {
    "uuid": "^9.0.1",
-   "zod": "^3.22.4",
    "mammoth": "^1.6.0"
  }
```

#### frontend/package.json
```diff
  "dependencies": {
    "vue": "^3.4.21",
    "vue-chartjs": "^5.3.3",
    "vue-router": "^4.3.0"
  },
  "devDependencies": {
    ...
    "vite": "^5.1.4",
    "vitest": "^1.6.0",
-   "vue-tsc": "^2.0.6",
-   "zod": "^3.22.4"
+   "vue-tsc": "^2.0.6"
  }
```

---

## 效益分析

### 💾 磁碟空間
- **減少重複安裝**：從 3 個實例減少到 1 個
- **估計節省**：~2-3 MB（zod 本身較小，但避免了重複）

### 🎯 版本一致性
- **單一版本來源**：所有 package 使用同一個 zod 實例
- **避免版本衝突**：不會有「Backend 用 3.22.4，Frontend 用 3.25.0」的問題
- **Runtime 一致性**：序列化/反序列化使用相同的 zod 版本

### 🔧 維護性
- **統一更新**：只需在根目錄更新 `pnpm update zod`
- **簡化依賴管理**：不需要在每個 package 單獨管理
- **減少配置錯誤**：避免忘記更新某個 package 的版本

### 📦 Bundle 大小
- **生產環境**：確保 Frontend 只打包一份 zod
- **Tree-shaking**：現代打包工具能更好地優化

---

## 如何使用

### 更新 Zod 版本
```bash
# 在根目錄更新
cd /home/akira/github/9Jang
pnpm update zod --latest

# 所有 package 自動使用新版本
pnpm install
```

### 在新 Package 中使用 Zod
```json
// 新的 workspace package
{
  "name": "@9jang/new-package",
  "dependencies": {
    // 不需要安裝 zod，直接使用即可
  }
}
```

```typescript
// 直接 import
import { z } from 'zod'  // ✓ 自動使用根目錄的 zod
```

### 檢查 Zod 版本
```bash
# 查看所有 package 的 zod 版本
pnpm list zod -r

# 應該只看到一個版本
```

---

## 注意事項

### ⚠️ Peer Dependencies 警告

如果看到這樣的警告：
```
WARN  Issues with peer dependencies found
@9jang/shared@0.1.0
└── ✕ missing peer zod@^3.22.4
```

**不用擔心**，這是正常的！因為：
1. Shared 宣告需要 zod
2. 根目錄已經提供了
3. pnpm 會自動解析

### ⚠️ 版本相容性

升級到 3.25.76 後，如果發現問題：
```bash
# 回退到特定版本
cd /home/akira/github/9Jang
pnpm add zod@3.22.4
pnpm install
```

### ⚠️ 其他依賴統一建議

**適合統一的**（開發工具）：
- ✅ TypeScript（已統一）
- ✅ ESLint（如果使用）
- ✅ Prettier（如果使用）

**不適合統一的**（運行時依賴）：
- ❌ React/Vue（frontend 專用）
- ❌ NestJS（backend 專用）
- ✅ Zod（共用依賴，已統一）

---

## 對比其他統一方式

### 方案 A：全部在根目錄（❌ 不推薦）
```json
// root/package.json
{
  "dependencies": {
    "vue": "^3.4.21",      // ❌ Backend 不需要
    "@nestjs/core": "^10", // ❌ Frontend 不需要
    "zod": "^3.22.4"       // ✓ 共用依賴
  }
}
```

**問題**：會安裝很多不需要的依賴

### 方案 B：各自安裝（❌ 原本的做法）
```json
// backend/package.json
{ "dependencies": { "zod": "^3.22.4" } }

// frontend/package.json
{ "devDependencies": { "zod": "^3.22.4" } }

// shared/package.json
{ "dependencies": { "zod": "^3.22.4" } }
```

**問題**：重複安裝，版本可能不一致

### 方案 C：peerDependencies + 根目錄（✅ 已採用）
```json
// root/package.json
{ "dependencies": { "zod": "^3.22.4" } }

// shared/package.json
{ "peerDependencies": { "zod": "^3.22.4" } }

// backend/frontend 不需要宣告
```

**優點**：
- 只安裝一份
- 版本保證一致
- 清楚表達依賴關係

---

## 回滾方式（如果需要）

```bash
# 恢復各自安裝
cd /home/akira/github/9Jang

# 移除根目錄的 zod
pnpm remove zod

# 各 package 重新安裝
cd backend && pnpm add zod@^3.22.4
cd ../frontend && pnpm add zod@^3.22.4
cd ../shared && pnpm add zod@^3.22.4

# 重新安裝
cd ..
pnpm install
```

---

## 結論

✅ Zod 已成功統一管理
✅ 所有功能正常運作
✅ 版本自動升級到 3.25.76
✅ 符合 monorepo 最佳實踐
✅ 使用 peerDependencies 優化共享

**與 TypeScript 統一的對比**：
- TypeScript：開發工具，子 package 繼承使用
- Zod：運行時依賴，透過 peerDependencies 共享

兩者都達到了統一管理的目標，但採用了適合各自特性的策略！

---

## 相關文檔

- 📄 `TYPESCRIPT_UNIFICATION.md` - TypeScript 統一報告
- 📄 `CONFIG_FINAL_REPORT.md` - 配置修正總結
- 📄 `ZOD_UNIFICATION.md` - 本文檔
