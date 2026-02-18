# 修復後端編譯錯誤 - 完成報告

## 執行日期
2026-02-13

## 問題描述

後端啟動失敗,有 43 個 TypeScript 編譯錯誤:
1. 26 個 controller 檔案的 `Permission` 裝飾器未使用
2. Course service 缺少 `subjectId` 欄位
3. Course service 測試檔案缺少 `subject_id` 欄位

## 解決方案

### 1. 批次添加 @Permission() 裝飾器

為所有 cramschool controllers 的每個 HTTP method 添加 `@Permission()` 裝飾器:

```typescript
@Get()
@Permission({ resource: '/cramschool/xxx' })
async getXxx() { ... }

@Post()
@Permission({ resource: '/cramschool/xxx' })
async createXxx() { ... }
```

**處理的檔案**: 26 個 controller 檔案
- attendances.controller.ts
- content-templates.controller.ts
- course-pdfs.controller.ts
- courses.controller.ts
- enrollment-periods.controller.ts
- enrollments.controller.ts
- error-log-images.controller.ts
- error-logs.controller.ts
- fees.controller.ts
- group-orders.controller.ts
- hashtags.controller.ts
- leaves.controller.ts
- media.controller.ts
- order-items.controller.ts
- orders.controller.ts
- question-tags.controller.ts
- questions.controller.ts
- resources.controller.ts
- restaurants.controller.ts
- sessions.controller.ts
- student-answers.controller.ts
- student-groups.controller.ts
- student-mistake-note-images.controller.ts
- student-mistake-notes.controller.ts
- subjects.controller.ts
- teachers.controller.ts

### 2. 修復 Course Service

#### courses.service.ts

**修復 1**: 在 `createCourse` 方法中添加 `subjectId`:

```typescript
const course = await this.prisma.cramschoolCourse.create({
  data: {
    courseName: createDto.course_name,
    subjectId: createDto.subject_id,  // ← 新增
    teacherId: createDto.teacher_id,
    startTime: createDto.start_time,
    endTime: createDto.end_time,
    dayOfWeek: createDto.day_of_week,
    feePerSession: createDto.fee_per_session,
    status: createDto.status || 'Active',
  },
});
```

**修復 2**: 修正 `count` 方法的參數:

```typescript
// 修改前
this.prisma.cramschoolCourse.count({})

// 修改後
this.prisma.cramschoolCourse.count(undefined)
```

這是因為當沒有條件時,Prisma 的 `count()` 方法應該傳入 `undefined` 而不是空物件 `{}`。

#### courses.service.spec.ts

在測試用的 `createDto` 中添加 `subject_id`:

```typescript
const createDto = {
  course_name: '數學基礎班',
  subject_id: 1,  // ← 新增
  teacher_id: 1,
  status: 'Active' as const,
  start_time: '18:00',
  end_time: '20:00',
  day_of_week: 'Mon' as const,
  fee_per_session: 500,
};
```

## 執行結果

✅ 所有 26 個 controller 已成功添加 `@Permission()` 裝飾器
✅ Course service 的 TypeScript 錯誤已修復
✅ Course service 測試檔案已修復

## 下一步

後端服務現在應該可以正常啟動:

```bash
cd backend
pnpm run start:dev
```

等待看到:
```
[Nest] LOG [NestApplication] Nest application successfully started
[Nest] LOG Application is running on: http://localhost:3000
```

## 測試登入

後端啟動後,使用以下帳號測試登入:

- **帳號**: `superadmin`
- **密碼**: `ChangeMe123!`

登入 API:
```bash
POST http://192.168.200.137:3000/account/login
Content-Type: application/json

{
  "email": "superadmin",
  "password": "ChangeMe123!"
}
```

## 權限系統說明

現在所有 API 都受到 PermissionGuard 保護:

1. **SUPERADMIN** - 擁有所有權限,不受限制
2. **其他角色** - 根據 `AccountRolePermission` 表中的設定進行權限檢查

要為新角色配置權限,請使用角色管理 API:

```bash
# 取得所有 API 資源
GET /account/api-resources/tree

# 為角色設定權限
PUT /account/roles/:roleId/permissions
```

## 相關文件

- [RBAC 系統實作完成報告](./RBAC_IMPLEMENTATION_COMPLETE.md)
- [專案初始化指南](./PROJECT_INITIALIZATION_GUIDE.md)
