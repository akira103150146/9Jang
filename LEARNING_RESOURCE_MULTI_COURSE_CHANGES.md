# 教學資源多課程綁定功能更新

## 概述

本次更新實現了教學資源可以屬於多個課程的功能，並更新了課程管理介面，移除了講義、隨堂測驗、考卷的分類標籤，統一顯示綁定到該課程的所有教學資源。

## 主要變更

### 1. 後端模型變更

#### `LearningResource` 模型 (`backend/cramschool/models.py`)

**變更前：**
```python
course = models.ForeignKey(
    'Course',
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name='learning_resources',
    verbose_name='所屬課程'
)
```

**變更後：**
```python
courses = models.ManyToManyField(
    'Course',
    related_name='learning_resources',
    blank=True,
    verbose_name='所屬課程'
)
```

- 將 `course` (ForeignKey) 改為 `courses` (ManyToManyField)
- 教學資源現在可以同時屬於多個課程

### 2. 資料庫遷移

**遷移文件：** `backend/cramschool/migrations/0024_remove_learningresource_course_and_more.py`

- 移除舊的 `course` ForeignKey 欄位
- 新增 `courses` ManyToManyField 欄位

### 3. API 序列化器變更

#### `LearningResourceSerializer` (`backend/cramschool/serializers.py`)

**新增欄位：**
- `course_ids`: 用於寫入操作的課程ID列表
- `course_names`: 用於讀取操作，返回所有綁定課程的名稱列表

**變更方法：**
- `create()`: 支援透過 `course_ids` 批量綁定課程
- `update()`: 支援更新課程綁定關係

### 4. API ViewSet 變更

#### `LearningResourceViewSet` (`backend/cramschool/api_views.py`)

**查詢變更：**
- 更新 `get_queryset()` 以支援多對多關係的篩選
- 老師可以看到所有自己課程相關的資源
- 學生可以看到所有已報名課程相關的資源

**新增 Action：**
```python
@action(detail=True, methods=['post'], url_path='bind-to-course')
def bind_to_course(self, request, pk=None):
    """
    將教學資源綁定到課程（或從課程解除綁定）
    
    請求參數：
    - course_id: 課程ID
    - action: 'add' 或 'remove'
    """
```

**權限檢查更新：**
- `create()`: 驗證所有指定的課程是否都屬於當前老師
- `partial_update()`: 檢查資源是否至少綁定到一個屬於當前老師的課程

### 5. 前端變更

#### `CourseDetailModal.vue` (`frontend/src/components/CourseDetailModal.vue`)

**介面變更：**
- **移除**：講義、隨堂測驗、考卷的分類標籤（Tabs）
- **新增**：統一顯示綁定到該課程的所有教學資源
- **新增**：「新增教學資源」按鈕 - 創建新資源並自動綁定到當前課程
- **新增**：「從已有資源綁定」按鈕 - 從現有資源中選擇並綁定到當前課程

**新增功能：**
1. **創建新資源**
   - 可直接在課程管理中創建新的教學資源
   - 自動綁定到當前課程

2. **綁定已有資源**
   - 顯示所有未綁定到當前課程的教學資源
   - 點擊即可綁定到當前課程

3. **解除綁定**
   - 可將資源從當前課程解除綁定
   - 資源本身不會被刪除

4. **資源類型標籤**
   - 每個資源旁顯示其類型（講義模式、線上測驗模式等）
   - 顯示資源所屬的所有課程名稱

## API 端點

### 現有端點（已更新）

```
GET /api/cramschool/resources/?course={course_id}
```
- 獲取綁定到特定課程的教學資源

```
POST /api/cramschool/resources/
```
請求體示例：
```json
{
  "title": "第一次小考",
  "mode": "ONLINE_QUIZ",
  "course_ids": [1, 2, 3],
  "structure": [],
  "settings": {}
}
```

### 新增端點

```
POST /api/cramschool/resources/{resource_id}/bind-to-course/
```
請求體：
```json
{
  "course_id": 1,
  "action": "add"  // 或 "remove"
}
```

響應：
```json
{
  "detail": "已將資源綁定到課程 高職一數學C",
  "resource_id": 5,
  "course_ids": [1, 2]
}
```

## 使用場景

### 場景 1：老師在課程管理中創建新資源

1. 開啟課程詳情 Modal
2. 點擊「新增教學資源」
3. 填寫標題和選擇模式類型
4. 點擊「創建」
5. 資源自動綁定到當前課程

### 場景 2：老師將已有資源綁定到課程

1. 開啟課程詳情 Modal
2. 點擊「從已有資源綁定」
3. 從列表中選擇想要綁定的資源
4. 資源立即綁定到當前課程

### 場景 3：資源屬於多個課程

1. 老師創建一個「期中考」資源
2. 在「國一數學」課程中綁定此資源
3. 在「國二數學」課程中也綁定此資源
4. 「期中考」資源現在同時顯示在兩個課程中

### 場景 4：解除資源與課程的綁定

1. 在課程詳情 Modal 中查看資源列表
2. 點擊資源的「解除綁定」按鈕
3. 確認操作
4. 資源從當前課程中移除（但不會被刪除）

## 向後兼容性

- 舊的 `Quiz`、`Exam`、`CourseMaterial` 模型仍然保留
- 可以逐步遷移到新的 `LearningResource` 模型
- 建議：未來統一使用 `LearningResource` 模型

## 測試建議

1. **創建資源測試**
   - 在課程管理中創建新資源
   - 驗證資源是否正確綁定到課程

2. **綁定資源測試**
   - 從已有資源中選擇並綁定
   - 驗證綁定是否成功

3. **多課程綁定測試**
   - 將同一資源綁定到多個課程
   - 在不同課程中查看資源列表

4. **解除綁定測試**
   - 解除資源與課程的綁定
   - 驗證資源仍然存在但不再顯示在該課程中

5. **權限測試**
   - 驗證老師只能在自己的課程中操作
   - 驗證學生只能看到已報名課程的資源

## 注意事項

1. **資料遷移**：現有的 `LearningResource` 資料中的 `course` 欄位已被移除，如果有舊資料需要手動遷移

2. **API 相容性**：前端需要使用 `course_ids` 而非 `course` 來指定課程

3. **查詢效能**：使用 `prefetch_related('courses')` 來優化多對多查詢

4. **刪除行為**：解除綁定不會刪除資源本身，只移除關聯關係

## 未來建議

1. 考慮完全遷移到 `LearningResource` 模型，棄用 `Quiz`、`Exam`、`CourseMaterial`
2. 添加批量綁定/解綁功能
3. 添加資源複製功能，讓老師可以複製資源到不同課程
4. 添加資源模板功能，方便重複使用
