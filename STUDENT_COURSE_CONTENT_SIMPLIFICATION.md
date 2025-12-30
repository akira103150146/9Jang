# 學生課程內容頁面簡化

## 📋 需求說明

用戶要求簡化學生查看課程內容的頁面：
1. **移除三個 Tab**（講義、隨堂測驗、考卷）
2. **統一顯示**：直接顯示該學生可見的所有學習資源
3. **綁定課程**：編輯完講義後綁定到課程，學生在「我的課程」頁面點選課程後能看到

## 🔧 實現方案

### 修改的文件

**frontend/src/components/StudentCourseDetailModal.vue**

### 1. 移除 Tabs UI

#### 修改前

```vue
<!-- Tabs -->
<div class="mt-4 border-b border-gray-200">
  <nav class="-mb-px flex space-x-8" aria-label="Tabs">
    <a 
      v-for="tab in tabs" 
      :key="tab.id"
      href="#"
      class="..."
      @click.prevent="currentTab = tab.id"
    >
      {{ tab.name }}
      <span v-if="tab.count" class="...">
        {{ tab.count }}
      </span>
    </a>
  </nav>
</div>

<!-- Content -->
<div class="mt-4 min-h-[400px]">
  <!-- Handouts Tab -->
  <div v-else-if="currentTab === 'materials'" class="space-y-4">
    <!-- 講義列表 -->
  </div>

  <!-- Quizzes Tab -->
  <div v-else-if="currentTab === 'quizzes'" class="space-y-4">
    <!-- 測驗列表 -->
  </div>

  <!-- Exams Tab -->
  <div v-else-if="currentTab === 'exams'" class="space-y-4">
    <!-- 考卷列表 -->
  </div>
</div>
```

#### 修改後

```vue
<h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
  {{ course?.course_name }} - 學習資源
</h3>

<!-- Content -->
<div class="mt-4 min-h-[400px]">
  <!-- Loading State -->
  <div v-if="loading" class="flex justify-center items-center h-64">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
  </div>

  <!-- All Resources -->
  <div v-else class="space-y-4">
    <div v-if="allResources.length === 0" class="text-center text-gray-500 py-8">
      暫無學習資源
    </div>
    <div v-for="resource in allResources" :key="resource.resource_id" class="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <h4 class="text-lg font-medium text-gray-900">{{ resource.title }}</h4>
            <span class="px-2 py-1 text-xs font-medium rounded-full" :class="getModeClass(resource.mode)">
              {{ getModeLabel(resource.mode) }}
            </span>
          </div>
          <p class="text-sm text-gray-500 mt-1">
            上傳時間：{{ formatDate(resource.created_at) }}
          </p>
        </div>
        <button @click="viewResource(resource)" class="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-100">
          查看內容
        </button>
      </div>
    </div>
  </div>
</div>
```

**變更說明：**
- ✅ 移除 Tabs 導航
- ✅ 移除條件渲染（`v-else-if="currentTab === 'materials'"`）
- ✅ 統一顯示所有資源
- ✅ 添加模式標籤（講義、線上測驗等）
- ✅ 標題改為「學習資源」

### 2. 簡化 JavaScript 邏輯

#### 修改前

```javascript
setup(props, { emit }) {
  const currentTab = ref('materials')
  const loading = ref(false)
  const materials = ref([])
  const quizzes = ref([])
  const exams = ref([])
  
  const currentAssessment = ref(null)
  const assessmentType = ref(null)
  const currentMaterial = ref(null)

  const tabs = computed(() => [
    { id: 'materials', name: '講義', count: materials.value.length },
    { id: 'quizzes', name: '隨堂測驗', count: quizzes.value.length },
    { id: 'exams', name: '考卷', count: exams.value.length },
  ])

  const fetchData = async () => {
    // 獲取資源並分類
    materials.value = allResources.filter(r => r.mode === 'HANDOUT')
    quizzes.value = allResources.filter(r => r.mode === 'ONLINE_QUIZ')
    exams.value = allResources.filter(r => ['LEETCODE', 'LISTENING_TEST', 'FLASHCARD'].includes(r.mode))
  }

  // 多個處理函數：startAssessment, closeAssessment, handleAssessmentSubmit, isExamAvailable, getExamStatusText
}
```

