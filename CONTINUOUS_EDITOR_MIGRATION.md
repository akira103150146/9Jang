# 連續編輯器遷移總結

## 📋 遷移日期
2025-12-29

## 🎯 遷移目標

將 ResourceEditor 從多紙張分頁模式改為像 Notion 一樣的連續畫布模式：
- ✅ 移除視覺上的紙張分頁效果
- ✅ 使用單一連續編輯器
- ✅ 支援手動插入分頁符號（列印時生效）
- ✅ 移除自動分頁邏輯

## 🔧 主要變更

### 1. 模板結構簡化

**變更前：**
```vue
<!-- 講義模式：多個獨立紙張容器 -->
<div v-if="resource.mode === 'HANDOUT'">
  <div 
    v-for="(pageContent, pageIndex) in handoutPages" 
    :key="`page-${pageIndex}`"
    class="paper-container"
  >
    <BlockEditor :model-value="{ type: 'doc', content: pageContent }" />
  </div>
</div>

<!-- 其他模式：單一編輯器 -->
<div v-else>
  <BlockEditor :model-value="tiptapStructure" />
</div>
```

**變更後：**
```vue
<!-- 統一使用單一連續編輯器 -->
<div class="continuous-editor max-w-4xl mx-auto bg-white shadow-sm my-8">
  <BlockEditor
    ref="blockEditorRef"
    :model-value="tiptapStructure"
    @update:model-value="handleBlockEditorUpdate"
  />
</div>
```

### 2. 移除的功能和代碼

#### 移除的 Computed Properties
- ❌ `handoutPages` - 自動分頁計算邏輯
- ❌ `estimateNodeHeight` - 節點高度估算

#### 移除的 Functions
- ❌ `checkAndSplitPage` - 檢查並分割頁面
- ❌ `handlePageEditorUpdate` - 處理多頁編輯器更新
- ❌ 相關的分頁邏輯（100+ 行代碼）

#### 移除的 Refs
- ❌ `pageEditorRefs` - 多頁編輯器引用數組
- ❌ `isUpdatingFromPageEditor` - 防止循環更新標誌
- ❌ `handoutContainerRef` - 講義容器引用

#### 移除的 Watchers
- ❌ `watch(() => handoutPages.value.length, ...)` - 監聽頁面數量變化

#### 移除的 UI 元素
- ❌ 頁碼顯示（「第 1 頁」「第 2 頁」等）
- ❌ 紙張容器的固定高度和寬度
- ❌ 紙張之間的間距和陰影

### 3. CSS 樣式更新

**移除的樣式：**
```css
/* 移除 */
.paper-container {
  width: 210mm;
  height: 297mm;
  page-break-after: always;
}

.page-number-display {
  position: absolute;
  top: 1rem;
  right: 1rem;
}
```

**新增的樣式：**
```css
/* 連續編輯器樣式 */
.continuous-editor {
  position: relative;
  box-sizing: border-box;
  max-width: 56rem; /* max-w-4xl */
  padding: 40px;
  min-height: 100vh;
}
```

### 4. 列印功能保留

列印時的分頁功能仍然保留，但改為：
- ✅ 使用瀏覽器原生的 `@page` 規則
- ✅ 支援手動插入分頁符號（PageBreak extension）
- ✅ 使用 `page-break-inside: avoid` 防止元素被切斷

```css
@media print {
  @page {
    size: A4;
    margin: 20mm;
  }
  
  /* 防止元素被分頁切斷 */
  .question-display,
  .section-block,
  .latex-block {
    page-break-inside: avoid;
    break-inside: avoid;
  }
}
```

## 🎨 UI/UX 改進

### 編輯體驗

**改進前：**
- 內容被分割成多個固定大小的紙張
- 每個紙張有明顯的邊界和陰影
- 顯示頁碼（第 1 頁、第 2 頁...）
- 內容超過頁面高度時自動分頁
- 跨頁編輯體驗不流暢

**改進後：**
- 單一連續的畫布，無視覺分頁
- 類似 Notion 的編輯體驗
- 沒有頁碼顯示
- 內容自由流動，不受頁面限制
- 流暢的編輯體驗

### 列印體驗

**保留功能：**
- ✅ 選擇紙張大小（A4/B4）
- ✅ 選擇列印模式（純題目/題目+答案/題目+詳解）
- ✅ 手動插入分頁符號（使用 Slash Command：`/分頁`）
- ✅ 自動防止元素被切斷

## 📊 代碼統計

