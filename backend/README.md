# NestJS 後端

## 設置

1. 安裝依賴：
```bash
pnpm install
```

2. 設置環境變數（創建 `.env` 文件）：

**選項 A：使用 Docker（推薦）**

```bash
# 在項目根目錄啟動 PostgreSQL
docker-compose up -d postgres

# 或使用快速啟動腳本
./scripts/start-postgres.sh

# 複製 Docker 環境變數配置
cp .env.docker .env
```

**選項 B：使用本地 PostgreSQL**

```env
DATABASE_URL=postgresql://user:password@localhost:5432/database_name
```

**其他環境變數：**

```env
JWT_SECRET=your-secret-key-here
JWT_ACCESS_TOKEN_LIFETIME_HOURS=1
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7

PORT=3000
NODE_ENV=development

CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

詳細說明請參考 [DOCKER_SETUP.md](./DOCKER_SETUP.md)

3. 生成 Prisma Client：
```bash
pnpm prisma:generate
```

4. 運行開發服務器：
```bash
pnpm start:dev
```

## 使用共享 Schema

所有 DTO 和類型都從 `@9jang/shared` 導入：

```typescript
import { CreateStudentDto, Student, StudentQuery } from '@9jang/shared';
import { CreateStudentSchema, StudentQuerySchema } from '@9jang/shared';
```

使用 `ZodValidationPipe` 進行驗證：

```typescript
@Post('students')
async createStudent(
  @Body(new ZodValidationPipe(CreateStudentSchema)) createDto: CreateStudentDto,
): Promise<Student> {
  // ...
}
```

## Prisma 使用

### 從現有資料庫生成 Schema

```bash
# 從現有資料庫生成 schema（首次設置時）
pnpm prisma:db:pull

# 生成 Prisma Client
pnpm prisma:generate
```

### Prisma Studio（可選）

```bash
pnpm prisma:studio
```

## API 端點

### Account 模組
- `POST /api/account/login` - 登入
- `POST /api/account/logout` - 登出
- `POST /api/account/token/refresh` - 刷新 token
- `GET /api/account/users/me` - 當前用戶
- `POST /api/account/change-password` - 修改密碼
- `GET /api/account/users` - 用戶列表
- `GET /api/account/users/:id` - 用戶詳情
- `GET /api/account/roles` - 角色列表
- `GET /api/account/audit-logs` - 審計日誌

### Cramschool 模組
- `GET /api/cramschool/students` - 學生列表
- `GET /api/cramschool/students/:id` - 學生詳情
- `POST /api/cramschool/students` - 創建學生
- `PUT /api/cramschool/students/:id` - 更新學生
- `DELETE /api/cramschool/students/:id` - 刪除學生

- `GET /api/cramschool/teachers` - 老師列表
- `GET /api/cramschool/courses` - 課程列表
- `GET /api/cramschool/enrollments` - 報名列表
- `GET /api/cramschool/questions` - 題目列表
- `GET /api/cramschool/resources` - 資源列表

- `POST /api/cramschool/upload-image` - 上傳圖片
- `POST /api/cramschool/generate-resource` - 生成資源

## 資料庫遷移

Prisma Schema 已經映射到現有 Django 資料庫表結構。如果需要修改：

1. 修改 `prisma/schema.prisma`
2. 運行 `pnpm prisma:generate` 重新生成 Prisma Client

注意：由於使用現有資料庫，不應運行 `prisma migrate`，除非需要創建新表。