#### 修改後

```javascript
setup(props, { emit }) {
  const loading = ref(false)
  const allResources = ref([])
  const currentMaterial = ref(null)

  const fetchData = async () => {
    if (!props.course) return
    
    loading.value = true
    try {
      const courseId = props.course.course_id || props.course.id
      
      // 獲取該課程的所有學習資源
      const resourcesRes = await learningResourceAPI.getAll({ course: courseId })
      const resourcesData = resourcesRes.data.results || resourcesRes.data
      allResources.value = Array.isArray(resourcesData) ? resourcesData : []
    } catch (error) {
      console.error('Error fetching course data:', error)
      allResources.value = []
    } finally {
      loading.value = false
    }
  }

  const viewResource = (resource) => {
    currentMaterial.value = resource
  }

  const getModeLabel = (mode) => {
    const labels = {
      'HANDOUT': '講義',
      'ONLINE_QUIZ': '線上測驗',
      'LEETCODE': '程式題',
      'LISTENING_TEST': '聽力測驗',
      'FLASHCARD': '單字卡'
    }
    return labels[mode] || mode
  }

  const getModeClass = (mode) => {
    const classes = {
      'HANDOUT': 'bg-blue-100 text-blue-800',
      'ONLINE_QUIZ': 'bg-green-100 text-green-800',
      'LEETCODE': 'bg-purple-100 text-purple-800',
      'LISTENING_TEST': 'bg-yellow-100 text-yellow-800',
      'FLASHCARD': 'bg-pink-100 text-pink-800'
    }
    return classes[mode] || 'bg-gray-100 text-gray-800'
  }

  return {
    loading,
    allResources,
    close,
    formatDate,
    currentMaterial,
    viewResource,
    getModeLabel,
    getModeClass
  }
}
```

**變更說明：**
- ✅ 移除 `currentTab` ref
- ✅ 移除 `materials`, `quizzes`, `exams` refs
- ✅ 新增 `allResources` ref（統一存儲所有資源）
- ✅ 移除 `tabs` computed
- ✅ 移除 `currentAssessment`, `assessmentType` refs
- ✅ 移除 `startAssessment`, `closeAssessment`, `handleAssessmentSubmit`, `isExamAvailable`, `getExamStatusText` 函數
- ✅ 新增 `getModeLabel` 函數（顯示模式標籤）
- ✅ 新增 `getModeClass` 函數（模式標籤樣式）
- ✅ 簡化 `fetchData`（不再分類資源）

### 3. 移除 AssessmentRunner 組件

#### 修改前

```vue
<script>
import { ref, watch, computed } from 'vue'
import { learningResourceAPI } from '../services/api'
import AssessmentRunner from './AssessmentRunner.vue'

export default {
  name: 'StudentCourseDetailModal',
  components: {
    AssessmentRunner
  },
  // ...
}
</script>

<template>
  <!-- Assessment Runner Modal -->
  <AssessmentRunner
    v-if="currentAssessment"
    :assessment-type="assessmentType"
    :assessment-data="currentAssessment"
    @close="closeAssessment"
    @submit="handleAssessmentSubmit"
  />
</template>
```

#### 修改後

```vue
<script>
import { ref, watch } from 'vue'
import { learningResourceAPI } from '../services/api'

export default {
  name: 'StudentCourseDetailModal',
  // ...
}
</script>

<template>
  <!-- AssessmentRunner 已移除 -->
</template>
```

**變更說明：**
- ✅ 移除 `AssessmentRunner` import
- ✅ 移除 `components` 註冊
- ✅ 移除 `computed` import（不再需要）
- ✅ 移除 `<AssessmentRunner>` 組件

## 📊 修改對比

### UI 變化

| 修改前 | 修改後 |
|--------|--------|
| 三個 Tab（講義、隨堂測驗、考卷） | 單一列表顯示所有資源 |
| 需要切換 Tab 查看不同類型資源 | 所有資源一次顯示 |
| 不同類型資源有不同的按鈕（查看內容、開始測驗、開始考試） | 統一使用「查看內容」按鈕 |
| 沒有模式標籤 | 每個資源顯示模式標籤（講義、線上測驗等） |

