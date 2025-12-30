# 篩選器設計規範

## 📋 設計原則

所有列表頁面的篩選器應遵循統一的設計規範，提供一致的用戶體驗。

## 🎯 核心特性

### 1. **動態即時篩選**
- ✅ 不需要點擊「搜尋」按鈕
- ✅ 篩選條件改變時自動觸發搜尋
- ✅ 文字輸入使用防抖（debounce）處理
- ✅ 下拉選單立即執行

### 2. **可摺疊面板**
- ✅ 提供「展開/收起」按鈕
- ✅ 預設展開狀態
- ✅ 摺疊後仍顯示載入指示器

### 3. **載入指示器**
- ✅ 顯示旋轉動畫和「搜尋中...」文字
- ✅ 位於篩選面板上方
- ✅ 不影響頁面佈局

### 4. **篩選標籤顯示**
- ✅ 顯示已套用的篩選條件
- ✅ 每個條件可單獨移除
- ✅ 顯示在篩選面板下方
- ✅ 使用彩色標籤樣式

### 5. **重置功能**
- ✅ 提供「重置篩選」按鈕
- ✅ 清空所有篩選條件
- ✅ 自動重新載入資料

## 🎨 UI 規範

### 容器樣式
```vue
<div class="mb-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
```

### 標題列
```vue
<div class="flex items-center justify-between mb-4">
  <h3 class="text-lg font-semibold text-slate-900">篩選條件</h3>
  <button 
    @click="showFilters = !showFilters" 
    class="text-sm text-indigo-600 hover:text-indigo-800 font-semibold"
  >
    {{ showFilters ? '收起' : '展開' }}篩選
  </button>
</div>
```

### 載入指示器
```vue
<div v-if="isFiltering" class="mb-2 text-xs text-slate-500 flex items-center gap-2">
  <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
  搜尋中...
</div>
```

### 篩選面板
```vue
<div v-show="showFilters" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <!-- 篩選欄位 -->
</div>
```

### 重置按鈕
```vue
<div v-show="showFilters" class="mt-4 flex justify-end gap-2">
  <button
    @click="resetFilters"
    class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
  >
    重置篩選
  </button>
</div>
```

### 已套用的篩選標籤
```vue
<!-- 已套用的篩選標籤 -->
<div v-if="hasActiveFilters" class="flex flex-wrap gap-2 pt-3 mt-3 border-t border-slate-200">
  <span class="text-xs text-slate-500">已套用：</span>
  <span
    v-for="(filter, key) in activeFilters"
    :key="key"
    class="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700"
  >
    {{ filter.label }}
    <button @click="removeFilter(key)" class="text-indigo-600 hover:text-indigo-800">×</button>
  </span>
</div>
```

**顏色方案：**
- 費用管理：`bg-sky-50 text-sky-700`（天藍色）
- 題庫列表：`bg-indigo-50 text-indigo-700`（靛藍色）
- 其他頁面：根據主題色選擇相應的顏色

## 💻 程式碼實現

### 1. 狀態定義
```javascript
const loading = ref(false)
const isFiltering = ref(false)
const showFilters = ref(true)
let filterTimeout = null

const filters = reactive({
  // 定義篩選欄位
  field1: '',
  field2: '',
  // ...
})
```

### 2. 防抖函數
```javascript
const debouncedFetchData = () => {
  if (filterTimeout) {
    clearTimeout(filterTimeout)
  }
  filterTimeout = setTimeout(() => {
    pagination.currentPage = 1
    fetchData()
  }, 500) // 500ms 延遲
}
```

### 3. 監聽篩選條件

#### 文字輸入欄位（使用防抖）
```javascript
watch(
  () => [filters.textField1, filters.textField2],
  () => {
    debouncedFetchData()
  }
)
```

#### 下拉選單（立即執行）
```javascript
watch(
  () => [filters.select1, filters.select2, filters.select3],
  () => {
    pagination.currentPage = 1
    fetchData()
  }
)
```

### 4. 資料載入函數
```javascript
const fetchData = async () => {
  loading.value = true
  isFiltering.value = true
  
  try {
    const params = {}
    
    // 組裝篩選參數
    if (filters.field1) params.field1 = filters.field1
    if (filters.field2) params.field2 = filters.field2
    // ...
    
    // 添加分頁參數
    params.page = pagination.currentPage
    
    const response = await api.getAll({ params })
    data.value = response.data.results || response.data
    
    // 更新分頁資訊
    if (response.data.count !== undefined) {
      pagination.totalCount = response.data.count
      pagination.totalPages = Math.ceil(response.data.count / pagination.pageSize)
    }
  } catch (error) {
    console.error('載入失敗：', error)
    data.value = []
  } finally {
    loading.value = false
    isFiltering.value = false
  }
}
```

### 5. 重置函數
```javascript
const resetFilters = () => {
  // 重置所有篩選欄位
  filters.field1 = ''
  filters.field2 = ''
  // ...
  
  pagination.currentPage = 1
  fetchData()
}
```

### 6. 移除單個篩選條件
```javascript
const removeFilter = (key) => {
  filters[key] = ''
  pagination.currentPage = 1
  fetchData()
}
```

### 7. 篩選標籤相關 Computed
```javascript
// 檢查是否有活躍的篩選
const hasActiveFilters = computed(() => {
  return Object.values(filters).some(value => value !== '')
})

// 獲取活躍篩選的顯示標籤
const activeFilters = computed(() => {
  const result = {}
  
  // 為每個有值的篩選條件創建標籤
  if (filters.field1) {
    result.field1 = { label: `欄位1：${filters.field1}` }
  }
  
  // 對於下拉選單，從選項列表中查找顯示名稱
  if (filters.selectField) {
    const option = options.value.find(o => o.id == filters.selectField)
    result.selectField = { label: `選項：${option?.name || filters.selectField}` }
  }
  
  // 對於需要映射的欄位（如狀態、類型等）
  if (filters.status) {
    const statusMap = {
      'active': '啟用',
      'inactive': '停用'
    }
    result.status = { label: `狀態：${statusMap[filters.status] || filters.status}` }
  }
  
  return result
})
```

## 📝 已實現的頁面

| 頁面 | 文件 | 狀態 |
|------|------|------|
| 費用管理 | `FeeTracker.vue` | ✅ 參考實現 |
| 題庫列表 | `QuestionList.vue` | ✅ 已更新 |

## 🔄 待更新的頁面

以下頁面需要按照此規範更新：

- [ ] 學生列表 (`StudentList.vue`)
- [ ] 教師列表 (`TeacherList.vue`)
- [ ] 課程列表 (`CourseList.vue`)
- [ ] 資源列表（如有）
- [ ] 其他列表頁面

## ⚠️ 注意事項

1. **防抖延遲時間**：文字輸入建議使用 500ms 延遲
2. **分頁重置**：篩選條件改變時，應重置到第一頁
3. **載入狀態**：使用兩個狀態變數
   - `loading`：控制列表的載入遮罩
   - `isFiltering`：控制篩選指示器的顯示
4. **保持滾動位置**：載入時應保持用戶的滾動位置
5. **錯誤處理**：API 失敗時應清空列表並顯示錯誤訊息

## 🎉 優勢

- ✅ **更好的用戶體驗**：無需手動點擊搜尋
- ✅ **即時反饋**：立即看到篩選結果
- ✅ **減少 API 請求**：防抖處理避免過多請求
- ✅ **一致的介面**：所有列表頁面使用相同的設計
- ✅ **易於維護**：統一的程式碼結構
