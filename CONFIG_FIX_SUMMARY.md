# 專案配置修正總結

## 修正日期
2026-02-04

## 已修正的問題

### 🔴 嚴重問題（已修正）

#### 1. ✅ frontend/package.json 重複的 dependencies 區塊
- **問題**：`dependencies` 被定義兩次（第 15-48 行和第 65-100 行）
- **影響**：導致 Vite 警告，第二個區塊覆蓋第一個
- **修正**：
  - 合併兩個 dependencies 區塊
  - 保留 `@9jang/shared: workspace:*`
  - 按字母順序排序
  - devDependencies 也按字母順序排序

### 🟡 建議問題（已修正）

#### 2. ✅ Docker Compose 使用 npm 而非 pnpm
- **問題**：本地開發用 pnpm，但 Docker 內用 npm
- **影響**：可能導致鎖定檔案不一致
- **修正**：
  - `docker-compose.yml` 中 backend 的 command 改為 `pnpm run start:dev`
  - `docker-compose.yml` 中 frontend 的 command 改為 `pnpm run dev -- --host 0.0.0.0`
  - Dockerfile 中已經正確安裝和使用 pnpm

#### 3. ✅ 移除 frontend/.npmrc 的 legacy-peer-deps
- **問題**：`legacy-peer-deps=true` 會隱藏依賴衝突
- **修正**：刪除 `frontend/.npmrc` 檔案
- **驗證**：如果 pnpm install 出現 peer dependency 警告，再評估是否需要此設定

#### 4. ✅ 清理未使用的 tsconfig paths
- **問題**：backend/tsconfig.json 中的 `@shared/*` path mapping 未被使用
- **修正**：移除 `@shared/*` mapping，保留 `@/*`
- **說明**：實際使用的是 `@9jang/shared`（透過 pnpm workspace）

#### 5. ✅ TypeScript 版本統一
- **問題**：根目錄、backend、frontend、shared 都有各自的 TypeScript
- **影響**：重複安裝、版本管理分散
- **修正**：
  - 移除所有子 package 的 TypeScript
  - 只在根目錄保留 TypeScript 5.9.3
  - 所有子 package 自動繼承根目錄版本
- **詳細報告**：請參考 `TYPESCRIPT_UNIFICATION.md`

### 🟢 建議優化（暫不修正）

#### 6. ⚠️ Backend TypeScript 配置較寬鬆
- **現狀**：backend 使用較寬鬆的 TypeScript 設定
- **對比**：frontend 使用 `strict: true`
- **建議**：視專案需求決定是否統一嚴格度
- **未修正原因**：需要團隊討論，可能需要修正大量現有程式碼

#### 7. ✅ Zod 版本統一
- **問題**：backend、frontend、shared 都各自安裝 zod
- **影響**：重複安裝、可能版本不一致
- **修正**：
  - 在根目錄統一提供 zod 3.25.76
  - Shared 使用 peerDependencies
  - Backend 和 Frontend 透過依賴提升自動使用
- **詳細報告**：請參考 `ZOD_UNIFICATION.md`

## 修正後需要執行的操作

```bash
# 1. 重新安裝依賴（建議）
pnpm install

# 2. 驗證沒有 peer dependency 警告
# 如果有警告，再評估是否需要恢復 legacy-peer-deps

# 3. 測試開發環境
pnpm run dev

# 4. 測試後端
pnpm run dev:backend

# 5. 如果使用 Docker，重新構建
docker-compose build
docker-compose up -d
```

## 驗證清單

- [x] frontend/package.json 格式正確
- [x] 沒有重複的 dependencies
- [x] Docker Compose 使用 pnpm
- [x] Dockerfiles 已經使用 pnpm（無需修改）
- [x] 移除不必要的配置

## 後續建議

1. **團隊討論**：是否要統一 TypeScript 嚴格度
2. **監控**：觀察是否有 peer dependency 問題
3. **文件**：更新開發文件，說明專案使用 pnpm
4. **CI/CD**：確保 CI/CD 也使用 pnpm

## 相關檔案

- `frontend/package.json` - 修正重複依賴
- `docker-compose.yml` - 統一使用 pnpm
- `backend/tsconfig.json` - 清理未使用的 paths
- `frontend/.npmrc` - 已刪除
