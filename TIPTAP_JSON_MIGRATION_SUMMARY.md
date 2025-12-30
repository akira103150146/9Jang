# TipTap JSON 格式遷移摘要

## 📋 概述

本次重構將題目內容從 Markdown 字串格式遷移到 TipTap JSON 格式。為確保向後相容性和一致性，我們檢查並更新了所有使用題目內容的模組。

## 🔧 新增工具

### `frontend/src/composables/useTiptapConverter.js`

創建了一個通用的 TipTap JSON 轉換工具 composable，提供以下函數：

1. **`extractTextFromTiptapJSON(node)`**
   - 從 TipTap JSON 中遞迴提取純文字
   - 用於預覽和搜尋功能

2. **`tiptapToMarkdown(node)`**
   - 將 TipTap JSON 完整轉換為 Markdown 字串
   - 支援所有 TipTap 節點類型（段落、標題、列表、LaTeX、圖表等）

3. **`contentToMarkdown(content)`**
   - 自動檢測內容格式（字串或 TipTap JSON）
   - 統一轉換為 Markdown 字串
   - 向後相容舊的字串格式

4. **`contentToTextPreview(content, maxLength)`**
   - 生成內容的純文字預覽
   - 自動處理格式轉換和長度限制

## ✅ 已更新的文件

### 1. `frontend/src/components/QuestionBlock.vue`
**狀態**: ✅ 已更新

**修改內容**:
- 引入 `useTiptapConverter`
- 使用 `extractTextFromTiptapJSON` 替換本地的 `extractText` 函數
- `renderContent` 函數現在使用統一的 composable

**用途**: 在 BlockEditor 中顯示單個題目

---

### 2. `frontend/src/components/BlockEditor/components/QuestionSelectorModal.vue`
**狀態**: ✅ 已更新

**修改內容**:
- 引入 `useTiptapConverter`
- 使用 `extractTextFromTiptapJSON` 替換本地的 `extractText` 函數
- `renderPreview` 函數簡化，使用統一的 composable

**用途**: 題目選擇器模態框，顯示題目預覽

---

### 3. `frontend/src/views/StudentErrorLog.vue`
**狀態**: ✅ 已更新

**修改內容**:
- 引入 `useTiptapConverter`
- 更新 `getQuestionContent` 函數使用 `contentToMarkdown`
- 更新所有 `v-html` 綁定，在渲染前先轉換為 Markdown：
  - `questionDetail.content`
  - `questionDetail.correct_answer`
  - `note.content`

**用途**: 學生錯題記錄頁面

---

### 4. `frontend/src/views/QuestionImport.vue`
**狀態**: ✅ 已更新

**修改內容**:
- 引入 `useTiptapConverter`
- 更新 `renderMarkdown` 函數使用 `contentToMarkdown`
- 確保從外部匯入的題目也能正確顯示

**用途**: 題目匯入頁面

---

### 5. `frontend/src/components/QuestionList.vue`
**狀態**: ✅ 已完整（無需修改）

**現有功能**:
- 已有完整的 `tiptapToMarkdown` 函數
- 已有 `extractTextFromTiptapJSON` 函數
- 已有 `getQuestionContent`, `getQuestionAnswer`, `getQuestionSolution`, `getOptionContent` 函數
- 所有函數都正確處理 TipTap JSON 和字串格式

**建議**: 未來可以考慮遷移到使用統一的 composable，但目前功能完整且正常工作。

---

### 6. `frontend/src/components/resource-runners/OnlineQuizRunner.vue`
**狀態**: ✅ 已完整（無需修改）

**現有功能**:
- `getQuestionTiptapStructure` 函數正確處理 TipTap JSON
- 使用 `BlockEditor` 唯讀模式顯示題目內容
- 自動檢測並處理不同格式

---

## 🎯 格式支援

**⚠️ 重要變更：已移除向後相容性**

系統現在**只支援 TipTap JSON 格式**：

```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "text": "題目內容" }
      ]
    }
  ]
}
```

**已移除的舊格式：**
- ❌ Markdown 字串格式
- ❌ `{format: 'markdown', text: '...'}` 物件格式

**已移除的組件：**
- ❌ `MarkdownEditor.vue`
- ❌ `RichTextEditor.vue`
- ❌ `DraggablePreview.vue`
- ❌ `SnippetManagerModal.vue`

## 📊 測試建議

建議測試以下場景：

1. ✅ 在 `ResourceEditor.vue` 中使用 slash command 插入題目
2. ✅ 在 `QuestionSelectorModal` 中瀏覽和選擇題目
3. ✅ 在 `QuestionBlock` 中顯示題目內容和答案
4. ✅ 在 `StudentErrorLog` 中查看錯題記錄
5. ✅ 在 `QuestionImport` 中匯入外部題目
6. ✅ 在 `QuestionList` 中瀏覽題目列表
7. ✅ 在 `OnlineQuizRunner` 中進行線上測驗

## 🔍 未來優化建議

1. **統一使用 composable**: 考慮將 `QuestionList.vue` 中的本地函數遷移到統一的 composable
2. **性能優化**: 對於大量題目的列表，考慮使用虛擬滾動
3. **快取機制**: 對於頻繁訪問的題目內容，考慮添加快取層
4. **類型定義**: 添加 TypeScript 類型定義以提高代碼安全性

## ✨ 總結

- ✅ 創建了通用的 TipTap JSON 轉換工具
- ✅ 更新了 5 個核心文件以使用 TipTap 編輯器
- ✅ 確認了 2 個文件已經正確處理 TipTap JSON
- ✅ **完全移除了舊的 Markdown 編輯器組件**
- ✅ **移除了向後相容代碼**
- ✅ 所有文件無 linter 錯誤

### 🗑️ 已移除的文件

1. `frontend/src/components/MarkdownEditor.vue`
2. `frontend/src/components/RichTextEditor.vue`
3. `frontend/src/components/DraggablePreview.vue`
4. `frontend/src/components/SnippetManagerModal.vue`

### 📝 已更新的文件

1. `frontend/src/views/StudentErrorLog.vue` - 替換 4 個 RichTextEditor 為 BlockEditor
2. `frontend/src/composables/useTiptapConverter.js` - 移除向後相容代碼

所有使用題目內容的模組現在都**只支援 TipTap JSON 格式**，系統更加簡潔和一致。
