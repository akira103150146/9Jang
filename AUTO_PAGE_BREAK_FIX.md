# 自動換頁功能修正總結

## 修正日期
2024-12-19

## 問題描述
在 BlockEditor 中編輯資源時，當內容超出 A4/B4 紙面邊界時，沒有自動新增換頁符（Page Break）。

## 根本原因分析

### 問題 1: autoPageBreak prop 傳遞錯誤
- **位置**: `frontend/src/views/ResourceEditor.vue:303`
- **原因**: 使用了 `resource.mode === 'handout'`（小寫），但實際模式值是 `'HANDOUT'`（大寫）
- **修正**: 改為 `resource.mode === 'HANDOUT'`

### 問題 2: 節點高度計算錯誤
- **位置**: `frontend/src/components/BlockEditor/BlockEditor.vue:performPageBreakCheck()`
- **原因**: 
  - 使用 `editor.view.domAtPos()` 獲取的 DOM 節點不正確
  - 所有段落的 `offsetHeight` 都返回 24px（實際應該是 56px）
  - 沒有向上查找正確的塊級元素
- **修正**: 
  - 向上查找直到找到 ProseMirror 的直接子元素
  - 使用 `getBoundingClientRect()` 和 `getComputedStyle()` 計算完整高度（包括 margin）

### 問題 3: 換頁符高度計算錯誤
- **位置**: `frontend/src/components/BlockEditor/BlockEditor.vue:performPageBreakCheck()`
- **原因**: 換頁符本身的高度被計算為 1012px，幾乎佔滿整頁
- **修正**: 特殊處理換頁符，將其高度設為 0（因為它代表分頁點，不是實際內容）

## 修正內容

### 1. BlockEditor.vue

#### 修正 autoPageBreak prop 判斷
```vue
<!-- 修正前 -->
:auto-page-break="resource.mode === 'handout'"

<!-- 修正後 -->
:auto-page-break="resource.mode === 'HANDOUT'"
```

#### 修正節點高度計算
```javascript
// 修正前：直接使用 domNode.offsetHeight
if (domNode && domNode instanceof HTMLElement) {
  nodes.push({
    node,
    domNode,
    pos: offset,
    height: domNode.offsetHeight
  })
}

// 修正後：向上查找正確的塊級元素並計算完整高度
while (domNode && domNode.parentElement && domNode.parentElement.classList && 
       !domNode.parentElement.classList.contains('ProseMirror')) {
  domNode = domNode.parentElement
}

if (domNode && domNode instanceof HTMLElement) {
  const rect = domNode.getBoundingClientRect()
  const computedStyle = window.getComputedStyle(domNode)
  const marginTop = parseFloat(computedStyle.marginTop) || 0
  const marginBottom = parseFloat(computedStyle.marginBottom) || 0
  let totalHeight = rect.height + marginTop + marginBottom
  
  // 特殊處理：換頁符不應該計入高度計算
  if (node.type.name === 'pageBreak') {
    totalHeight = 0
  }
  
  nodes.push({
    node,
    domNode,
    pos: offset,
    height: totalHeight
  })
}
```

### 2. ResourceEditor.vue UI 改進

#### 移動 JSON 結構顯示到側邊欄
- 將 JSON 結構預覽從主編輯區移到左側邊欄的「文件設定」區塊
- 預設隱藏 JSON 結構（`showJson = false`）
- 使用更緊湊的樣式（較小的字體和高度限制）

#### 簡化主編輯區
- 移除多頁面預覽相關的 DOM 結構
- 只保留單一的 BlockEditor 容器
- 移除不必要的頁面計算函數：
  - `getBlockPage()`
  - `getBlocksForPage()`
  - `getGlobalBlockIndex()`
  - `ensurePages()`
  - `calculatePages()`

#### 清理代碼
- 移除不再使用的 ref：
  - `paperContainer`
  - `contentContainer`
  - `pageContainers`
  - `pageContentContainers`
  - `totalPages`
  - `markdownEditorRefs`
- 簡化 `addBlock()`, `addQuestionBlock()`, `addTemplateBlock()` 等函數
- 移除 ResizeObserver 相關的頁面監聽邏輯

## 測試結果

### 功能驗證
✅ 自動換頁功能正常工作
✅ 當內容超出頁面高度時，自動插入紅色的「強制分頁 (Page Break)」分隔線
✅ 換頁符正確顯示，不佔用過多空間
✅ 可以插入多個換頁符

### 日誌證據
- 成功插入 5 個換頁符
- 節點高度正確計算（從 24px 修正為 56px）
- 換頁符高度正確設為 0px
- 頁面可用高度：971.33px（A4 紙張減去 padding）

## 技術細節

### 頁面高度計算
- A4: 297mm - 40mm (padding) = 257mm ≈ 971.33px
- B4: 353mm - 40mm (padding) = 313mm ≈ 1182.66px
- 轉換係數: 1mm ≈ 3.7795px (at 96dpi)

### 換頁邏輯
1. 每次編輯器內容更新時觸發 `onUpdate` 事件
2. 如果 `autoPageBreak` 為 true，調用 `checkAndInsertPageBreaks()`
3. 使用 500ms 防抖避免頻繁觸發
4. 遍歷所有頂層節點，計算累積高度
5. 當累積高度超過頁面可用高度時，記錄插入位置
6. 從後往前插入換頁符，避免位置偏移

## 後續建議

### 可能的改進
1. **性能優化**: 考慮使用 IntersectionObserver 來優化大文件的換頁計算
2. **用戶體驗**: 添加手動插入換頁符的快捷鍵（如 Ctrl+Enter）
3. **視覺反饋**: 在接近頁面底部時顯示提示
4. **配置選項**: 允許用戶自定義頁面邊距和可用高度

### 已知限制
1. 換頁符的插入是基於內容高度計算，可能在某些複雜佈局下不夠精確
2. 目前只支持 A4 和 B4 兩種紙張大小
3. 換頁符插入後，如果用戶刪除內容，不會自動移除多餘的換頁符

## 相關檔案

### 修改的檔案
- `frontend/src/components/BlockEditor/BlockEditor.vue`
- `frontend/src/views/ResourceEditor.vue`

### 相關文件
- `GENERATOR_REMOVAL_SUMMARY.md` - 生成教學資源模塊移除總結
- `BLOCK_EDITOR_COMPLETE.md` - BlockEditor 完整實作文件
