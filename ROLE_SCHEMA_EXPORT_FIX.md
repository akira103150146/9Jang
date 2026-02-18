# 修正 Role Schema 導出問題

## 問題描述

在瀏覽器中出現錯誤:
```
user.schema.ts:79 Uncaught SyntaxError: The requested module does not provide an export named 'Role'
```

## 問題原因

TypeScript 的 type-only exports (如 `type Role`) 無法通過 `export { ... } from` 語法在 Vite 的 ESM 開發模式中正確 re-export。

## 解決方案

採用**方式 3:移除 re-export**,讓使用者直接從 `role.schema.ts` 導入。

## 修改的檔案

### 1. `shared/src/schemas/user.schema.ts`
- **移除**: 第 75-79 行的 Role 和 RolePermission re-export

### 2. `shared/package.json`
- **新增**: `exports` 欄位,支援子路徑導入 (`@9jang/shared/schemas/*`)

### 3. `backend/src/account/roles.service.ts`
- **修改**: 從 `@9jang/shared/schemas/role.schema` 導入 Role 相關類型

### 4. `backend/src/account/roles.controller.ts`
- **修改**: 從 `@9jang/shared/schemas/role.schema` 導入 Role 相關類型

## 新的導入方式

```typescript
// ✅ 正確 - 直接從 role.schema 導入
import { 
  Role, 
  RolePermission,
  CreateRoleDto,
  UpdateRoleDto 
} from '@9jang/shared/schemas/role.schema'

// ❌ 不再支援 - 從 shared 根目錄導入
import { Role } from '@9jang/shared'
```

## 測試步驟

1. 重新啟動開發伺服器:
   ```bash
   # 停止前端服務 (Ctrl+C)
   cd frontend
   pnpm run dev
   ```

2. 如果還有問題,清除快取:
   ```bash
   rm -rf frontend/node_modules/.vite
   pnpm run dev
   ```

3. 驗證登入頁面可以正常顯示

## 優點

1. ✅ 避免 TypeScript type re-export 的問題
2. ✅ 更清晰的依賴關係
3. ✅ 符合現代 ES Modules 最佳實踐
4. ✅ 不會有循環依賴的風險

## 注意事項

未來如果需要使用 Role 相關類型,請直接從 `@9jang/shared/schemas/role.schema` 導入,不要從 `@9jang/shared` 根目錄導入。
