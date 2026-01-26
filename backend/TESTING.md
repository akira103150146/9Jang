# 測試指南

## 資料庫連接測試

驗證 Prisma Schema 正確映射現有表結構：

```bash
pnpm test:db
```

這個測試會：
- 測試資料庫連接
- 驗證所有表（Account 和 Cramschool 模組）可訪問
- 測試關聯查詢（`include`，對應 Django 的 `select_related`）
- 測試多對多關聯（對應 Django 的 `prefetch_related`）
- 測試複雜查詢（過濾、排序）
- 測試聚合查詢（對應 Django 的 `annotate`）
- 測試 JSON 欄位

## API 兼容性測試

確保所有 API 端點與 Django 版本的響應格式一致：

```bash
pnpm test:e2e
```

這個測試會：
- 測試所有 API 端點的路由存在
- 驗證認證要求
- 驗證請求格式驗證（Zod schema）
- 驗證響應格式（分頁、錯誤等）

## 單元測試

運行單元測試：

```bash
pnpm test
```

## 測試覆蓋率

生成測試覆蓋率報告：

```bash
pnpm test:cov
```

## 注意事項

1. **資料庫連接測試**需要有效的 `DATABASE_URL` 環境變數
2. **API 測試**需要應用程序運行（或使用測試資料庫）
3. 某些測試需要有效的認證 token，目前主要測試路由存在和錯誤處理

## 手動測試 API

### 使用 curl

```bash
# 登入
curl -X POST http://localhost:3000/api/account/login \
  -H "Content-Type: application/json" \
  -d '{"username": "your_username", "password": "your_password"}'

# 獲取當前用戶（需要 token）
curl -X GET http://localhost:3000/api/account/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 獲取學生列表
curl -X GET http://localhost:3000/api/cramschool/students?page=1&page_size=10 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 使用 Postman 或類似工具

1. 設置基礎 URL: `http://localhost:3000/api`
2. 在 Headers 中添加 `Authorization: Bearer YOUR_ACCESS_TOKEN`
3. 測試各個端點