| 項目 | 變更 |
|------|------|
| **移除的代碼行數** | ~200 行 |
| **移除的函數** | 3 個 |
| **移除的 Computed** | 2 個 |
| **移除的 Refs** | 3 個 |
| **移除的 Watchers** | 1 個 |
| **簡化的模板** | 30+ 行 → 10 行 |

## 🔄 遷移影響

### 對現有功能的影響

1. **題號計算** ✅
   - 不受影響
   - 仍然根據 SectionBlock 重新編號

2. **列印功能** ✅
   - 不受影響
   - 仍然支援三種列印模式
   - 仍然支援手動分頁符號

3. **圖片上傳** ✅
   - 不受影響
   - 仍然支援圖片映射和替換

4. **模板插入** ✅
   - 不受影響
   - 仍然支援模板選擇和插入

5. **題目插入** ✅
   - 不受影響
   - 仍然支援無限滾動載入題目

### 性能改進

1. **減少響應式計算**
   - 移除了 `handoutPages` computed（複雜的分頁計算）
   - 減少了 watch 監聽器

2. **減少 DOM 操作**
   - 從多個編輯器實例 → 單一編輯器實例
   - 減少了 DOM 節點數量

3. **簡化狀態管理**
   - 不需要管理多個頁面的狀態
   - 不需要同步多個編輯器的內容

## 🎯 使用方式

### 編輯文檔

1. **連續編輯**
   - 像在 Notion 中一樣自由編輯
   - 不受頁面邊界限制
   - 流暢的編輯體驗

2. **插入內容**
   - 使用 Slash Command 插入各種內容
   - `/題目` - 插入題目
   - `/大題` - 插入大題標題
   - `/分頁` - 手動插入分頁符號（列印時生效）

### 列印文檔

1. **選擇列印模式**
   - 純題目卷
   - 題目+答案
   - 題目+詳解

2. **手動控制分頁**
   - 在需要分頁的地方插入分頁符號（`/分頁`）
   - 列印時會在該位置分頁

3. **列印預覽**
   - 點擊「列印 / 預覽 PDF」
   - 在瀏覽器列印對話框中預覽
   - 瀏覽器會自動處理分頁

## ✨ 優勢

1. **更簡潔的代碼**
   - ✅ 移除 ~200 行複雜的分頁邏輯
   - ✅ 更易於維護和理解
   - ✅ 減少潛在的 bug

2. **更好的用戶體驗**
   - ✅ 類似 Notion 的流暢編輯體驗
   - ✅ 沒有視覺干擾（頁碼、紙張邊界）
   - ✅ 更專注於內容本身

3. **更靈活的控制**
   - ✅ 用戶可以手動控制分頁位置
   - ✅ 不受自動分頁邏輯限制
   - ✅ 更符合實際使用需求

4. **更好的性能**
   - ✅ 減少響應式計算
   - ✅ 減少 DOM 操作
   - ✅ 簡化狀態管理

## 🧪 測試建議

### 功能測試

1. **編輯功能**
   - [ ] 插入和編輯各種內容類型
   - [ ] 插入題目和大題標題
   - [ ] 題號正確顯示和更新
   - [ ] 手動插入分頁符號

2. **列印功能**
   - [ ] 三種列印模式正常工作
   - [ ] 手動分頁符號在列印時生效
   - [ ] 元素不會被分頁切斷
   - [ ] 列印預覽正確顯示

3. **性能測試**
   - [ ] 大文檔（100+ 題目）編輯流暢
   - [ ] 滾動性能良好
   - [ ] 保存速度正常

### 視覺測試

1. **編輯模式**
   - [ ] 沒有視覺上的紙張分頁
   - [ ] 沒有頁碼顯示
   - [ ] 連續的白色畫布
   - [ ] 適當的內邊距和最大寬度

2. **列印模式**
   - [ ] 列印預覽中正確分頁
   - [ ] 頁邊距正確
   - [ ] 內容不會被切斷

## 📦 相關文件

### 修改的文件
- `frontend/src/views/ResourceEditor.vue` - 主要變更
- `QUESTION_BLOCK_REDESIGN_SUMMARY.md` - 題目區塊設計文檔

### 新增的文件
- `CONTINUOUS_EDITOR_MIGRATION.md` - 本文檔

## 🎉 總結

成功將 ResourceEditor 從多紙張分頁模式遷移到連續編輯器模式：
- 📉 **移除 ~200 行代碼**
- 🎨 **更簡潔的 UI**
- ⚡ **更好的性能**
- 🖨️ **保留完整的列印功能**
- 📝 **更好的編輯體驗**

這個遷移大幅簡化了代碼結構，提升了用戶體驗，同時保留了所有必要的功能。現在的編輯器更像 Notion，提供了流暢、不受限制的編輯體驗。