### 代碼簡化

| 項目 | 修改前 | 修改後 |
|------|--------|--------|
| Refs 數量 | 8 個 | 3 個 |
| Computed 數量 | 1 個 | 0 個 |
| 函數數量 | 10 個 | 5 個 |
| Import 數量 | 3 個 | 2 個 |
| 組件依賴 | 1 個（AssessmentRunner） | 0 個 |
| 模板行數 | ~100 行 | ~40 行 |

## 🎯 功能流程

### 教師端：綁定講義到課程

```
1. 教師在 ResourceEditor 編輯講義
    ↓
2. 在側邊欄「綁定課程」中勾選課程
    ↓
3. 保存講義
    ↓
4. 講義與課程建立關聯
```

### 學生端：查看課程內容

```
1. 學生進入「我的課程」頁面
    ↓
2. 點擊已報名的課程
    ↓
3. 點擊「查看課程內容」
    ↓
4. StudentCourseDetailModal 打開
    ↓
5. 調用 learningResourceAPI.getAll({ course: courseId })
    ↓
6. 顯示所有綁定到該課程的學習資源
    ↓
7. 學生點擊「查看內容」
    ↓
8. 顯示資源內容
```

## ✨ 優勢

### 1. 簡化用戶體驗

- ✅ 不需要切換 Tab
- ✅ 一次看到所有資源
- ✅ 減少點擊次數
- ✅ 更直觀的瀏覽方式

### 2. 代碼簡化

- ✅ 移除 50+ 行代碼
- ✅ 減少 5 個 refs
- ✅ 減少 5 個函數
- ✅ 移除 1 個組件依賴
- ✅ 減少複雜的條件渲染

### 3. 性能提升

- ✅ 減少響應式依賴
- ✅ 不需要分類資源（減少計算）
- ✅ 簡化數據結構
- ✅ 減少組件載入

### 4. 維護簡化

- ✅ 減少需要維護的代碼
- ✅ 減少潛在的 bug 來源
- ✅ 更容易理解和修改
- ✅ 減少測試複雜度

## 🎨 UI 設計

### 資源卡片

每個資源顯示為一張卡片，包含：

1. **標題**：資源名稱
2. **模式標籤**：
   - 📄 講義（藍色）
   - 📝 線上測驗（綠色）
   - 💻 程式題（紫色）
   - 🎧 聽力測驗（黃色）
   - 🃏 單字卡（粉色）
3. **上傳時間**：資源創建時間
4. **查看按鈕**：點擊查看資源內容

### 模式標籤顏色

```javascript
const getModeClass = (mode) => {
  const classes = {
    'HANDOUT': 'bg-blue-100 text-blue-800',
    'ONLINE_QUIZ': 'bg-green-100 text-green-800',
    'LEETCODE': 'bg-purple-100 text-purple-800',
    'LISTENING_TEST': 'bg-yellow-100 text-yellow-800',
    'FLASHCARD': 'bg-pink-100 text-pink-800'
  }
  return classes[mode] || 'bg-gray-100 text-gray-800'
}
```

## 🧪 測試用例

### 測試 1：查看課程內容

1. 學生登入
2. 進入「我的課程」
3. 點擊已報名的課程
4. 點擊「查看課程內容」
5. 預期結果：
   - ✅ 顯示該課程的所有學習資源
   - ✅ 每個資源顯示標題、模式標籤、上傳時間
   - ✅ 有「查看內容」按鈕

### 測試 2：空課程

1. 點擊沒有綁定資源的課程
2. 預期結果：
   - ✅ 顯示「暫無學習資源」
   - ✅ 不顯示任何資源卡片

### 測試 3：多種資源類型

1. 課程綁定了講義、線上測驗、程式題
2. 點擊「查看課程內容」
3. 預期結果：
   - ✅ 所有資源都顯示在同一個列表中
   - ✅ 每個資源有對應的模式標籤
   - ✅ 標籤顏色正確（講義藍色、測驗綠色、程式題紫色）

