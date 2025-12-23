# BlockEditor 新功能說明

## 1. 批次選擇題目功能

### 功能描述
在 QuestionBlockComponent 中點擊「選擇題目」或「更換題目」時,會彈出題目選擇器對話框,支援:

- **多選模式**: 可以勾選多個題目 (最多100題)
- **篩選功能**: 
  - 科目篩選
  - 章節搜尋
  - 難度篩選
- **批次選擇**: 
  - 輸入數字 (1-100)
  - 點擊「選擇前 N 題」自動選擇篩選結果的前 N 個題目
- **選擇管理**:
  - 顯示篩選結果數量
  - 顯示已選題目數量
  - 一鍵清除所有選擇

### 使用方式

1. 在編輯器中使用斜線命令 `/` 插入題目區塊
2. 點擊「從題庫選擇」按鈕
3. 使用篩選條件縮小範圍
4. 方式一:手動勾選多個題目
5. 方式二:輸入數量,點擊「選擇前 N 題」批次選擇
6. 點擊「確認選擇」

### 技術實現

**檔案**: 
- `frontend/src/components/BlockEditor/components/QuestionSelectorModal.vue`
- `frontend/src/components/BlockEditor/components/QuestionBlockComponent.vue`

**核心功能**:
- 多選 checkbox 介面
- 批次選擇邏輯 (最多100題限制)
- 當選擇多個題目時,在當前位置依序插入多個 `questionBlock` 節點

```javascript
// QuestionBlockComponent.vue 中的批次插入邏輯
const onQuestionSelected = (questionIds) => {
  if (Array.isArray(questionIds)) {
    const editor = props.editor
    const pos = props.getPos() + props.node.nodeSize
    
    const nodes = questionIds.map(qId => 
      editor.schema.nodes.questionBlock.create({ questionId: qId })
    )
    
    editor.chain()
      .focus()
      .insertContentAt(pos, nodes)
      .run()
  }
}
```

---

## 2. 自動換頁功能

### 功能描述
在講義模式 (`handout`) 下,編輯器會自動檢測內容高度,當內容超過紙張邊界時自動插入換頁元件 (`pageBreak`),確保列印時不會跨頁截斷。

### 啟用條件
- 資源模式為「講義模式」(`resource.mode === 'handout'`)
- 設定 `auto-page-break` prop 為 `true`

### 技術實現

**檔案**: `frontend/src/components/BlockEditor/BlockEditor.vue`

**核心邏輯**:

1. **紙張尺寸計算**:
   - A4: 297mm 高度,扣除上下各 20mm padding = 257mm 可用內容高度
   - B4: 353mm 高度,扣除上下各 20mm padding = 313mm 可用內容高度
   - 使用 1mm ≈ 3.7795px (96dpi) 轉換為像素

2. **高度檢測**:
   - 遍歷編輯器中的所有頂層節點
   - 使用 `editor.view.domAtPos()` 獲取每個節點的 DOM 元素
   - 累積計算節點的 `offsetHeight`
   - 當累積高度超過頁面高度時,在該節點前插入 `pageBreak`

3. **防抖優化**:
   - 使用 500ms 防抖,避免頻繁觸發
   - 只在 `onUpdate` 事件中檢查

4. **智能插入**:
   - 檢查前一個節點是否已經是換頁符,避免重複插入
   - 從後往前插入,避免位置偏移問題

```javascript
// BlockEditor.vue 中的自動換頁邏輯
function checkAndInsertPageBreaks(editor) {
  // 防抖處理
  if (autoPageBreakTimeout) {
    clearTimeout(autoPageBreakTimeout)
  }
  
  autoPageBreakTimeout = setTimeout(() => {
    performPageBreakCheck(editor)
  }, 500)
}

function performPageBreakCheck(editor) {
  // 計算紙張可用高度
  const pageHeightMM = props.paperSize === 'A4' ? 297 : 353
  const contentHeightMM = pageHeightMM - 40 // 扣除 padding
  const pageHeightPx = contentHeightMM * 3.7795
  
  // 遍歷節點,檢測高度
  let currentPageHeight = 0
  const insertPositions = []
  
  // ... 高度檢測邏輯 ...
  
  // 插入換頁符
  insertPositions.reverse().forEach(pos => {
    editor.chain()
      .insertContentAt(pos, { type: 'pageBreak' })
      .run()
  })
}
```

