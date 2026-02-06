# PDF 講義上傳功能

## 功能概述

此功能允許老師上傳 PDF 講義到課程,並控制學生的可見性和下載權限。學生可以在自己報名的課程中檢視有權限的 PDF 講義。

## 已完成的實作

### 1. 資料庫 Schema (✅ 完成)

新增了兩個資料表:
- `cramschool_course_pdf`: 儲存 PDF 基本資訊
- `cramschool_course_pdf_student_groups`: PDF 與學生群組的多對多關聯

**重要**: 需要執行 migration 來建立資料表:
```bash
cd backend
npx prisma migrate dev --name add_course_pdf
```

### 2. Shared Schema (✅ 完成)

建立了 `shared/src/schemas/course-pdf.schema.ts`,定義了:
- `CoursePdfSchema`: 完整的 PDF 資料結構
- `CreateCoursePdfDto`: 上傳時的 DTO
- `UpdateCoursePdfDto`: 更新時的 DTO

### 3. Backend Service (✅ 完成)

`backend/src/cramschool/services/course-pdfs.service.ts` 提供以下功能:
- `uploadPdf()`: 老師上傳 PDF
- `getPdfsForStudent()`: 學生取得可見的 PDF 列表
- `getPdfsForTeacher()`: 老師取得課程的所有 PDF
- `viewPdf()`: 檢視 PDF (返回檔案流)
- `downloadPdf()`: 下載 PDF (需要權限)
- `deletePdf()`: 刪除 PDF (軟刪除)
- `toggleDownload()`: 切換下載權限
- `updatePdf()`: 更新 PDF 資訊

### 4. Backend Controller (✅ 完成)

`backend/src/cramschool/controllers/course-pdfs.controller.ts` 提供以下 API:

#### POST `/cramschool/courses/:courseId/pdfs/upload`
上傳 PDF 檔案
- **權限**: 老師、管理員
- **參數**: 
  - `file`: PDF 檔案 (multipart/form-data)
  - `title`: 標題 (必填)
  - `description`: 描述 (可選)
  - `student_group_ids`: 可見的學生群組 ID 陣列 (可選)
  - `is_visible_to_all`: 是否所有學生可見 (boolean)
  - `allow_download`: 是否允許下載 (boolean, 預設 false)

#### GET `/cramschool/courses/:courseId/pdfs`
取得課程的 PDF 列表
- **權限**: 所有角色
- 學生只能看到有權限的 PDF
- 老師和管理員可以看到所有 PDF

#### GET `/cramschool/courses/:courseId/pdfs/:pdfId/view`
檢視 PDF (在瀏覽器中開啟)
- **權限**: 有權限的學生、老師、管理員
- 返回 PDF 檔案流,設定為 inline 顯示

#### GET `/cramschool/courses/:courseId/pdfs/:pdfId/download`
下載 PDF
- **權限**: 有權限且 PDF 允許下載
- 返回 PDF 檔案流,設定為 attachment 下載

#### PUT `/cramschool/courses/:courseId/pdfs/:pdfId/download`
切換下載權限
- **權限**: 老師、管理員
- **參數**: `{ allow_download: boolean }`

#### PUT `/cramschool/courses/:courseId/pdfs/:pdfId`
更新 PDF 資訊
- **權限**: 老師、管理員
- **參數**: 標題、描述、群組設定等

#### DELETE `/cramschool/courses/:courseId/pdfs/:pdfId`
刪除 PDF (軟刪除)
- **權限**: 老師、管理員

### 5. 單元測試 (✅ 完成)

- `course-pdfs.service.spec.ts`: 15 個測試,全部通過 ✅
- `course-pdfs.controller.spec.ts`: 14 個測試,全部通過 ✅

## 權限控制

### 可見性控制
- **所有學生可見** (`is_visible_to_all = true`): 所有報名該課程的學生都可以看到
- **特定群組可見** (`is_visible_to_all = false`): 只有在指定學生群組中的學生可以看到

