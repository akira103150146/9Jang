# Django → NestJS 遷移狀態報告

## 總覽

本報告總結了從 Django 遷移到 NestJS 的進度。根據計劃文件，大部分功能已經完成實現。

## 階段 1：核心業務模組 ✅ 已完成

### 1.1 AttendanceViewSet ✅
- **Controller**: `packages/backend/src/cramschool/controllers/attendances.controller.ts` ✅
- **Service**: `packages/backend/src/cramschool/services/attendances.service.ts` ✅
- **Schema**: `packages/shared/src/schemas/attendance.schema.ts` ✅
- **功能**: 基本 CRUD、restore、include_deleted 查詢參數、軟刪除 ✅

### 1.2 SessionRecordViewSet ✅
- **Controller**: `packages/backend/src/cramschool/controllers/sessions.controller.ts` ✅
- **Service**: `packages/backend/src/cramschool/services/sessions.service.ts` ✅
- **Schema**: `packages/shared/src/schemas/session.schema.ts` ✅
- **功能**: 基本 CRUD、關聯查詢優化 ✅

### 1.3 Students.attendance_and_leaves ✅
- **端點**: `GET /cramschool/students/:id/attendance_and_leaves` ✅
- **實現位置**: `packages/backend/src/cramschool/services/students.service.ts:762` ✅
- **功能**: 返回學生的所有出席記錄和請假記錄 ✅

### 1.4 Courses.student_status 和 get_resources ✅
- **端點**: 
  - `GET /cramschool/courses/:id/student-status` ✅
  - `GET /cramschool/courses/:id/resources` ✅
- **實現位置**: `packages/backend/src/cramschool/services/courses.service.ts:142, 223` ✅
- **功能**: 統計課程中學生的出席/請假/暫停狀態，返回課程綁定的所有教學資源 ✅

## 階段 2：題庫相關功能 ⚠️ 部分完成

### 2.1 Questions 匯入/匯出功能 ⚠️

#### 已完成 ✅
- `GET /cramschool/questions/search-chapters` - 搜尋章節 ✅
- `GET /cramschool/questions/source-options` - 題目來源選項 ✅
- `GET /cramschool/questions/:id/export-to-latex` - 導出 LaTeX ✅
- `GET /cramschool/questions/:id/export-to-markdown` - 導出 Markdown ✅

#### 未完成 ❌
- `POST /cramschool/questions/preview-from-word` - 預覽 Word ❌
- `POST /cramschool/questions/import-from-word` - 匯入 Word ❌
- `POST /cramschool/questions/preview-from-markdown` - 預覽 Markdown ❌
- `POST /cramschool/questions/import-from-markdown` - 匯入 Markdown ❌

**說明**: Word 和 Markdown 匯入功能需要遷移 Python 工具函數：
- `backend/cramschool/word_importer.py` (715 行)
- `backend/cramschool/markdown_importer.py` (362 行)

這些功能依賴多個 Python 庫（`docx`, `textract`, `officemath2latex` 等），遷移到 TypeScript/NestJS 需要：
1. 尋找對應的 Node.js 庫或實現
2. 處理文件上傳（multipart/form-data）
3. 處理 Word 文件解析（.docx 和 .doc 格式）
4. 處理數學方程式轉換（OMML → LaTeX）
5. 處理圖片提取和保存

**建議**: 這是一個複雜的任務，可能需要單獨的實施計劃。

### 2.2 ErrorLogViewSet ✅
- **Controller**: `packages/backend/src/cramschool/controllers/error-logs.controller.ts` ✅
- **Service**: `packages/backend/src/cramschool/services/error-logs.service.ts` ✅
- **Schema**: `packages/shared/src/schemas/error-log.schema.ts` ✅
- **功能**: 基本 CRUD、restore、upload_images、reorder_images、import_to_question_bank ✅

### 2.3 StudentMistakeNoteViewSet ✅
- **Controller**: `packages/backend/src/cramschool/controllers/student-mistake-notes.controller.ts` ✅
- **Service**: `packages/backend/src/cramschool/services/student-mistake-notes.service.ts` ✅
- **Schema**: `packages/shared/src/schemas/student-mistake-note.schema.ts` ✅
- **功能**: 基本 CRUD、restore、upload_images、reorder_images、import_to_question_bank ✅

### 2.4 ErrorLogImageViewSet & StudentMistakeNoteImageViewSet ✅
- **Controllers**: 
  - `packages/backend/src/cramschool/controllers/error-log-images.controller.ts` ✅
  - `packages/backend/src/cramschool/controllers/student-mistake-note-images.controller.ts` ✅
- **Services**: 對應的 service 文件 ✅
- **功能**: 基本 CRUD 操作 ✅

## 階段 3：輔助功能模組 ✅ 已完成

### 3.1 SubjectViewSet ✅
- **Controller**: `packages/backend/src/cramschool/controllers/subjects.controller.ts` ✅
- **Service**: `packages/backend/src/cramschool/services/subjects.service.ts` ✅
- **Schema**: `packages/shared/src/schemas/subject.schema.ts` ✅
- **功能**: 基本 CRUD、權限控制（學生/會計不可見） ✅

