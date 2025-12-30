# 前端測試實施指南

## 快速開始

### 運行測試

```bash
# 運行所有測試
npm run test

# 運行測試並顯示 UI
npm run test:ui

# 運行測試一次（CI 模式）
npm run test:run

# 運行特定測試文件
npm run test src/utils/dateFormat.test.ts

# 運行測試並生成覆蓋率報告
npm run test -- --coverage
```

## 已完成的測試

### ✅ Utils（工具函數）
- `dateFormat.test.ts` - 日期格式化函數（15 個測試）
- `debounce.test.ts` - 防抖函數（7 個測試）

### ✅ Composables（組合式函數）
- `useMarkdownRenderer.test.ts` - Markdown 渲染器（3 個測試）
- `useStudentFilters.test.ts` - 學生篩選邏輯（10 個測試）

### ✅ Components（組件）
- `RichTextPreview.test.ts` - 富文本預覽（3 個測試）
- `forms/BaseInput.test.ts` - 基礎輸入框（14 個測試）

**總計：52 個測試全部通過 ✅**

## 測試範例

### 1. 工具函數測試（Utils）

```typescript
// src/utils/dateFormat.test.ts
import { describe, it, expect } from 'vitest'
import { formatTime, formatDate, formatDateTime } from './dateFormat'

describe('dateFormat', () => {
  it('should format Date object to time string', () => {
    const date = new Date('2024-01-15T14:30:00')
    const result = formatTime(date)
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })
})
```

### 2. Composable 測試

```typescript
// src/composables/useStudentFilters.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { useStudentFilters } from './useStudentFilters'

// Mock vue-router
const mockRouter = {
  replace: vi.fn().mockResolvedValue(undefined)
}

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => ({ query: {} })
}))

describe('useStudentFilters', () => {
  it('should initialize with empty filters', () => {
    const { filters, hasActiveFilters } = useStudentFilters(
      ref(false),
      vi.fn()
    )
    expect(hasActiveFilters.value).toBe(false)
  })
})
```

### 3. 組件測試

```typescript
// src/components/forms/BaseInput.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseInput from './BaseInput.vue'

describe('BaseInput', () => {
  it('should emit update:modelValue on input', async () => {
    const wrapper = mount(BaseInput, {
      props: { modelValue: '' }
    })
    
    const input = wrapper.find('input')
    await input.setValue('測試輸入')
    
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })
})
```

## 下一步實施計劃

### 優先級 1：核心工具函數
- [ ] `imageCompress.ts` - 圖片壓縮
- [ ] `studentFormatters.ts` - 學生格式化
- [ ] `studentUtils.ts` - 學生工具函數
- [ ] `tiptapConverter.ts` - TipTap 轉換器

### 優先級 2：核心 Composables
- [ ] `useStudentList.ts` - 學生列表邏輯
- [ ] `useStudentEnrollment.ts` - 學生報名邏輯
- [ ] `useStudentTags.ts` - 學生標籤管理
- [ ] `useFeeFilters.ts` - 費用篩選邏輯
- [ ] `useGroupOrderManagement.ts` - 團購訂單管理

### 優先級 3：基礎組件
- [ ] `forms/BaseSelect.vue` - 基礎選擇框
- [ ] `forms/BaseCheckbox.vue` - 基礎複選框
- [ ] `Sidebar.vue` - 側邊欄

### 優先級 4：功能組件
- [ ] `QuestionList.vue` - 題目列表
- [ ] `ResourceList.vue` - 資源列表
- [ ] `fee-tracker/FeeFilters.vue` - 費用篩選
- [ ] `fee-tracker/FeeTable.vue` - 費用表格

### 優先級 5：視圖頁面
- [ ] `Login.vue` - 登入頁面
- [ ] `StudentList.vue` - 學生列表
- [ ] `CourseList.vue` - 課程列表

## 測試工具使用

### 測試工具函數（test-utils/index.ts）

```typescript
import { 
  createTestRouter,
  mountWithRouter,
  createMockApiResponse,
  createMockStudent,
  simulateInput,
  simulateClick
} from '../test-utils'

// 使用範例
const router = createTestRouter()
const mockStudent = createMockStudent({ name: '測試學生' })
```

## Mock 策略

### 1. API Mock

```typescript
vi.mock('../services/api', () => ({
  getStudents: vi.fn().mockResolvedValue({
    data: [createMockStudent()]
  })
}))
```

### 2. Router Mock

```typescript
const mockRouter = {
  replace: vi.fn(),
  push: vi.fn()
}

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => ({ query: {} })
}))
```

### 3. 組件 Mock

```typescript
const wrapper = mount(Component, {
  global: {
    stubs: {
      ChildComponent: { template: '<div>Stub</div>' }
    }
  }
})
```

## 測試覆蓋率目標

- **Utils**: 90%+ ✅ (進行中)
- **Composables**: 80%+ ✅ (進行中)
- **Components**: 70%+ ✅ (進行中)
- **Views**: 60%+ ⬜ (待開始)

## 常見問題

### Q: 如何測試異步操作？
A: 使用 `await` 和 `nextTick()`：

```typescript
await wrapper.vm.$nextTick()
await waitForNextTick(wrapper)
```

### Q: 如何測試事件發射？
A: 使用 `emitted()`：

```typescript
expect(wrapper.emitted('update:modelValue')).toBeTruthy()
expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['value'])
```

### Q: 如何測試路由導航？
A: Mock router 並檢查調用：

```typescript
expect(mockRouter.push).toHaveBeenCalledWith({ path: '/students' })
```

## 參考資源

- [測試策略文檔](./TESTING_STRATEGY.md)
- [Vitest 文檔](https://vitest.dev/)
- [Vue Test Utils 文檔](https://test-utils.vuejs.org/)
