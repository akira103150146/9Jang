# 管理員查看課程教學資源功能

## 功能說明

管理員現在可以在課程管理頁面查看所有老師綁定在課程的教學資源（文件）。

## 實作內容

### 後端變更

1. **新增 API Endpoint** (`backend/cramschool/api_views.py`)
   - 在 `CourseViewSet` 中添加了 `get_resources` action
   - URL: `/api/cramschool/courses/{course_id}/resources/`
   - 方法: `GET`
   - 權限:
     - 管理員：可以查看所有課程的資源
     - 老師：只能查看自己課程的資源
     - 其他角色：無權限

### 前端變更

1. **API 方法** (`frontend/src/services/api.js`)
   - 添加 `courseAPI.getResources(id)` 方法

2. **課程列表頁面** (`frontend/src/views/CourseList.vue`)
   - 管理員視圖新增「查看文件」按鈕
   - 點擊後會打開 CourseDetailModal

3. **課程詳情彈窗** (`frontend/src/components/CourseDetailModal.vue`)
   - 修改為使用新的 API endpoint 獲取課程資源
   - 管理員模式：
     - 標題顯示「課程文件」
     - 只顯示「查看」按鈕
     - 隱藏「新增」、「編輯」、「刪除」、「解除綁定」按鈕
   - 老師模式：
     - 標題顯示「課程管理」
     - 顯示所有操作按鈕

## 使用方式

### 管理員操作流程

1. 以管理員身份登入系統
2. 進入「課程與時段管理」頁面（`/courses`）
3. 在任一課程卡片上，點擊「查看文件」按鈕
4. 彈出視窗會顯示該課程所有綁定的教學資源
5. 可以點擊「查看」按鈕查看資源詳情

### 老師操作流程

1. 以老師身份登入系統
2. 進入「課程與時段管理」頁面（`/courses`）
3. 在自己的課程卡片上，點擊「查看課程內容」按鈕
4. 彈出視窗會顯示課程的所有教學資源
5. 可以進行完整的管理操作（新增、編輯、刪除、綁定、解除綁定）

## 測試建議

### 手動測試步驟

1. **準備測試數據**
   - 創建至少一個課程
   - 以老師身份創建並綁定教學資源到課程

2. **測試管理員查看功能**
   - 以管理員身份登入
   - 進入課程列表頁面
   - 驗證「查看文件」按鈕顯示
   - 點擊按鈕，驗證彈窗正確顯示
   - 驗證教學資源列表正確顯示
   - 驗證只有「查看」按鈕，沒有編輯/刪除按鈕
   - 點擊「查看」按鈕，驗證能正確跳轉到資源詳情頁

3. **測試老師功能不受影響**
   - 以老師身份登入
   - 進入課程列表頁面
   - 驗證「查看課程內容」按鈕顯示
   - 點擊按鈕，驗證彈窗正確顯示
   - 驗證所有操作按鈕都顯示
   - 測試各項操作功能正常

4. **測試權限控制**
   - 嘗試以老師身份訪問其他老師的課程資源
   - 驗證權限被正確限制

### API 測試

使用以下 curl 命令測試 API：

```bash
# 獲取課程資源（需要替換 {course_id} 和 {access_token}）
curl -X GET \
  "http://localhost:8000/api/cramschool/courses/{course_id}/resources/" \
  -H "Authorization: Bearer {access_token}"
```

預期響應：
```json
[
  {
    "resource_id": 1,
    "title": "教學資源標題",
    "mode": "HANDOUT",
    "course_names": ["課程名稱"],
    "created_by_name": "老師名稱",
    "created_at": "2024-01-01T00:00:00Z",
    ...
  }
]
```

## 注意事項

1. 管理員只能查看資源，不能編輯或刪除
2. 如果管理員需要編輯資源，需要使用「模擬老師」功能切換身份
3. 教學資源的詳細查看頁面權限由資源編輯器本身控制

## 相關文件

- API 文檔: `API_DOCUMENTATION.md`
- 前端路由: `frontend/src/router/index.js`
- 後端 API Views: `backend/cramschool/api_views.py`
