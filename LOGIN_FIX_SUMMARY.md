# 登入問題修復總結

## 問題描述

登入時出現 `ERR_NETWORK` 錯誤，前端無法連接到後端 API。

## 根本原因

1. **bcrypt native binding 未正確安裝**：Docker 容器中的 bcrypt 模組缺少預編譯的 native binding（`bcrypt_lib.node`），導致後端服務無法啟動
2. **TypeScript 編譯錯誤**：`Enrollment` 類型定義中缺少 `Decimal` 類型支持
3. **資料庫無用戶**：資料庫中沒有任何可供登入的用戶

## 解決方案

### 1. 修復 bcrypt Native Binding

**問題**：Alpine Linux 的 Docker 容器中，bcrypt 的 native binding 需要手動下載和安裝。

**修復**：
- 在 `backend/Dockerfile` 中添加必要的構建工具（python3, make, g++）
- 在 Docker 構建過程中手動執行 `npm run install` 來下載預編譯的 bcrypt native binding

```dockerfile
# 安裝系統依賴（包括 OpenSSL 和構建工具）
RUN apk add --no-cache \
    openssl \
    openssl-dev \
    libc6-compat \
    python3 \
    make \
    g++

# 手動安裝 bcrypt native binding
RUN cd /app/node_modules/.pnpm/bcrypt@5.1.1/node_modules/bcrypt && npm run install
```

### 2. 修復 TypeScript 類型錯誤

**問題**：Prisma 返回的 `discountRate` 是 `Decimal` 類型，但類型定義中不包含此類型。

**修復**：在 `backend/src/cramschool/types/student.types.ts` 中添加 `Decimal` 類型：

```typescript
import { Decimal } from '@prisma/client/runtime/library'

export interface Enrollment {
  enrollmentId: number
  courseId: number
  course: { 
    courseName: string 
  }
  enrollDate: Date
  discountRate: number | string | Decimal  // 添加 Decimal 類型
  isActive: boolean
}
```

### 3. 調整 Docker Compose 卷掛載

**問題**：開發模式下的卷掛載配置不當，導致容器內的 node_modules 被覆蓋。

**修復**：調整 `docker-compose.yml` 的卷掛載路徑：

```yaml
volumes:
  # 開發時掛載源代碼（熱重載）
  - ./backend/src:/app/backend/src
  - ./backend/prisma:/app/backend/prisma
  # 媒體文件持久化
  - backend_media:/app/backend/media
  # node_modules 使用容器內的版本（匿名卷防止被覆蓋）
  - /app/node_modules
  - /app/backend/node_modules
```

### 4. 載入測試資料

**問題**：資料庫中沒有用戶資料。

**修復**：執行 seeder 腳本載入測試資料：

```bash
docker exec 9jang-backend sh -c "cd /app/backend && npx ts-node --project tsconfig.json src/scripts/seed-data.ts src/scripts/seed_data_example.json"
```

## 測試帳號

所有測試帳號的**密碼與帳號名稱相同**：

### 管理員
- 帳號：`admin`
- 密碼：`admin`

### 老師
- 帳號：`teacher1`, `akira`, `kai`
- 密碼：與帳號名稱相同

### 會計
- 帳號：`accountant1`, `bordless`
- 密碼：與帳號名稱相同

### 學生
- 帳號：`student1`, `student2`, `luoyujun`, `linshixiu`, `liaoyunjie`
- 密碼：與帳號名稱相同

## 驗證步驟

1. 確認所有 Docker 容器正常運行：
   ```bash
   docker ps
   ```

2. 確認後端服務已啟動：
   ```bash
   docker logs 9jang-backend --tail 20
   ```

3. 確認資料庫中有用戶：
   ```bash
   docker exec 9jang-postgres psql -U postgres -d 9jang_db -c "SELECT id, username, email FROM account_customuser;"
   ```

4. 測試登入：訪問 http://localhost:5173 並使用任一測試帳號登入

## 相關文件

- `backend/Dockerfile` - bcrypt 安裝修復
- `backend/src/cramschool/types/student.types.ts` - 類型定義修復
- `docker-compose.yml` - 卷掛載配置
- `backend/src/scripts/seed-data.ts` - 資料載入腳本
- `backend/src/scripts/seed_data_example.json` - 測試資料

## 未來改進建議

1. **自動化資料初始化**：在首次啟動時自動檢查並載入測試資料
2. **健康檢查改進**：Docker healthcheck 應該檢查 bcrypt 是否正確載入
3. **文檔更新**：更新部署文檔，說明 bcrypt 安裝的特殊要求
4. **考慮使用 bcryptjs**：如果持續遇到 bcrypt native binding 問題，可以考慮切換到純 JavaScript 實現的 bcryptjs

## 修復日期

2026-02-02
