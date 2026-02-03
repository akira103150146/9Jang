# 快速修正指南

## 🚀 立即可執行的修正

### 1. 創建 Backend 類型定義文件

創建 `backend/src/cramschool/types/responses.ts`：

```typescript
/**
 * API 響應類型定義
 */

// 匯出相關
export interface ExportResult {
  latex?: string
  markdown?: string
  filename: string
}

// 匯入相關
export interface ImportResult {
  success: boolean
  count: number
  questions: Array<{
    question_id: number
    content: unknown
  }>
  errors?: string[]
}

// 學生相關
export interface TuitionStatus {
  student_id: number
  total_unpaid: number
  total_paid: number
  tuition_months: Array<{
    year: number
    month: number
    enrollment_id: number
    course_name: string
    has_fee: boolean
    weeks: number
  }>
}

export interface AccountStatus {
  is_active: boolean
}

export interface AttendanceAndLeaves {
  student_id: number
  student_name: string
  attendances: Array<{
    attendance_id: number
    session_id: number
    session_id_display?: number
    student_id: number
    student_name?: string
    status: string
    course_name?: string
    session_date: string | null
    is_deleted: boolean
    deleted_at: string | null
  }>
  leaves: Array<{
    leave_id: number
    student_id: number
    course_id: number
    leave_date: string
    reason: string
    approval_status: string
    course_name?: string
    student_name?: string
    is_deleted: boolean
    deleted_at: string | null
  }>
}

// Prisma 相關類型
export interface StudentGroup {
  group: {
    groupId: number
    name: string
    description: string | null
    groupType: string
  }
}

export interface Enrollment {
  enrollmentId: number
  courseId: number
  course: { courseName: string }
  enrollDate: Date
  discountRate: number
  isActive: boolean
}

export interface QuestionOption {
  text: string
  value?: string
  label?: string
}
```

### 2. 創建 Frontend Toast 系統

**步驟 1：** 創建 `frontend/src/composables/useToast.ts`

```typescript
import { ref, readonly } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastMessage {
  id: string
  type: ToastType
  message: string
  duration: number
}

const messages = ref<ToastMessage[]>([])

export function useToast() {
  const show = (type: ToastType, message: string, duration = 3000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(7)}`
    const toast: ToastMessage = { id, type, message, duration }
    
    messages.value.push(toast)
    
    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }
    
    return id
  }

  const remove = (id: string) => {
    messages.value = messages.value.filter(m => m.id !== id)
  }

  const clear = () => {
    messages.value = []
  }

  return {
    messages: readonly(messages),
    success: (message: string, duration?: number) => show('success', message, duration),
    error: (message: string, duration?: number) => show('error', message, duration),
    warning: (message: string, duration?: number) => show('warning', message, duration),
    info: (message: string, duration?: number) => show('info', message, duration),
    remove,
    clear,
  }
}
```

**步驟 2：** 創建 `frontend/src/components/Toast.vue`

```vue
<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <TransitionGroup name="toast">
        <div
          v-for="toast in messages"
          :key="toast.id"
          :class="[
            'px-4 py-3 rounded-lg shadow-lg max-w-md',
            'flex items-center gap-3',
            'animate-slide-in-right',
            toastClasses[toast.type]
          ]"
        >
          <div class="flex-shrink-0">
            <component :is="toastIcons[toast.type]" class="w-5 h-5" />
          </div>
          <p class="flex-1 text-sm font-medium">{{ toast.message }}</p>
          <button
            @click="remove(toast.id)"
            class="flex-shrink-0 text-current opacity-70 hover:opacity-100"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { messages, remove } = useToast()

const toastClasses = {
  success: 'bg-green-500 text-white',
  error: 'bg-red-500 text-white',
  warning: 'bg-yellow-500 text-white',
  info: 'bg-blue-500 text-white',
}

const toastIcons = {
  success: 'svg',  // 使用適當的圖標組件
  error: 'svg',
  warning: 'svg',
  info: 'svg',
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease;
}
</style>
```

**步驟 3：** 在 `frontend/src/App.vue` 中添加 Toast 組件

```vue
<template>
  <div id="app">
    <RouterView />
    <Toast />
  </div>
</template>

<script setup lang="ts">
import Toast from '@/components/Toast.vue'
</script>
```

### 3. 批量修正範例

**修正 `useQuestionForm.ts`：**

```typescript
// 在文件頂部添加
import type { JSONContent } from '@tiptap/core'
import { useToast } from '@/composables/useToast'

const toast = useToast()

