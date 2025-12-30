# 移除舊模型總結

## 概述

本次更新移除了 `Quiz`、`Exam`、`CourseMaterial` 三個舊模型，統一使用可擴充的 `LearningResource` 模型。同時將 `LearningResource` 的 `course` (ForeignKey) 改為 `courses` (ManyToManyField)，使教學資源可以屬於多個課程。

## 主要變更

### 1. 後端模型變更

#### 移除的模型
- `Quiz` - 測驗模型
- `Exam` - 考卷模型  
- `CourseMaterial` - 上課講義模型

#### 更新的模型

**`LearningResource`**
- 將 `course` (ForeignKey) 改為 `courses` (ManyToManyField)
- 現在支援一個資源綁定到多個課程

**`AssessmentSubmission`**
- 移除 `quiz` 和 `exam` 外鍵
- 新增 `learning_resource` 外鍵指向 `LearningResource`
- 更新 Meta 的 verbose_name

### 2. 數據遷移

**遷移文件：**
- `0024_remove_learningresource_course_and_more.py` - 將 course 改為 courses (ManyToMany)
- `0025_remove_exam_course_remove_exam_created_by_and_more.py` - 刪除舊模型

### 3. 後端 API 變更

#### 移除的 ViewSets
- `QuizViewSet`
- `ExamViewSet`
- `CourseMaterialViewSet`

#### 移除的生成函數
- `generate_quiz()`
- `generate_exam()`
- `generate_material()`

#### 保留的功能
- `generate_resource()` - 統一的資源生成 API
- `LearningResourceViewSet` - 統一的資源管理 API
  - 新增 `bind_to_course` action - 綁定/解綁資源到課程
  - 更新查詢邏輯以支援多對多關係

#### 移除的 Serializers
- `QuizSerializer`
- `QuizDetailSerializer`
- `ExamSerializer`
- `ExamDetailSerializer`
- `CourseMaterialSerializer`

#### 更新的 Serializers

**`LearningResourceSerializer`**
- 新增 `course_ids` (write_only) - 用於綁定課程
- `course_name` 改為 `course_names` - 返回多個課程名稱
- 更新 create/update 方法以處理多對多關係

### 4. 路由變更

#### 移除的路由
```python
router.register(r'quizzes', QuizViewSet)
router.register(r'exams', ExamViewSet)
router.register(r'materials', CourseMaterialViewSet)
```

#### 移除的 URL 端點
```python
path('generate-quiz/', generate_quiz, name='generate-quiz')
path('generate-exam/', generate_exam, name='generate-exam')
path('generate-material/', generate_material, name='generate-material')
```

### 5. Admin 變更

移除的 Admin 類別：
- `QuizAdmin`
- `ExamAdmin`
- `CourseMaterialAdmin`

更新的 Admin：
- `AssessmentSubmissionAdmin` - 顯示 `learning_resource` 而非 `quiz` 和 `exam`

### 6. 前端變更

#### 更新的組件
- `CourseDetailModal.vue` - 移除講義、測驗、考卷的分類標籤，統一顯示教學資源
  - 新增「新增教學資源」功能
  - 新增「從已有資源綁定」功能
  - 新增「解除綁定」功能

#### API 服務變更 (`api.js`)

**移除的 API（提供向後兼容性）：**
```javascript
// 以下 API 現在內部使用 learningResourceAPI
export const quizAPI = learningResourceAPI
export const examAPI = learningResourceAPI
export const courseMaterialAPI = learningResourceAPI
```

**移除的生成 API：**
```javascript
// 已移除
generationAPI.generateQuiz()
generationAPI.generateExam()
generationAPI.generateMaterial()
```

## 使用指南

### 創建教學資源

**方式一：在課程管理中直接創建**
```javascript
await learningResourceAPI.create({
  title: '第一次小考',
  mode: 'ONLINE_QUIZ',
  course_ids: [1, 2],  // 同時綁定到多個課程
  structure: [],
  settings: {}
})
```

**方式二：綁定已有資源到課程**
```javascript
await axios.post(`/api/resources/${resourceId}/bind-to-course/`, {
  course_id: 1,
  action: 'add'  // 或 'remove' 解除綁定
})
```

### 查詢資源

**查詢特定課程的資源：**
```javascript
await learningResourceAPI.getAll({ course: courseId })
```

**查詢特定模式的資源：**
```javascript
await learningResourceAPI.getAll({ mode: 'ONLINE_QUIZ' })
```

## 向後兼容性

### 前端舊代碼
如果有舊組件使用 `quizAPI`、`examAPI` 或 `courseMaterialAPI`，它們會自動重定向到 `learningResourceAPI`，但建議逐步遷移到新的 API。

### 資料遷移
由於這是開發階段，舊資料會被直接刪除。如果是生產環境，需要：
1. 先將 Quiz/Exam/CourseMaterial 資料遷移到 LearningResource
2. 建立課程關聯（多對多）
3. 再執行刪除遷移

## 優勢

1. **統一管理** - 所有教學資源使用同一個模型和 API
2. **更靈活** - 資源可以屬於多個課程
3. **易擴充** - 新增資源類型只需添加 mode，不需要新建模型
4. **簡化維護** - 減少重複代碼和模型

## 注意事項

1. 所有舊的 Quiz、Exam、CourseMaterial 資料已被刪除
2. 如果有視圖或組件仍引用舊 API，需要更新為 `learningResourceAPI`
3. `AssessmentSubmission` 現在關聯到 `LearningResource` 而非 Quiz/Exam
4. 課程綁定現在是多對多關係，需要使用 `course_ids` 而非 `course_id`

## 後續工作建議

1. 更新所有引用舊 API 的前端組件
2. 移除 ExamManagement.vue、QuizManagement.vue、CourseMaterialManagement.vue
3. 創建統一的 ResourceManagement.vue
4. 更新相關文檔和使用說明
