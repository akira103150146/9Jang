# Backend TypeScript Strict Mode 升級

## 升級日期
2026-02-04

## 變更內容

### 修正前 (tsconfig.json)
```json
{
  "compilerOptions": {
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false
  }
}
```

### 修正後 (tsconfig.json)
```json
{
  "compilerOptions": {
    "strict": true,                        // ✓ 啟用所有嚴格檢查
    "noUnusedLocals": true,               // ✓ 禁止未使用的局部變數
    "noUnusedParameters": true,           // ✓ 禁止未使用的參數
    "noFallthroughCasesInSwitch": true,   // ✓ switch 必須有 break
    "noImplicitReturns": true,            // ✓ 函數必須明確返回
    "forceConsistentCasingInFileNames": true  // ✓ 檔名大小寫一致
  }
}
```

### `strict: true` 包含的檢查項目
- ✅ `strictNullChecks` - null/undefined 檢查
- ✅ `noImplicitAny` - 禁止隱式 any
- ✅ `strictBindCallApply` - 嚴格的 bind/call/apply
- ✅ `strictFunctionTypes` - 嚴格的函數類型
- ✅ `strictPropertyInitialization` - 類屬性必須初始化
- ✅ `alwaysStrict` - 使用嚴格模式
- ✅ `useUnknownInCatchVariables` - catch 變數類型為 unknown

---

## 錯誤統計

### 總計
- **111 個 TypeScript 錯誤**需要修正

### 錯誤分類

#### 1. 隱式 any 類型（~70 個，63%）
**問題**：`req` 參數沒有明確類型
```typescript
// ❌ 錯誤
@Request() req
```

**修正**：
```typescript
// ✓ 正確
@Request() req: Express.Request
```

**影響範圍**：
- Controllers: 所有需要 `@Request()` 裝飾器的方法
- 主要在權限檢查和使用者身份驗證時

#### 2. 未使用的變數/參數（~25 個，22%）
**問題**：宣告但未使用的變數
```typescript
// ❌ 錯誤
const userId = 123;  // 未使用
```

**修正方案**：
```typescript
// 方案 A: 移除未使用的變數
// (刪除該行)

// 方案 B: 如果是參數，使用底線前綴
async someMethod(_userId: number) {
  // 表示這個參數是必需的但不使用
}
```

#### 3. Prisma JSON 欄位的 null 問題（~15 個，14%）
**問題**：Prisma 的 JSON 欄位不接受 `null`
```typescript
// ❌ 錯誤
content: someValue  // someValue 可能是 null
```

**修正**：
```typescript
// ✓ 正確 - 使用 Prisma.DbNull
content: someValue ?? Prisma.DbNull

// 或使用 JsonNull
content: someValue as Prisma.InputJsonValue
```

#### 4. 未使用的 imports（~10 個，9%）
**問題**：import 但未使用的模組
```typescript
// ❌ 錯誤
import { BadRequestException } from '@nestjs/common';
// 但沒有使用 BadRequestException
```

**修正**：移除未使用的 import

---

## 修正優先順序

### 🔴 高優先（必須修正）
1. **隱式 any 類型** - 嚴重影響類型安全
2. **Prisma JSON null 問題** - 會導致運行時錯誤

### 🟡 中優先（建議修正）
3. **未使用的變數** - 可能是忘記使用的邏輯

### 🟢 低優先（清理代碼）
4. **未使用的 imports** - 只是代碼清潔度問題

---

## 詳細錯誤列表

### Controllers 中的 req 參數（70 個）

#### account/account.controller.ts
- Line 42: `@Request() req` 
- Line 58: `@Request() req`
- Line 65: `@Request() req`
- Line 81: `@Request() req`
- Line 90: `@Request() req`
- Line 98: `@Request() req`
- Line 112: `@Request() req`

#### cramschool/controllers/*.controller.ts
- content-templates.controller.ts: 5 處
- courses.controller.ts: 1 處
- error-log-images.controller.ts: 1 處
- error-logs.controller.ts: 4 處
- group-orders.controller.ts: 3 處
- orders.controller.ts: 1 處
- questions.controller.ts: 7 處
- resources.controller.ts: 5 處
- restaurants.controller.ts: 1 處
- student-groups.controller.ts: 1 處
- student-mistake-note-images.controller.ts: 5 處
- student-mistake-notes.controller.ts: 8 處
- students.controller.ts: 2 處
- subjects.controller.ts: 4 處

### Services 中的問題

#### content-templates.service.ts
- Line 87, 126: Prisma JSON null 問題

#### error-logs.service.ts
- Line 232, 234, 239: Prisma JSON null 問題

#### questions-import.service.ts
- Line 58-60: 未使用的變數 (userId, userRole, difficulty)
- Line 86: Prisma JSON null 問題
- Line 156-157: 未使用的變數

### 其他問題

#### Guards & Filters
- common/guards/role.guard.ts: Line 8 - undefined 不能分配給 string | symbol
- common/filters/http-exception.filter.ts: 未使用的 import