### 在 ResourceEditor 中使用

```vue
<BlockEditor
  :model-value="tiptapStructure"
  @update:model-value="handleBlockEditorUpdate"
  :templates="templates"
  :questions="questions"
  :auto-page-break="resource.mode === 'handout'"
  :paper-size="resource.settings?.paperSize || 'A4'"
/>
```

### 限制與注意事項

1. **DOM 依賴**: 需要節點已經渲染到 DOM 才能計算高度
2. **性能考量**: 使用防抖避免頻繁計算
3. **手動換頁符**: 如果用戶手動插入換頁符,自動換頁邏輯會識別並跳過
4. **不適用場景**: 
   - 模板編輯模式 (`TemplateEditor`) 不啟用自動換頁
   - 測試頁面 (`BlockEditorTest`) 不啟用自動換頁

---

## 3. Props 新增

### BlockEditor.vue 新增的 Props

| Prop | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `autoPageBreak` | Boolean | `false` | 是否啟用自動換頁功能 |
| `paperSize` | String | `'A4'` | 紙張尺寸,可選 `'A4'` 或 `'B4'` |

---

## 4. 測試建議

### 批次選擇題目測試

1. 開啟 ResourceEditor 或 BlockEditorTest
2. 使用 `/` 插入題目區塊
3. 點擊「從題庫選擇」
4. 測試篩選功能 (科目、章節、難度)
5. 測試批次選擇 (輸入數字,點擊「選擇前 N 題」)
6. 測試手動多選 (勾選多個 checkbox)
7. 確認選擇後,檢查是否正確插入多個題目區塊

### 自動換頁測試

1. 創建或編輯一個講義模式的資源
2. 使用批次選擇功能插入 20-30 個題目
3. 觀察編輯器是否自動插入換頁符
4. 檢查換頁符位置是否合理 (不會截斷題目)
5. 測試不同紙張尺寸 (A4 vs B4)
6. 測試手動插入換頁符後,自動換頁是否仍正常運作

---

## 5. 未來改進方向

1. **更精確的高度計算**:
   - 考慮圖片、圖表等動態載入元素的高度
   - 支援更複雜的排版需求

2. **批次選擇的高級功能**:
   - 隨機選擇 N 題
   - 按難度比例選擇 (例如:簡單30%、中等50%、困難20%)
   - 儲存常用的篩選組合

3. **自動換頁的優化**:
   - 提供「智能換頁」選項,避免在題目中間換頁
   - 支援「孤行控制」(避免單行文字出現在頁首或頁尾)
   - 提供換頁符的可視化編輯和拖動調整

4. **性能優化**:
   - 使用虛擬滾動處理大量題目的選擇器
   - 優化自動換頁的計算邏輯,減少重新計算次數

---

## 相關檔案

### 新增檔案
- `frontend/src/components/BlockEditor/components/QuestionSelectorModal.vue` - 題目選擇器對話框
- `frontend/src/components/BlockEditor/components/TemplateSelectorModal.vue` - 模板選擇器對話框

### 修改檔案
- `frontend/src/components/BlockEditor/BlockEditor.vue` - 新增自動換頁邏輯和 props
- `frontend/src/components/BlockEditor/components/QuestionBlockComponent.vue` - 整合題目選擇器,支援批次插入
- `frontend/src/components/BlockEditor/components/TemplateBlockComponent.vue` - 整合模板選擇器
- `frontend/src/views/ResourceEditor.vue` - 傳入自動換頁相關 props
- `frontend/src/views/TemplateEditor.vue` - 禁用自動換頁
- `frontend/src/views/BlockEditorTest.vue` - 載入題目和模板數據

---

## 版本資訊

- **實作日期**: 2025-12-18
- **開發者**: AI Assistant
- **相關 Issue/PR**: Block Editor Integration
