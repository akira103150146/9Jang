# 學生端手機 UI 優化與顯示模式功能

## 概述
針對學生查看講義和考卷的體驗進行全面優化，特別針對手機端使用場景設計，並加入與編輯模式相同的多種顯示模式選擇功能。

## 主要改進

### 1. 手機優化的全螢幕介面
**問題**：原本的 Modal 設計在手機上顯示不佳，內容區域小，操作不便。

**解決方案**：
- 將 Modal 改為全螢幕顯示（`fixed inset-0`）
- 採用 Flex 佈局，分為頂部導航、內容區、底部操作欄三個區域
- 內容區域可完整滾動，充分利用螢幕空間

### 2. 顯示模式選擇功能
**新增功能**：學生可以根據需求切換不同的顯示模式

**可選模式**：
- 📝 **純題目**：只顯示題目內容，適合自我測驗
- ✅ **題目+答案**：顯示題目和答案，適合快速核對
- 💡 **題目+詳解**：顯示題目和詳細解答，適合學習理解
- 📚 **完整內容**：顯示所有內容（題目+答案+詳解）

**實現方式**：
```javascript
// 使用 provide/inject 機制傳遞顯示模式
provide('printMode', currentDisplayMode)
```

### 3. 頂部導航欄設計

**特點**：
- 固定在頂部（`sticky top-0`），滾動時始終可見
- 左側：返回按鈕，清晰的返回路徑
- 中間：資源標題，自動截斷過長文字
- 橫向滑動的模式選擇器，適合手機觸控操作

**手機友好設計**：
```vue
<div class="overflow-x-auto scrollbar-hide">
  <div class="flex gap-2 min-w-max">
    <!-- 模式按鈕 -->
  </div>
</div>
```

### 4. 底部操作欄

**功能按鈕**：
- 🔲 **全螢幕**：切換全螢幕模式，提供沉浸式閱讀體驗
- 🖨️ **列印/下載**：觸發瀏覽器列印功能，可儲存為 PDF

**設計考量**：
- 固定在底部（`sticky bottom-0`），方便手指觸及
- 大按鈕設計，適合觸控操作
- 視覺層次清晰，主要操作（列印）使用品牌色

### 5. 響應式內容區域

**特點**：
- 最大寬度限制（`max-w-4xl mx-auto`），在大螢幕上保持可讀性
- 適當的內邊距（`px-4 py-6 sm:px-6 lg:px-8`），不同螢幕自適應
- 白色背景，提供清晰的閱讀環境

### 6. 列印優化

**列印時的行為**：
```css
@media print {
  /* 隱藏所有操作元素 */
  button, .border-b, .border-t { display: none !important; }
  
  /* 內容區域自動展開 */
  .flex-1.overflow-y-auto { overflow: visible !important; }
  
  /* 適當的頁面邊距 */
  @page { margin: 20mm; }
}
```

## 技術實現細節

### 組件結構
```vue
<template>
  <div class="fixed inset-0 z-[60] bg-white flex flex-col">
    <!-- 頂部導航欄 -->
    <div class="sticky top-0 z-10">
      <!-- 返回按鈕 + 標題 -->
      <!-- 顯示模式選擇器 -->
    </div>
    
    <!-- 內容區域 -->
    <div class="flex-1 overflow-y-auto">
      <BlockEditor :readonly="true" />
    </div>
    
    <!-- 底部操作欄 -->
    <div class="sticky bottom-0">
      <!-- 全螢幕 + 列印按鈕 -->
    </div>
  </div>
</template>
```

### 狀態管理
```javascript
// 顯示模式選項
const displayModes = [
  { value: 'question-only', label: '📝 純題目' },
  { value: 'with-answer', label: '✅ 題目+答案' },
  { value: 'with-solution', label: '💡 題目+詳解' },
  { value: 'with-all', label: '📚 完整內容' }
]

// 當前顯示模式
const currentDisplayMode = ref('question-only')

// 提供給子組件
provide('printMode', currentDisplayMode)
```