### 3.2 HashtagViewSet ✅
- **Controller**: `packages/backend/src/cramschool/controllers/hashtags.controller.ts` ✅
- **Service**: `packages/backend/src/cramschool/services/hashtags.service.ts` ✅
- **Schema**: `packages/shared/src/schemas/hashtag.schema.ts` ✅
- **功能**: 基本 CRUD ✅

### 3.3 QuestionTagViewSet ✅
- **Controller**: `packages/backend/src/cramschool/controllers/question-tags.controller.ts` ✅
- **Service**: `packages/backend/src/cramschool/services/question-tags.service.ts` ✅
- **Schema**: `packages/shared/src/schemas/question-tag.schema.ts` ✅
- **功能**: 基本 CRUD ✅

### 3.4 StudentAnswerViewSet ✅
- **Controller**: `packages/backend/src/cramschool/controllers/student-answers.controller.ts` ✅
- **Service**: `packages/backend/src/cramschool/services/student-answers.service.ts` ✅
- **Schema**: `packages/shared/src/schemas/student-answer.schema.ts` ✅
- **功能**: 基本 CRUD、restore ✅

### 3.5 RestaurantViewSet ✅
- **Controller**: `packages/backend/src/cramschool/controllers/restaurants.controller.ts` ✅
- **Service**: `packages/backend/src/cramschool/services/restaurants.service.ts` ✅
- **Schema**: `packages/shared/src/schemas/restaurant.schema.ts` ✅
- **功能**: 基本 CRUD ✅

### 3.6 GroupOrderViewSet ✅
- **Controller**: `packages/backend/src/cramschool/controllers/group-orders.controller.ts` ✅
- **Service**: `packages/backend/src/cramschool/services/group-orders.service.ts` ✅
- **Schema**: `packages/shared/src/schemas/group-order.schema.ts` ✅
- **功能**: 基本 CRUD、complete action ✅

### 3.7 OrderViewSet ✅
- **Controller**: `packages/backend/src/cramschool/controllers/orders.controller.ts` ✅
- **Service**: `packages/backend/src/cramschool/services/orders.service.ts` ✅
- **Schema**: `packages/shared/src/schemas/order.schema.ts` ✅
- **功能**: 基本 CRUD、restore、查詢參數過濾（group_order, student, include_deleted） ✅

### 3.8 OrderItemViewSet ✅
- **Controller**: `packages/backend/src/cramschool/controllers/order-items.controller.ts` ✅
- **Service**: `packages/backend/src/cramschool/services/order-items.service.ts` ✅
- **Schema**: `packages/shared/src/schemas/order-item.schema.ts` ✅
- **功能**: 基本 CRUD ✅

### 3.9 ContentTemplateViewSet ✅
- **Controller**: `packages/backend/src/cramschool/controllers/content-templates.controller.ts` ✅
- **Service**: `packages/backend/src/cramschool/services/content-templates.service.ts` ✅
- **Schema**: `packages/shared/src/schemas/content-template.schema.ts` ✅
- **功能**: 基本 CRUD、查詢參數過濾 ✅

## 階段 4：Resources 和 Account 擴展 ✅ 已完成

### 4.1 Resources 自定義 Actions ✅
- **端點**:
  - `POST /cramschool/resources/:id/bind-to-course` - 綁定/解除綁定課程 ✅
  - `POST /cramschool/resources/:id/export` - 匯出資源 (PDF/HTML) ✅
  - `POST /cramschool/resources/:id/grade` - 評分提交 ✅
- **實現位置**: `packages/backend/src/cramschool/controllers/resources.controller.ts:97, 116, 124` ✅
- **功能**: 所有自定義 actions 已實現 ✅

### 4.2 Account 模組擴展 ✅
- **端點**:
  - `POST /account/switch-role` - 切換角色 ✅
  - `POST /account/reset-role` - 重置角色 ✅
  - `POST /account/impersonate-user` - 模擬用戶 ✅
- **實現位置**: 
  - Controller: `packages/backend/src/account/account.controller.ts:78, 87, 95` ✅
  - Service: `packages/backend/src/account/account.service.ts:269, 292, 349` ✅
- **功能**: 所有擴展功能已實現 ✅

## 總結

### 已完成 ✅
- **階段 1**: 100% 完成
- **階段 2**: 約 70% 完成（缺少 Word/Markdown 匯入功能）
- **階段 3**: 100% 完成
- **階段 4**: 100% 完成

### 待完成 ❌
- **階段 2.1**: Word 和 Markdown 匯入功能（4 個端點）
  - `POST /cramschool/questions/preview-from-word`
  - `POST /cramschool/questions/import-from-word`
  - `POST /cramschool/questions/preview-from-markdown`
  - `POST /cramschool/questions/import-from-markdown`

### 建議

Word 和 Markdown 匯入功能的遷移是一個複雜的任務，建議：

1. **評估優先級**: 確認這些功能的使用頻率和重要性
2. **技術調研**: 研究 Node.js 生態系統中的替代方案
3. **分階段實施**: 
   - 先實施 Markdown 匯入（相對簡單）
   - 再實施 Word 匯入（更複雜）
4. **考慮替代方案**: 
   - 是否可以在後端保留 Python 微服務處理這些功能？
   - 或者使用現有的 Python 服務通過 API 調用？

## 模組註冊狀態

所有控制器和服務都已正確註冊在 `packages/backend/src/cramschool/cramschool.module.ts` 中 ✅
