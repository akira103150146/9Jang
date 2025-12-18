# 編輯器預覽拖動功能實作總結

## 實作日期
2025-12-18

## 功能概述

為教學資源編輯器和模板編輯器新增了「編輯/預覽」雙模式切換功能，使用者可以：
- 在**編輯模式**下撰寫 Markdown 內容
- 在**預覽模式**下查看渲染效果並拖動區塊重新排序
- 拖動產生的變更會自動同步回原始 Markdown 內容

## 新增檔案

### 1. `frontend/src/utils/markdownBlockParser.js`
Markdown 區塊解析器，負責：
- 將 Markdown 文本解析為獨立的可拖動區塊
- 識別不同類型的 Markdown 語法（標題、段落、列表、程式碼塊、LaTeX 公式等）
- 將重新排序的區塊陣列轉換回 Markdown 文本

**主要函數**：
- `parseMarkdownToBlocks(markdown)` - 解析 Markdown 為區塊陣列
- `blocksToMarkdown(blocks)` - 區塊陣列轉回 Markdown
- `getBlockTypeName(type)` - 獲取區塊類型的中文名稱

**支援的區塊類型**：
- 標題 (heading)
- 段落 (paragraph)
- 程式碼區塊 (code_block)
- LaTeX 公式區塊 (latex_block)
- 無序列表 (list)
- 有序列表 (ordered_list)
- 引用 (quote)

### 2. `frontend/src/components/DraggablePreview.vue`
可拖動預覽組件，提供：
- 渲染 Markdown 區塊的預覽
- HTML5 拖放 API 實作的拖動功能
- 視覺化的拖動反饋（插入指示線、拖動手柄等）
- 區塊類型標籤顯示
- 響應式的拖動體驗

**主要功能**：
- 每個區塊都可獨立拖動
- 顯示清晰的插入位置指示
- Hover 時顯示拖動手柄和區塊類型
- 拖動時顯示提示文字
- 自動更新父組件的內容

## 修改檔案

### `frontend/src/components/RichTextEditor.vue`
重大改動：
- 新增 `mode` 狀態（'edit' | 'preview'）
- 在工具列添加模式切換按鈕
- 根據模式條件渲染編輯器或預覽組件
- 移除原有的下方預覽區域（避免混亂）
- 編輯工具按鈕僅在編輯模式顯示
- 預覽模式顯示拖動提示

**使用方式**：
```vue
<RichTextEditor 
  v-model="content" 
  placeholder="輸入內容..."
/>
```

組件會自動提供：
- ✏️ 編輯按鈕 - 切換到編輯模式
- 👁️ 預覽按鈕 - 切換到預覽模式（可拖動）

## 影響範圍

此功能會自動應用到所有使用 `RichTextEditor` 的地方：

1. **教學資源編輯器** (`/resources/new`, `/resources/edit/:id`)
   - 文字區塊編輯時可使用新功能
   
2. **模板編輯器** (`/templates/new`, `/templates/edit/:id`)
   - 模板內容編輯時可使用新功能

## 使用指南

### 編輯模式
1. 點擊「✏️ 編輯」按鈕進入編輯模式
2. 使用 Markdown 語法撰寫內容
3. 可使用工具列的插入按鈕快速插入公式、程式碼等

### 預覽模式
1. 點擊「👁️ 預覽」按鈕進入預覽模式
2. 看到渲染後的內容，每個區塊都是獨立的
3. Hover 在區塊上會顯示：
   - 左側的拖動手柄（⋮⋮）
   - 右上角的區塊類型標籤
4. 拖動區塊以重新排序：
   - 點擊並拖動任何區塊
   - 看到藍色的插入指示線
   - 放開滑鼠完成排序
5. 排序變更會自動同步到編輯器內容

## 技術細節

### 區塊解析邏輯
解析器按照優先級順序檢查：
1. 程式碼區塊（```...```）
2. LaTeX 區塊（$$...$$）
3. 標題（# ## ###）
4. 引用（>）
5. 無序列表（- * +）
6. 有序列表（1. 2. 3.）
7. 段落（其餘文字）

### 拖動實作
使用 HTML5 Drag & Drop API：
- `draggable="true"` - 使元素可拖動
- `@dragstart` - 記錄拖動的區塊
- `@dragover` - 計算插入位置
- `@drop` - 執行重新排序

### 資料流
```
用戶拖動區塊
  ↓
計算新順序
  ↓
更新區塊陣列
  ↓
轉換為 Markdown
  ↓
emit 'update:content'
  ↓
父組件更新 v-model
  ↓
重新渲染
```

## 相容性

- ✅ 保留所有原有的編輯功能
- ✅ 不影響 ResourceEditor 中其他區塊類型（question, template）的拖動
- ✅ Markdown 格式完整保留（包括 LaTeX、程式碼塊等）
- ✅ 支援自動儲存機制
- ✅ 響應式設計，適配不同螢幕尺寸

## 測試建議

1. **基本功能測試**
   - 在 `/resources/new` 創建新文件
   - 輸入多種 Markdown 語法
   - 切換到預覽模式檢查渲染
   - 拖動區塊重新排序
   - 切回編輯模式確認內容正確

2. **邊界測試**
   - 空內容時的表現
   - 只有一個區塊時的拖動
   - 複雜嵌套結構（列表中的程式碼等）
   - LaTeX 公式的正確渲染

3. **整合測試**
   - 與自動儲存的配合
   - 與題目、模板區塊的混合使用
   - 不同模式下的切換流暢度

## 已知限制

1. 拖動單位是整個區塊，不支援更細粒度的拖動（如單個列表項）
2. 區塊間的空行會被標準化為雙換行（`\n\n`）
3. 某些複雜的 Markdown 結構可能被解析為多個區塊

## 未來改進方向

1. 支援鍵盤快捷鍵調整區塊順序
2. 支援區塊的複製/刪除操作
3. 支援更精細的拖動單位（列表項、表格行等）
4. 添加撤銷/重做功能
5. 支援觸控裝置的長按拖動

## 相關文件

- 計劃文檔：`.cursor/plans/編輯器預覽拖動功能_4ca951cf.plan.md`
- 主要組件：`frontend/src/components/RichTextEditor.vue`
- 解析工具：`frontend/src/utils/markdownBlockParser.js`
- 預覽組件：`frontend/src/components/DraggablePreview.vue`