### 全螢幕功能
```javascript
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }
}
```

## 使用者體驗改進

### 手機端
1. **單手操作友好**：
   - 返回按鈕在左上角，拇指易觸及
   - 底部操作欄在拇指區域
   - 橫向滑動選擇模式，自然的手勢

2. **視覺清晰**：
   - 全螢幕顯示，無干擾
   - 白色背景，減少眼睛疲勞
   - 清晰的視覺層次

3. **快速切換**：
   - 模式切換即時生效
   - 無需重新載入頁面
   - 流暢的過渡效果

### 桌面端
1. **充分利用空間**：
   - 內容區域自動居中
   - 最大寬度限制保持可讀性
   - 響應式內邊距

2. **鍵盤支援**：
   - ESC 鍵返回（可擴展）
   - F11 全螢幕（瀏覽器原生）

## 與編輯模式的一致性

**相同的顯示模式**：
- 學生端和教師編輯端使用相同的顯示模式邏輯
- 透過 `provide('printMode')` 統一控制
- `QuestionBlock.vue` 組件自動響應模式變化

**差異**：
- 學生端：預設為「純題目」，鼓勵自主思考
- 編輯端：預設為「完整內容」，方便教師檢視

## 未來擴展可能

1. **進度追蹤**：
   - 記錄學生查看到哪一題
   - 下次開啟時自動跳轉

2. **筆記功能**：
   - 允許學生在題目旁做筆記
   - 筆記與題目關聯儲存

3. **離線支援**：
   - PWA 支援
   - 下載講義供離線閱讀

4. **深色模式**：
   - 夜間閱讀模式
   - 減少藍光

5. **字體大小調整**：
   - 可調整字體大小
   - 適應不同視力需求

## 檔案修改

### 修改的檔案
- `frontend/src/components/StudentCourseDetailModal.vue`

### 主要變更
1. 將 Modal 改為全螢幕佈局
2. 新增顯示模式選擇器
3. 新增底部操作欄（全螢幕、列印）
4. 優化手機端觸控體驗
5. 新增列印樣式優化

### 依賴的現有功能
- `BlockEditor.vue` 的 `readonly` 模式
- `QuestionBlock.vue` 的 `printMode` 注入
- `provide/inject` 機制傳遞顯示模式

## 測試建議

### 手機端測試
1. 在不同尺寸的手機上測試（小、中、大螢幕）
2. 測試橫向和直向模式
3. 測試單手操作的便利性
4. 測試滾動流暢度

### 功能測試
1. 測試四種顯示模式的切換
2. 測試全螢幕功能
3. 測試列印/下載功能
4. 測試返回功能

### 跨瀏覽器測試
1. Chrome/Safari（手機）
2. Chrome/Firefox/Safari（桌面）
3. 微信內建瀏覽器
4. Line 內建瀏覽器

## 效能考量

1. **懶載入**：只在開啟資源時載入內容
2. **狀態重置**：關閉時重置顯示模式為預設值
3. **CSS 優化**：使用 Tailwind 的 JIT 模式，只包含使用的樣式
4. **避免重複渲染**：使用 `ref` 和 `provide` 精確控制更新範圍

## 無障礙考量

1. **語意化 HTML**：使用適當的 HTML 標籤
2. **ARIA 屬性**：保留原有的 `role` 和 `aria-*` 屬性
3. **鍵盤導航**：所有功能可通過鍵盤操作
4. **對比度**：確保文字和背景有足夠對比度
5. **觸控目標大小**：按鈕至少 44x44px（iOS 建議）

## 總結

這次改進大幅提升了學生在手機上查看學習資源的體驗，同時保持了與教師編輯端的一致性。全螢幕設計、直觀的模式切換、便捷的操作按鈕，都讓學生能更專注於學習內容本身。
