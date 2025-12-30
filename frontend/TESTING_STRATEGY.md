# 前端測試策略

## 概述

本文件說明如何為前端專案的每個功能撰寫單元測試（unittest）。專案使用 **Vitest** 作為測試框架，配合 **@vue/test-utils** 進行 Vue 組件測試。

## 測試框架設置

- **測試框架**: Vitest
- **組件測試**: @vue/test-utils
- **環境**: jsdom（模擬瀏覽器環境）
- **測試文件模式**: `*.test.ts` 或 `*.spec.ts`

## 測試覆蓋範圍

### 1. Composables（組合式函數）
- ✅ `useMarkdownRenderer` - 已測試（3 個測試）
- ✅ `useStudentFilters` - 已測試（10 個測試）
- ✅ `useFeeFilters` - 已測試（17 個測試）
- ✅ `useModalManager` - 已測試（10 個測試）
- ✅ `useFeeSelection` - 已測試（11 個測試）
- ✅ `useTagManagement` - 已測試（9 個測試）
- ✅ `useStudentList` - 已測試（19 個測試）
- ✅ `useStudentEnrollment` - 已測試（16 個測試）
- ✅ `useStudentTags` - 已測試（21 個測試）
- ✅ `useGroupOrderManagement` - 已測試（18 個測試）
- ⬜ `useResourceEditor` - 資源編輯器邏輯
- ⬜ `useEditorConfiguration` - 編輯器配置
- ⬜ 其他 composables...

### 2. Utils（工具函數）
- ✅ `dateFormat.ts` - 已測試（15 個測試）
- ✅ `debounce.ts` - 已測試（7 個測試）
- ✅ `studentFormatters.ts` - 已測試（22 個測試）
- ✅ `studentUtils.ts` - 已測試（12 個測試）
- ✅ `imageCompress.ts` - 已測試（11 個測試）
- ⬜ `tiptapConverter.ts` - TipTap 轉換器
- ⬜ `markdownBlockParser.ts` - Markdown 區塊解析器
- ⬜ 其他 utils...

### 3. Components（組件）
#### 3.1 基礎組件
- ✅ `forms/BaseInput.vue` - 已測試（14 個測試）
- ✅ `forms/BaseSelect.vue` - 已測試（17 個測試）
- ✅ `forms/BaseCheckbox.vue` - 已測試（12 個測試）
- ⬜ `Sidebar.vue` - 側邊欄

#### 3.2 功能組件
- ✅ `RichTextPreview.vue` - 已測試
- ⬜ `QuestionList.vue` - 題目列表
- ⬜ `ResourceList.vue` - 資源列表
- ⬜ `TemplateList.vue` - 模板列表
- ⬜ `StudentAddTagModal.vue` - 添加標籤模態框
- ⬜ `StudentEnrollmentModal.vue` - 報名模態框
- ⬜ `fee-tracker/FeeFilters.vue` - 費用篩選
- ⬜ `fee-tracker/FeeTable.vue` - 費用表格
- ⬜ `lunch-order/ActiveGroupOrders.vue` - 活躍團購訂單
- ⬜ `BlockEditor/BlockEditor.vue` - 區塊編輯器
- ⬜ 其他組件...

### 4. Views（視圖頁面）
- ⬜ `Login.vue` - 登入頁面
- ⬜ `Dashboard.vue` - 儀表板
- ⬜ `StudentList.vue` - 學生列表
- ⬜ `StudentForm.vue` - 學生表單
- ⬜ `CourseList.vue` - 課程列表
- ⬜ `QuestionBank.vue` - 題庫
- ⬜ `FeeTracker.vue` - 費用追蹤
- ⬜ `LunchOrderSystem.vue` - 午餐訂購系統
- ⬜ `ResourceEditor.vue` - 資源編輯器
- ⬜ 其他視圖...

### 5. Services（服務層）
- ⬜ `api.ts` - API 服務（需要 mock）
- ⬜ `snippets.ts` - 代碼片段服務

## 測試最佳實踐

### 1. 測試結構
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'

describe('ComponentName', () => {
  beforeEach(() => {
    // 設置測試環境
  })

  it('should render correctly', () => {
    // 測試渲染
  })

  it('should handle user interaction', async () => {
    // 測試用戶交互
  })
})
```

### 2. Mock 策略
- **API 調用**: 使用 `vi.mock()` mock API 服務
- **外部依賴**: Mock 第三方庫（如 axios, router）
- **組件依賴**: 使用 `stubs` 或 `shallowMount`

### 3. 測試類型
- **單元測試**: 測試單個函數/組件的功能
- **集成測試**: 測試多個組件/模塊的協作
- **快照測試**: 測試組件輸出的一致性（可選）

### 4. 測試覆蓋率目標
- **Composables**: 80%+
- **Utils**: 90%+
- **Components**: 70%+
- **Views**: 60%+

## 執行測試

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

## 測試文件組織

測試文件應該與源文件放在同一目錄下，使用 `.test.ts` 或 `.spec.ts` 後綴：

```
src/
├── components/
│   ├── Sidebar.vue
│   └── Sidebar.test.ts
├── composables/
│   ├── useStudentList.ts
│   └── useStudentList.test.ts
└── utils/
    ├── dateFormat.ts
    └── dateFormat.test.ts
```

## 逐步實施計劃

### 階段 1: 基礎工具函數（優先）
1. ✅ `useMarkdownRenderer` - 已完成
2. ✅ `dateFormat.ts` - 已完成
3. ✅ `debounce.ts` - 已完成
4. ✅ `studentFormatters.ts` - 已完成
5. ✅ `studentUtils.ts` - 已完成

### 階段 2: Composables（核心邏輯）
1. ✅ `useStudentList.ts` - 已完成
2. ✅ `useStudentFilters.ts` - 已完成
3. ✅ `useStudentEnrollment.ts` - 已完成
4. ✅ `useFeeFilters.ts` - 已完成
5. ✅ `useGroupOrderManagement.ts` - 已完成

### 階段 3: 基礎組件
1. ✅ `forms/BaseInput.vue` - 已完成
2. ✅ `forms/BaseSelect.vue` - 已完成
3. ✅ `forms/BaseCheckbox.vue` - 已完成
4. ⬜ `Sidebar.vue`

### 階段 4: 功能組件
1. ⬜ `QuestionList.vue`
2. ⬜ `ResourceList.vue`
3. ⬜ `fee-tracker/FeeFilters.vue`
4. ⬜ `lunch-order/ActiveGroupOrders.vue`

### 階段 5: 視圖頁面
1. ⬜ `Login.vue`
2. ⬜ `StudentList.vue`
3. ⬜ `CourseList.vue`
4. ⬜ `FeeTracker.vue`

## 注意事項

1. **API Mock**: 所有 API 調用都應該被 mock，避免真實的網絡請求
2. **異步處理**: 使用 `await` 和 `nextTick()` 處理異步操作
3. **組件掛載**: 根據測試需求選擇 `mount` 或 `shallowMount`
4. **清理**: 在 `afterEach` 中清理測試狀態和 mock
5. **可讀性**: 測試名稱應該清晰描述測試內容

## 參考資源

- [Vitest 文檔](https://vitest.dev/)
- [Vue Test Utils 文檔](https://test-utils.vuejs.org/)
- [Vue 3 測試指南](https://vuejs.org/guide/scaling-up/testing.html)
