# Prisma 命令參考

## 資料庫結構管理

### `prisma db push` - 快速同步 Schema（開發環境推薦）

直接將 `schema.prisma` 的結構推送到數據庫，不創建遷移文件：

```bash
pnpm prisma:db:push
```

**使用場景**：
- 開發環境快速設置
- 測試 schema 變更
- 不需要遷移歷史記錄

**注意**：
- 會直接修改數據庫結構
- 不會創建遷移文件
- 不適合生產環境

### `prisma migrate dev` - 創建並應用遷移

創建遷移文件並應用到數據庫：

```bash
pnpm prisma:migrate:dev --name migration_name
```

**使用場景**：
- 需要版本控制的遷移
- 團隊協作
- 生產環境部署

**注意**：
- 會創建遷移文件在 `prisma/migrations/` 目錄
- 適合需要追蹤數據庫變更歷史的項目

### `prisma migrate deploy` - 應用遷移（生產環境）

應用所有待執行的遷移：

```bash
pnpm prisma:migrate:deploy
```

**使用場景**：
- 生產環境部署
- CI/CD 流程
- 應用已創建的遷移文件

### `prisma db pull` - 從數據庫拉取 Schema

從現有數據庫生成 `schema.prisma`：

```bash
pnpm prisma:db:pull
```

**使用場景**：
- 從 Django 數據庫生成 Prisma Schema
- 同步現有數據庫結構
- 初始化項目

**注意**：
- 會覆蓋現有的 `schema.prisma`
- 建議先備份現有 schema

## 開發工具

### `prisma generate` - 生成 Prisma Client

根據 `schema.prisma` 生成 TypeScript 類型定義：

```bash
pnpm prisma:generate
```

**自動執行**：
- 安裝依賴時（`postinstall` 腳本）
- 修改 schema 後需要重新生成

### `prisma studio` - 可視化數據庫管理

打開 Prisma Studio，可視化查看和編輯數據庫：

```bash
pnpm prisma:studio
```

## 完整工作流程

### 從 Django 數據庫初始化

```bash
# 1. 從 Django 數據庫拉取 schema
pnpm prisma:db:pull

# 2. 生成 Prisma Client
pnpm prisma:generate

# 3. 驗證連接
pnpm test:db
```

### 創建新的表結構（如果 schema 已準備好）

```bash
# 方法 1: 快速推送（開發環境）
pnpm prisma:db:push

# 方法 2: 創建遷移（生產環境）
pnpm prisma:migrate:dev --name init
```

### 修改 Schema 後

```bash
# 1. 修改 prisma/schema.prisma

# 2. 推送變更（開發環境）
pnpm prisma:db:push

# 或創建遷移（生產環境）
pnpm prisma:migrate:dev --name add_new_field

# 3. 重新生成 Client
pnpm prisma:generate
```

## 與 Django 的對應

| Django | Prisma |
|--------|--------|
| `python manage.py makemigrations` | `prisma migrate dev` |
| `python manage.py migrate` | `prisma migrate deploy` 或 `prisma db push` |
| `python manage.py migrate --fake` | - |
| `python manage.py showmigrations` | `prisma migrate status` |
| `python manage.py sqlmigrate` | 查看 `prisma/migrations/` 目錄 |

## 注意事項

1. **Schema 一致性**：確保 `schema.prisma` 與 Django 模型一致
2. **數據遷移**：`db push` 和 `migrate` 只創建結構，不遷移數據
3. **備份**：在生產環境操作前務必備份數據庫
4. **開發 vs 生產**：
   - 開發環境：使用 `db push` 快速迭代
   - 生產環境：使用 `migrate` 進行版本控制
