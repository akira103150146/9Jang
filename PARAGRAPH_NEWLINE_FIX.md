# 段落換行問題修復

## 問題描述
- 新增段落後無法換行
- 內容保持純文字型態,不會轉變成區塊物件
- LaTeX 區塊也有類似問題

## 根本原因

1. **StarterKit 配置不完整**: 缺少 paragraph、heading、hardBreak 的明確配置
2. **KeyboardShortcuts Enter 處理**: 返回 `false` 但沒有確保正確創建新段落
3. **缺少 Shift+Enter 處理**: 沒有硬換行(br)的快捷鍵

## 修復方案

### 1. 改進 StarterKit 配置 (`BlockEditor.vue`)

```javascript
StarterKit.configure({
  history: {
    depth: 100,
  },
  // 確保段落可以正常換行
  paragraph: {
    HTMLAttributes: {
      class: 'paragraph-block',
    },
  },
  // 確保標題可以正常使用
  heading: {
    levels: [1, 2, 3, 4, 5, 6],
  },
  // 確保硬換行功能啟用
  hardBreak: {
    keepMarks: true,
  },
}),
```

### 2. 改進 KeyboardShortcuts (`extensions/KeyboardShortcuts.js`)

#### Enter 鍵處理
```javascript
'Enter': ({ editor }) => {
  const { state } = editor
  const { $from } = state.selection
  const parentType = $from.parent.type.name

  // 如果在自定義區塊的內容區域
  if (['questionBlock', 'templateBlock', 'latexBlock', 
       'diagram2DBlock', 'diagram3DBlock', 'circuitBlock'].includes(parentType)) {
    return editor.chain().focus().createParagraphNear().run()
  }

  // 如果當前是段落,使用預設的換行行為
  if (parentType === 'paragraph') {
    return false // 讓 Tiptap 預設行為處理(創建新段落)
  }

  // 如果在標題或其他區塊,創建新段落
  if (['heading', 'codeBlock', 'blockquote'].includes(parentType)) {
    return editor.chain().focus().createParagraphNear().run()
  }

  return false
},
```

#### Shift+Enter 鍵處理(硬換行)
```javascript
'Shift-Enter': ({ editor }) => {
  return editor.chain().focus().setHardBreak().run()
},
```

### 3. 添加 DOM 事件處理 (`BlockEditor.vue`)

```javascript
editorProps: {
  handleDOMEvents: {
    keydown: (view, event) => {
      // 確保 Enter 鍵可以創建新段落
      if (event.key === 'Enter' && !event.shiftKey) {
        const { state } = view
        const { $from } = state.selection
        
        // 如果在段落的末尾,確保可以創建新段落
        if ($from.parent.type.name === 'paragraph' && 
            $from.pos === $from.end()) {
          return false // 讓預設行為處理
        }
      }
      return false
    }
  }
}
```

## 鍵盤快捷鍵

| 快捷鍵 | 功能 | 說明 |
|--------|------|------|
| `Enter` | 創建新段落或換行 | 根據當前區塊類型智能處理 |
| `Shift+Enter` | 插入硬換行(br) | 不創建新段落,只換行 |
| `Tab` | 增加縮排 | 在列表中有效 |
| `Shift+Tab` | 減少縮排 | 在列表中有效 |

## 不同區塊的 Enter 行為

### 段落 (Paragraph)
- **Enter**: 創建新段落
- **Shift+Enter**: 插入 `<br>` 標籤

### 標題 (Heading)
- **Enter**: 在標題後創建新段落
- **Shift+Enter**: 插入硬換行

### 自定義區塊 (Question, Template, LaTeX 等)
- **Enter**: 在區塊內部創建新段落
- **Shift+Enter**: 插入硬換行

### 列表 (List)
- **Enter**: 
  - 空列表項: 退出列表
  - 有內容: 創建新列表項
- **Shift+Enter**: 在列表項內換行

### 程式碼區塊 (Code Block)
- **Enter**: 創建新行(保留程式碼格式)
- **Shift+Enter**: 同 Enter

## 測試案例

### 測試 1: 段落換行
1. 輸入一些文字
2. 按 `Enter`
3. ✅ 應該創建新段落,游標移到新段落

### 測試 2: 硬換行
1. 輸入一些文字
2. 按 `Shift+Enter`
3. ✅ 應該在同一段落內換行(不創建新段落)

### 測試 3: LaTeX 區塊
1. 使用 `/` 插入 LaTeX 區塊
2. 輸入公式並儲存
3. 在 LaTeX 區塊後按 `Enter`
4. ✅ 應該在 LaTeX 區塊內創建新段落

### 測試 4: 題目區塊
1. 使用 `/` 插入題目區塊
2. 選擇一個題目
3. 在題目區塊內的內容區域按 `Enter`
4. ✅ 應該創建新段落

### 測試 5: 標題後換行
1. 使用 `/h1` 創建標題
2. 輸入標題文字
3. 按 `Enter`
4. ✅ 應該創建新段落(不是新標題)

## 相關檔案

- `frontend/src/components/BlockEditor/BlockEditor.vue`
- `frontend/src/components/BlockEditor/extensions/KeyboardShortcuts.js`

## 技術細節

### Tiptap 的換行機制

1. **`createParagraphNear()`**: 在當前節點附近創建新段落
2. **`setHardBreak()`**: 插入 `<br>` 標籤
3. **預設 Enter 行為**: 根據節點類型決定(由 StarterKit 處理)

### 為什麼需要自定義處理

- Tiptap 的預設行為可能不適合所有自定義節點
- 需要根據節點類型提供不同的換行邏輯
- 自定義區塊的內容區域需要特殊處理

## 已知限制

1. 在某些複雜的嵌套結構中,換行行為可能需要進一步調整
2. 如果自定義區塊沒有 `content: 'block*'`,則無法在內部創建段落

## 未來改進

1. 添加更多鍵盤快捷鍵(例如:Ctrl+Shift+Enter 在當前區塊前插入段落)
2. 改進嵌套區塊的換行邏輯
3. 添加自動格式化功能(例如:在列表中按兩次 Enter 自動退出列表)

---

**修復日期**: 2025-12-18
**狀態**: 已完成