### 下載權限
- **不允許下載** (`allow_download = false`): 只能在線檢視,不能下載
- **允許下載** (`allow_download = true`): 可以檢視也可以下載

### 角色權限
- **老師**: 可以上傳、修改、刪除自己課程的 PDF
- **管理員**: 可以操作所有課程的 PDF
- **學生**: 只能檢視有權限的 PDF,下載需要額外權限

## 檔案存儲

PDF 檔案存放在 `{MEDIA_ROOT}/course_pdfs/{courseId}/` 目錄下。

預設 `MEDIA_ROOT` 為 `./media`,可透過環境變數設定。

## 安全性

1. **檔案類型驗證**: 只接受 `application/pdf` MIME type
2. **檔案大小限制**: 20MB
3. **路徑遍歷防護**: 使用時間戳和清理後的檔名
4. **權限驗證**: 每次請求都驗證使用者權限
5. **軟刪除**: 刪除時只設定 `is_active = false`,不刪除實體檔案

## 前端整合建議

### 老師端介面

```typescript
// 上傳 PDF
const uploadPdf = async (courseId: number, file: File, data: {
  title: string;
  description?: string;
  studentGroupIds?: number[];
  isVisibleToAll: boolean;
  allowDownload: boolean;
}) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', data.title);
  if (data.description) formData.append('description', data.description);
  formData.append('student_group_ids', JSON.stringify(data.studentGroupIds || []));
  formData.append('is_visible_to_all', String(data.isVisibleToAll));
  formData.append('allow_download', String(data.allowDownload));

  const response = await axios.post(
    `/api/cramschool/courses/${courseId}/pdfs/upload`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
  );
  return response.data;
};

// 切換下載權限
const toggleDownload = async (courseId: number, pdfId: number, allowDownload: boolean) => {
  const response = await axios.put(
    `/api/cramschool/courses/${courseId}/pdfs/${pdfId}/download`,
    { allow_download: allowDownload }
  );
  return response.data;
};
```

### 學生端介面

```typescript
// 取得課程 PDF 列表
const getPdfs = async (courseId: number) => {
  const response = await axios.get(`/api/cramschool/courses/${courseId}/pdfs`);
  return response.data;
};

// 在 iframe 中檢視 PDF
<iframe 
  :src="`/api/cramschool/courses/${courseId}/pdfs/${pdfId}/view`" 
  width="100%" 
  height="600px"
  style="border: none;"
/>

// 下載 PDF (如果允許)
const downloadPdf = (courseId: number, pdfId: number) => {
  window.open(`/api/cramschool/courses/${courseId}/pdfs/${pdfId}/download`, '_blank');
};
```

## 待辦事項

1. **執行 Migration**: 
   ```bash
   cd backend
   npx prisma migrate dev --name add_course_pdf
   ```

2. **建立 media 目錄** (如果不存在):
   ```bash
   mkdir -p backend/media/course_pdfs
   ```

3. **設定環境變數** (可選):
   ```env
   MEDIA_ROOT=./media
   MEDIA_URL=/media/
   ```

4. **前端實作**:
   - 老師端: PDF 上傳表單、列表管理、權限設定
   - 學生端: PDF 列表、檢視器 (iframe 或 PDF.js)

## 測試

執行測試:
```bash
cd backend
npm test -- course-pdfs.service.spec.ts
npm test -- course-pdfs.controller.spec.ts
```

所有測試應該都通過 ✅

## 注意事項

1. PDF 檔案預設不可下載,只能線上檢視
2. 老師可以透過後台切換下載權限
3. 刪除 PDF 是軟刪除,實體檔案仍保留在伺服器上
4. 建議使用雲端存儲 (如 AWS S3) 來存放 PDF 檔案,而不是本地檔案系統
5. 前端可以使用 PDF.js 提供更好的 PDF 檢視體驗

## API 文件

完整的 API 文件可以在 Swagger UI 中查看:
```
http://localhost:3000/api/docs
```

所有 API 都有完整的 Swagger 註解,包含請求/回應範例。
