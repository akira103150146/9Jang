# Backend Strict Mode 快速修正指南

## 當前狀態
- ✅ TypeScript strict mode 已啟用
- ⚠️ 111 個錯誤待修正
- 📝 已創建 `AuthRequest` 類型定義

---

## 快速修正步驟

### 1️⃣ 修正 Controller 中的 req 參數（~70 個）

#### 自動替換方案
```bash
# 在 backend/src 目錄下執行
cd /home/akira/github/9Jang/backend/src

# 方案 A: 使用 sed (推薦)
find . -name "*.controller.ts" -type f -exec sed -i 's/@Request() req/@Request() req: AuthRequest/g' {} \;

# 然後在每個 controller 檔案頂部添加 import
# import { AuthRequest } from '@/types/request.types';
```

#### 手動修正範本
```typescript
// 修正前
import { Controller, Get, Request } from '@nestjs/common';

@Controller('example')
export class ExampleController {
  @Get()
  async getAll(@Request() req) {
    const userId = req.user.userId;
  }
}

// 修正後
import { Controller, Get, Request } from '@nestjs/common';
import { AuthRequest } from '@/types/request.types';

@Controller('example')
export class ExampleController {
  @Get()
  async getAll(@Request() req: AuthRequest) {
    const userId = req.user?.userId;  // 注意：使用 optional chaining
  }
}
```

#### 需要修正的檔案列表
```
account/account.controller.ts          - 7 處
cramschool/controllers/
  ├─ content-templates.controller.ts   - 5 處
  ├─ courses.controller.ts             - 1 處
  ├─ error-log-images.controller.ts    - 1 處
  ├─ error-logs.controller.ts          - 4 處
  ├─ group-orders.controller.ts        - 3 處
  ├─ orders.controller.ts              - 1 處
  ├─ questions.controller.ts           - 7 處
  ├─ resources.controller.ts           - 5 處
  ├─ restaurants.controller.ts         - 1 處
  ├─ student-groups.controller.ts      - 1 處
  ├─ student-mistake-note-images...    - 5 處
  ├─ student-mistake-notes...          - 8 處
  ├─ students.controller.ts            - 2 處
  └─ subjects.controller.ts            - 4 處
```

---

### 2️⃣ 修正 Prisma JSON null 問題（~15 個）

#### 通用修正模式
```typescript
import { Prisma } from '@prisma/client';

// 場景 A: 可能為 null 的值
await prisma.model.create({
  data: {
    jsonField: value ?? Prisma.DbNull
  }
});

// 場景 B: 更新時
await prisma.model.update({
  data: {
    jsonField: value ? (value as Prisma.InputJsonValue) : Prisma.DbNull
  }
});
```

#### 需要修正的檔案
```
cramschool/services/
  ├─ content-templates.service.ts   - Line 87, 126
  ├─ error-logs.service.ts          - Line 232, 234, 239
  └─ questions-import.service.ts    - Line 86

scripts/
  └─ test-db-connection.ts          - Line 131
```

---

### 3️⃣ 清理未使用的變數/參數（~25 個）

#### 修正原則
```typescript
// 原則 A: 真的不需要 → 刪除
const unused = 123;  // 刪除這行

// 原則 B: 參數必須但不使用 → 加 _ 前綴
async method(_userId: number, name: string) {
  // 只使用 name，但 userId 參數是 API 需要的
}

// 原則 C: 未來可能使用 → 保留但註釋
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const futureUse = 123;
```

#### 需要修正的主要檔案
```
account/strategies/jwt.strategy.ts
  - Line 8: configService (已宣告但未使用)

common/
  - filters/http-exception.filter.ts - Line 7: BadRequestException
  - guards/role.guard.ts - Line 7: descriptor
  - interceptors/audit-log.interceptor.ts - Line 24: startTime

cramschool/services/
  - questions-import.service.ts - Line 58-60: userId, userRole, difficulty
  - questions-query.service.ts - Line 6, 8, 22
  - group-orders.service.ts - Line 64, 228-229
```

---

### 4️⃣ 移除未使用的 imports（~10 個）

#### 自動清理（使用 ESLint）
```bash
cd /home/akira/github/9Jang/backend

# 如果有安裝 ESLint，可以自動修正
pnpm run lint --fix
```

#### 手動移除
直接刪除檔案頂部未使用的 import 語句。

