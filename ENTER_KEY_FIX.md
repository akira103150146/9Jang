# Enter 鍵換行問題修復

## 問題描述
用戶按 Enter 鍵後無法換行,編輯器卡住不動,無法創建新段落。

## 根本原因

**無限更新循環問題**: 
```javascript
// BlockEditor.vue 中的問題代碼

// onUpdate 觸發時 emit 更新
onUpdate: ({ editor }) => {
  const json = editor.getJSON()
  emit('update:modelValue', json)  // 觸發父組件更新
}

// watch 監聽 modelValue 變化
watch(() => props.modelValue, (newValue) => {
  if (!editor.value) return
  const currentContent = editor.value.getJSON()
  const newContent = convertToTiptapFormat(newValue)
  
  // 當 modelValue 變化時,重置編輯器內容
  editor.value.commands.setContent(newContent, false)  // 這會觸發 onUpdate!
}, { deep: true })
```

### 問題流程
1. 用戶按 Enter 鍵
2. Tiptap 嘗試創建新段落
3. `onUpdate` 被觸發,emit 新的 modelValue
4. `watch` 檢測到 modelValue 變化
5. `watch` 調用 `setContent()` 重置編輯器內容
6. 內容被恢復到變化前的狀態
7. 用戶看起來按 Enter 沒有任何反應

## 解決方案

使用標誌變數 `isUpdatingFromEditor` 來防止循環更新:

```javascript
// 添加標誌變數
let isUpdatingFromEditor = false

// 在 onUpdate 中設置標誌
onUpdate: ({ editor }) => {
  isUpdatingFromEditor = true  // 設置標誌
  const json = editor.getJSON()
  emit('update:modelValue', json)
  
  if (props.autoPageBreak) {
    checkAndInsertPageBreaks(editor)
  }
  
  // 100ms 後重置標誌
  setTimeout(() => {
    isUpdatingFromEditor = false
  }, 100)
}

// 在 watch 中檢查標誌
watch(() => props.modelValue, (newValue) => {
  if (!editor.value || isUpdatingFromEditor) return  // 如果是編輯器觸發的更新,跳過
  
  const currentContent = editor.value.getJSON()
  const newContent = convertToTiptapFormat(newValue)
  
  if (JSON.stringify(currentContent) !== JSON.stringify(newContent)) {
    editor.value.commands.setContent(newContent, false)
  }
}, { deep: true })
```

## 修復邏輯

1. **編輯器更新流程**:
   - 用戶在編輯器中輸入/按 Enter
   - `onUpdate` 觸發,設置 `isUpdatingFromEditor = true`
   - emit 更新到父組件
   - `watch` 被觸發,但檢測到 `isUpdatingFromEditor === true`,跳過處理
   - 100ms 後重置標誌

2. **外部更新流程**:
   - 父組件改變 modelValue
   - `watch` 被觸發,`isUpdatingFromEditor === false`
   - 正常更新編輯器內容

## 其他改進

### 1. 移除有問題的 Enter 鍵自定義處理
之前嘗試在 KeyboardShortcuts 中自定義 Enter 行為,但返回 `false` 並不能正確觸發預設行為。

```javascript
// 移除前 (有問題)
'Enter': ({ editor }) => {
  // 各種判斷邏輯...
  return false  // 這不能正確觸發預設行為
}

// 移除後 (正確)
// 完全不處理 Enter,讓 StarterKit 的預設行為處理
```

### 2. 保留 Shift+Enter 處理
```javascript
'Shift-Enter': ({ editor }) => {
  return editor.chain().focus().setHardBreak().run()
}
```

### 3. 確保編輯器可編輯
```javascript
const editor = useEditor({
  extensions: [...],
  content: convertToTiptapFormat(props.modelValue),
  editable: true,  // 明確設定為可編輯
  //...
})
```

## 測試結果

✅ **修復前**: 按 Enter 鍵無反應,內容被立即恢復
✅ **修復後**: 按 Enter 鍵正常創建新段落

## 相關問題

這個問題也解決了:
- LaTeX 區塊內無法換行
- 其他自定義區塊內無法換行
- 段落保持純文字型態,不轉變成區塊物件

所有這些問題都是由同一個根本原因(無限更新循環)導致的。

## 修改的檔案

1. **frontend/src/components/BlockEditor/BlockEditor.vue**
   - 添加 `isUpdatingFromEditor` 標誌變數
   - 修改 `onUpdate` 處理邏輯
   - 修改 `watch` 處理邏輯
   - 添加 `editable: true` 配置

2. **frontend/src/components/BlockEditor/extensions/KeyboardShortcuts.js**
   - 移除自定義的 Enter 鍵處理
   - 保留 Shift+Enter 處理

## 技術細節

### Vue 響應式系統的循環更新問題

在 Vue 的響應式系統中,watch 和 emit 的組合可能導致循環更新:
```
User Input → onUpdate → emit → watch → setContent → onUpdate → ...
```

### 解決方案的關鍵

使用標誌變數是一種常見的模式,用於:
- 區分更新來源(用戶操作 vs 程式控制)
- 防止循環更新
- 保持單向數據流

### 為什麼使用 setTimeout

`setTimeout(() => { isUpdatingFromEditor = false }, 100)` 確保:
1. Vue 的響應式系統完成所有更新
2. watch 的 deep 監聽完成比較
3. 父組件的狀態穩定後才重置標誌

## 未來改進

1. **更精確的比較**: 可以使用更智能的內容比較,而不是 `JSON.stringify`
2. **debounce**: 對 emit 使用 debounce 來減少更新頻率
3. **Transaction**: 使用 Tiptap 的 transaction 系統來更好地控制更新

## 相關文檔

- `PARAGRAPH_NEWLINE_FIX.md` - 之前嘗試的修復(未解決根本問題)
- `CURSOR_VISIBILITY_IMPROVEMENTS.md` - 游標可見性改進
- `BLOCK_EDITOR_NEW_FEATURES.md` - 批次選擇和自動換頁功能

---

**修復日期**: 2025-12-18
**狀態**: ✅ 已完成並驗證
**影響範圍**: 所有編輯器功能現在都能正常工作
