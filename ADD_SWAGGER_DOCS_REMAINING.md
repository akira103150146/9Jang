# 剩餘 Controllers Swagger 文檔添加指南

## 已完成 ✅
1. **Account Controller** - 100% 完成（13 個 endpoints）
2. **Students Controller** - 100% 完成（12 個 endpoints）
3. **Questions Controller** - 100% 完成（14 個 endpoints）

## 進行中 🔄

### 3. Error Logs Controller
需要添加的 endpoints：
- GET / - 取得錯題列表
- GET /:id - 取得單一錯題
- POST / - 建立錯題記錄
- PUT /:id - 更新錯題
- DELETE /:id - 刪除錯題
- POST /:id/restore - 恢復錯題
- POST /:id/import-to-question-bank - 匯入到題庫
- POST /:id/upload-images - 上傳錯題圖片
- POST /:id/reorder-images - 重新排序圖片

### 4. Teachers Controller
基本 CRUD + 特殊功能

### 5. Courses Controller
課程管理相關 API

## 待完成 ⏳

### 其他 21 個 Controllers（基本文檔）

只需添加基本的 `@ApiOperation` 和 `@ApiResponse`：

```typescript
@Get()
@ApiBearerAuth('JWT-auth')
@ApiOperation({ summary: '取得XXX列表' })
@ApiResponse({ status: 200, description: '成功' })
@ApiResponse({ status: 401, description: '未授權' })

@Get(':id')
@ApiBearerAuth('JWT-auth')
@ApiOperation({ summary: '取得單一XXX' })
@ApiParam({ name: 'id', type: Number })
@ApiResponse({ status: 200, description: '成功' })
@ApiResponse({ status: 404, description: '不存在' })

@Post()
@ApiBearerAuth('JWT-auth')
@ApiOperation({ summary: '建立XXX' })
@ApiResponse({ status: 201, description: '建立成功' })
@ApiResponse({ status: 400, description: '驗證失敗' })

@Put(':id')
@ApiBearerAuth('JWT-auth')
@ApiOperation({ summary: '更新XXX' })
@ApiParam({ name: 'id', type: Number })
@ApiResponse({ status: 200, description: '更新成功' })
@ApiResponse({ status: 404, description: '不存在' })

@Delete(':id')
@ApiBearerAuth('JWT-auth')
@ApiOperation({ summary: '刪除XXX' })
@ApiParam({ name: 'id', type: Number })
@ApiResponse({ status: 200, description: '刪除成功' })
@ApiResponse({ status: 404, description: '不存在' })
```

### Controllers 列表：

1. ✅ students.controller.ts
2. ✅ questions.controller.ts
3. 🔄 error-logs.controller.ts
4. ⏳ teachers.controller.ts
5. ⏳ courses.controller.ts
6. ⏳ resources.controller.ts
7. ⏳ orders.controller.ts
8. ⏳ group-orders.controller.ts
9. ⏳ restaurants.controller.ts
10. ⏳ order-items.controller.ts
11. ⏳ student-mistake-notes.controller.ts
12. ⏳ student-mistake-note-images.controller.ts
13. ⏳ error-log-images.controller.ts
14. ⏳ content-templates.controller.ts
15. ⏳ attendances.controller.ts
16. ⏳ leaves.controller.ts
17. ⏳ sessions.controller.ts
18. ⏳ enrollments.controller.ts
19. ⏳ enrollment-periods.controller.ts
20. ⏳ fees.controller.ts
21. ⏳ subjects.controller.ts
22. ⏳ student-groups.controller.ts
23. ⏳ hashtags.controller.ts
24. ⏳ question-tags.controller.ts
25. ⏳ student-answers.controller.ts
26. ⏳ media.controller.ts

## 快速添加腳本

可以使用以下模板快速添加基本文檔：

```bash
# 為單個 controller 添加基本文檔
# 1. 在每個 @Get(), @Post() 等前面添加 @ApiBearerAuth('JWT-auth')
# 2. 添加 @ApiOperation({ summary: '...' })
# 3. 添加基本的 @ApiResponse
```

## 預估時間

- **詳細文檔**（如 Students, Questions）：每個 controller 約 30-60 分鐘
- **基本文檔**（只有 summary 和基本 response）：每個 controller 約 5-10 分鐘

**總計剩餘時間**：
- 3 個詳細 controller：約 2-3 小時
- 21 個基本 controller：約 2-3 小時
- **總計**：約 4-6 小時

## 建議

1. **優先完成前 5 個詳細文檔**（最常用的 API）
2. **其他 21 個先添加基本文檔**（讓所有 API 都有說明）
3. **後續根據使用頻率逐步完善**

## 當前狀態

✅ **3/26 controllers 完成詳細文檔**  
⏳ **23/26 controllers 待添加文檔**

繼續加油！🚀