// 修正介面定義
export interface QuestionFormData {
  subject: number | string
  level: string
  chapter: string
  content: JSONContent  // ✅ 替代 any
  question_type: string
  options: string[]
  correct_answer: JSONContent  // ✅ 替代 any
  solution_content: JSONContent  // ✅ 替代 any
  difficulty: number
  question_number: string
  origin: string
  origin_detail: string
  source: string
  tag_ids: number[]
}

// 修正函數
const extractTextFromTiptapJSON = (json: JSONContent): string => {  // ✅ 替代 any
  if (!json || typeof json !== 'object') return ''
  if (json.type === 'text' && 'text' in json) return json.text || ''
  if (json.content && Array.isArray(json.content)) {
    return json.content.map(extractTextFromTiptapJSON).join('')
  }
  return ''
}

// 修正驗證函數
const validateForm = (): boolean => {
  if (!formData.value.subject) {
    toast.error('請選擇科目')  // ✅ 替代 alert
    return false
  }
  if (!formData.value.level) {
    toast.error('請選擇年級')  // ✅ 替代 alert
    return false
  }
  // ... 其他驗證
  return true
}

// 修正保存函數
const saveQuestion = async () => {
  if (!validateForm()) {
    return
  }

  saving.value = true
  try {
    // ... 保存邏輯
    toast.success('儲存成功！')  // ✅ 替代 alert
    goBack()
  } catch (error) {
    console.error('儲存題目失敗：', error)
    const errorMsg = error instanceof Error ? error.message : '未知錯誤'
    toast.error(`儲存失敗：${errorMsg}`)  // ✅ 替代 alert
  } finally {
    saving.value = false
  }
}
```

### 4. 創建常數文件

創建 `frontend/src/constants/index.ts`：

```typescript
/**
 * 應用程式常數
 */

// 分頁相關
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 10,
} as const

// 時間相關
export const TIMING = {
  DEBOUNCE_DELAY: 500,
  TOAST_DURATION: 3000,
  REQUEST_TIMEOUT: 30000,
  CACHE_DURATION: 5 * 60 * 1000, // 5 分鐘
} as const

// 年級選項
export const GRADE_OPTIONS = {
  JHS: '國中',
  SHS: '高中',
  VCS: '高職',
} as const

// 題目類型
export const QUESTION_TYPES = {
  SINGLE_CHOICE: '單選題',
  MULTIPLE_CHOICE: '多選題',
  FILL_IN_BLANK: '填充題',
  PROGRAMMING: '程式題',
  LISTENING: '聽力題',
} as const

// 難度星級
export const DIFFICULTY_LEVELS = [1, 2, 3, 4, 5] as const

export type GradeType = keyof typeof GRADE_OPTIONS
export type QuestionType = keyof typeof QUESTION_TYPES
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number]
```

---

## 📋 修正檢查清單

### Backend 修正

- [ ] 創建 `types/responses.ts` 文件
- [ ] 更新 `questions-export.service.ts` 的返回類型
- [ ] 更新 `questions-import.service.ts` 的返回類型
- [ ] 更新 `students.service.ts` 的類型註解
- [ ] 更新 `students.controller.ts` 的返回類型
- [ ] 運行 `npm run build` 確認無錯誤

### Frontend 修正

- [ ] 創建 `composables/useToast.ts`
- [ ] 創建 `components/Toast.vue`
- [ ] 在 `App.vue` 中添加 Toast 組件
- [ ] 創建 `constants/index.ts`
- [ ] 更新 `useQuestionForm.ts` 的類型和 alert
- [ ] 更新 `useChapterSearch.ts` 的類型
- [ ] 更新 `useQuestionOptions.ts` 的類型
- [ ] 更新 `router/index.ts` 的 alert
- [ ] 運行 `npm run type-check` 確認無錯誤

---

## 🧪 測試建議

修正後，請測試以下功能：

1. **題目表單**
   - 創建新題目
   - 編輯現有題目
   - 驗證錯誤訊息顯示

2. **學生管理**
   - 查看學生列表
   - 查看學費狀態
   - 切換帳號狀態

3. **路由守衛**
   - 測試權限檢查
   - 確認 Toast 訊息正常顯示

4. **類型檢查**
   ```bash
   # Backend
   cd backend && npm run build
   
   # Frontend
   cd frontend && npm run type-check
   ```

---

## 💡 提示

1. **漸進式修正**：不需要一次修正所有問題，可以按模組逐步進行
2. **測試驅動**：每修正一個模組就進行測試
3. **提交頻率**：建議每完成一個模組就提交一次
4. **文檔更新**：修正完成後更新相關文檔

---

## 📞 需要協助？

如果在修正過程中遇到問題：

1. 檢查 TypeScript 錯誤訊息
2. 參考 `@tiptap/core` 的類型定義
3. 查看 Vue 3 + TypeScript 最佳實踐
4. 參考專案中已有的類型定義範例
