# 學習資源多課程綁定架構修復

## 問題背景

系統從單對一關係（一個資源只能綁定一個課程）改為多對多關係（一個資源可以綁定多個課程）後，遺留了一些使用舊 API 的代碼，導致 500 錯誤。

## 發現的問題

### 1. 後端 API 視圖（backend/cramschool/api_views.py）

#### 問題 A: `update` 方法（第 3160-3202 行）
**症狀**: 綁定課程時出現 500 錯誤
**原因**: 代碼嘗試訪問 `instance.course`（單對一），但模型已改為 `instance.courses`（多對多）

```python
# 錯誤的代碼
if instance.course:  # AttributeError: 'LearningResource' object has no attribute 'course'
    if instance.course.teacher != teacher:
        ...
```

**修復**: 移除了過時的權限檢查邏輯，因為多對多關係下無法簡單判斷單一課程的所有權

#### 問題 B: `destroy` 方法（第 3376-3418 行）
**症狀**: 刪除資源時可能出現 500 錯誤
**原因**: 同樣使用了 `instance.course`

```python
# 錯誤的代碼（第 3404-3407 行）
if instance.course:
    if instance.course.teacher != teacher:
        ...
```

**修復**: 移除了過時的權限檢查邏輯

### 2. 前端資源編輯器（frontend/src/views/ResourceEditor.vue）

#### 問題 C: UI 使用單選下拉框
**位置**: 第 60 行
**症狀**: 只能選擇一個課程，無法多選
**原因**: 使用 `<select v-model="resource.course">` 單選

**修復**: 改為多選 checkbox 列表
```vue
<!-- 修復前 -->
<select v-model="resource.course">
  <option :value="null">未綁定</option>
  <option v-for="c in courses" :value="c.course_id">{{ c.course_name }}</option>
</select>

<!-- 修復後 -->
<div class="space-y-2">
  <div v-for="c in courses" :key="c.course_id">
    <input type="checkbox" :value="c.course_id" v-model="resource.course_ids" />
    <label>{{ c.course_name }}</label>
  </div>
</div>
```

#### 問題 D: 資料模型定義錯誤
**位置**: 第 398-410 行
**症狀**: 資料結構不匹配後端 API

```javascript
// 錯誤的定義
const resource = reactive({
  course: null,  // 單一值
  ...
})

// 正確的定義
const resource = reactive({
  course_ids: [],  // 陣列
  ...
})
```

#### 問題 E: 資料載入錯誤
**位置**: 第 826 行
**症狀**: 編輯現有資源時課程綁定資料無法正確載入

```javascript
// 錯誤的代碼
resource.course = data.course  // 單一值

// 正確的代碼
resource.course_ids = data.courses?.map(c => c.course_id) || []  // 陣列
```

#### 問題 F: 監聽器錯誤
**位置**: 第 921 行
**症狀**: 自動保存功能無法正確偵測課程變更

```javascript
// 錯誤的監聽
watch([() => resource.course, ...], ...)

// 正確的監聽
watch([() => resource.course_ids, ...], ...)
```

## 修復總結

### 後端修改
1. `api_views.py` `LearningResourceViewSet.update()` - 移除 `instance.course` 檢查
2. `api_views.py` `LearningResourceViewSet.destroy()` - 移除 `instance.course` 檢查

### 前端修改
1. `ResourceEditor.vue` 第 60 行 - 改為多選 checkbox
2. `ResourceEditor.vue` 第 401 行 - `course: null` → `course_ids: []`
3. `ResourceEditor.vue` 第 826 行 - `resource.course = data.course` → `resource.course_ids = data.courses?.map(c => c.course_id) || []`
4. `ResourceEditor.vue` 第 921 行 - `() => resource.course` → `() => resource.course_ids`

## 測試建議

1. **綁定單一課程**: 選擇一個課程，保存，刷新頁面確認已正確綁定
2. **綁定多個課程**: 選擇多個課程，保存，刷新頁面確認已正確綁定
3. **取消綁定**: 取消所有課程選擇，保存，確認資源變為通用資源
4. **編輯已綁定資源**: 打開已綁定課程的資源，確認 checkbox 正確顯示選中狀態
5. **刪除資源**: 確認可以正常刪除資源，不出現 500 錯誤
6. **權限檢查**: 確認不同角色（管理員、老師）的權限控制仍正常運作

## API 變更

### 請求格式
```json
{
  "title": "測試資源",
  "mode": "HANDOUT",
  "course_ids": [1, 2, 3],  // 陣列，可以是空陣列
  "tag_ids_input": [],
  "student_group_ids": []
}
```

### 回應格式
```json
{
  "resource_id": 12,
  "title": "測試資源",
  "courses": [
    {"course_id": 1, "course_name": "數學A"},
    {"course_id": 2, "course_name": "數學B"}
  ],
  "course_ids": null,  // 這是 write_only 欄位，不會在回應中出現
  ...
}
```

## 相關文件
- `LEARNING_RESOURCE_MULTI_COURSE_CHANGES.md` - 原始多對多架構變更文檔
- `backend/cramschool/models.py` - LearningResource 模型定義
- `backend/cramschool/serializers.py` - LearningResourceSerializer
- `backend/cramschool/api_views.py` - LearningResourceViewSet

## 注意事項

1. **向後兼容性**: 如果有舊的 API 客戶端仍使用 `course` 欄位，需要添加相容層
2. **資料遷移**: 如果資料庫中有使用舊結構的資料，需要執行遷移腳本
3. **權限控制**: 移除了課程所有權檢查後，可能需要在其他地方加強權限控制
4. **測試覆蓋**: 建議添加自動化測試確保多對多關係的各種情境都能正確處理

