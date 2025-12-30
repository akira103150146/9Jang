# 管理員查看課程教學資源功能 - 實作總結

## 需求

管理員應該要能夠在課程管理頁面查看所有老師綁定在課程的所有文件。

## 實作完成

### ✅ 後端變更

**文件**: `backend/cramschool/api_views.py`

在 `CourseViewSet` 類別中新增了 `get_resources` action：

```python
@action(detail=True, methods=['get'], url_path='resources')
def get_resources(self, request, pk=None):
    """
    獲取課程的所有教學資源
    管理員可以查看所有老師綁定在課程的教學資源
    老師只能查看自己的課程資源
    """
```

**功能特點**：
- URL: `/api/cramschool/courses/{course_id}/resources/`
- 方法: `GET`
- 權限控制：
  - ✅ 管理員：可以查看任何課程的所有教學資源
  - ✅ 老師：只能查看自己課程的教學資源
  - ❌ 其他角色：無權限訪問

### ✅ 前端變更

#### 1. API 服務層 (`frontend/src/services/api.js`)

在 `courseAPI` 對象中新增方法：

```javascript
// 獲取課程的所有教學資源
getResources: (id) => api.get(`/cramschool/courses/${id}/resources/`)
```

#### 2. 課程列表頁面 (`frontend/src/views/CourseList.vue`)

**變更內容**：
- 為管理員添加「查看文件」按鈕
- 按鈕與老師的「查看課程內容」按鈕功能相同，都會打開 CourseDetailModal
- 保留原有的「編輯」按鈕

**UI 變化**：
```vue
<!-- 管理員視圖 -->
<button @click="openCourseDetail(course)">查看文件</button>
<router-link :to="`/courses/edit/${course.course_id}`">編輯</router-link>
```

#### 3. 課程詳情彈窗 (`frontend/src/components/CourseDetailModal.vue`)

**變更內容**：

1. **數據獲取方式改進**：
   - 從使用 `learningResourceAPI.getAll({ course: courseId })` 
   - 改為使用 `courseAPI.getResources(courseId)`
   - 新方法直接通過課程 API 獲取資源，權限控制更清晰

2. **UI 適配不同角色**：
   - **標題動態顯示**：
     - 老師：「課程名稱 - 課程管理」
     - 管理員：「課程名稱 - 課程文件」
   
   - **操作按鈕權限控制**：
     - 老師可見：新增教學資源、從已有資源綁定、編輯、刪除、解除綁定
     - 管理員可見：僅「查看」按鈕
     - 兩者都可以：查看資源詳情

**代碼示例**：
```vue
<!-- 標題 -->
<h3>{{ course?.course_name }} - {{ isTeacher ? '課程管理' : '課程文件' }}</h3>

<!-- 操作按鈕（僅老師可見） -->
<div v-if="isTeacher" class="flex gap-2 mb-4">
  <button @click="showCreateResourceModal = true">新增教學資源</button>
  <button @click="showBindResourceModal = true">從已有資源綁定</button>
</div>

<!-- 資源操作按鈕 -->
<button @click="viewResource(resource)">查看</button>
<template v-if="isTeacher">
  <button @click="editResource(resource)">編輯</button>
  <button @click="unbindResource(resource)">解除綁定</button>
  <button @click="deleteResource(resource)">刪除</button>
</template>
```

## 使用流程

### 管理員使用流程

1. 以管理員身份登入系統
2. 導航至「課程與時段管理」頁面 (`/courses`)
3. 在任一課程卡片上，點擊「查看文件」按鈕
4. 彈出視窗顯示該課程的所有教學資源
5. 可以點擊「查看」按鈕查看資源詳情（只讀模式）

### 老師使用流程（保持不變）

1. 以老師身份登入系統
2. 導航至「課程與時段管理」頁面 (`/courses`)
3. 在自己的課程卡片上，點擊「查看課程內容」按鈕
4. 彈出視窗顯示課程的所有教學資源
5. 可以進行完整的管理操作

## 權限設計

| 角色 | 查看課程資源 | 新增資源 | 編輯資源 | 刪除資源 | 綁定/解綁資源 |
|------|------------|---------|---------|---------|-------------|
| 管理員 | ✅ 所有課程 | ❌ | ❌ | ❌ | ❌ |
| 老師 | ✅ 自己的課程 | ✅ | ✅ | ✅ | ✅ |
| 學生 | ❌ | ❌ | ❌ | ❌ | ❌ |

**注意**：管理員如需編輯資源，可使用「模擬老師」功能切換身份。

## 技術細節

### 後端 API Endpoint

```
GET /api/cramschool/courses/{course_id}/resources/
```

**請求頭**：
```
Authorization: Bearer {access_token}
```

**響應示例**：
```json
[
  {
    "resource_id": 1,
    "title": "數學講義 - 第一章",
    "mode": "HANDOUT",
    "courses": [1],
    "course_names": ["高三數學總複習班"],
    "student_groups": [],
    "student_group_names": [],
    "structure": [...],
    "settings": {...},
    "tags": ["數學", "高三"],
    "tag_ids": [1, 2],
    "created_by": 2,
    "created_by_name": "張老師",
    "is_individualized": false,
    "available_from": null,
    "available_until": null,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-20T14:45:00Z"
  }
]
```

### 前端組件通信

```
CourseList.vue
    ↓ (openCourseDetail)
    ↓ props: { course, isTeacher: !isAdmin }
CourseDetailModal.vue
    ↓ (fetchData)
    ↓ courseAPI.getResources(courseId)
Backend API
```

## 測試檢查清單

- [x] 後端 API endpoint 實作完成
- [x] 前端 API 方法添加
- [x] CourseList.vue 添加管理員按鈕
- [x] CourseDetailModal.vue 適配不同角色
- [x] 代碼無 linter 錯誤
- [x] 權限控制正確實作
- [ ] 手動測試：管理員查看功能
- [ ] 手動測試：老師功能不受影響
- [ ] 手動測試：權限邊界情況

## 相關文件

- 詳細功能說明：`ADMIN_COURSE_RESOURCES_FEATURE.md`
- API 文檔：`API_DOCUMENTATION.md`
- 項目結構：`PROJECT_STRUCTURE.md`

## 後續建議

1. **增強功能**：
   - 可考慮添加資源搜尋/篩選功能
   - 可添加資源統計資訊（如：使用次數、學生完成度等）

2. **UI 優化**：
   - 可添加資源類型圖標
   - 可添加資源狀態標籤（草稿/已發布等）

3. **測試**：
   - 建議添加單元測試
   - 建議添加 E2E 測試

## 完成時間

2024年12月19日