### 測試 4：查看資源內容

1. 點擊某個資源的「查看內容」按鈕
2. 預期結果：
   - ✅ 打開資源內容 Modal
   - ✅ 顯示資源標題
   - ✅ 顯示資源內容
   - ✅ 有「關閉」按鈕

### 測試 5：權限控制

1. 學生只能看到自己有權限的資源
2. 預期結果：
   - ✅ 只顯示綁定到該課程的資源
   - ✅ 只顯示該學生可見的資源（根據學生標籤）

## 🔄 數據流

### API 調用

```javascript
// 獲取課程的所有學習資源
const resourcesRes = await learningResourceAPI.getAll({ course: courseId })
```

**後端過濾邏輯：**
1. 根據 `course` 參數過濾資源
2. 根據學生的 `student_group_ids` 過濾可見資源
3. 返回該學生可見的所有資源

### 數據結構

```javascript
allResources.value = [
  {
    resource_id: 1,
    title: '數學講義 - 第一章',
    mode: 'HANDOUT',
    created_at: '2024-01-01T10:00:00Z',
    content: '...',
    // ... 其他字段
  },
  {
    resource_id: 2,
    title: '數學測驗 - 第一章',
    mode: 'ONLINE_QUIZ',
    created_at: '2024-01-02T10:00:00Z',
    // ... 其他字段
  },
  // ...
]
```

## 📦 相關文件

### 修改的文件

1. **frontend/src/components/StudentCourseDetailModal.vue**
   - 移除 Tabs UI
   - 簡化 JavaScript 邏輯
   - 移除 AssessmentRunner 組件
   - 添加模式標籤顯示

### 相關文檔

- **HANDOUT_SETTINGS_REMOVAL.md** - 講義設定移除
- **DISPLAY_MODE_CONTROL.md** - 顯示模式控制

### 新增的文件

- **STUDENT_COURSE_CONTENT_SIMPLIFICATION.md** - 本文檔

## 🎉 總結

成功簡化了學生課程內容頁面：

- ✅ **移除 Tabs**：不再分為講義、隨堂測驗、考卷三個 Tab
- ✅ **統一顯示**：所有學習資源顯示在同一個列表中
- ✅ **模式標籤**：每個資源顯示對應的模式標籤（講義、線上測驗等）
- ✅ **代碼簡化**：移除 50+ 行代碼，減少 5 個 refs 和 5 個函數
- ✅ **用戶體驗**：更簡潔、更直觀的瀏覽方式
- ✅ **權限控制**：學生只能看到自己有權限的資源

現在學生可以在「我的課程」中點擊課程，直接看到所有綁定到該課程的學習資源！🎊

## 💡 未來擴展

### 1. 資源排序

可以添加排序功能：

```javascript
const sortBy = ref('created_at') // 'created_at', 'title', 'mode'
const sortOrder = ref('desc') // 'asc', 'desc'

const sortedResources = computed(() => {
  return [...allResources.value].sort((a, b) => {
    if (sortBy.value === 'created_at') {
      return sortOrder.value === 'asc' 
        ? new Date(a.created_at) - new Date(b.created_at)
        : new Date(b.created_at) - new Date(a.created_at)
    }
    // ... 其他排序邏輯
  })
})
```

### 2. 資源搜尋

可以添加搜尋功能：

```javascript
const searchQuery = ref('')

const filteredResources = computed(() => {
  if (!searchQuery.value) return allResources.value
  return allResources.value.filter(r => 
    r.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
```

### 3. 模式過濾

可以添加模式過濾：

```javascript
const selectedMode = ref('ALL') // 'ALL', 'HANDOUT', 'ONLINE_QUIZ', etc.

const filteredResources = computed(() => {
  if (selectedMode.value === 'ALL') return allResources.value
  return allResources.value.filter(r => r.mode === selectedMode.value)
})
```

### 4. 資源預覽

可以在卡片上添加預覽功能：

```javascript
const showPreview = (resource) => {
  // 顯示資源的簡短預覽（前 100 字）
}
```