#### Scripts
- scripts/flush-db.ts: Line 153 - 未使用的 tx 參數
- scripts/seed-data.ts: Line 185, 450 - 未使用的變數
- test-db-connection.ts: Line 131 - Prisma JSON null 問題

---

## 修正策略

### 階段 1: 定義類型（建議）
創建通用類型定義檔案：

```typescript
// src/types/express.types.ts
import { Request as ExpressRequest } from 'express';

export interface AuthenticatedRequest extends ExpressRequest {
  user: {
    userId: number;
    username: string;
    role: string;
  };
}
```

### 階段 2: 批量修正 req 參數
使用 find & replace：

```typescript
// 查找: @Request\(\) req
// 替換: @Request() req: AuthenticatedRequest
```

### 階段 3: 修正 Prisma JSON 問題
在所有涉及 JSON 欄位的地方：

```typescript
import { Prisma } from '@prisma/client';

// 方案 A
content: value ?? Prisma.DbNull

// 方案 B  
content: value as Prisma.InputJsonValue
```

### 階段 4: 清理未使用的代碼
- 移除未使用的 imports
- 移除或重命名未使用的變數（加 `_` 前綴）

---

## 預期效果

### ✅ 優點
1. **類型安全**：捕捉更多潛在錯誤
2. **代碼品質**：強制良好的編碼習慣
3. **IDE 支援**：更好的自動完成和錯誤提示
4. **維護性**：未來更容易重構和維護
5. **統一標準**：與 Frontend 的 strict 模式一致

### ⚠️ 挑戰
1. **初期工作量**：需要修正 111 個錯誤
2. **學習曲線**：團隊需要適應嚴格模式
3. **Prisma 類型**：JSON 欄位需要特別處理

---

## 建議修正方式

### 選項 A: 逐步修正（建議）
```json
// 暫時允許某些錯誤，逐步修正
{
  "compilerOptions": {
    "strict": true,
    // 暫時關閉某些檢查
    "noUnusedLocals": false,
    "noUnusedParameters": false
  }
}
```

修正優先順序：
1. 先修正 req 參數類型（最多）
2. 再修正 Prisma JSON 問題（可能導致錯誤）
3. 最後清理未使用的代碼

### 選項 B: 一次全部修正
- 優點：一次性解決所有問題
- 缺點：需要較長時間，可能影響其他開發

### 選項 C: 回退到部分 strict
```json
{
  "compilerOptions": {
    "strict": true,
    // 但明確關閉某些檢查
    "strictNullChecks": false  // 暫時關閉
  }
}
```

---

## 快速修正指南

### 1. 修正 req 參數（最常見）

**步驟 1**: 創建類型定義
```typescript
// src/types/request.types.ts
import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    username: string;
    role: string;
  };
}
```

**步驟 2**: 在 controllers 中使用
```typescript
import { AuthRequest } from '@/types/request.types';

@Get()
async getAll(@Request() req: AuthRequest) {
  const userId = req.user?.userId;
  // ...
}
```

### 2. 修正 Prisma JSON 問題

```typescript
import { Prisma } from '@prisma/client';

// 場景 A: 可能為 null 的值
content: someValue ?? Prisma.DbNull

// 場景 B: 確定有值但類型不匹配
content: someValue as Prisma.InputJsonValue

// 場景 C: 使用 JsonNull
import { Prisma, JsonNull } from '@prisma/client';
content: someValue ?? (null as JsonNull)
```

### 3. 處理未使用的變數

```typescript
// 如果真的不需要，直接刪除
// const unused = 123;

// 如果是必需的參數但不使用，加 _ 前綴
async method(_userId: number, name: string) {
  // 只使用 name
}

// 或使用 eslint-disable 註釋（不推薦）
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const kept = 123;
```

---

## 檢查進度

```bash
# 查看剩餘錯誤數量
cd backend
pnpm run type-check 2>&1 | grep "error TS" | wc -l

# 查看特定類型的錯誤
pnpm run type-check 2>&1 | grep "TS7006"  # implicit any
pnpm run type-check 2>&1 | grep "TS6133"  # unused variable
pnpm run type-check 2>&1 | grep "TS2322"  # type mismatch
```

---

## 回退方式（如果需要）

```bash
# 恢復原始設定
cd /home/akira/github/9Jang/backend
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false
  }
}
```

```bash
pnpm run type-check  # 應該沒有錯誤
```

---

## 結論

Backend 已成功啟用 strict mode！

**當前狀態**：
- ✅ TypeScript strict 模式已啟用
- ⚠️ 有 111 個錯誤需要修正
- 📝 已建立詳細的修正指南

**建議**：
採用**逐步修正**策略，先修正高優先級的錯誤（req 參數和 Prisma JSON），再逐步清理代碼。

**相關文檔**：
- `BACKEND_STRICT_MODE.md` - 本文檔
- `TYPESCRIPT_UNIFICATION.md` - TypeScript 統一報告