---

## 進度追蹤

### 檢查剩餘錯誤
```bash
cd /home/akira/github/9Jang/backend

# 總錯誤數
pnpm run type-check 2>&1 | grep "error TS" | wc -l

# 各類錯誤數量
echo "implicit any (TS7006):"
pnpm run type-check 2>&1 | grep "TS7006" | wc -l

echo "unused variables (TS6133):"
pnpm run type-check 2>&1 | grep "TS6133" | wc -l

echo "type mismatch (TS2322):"
pnpm run type-check 2>&1 | grep "TS2322" | wc -l
```

### 預期進度
- 修正 req 參數後: ~70 個錯誤 → ~40 個錯誤
- 修正 Prisma JSON 後: ~40 個錯誤 → ~25 個錯誤
- 清理未使用代碼後: ~25 個錯誤 → 0 個錯誤

---

## 特殊情況處理

### 1. role.guard.ts 的 undefined 問題
```typescript
// Line 8: 錯誤
const requiredRoles = Reflect.getMetadata(
  ROLES_KEY, 
  context.getHandler()  // 可能返回 undefined
);

// 修正
const requiredRoles = Reflect.getMetadata(
  ROLES_KEY, 
  context.getHandler()
) as string[] | undefined;

// 或使用 optional
const handler = context.getHandler();
if (!handler) return true;
const requiredRoles = Reflect.getMetadata(ROLES_KEY, handler);
```

### 2. media.controller.ts 的 error 類型
```typescript
// Line 69: 錯誤
catch (error) {
  console.log(error);  // error 是 unknown
}

// 修正
catch (error) {
  if (error instanceof Error) {
    console.log(error.message);
  }
  // 或
  console.log(String(error));
}
```

---

## 測試修正結果

```bash
cd /home/akira/github/9Jang/backend

# 1. Type check
pnpm run type-check

# 2. Build (確保能編譯)
pnpm run build

# 3. 測試 (如果有)
pnpm run test

# 4. 啟動開發伺服器
pnpm run start:dev
```

---

## 常見問題

### Q: 為什麼要用 `req.user?.userId` 而不是 `req.user.userId`？
A: 因為 strict mode 下，`req.user` 可能是 `undefined`（未認證的請求），必須使用 optional chaining。

### Q: `Prisma.DbNull` vs `null` 的區別？
A: 
- `null` 在 TypeScript 中表示「沒有值」
- `Prisma.DbNull` 是 Prisma 特殊類型，表示資料庫中的 NULL
- JSON 欄位不能直接使用 `null`，必須使用 `Prisma.DbNull`

### Q: 可以部分啟用 strict mode 嗎？
A: 可以！在 tsconfig.json 中：
```json
{
  "compilerOptions": {
    "strict": true,
    // 但關閉某些檢查
    "noUnusedLocals": false,
    "noUnusedParameters": false
  }
}
```

---

## 建議流程

### 方案 A: 立即全部修正（2-3 小時）
1. 使用 sed 批量修正 req 參數
2. 手動修正 Prisma JSON 問題（~15 處）
3. 清理未使用的代碼
4. 測試

### 方案 B: 分階段修正（推薦）
**Week 1**: 修正 req 參數類型
- 創建 AuthRequest 類型 ✓（已完成）
- 批量替換 controllers
- 測試 API 功能

**Week 2**: 修正 Prisma JSON 和其他類型問題
- 處理 JSON 欄位
- 修正 role.guard.ts
- 修正 error handling

**Week 3**: 代碼清理
- 移除未使用的 imports
- 移除未使用的變數
- 最終測試

---

## 完成清單

- [ ] 創建 AuthRequest 類型定義 ✓（已完成）
- [ ] 修正所有 controller 的 req 參數（~70 處）
- [ ] 修正 Prisma JSON null 問題（~15 處）
- [ ] 清理未使用的變數（~25 處）
- [ ] 移除未使用的 imports（~10 處）
- [ ] 運行 type-check 確認 0 錯誤
- [ ] 測試 API 功能
- [ ] 更新文檔

---

## 相關文檔

- `BACKEND_STRICT_MODE.md` - 完整的技術文檔
- `BACKEND_STRICT_QUICK_GUIDE.md` - 本指南（快速參考）
- `TYPESCRIPT_UNIFICATION.md` - TypeScript 統一報告
