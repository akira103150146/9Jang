# 反斜線消失問題診斷

## 📋 問題描述

用戶報告：「預覽時會有 `\`，但進入編輯模式 `\` 會消失」

## 🔍 可能的原因

### 1. TipTap 編輯器的轉義處理

TipTap 在處理文字時，可能會將反斜線 `\` 當作轉義字符處理。

### 2. JSON 序列化問題

在 JavaScript 中，反斜線在字符串中需要轉義：
- 正確：`"\\sin\\theta"` （兩個反斜線）
- 錯誤：`"\sin\theta"` （單個反斜線會被解釋為轉義字符）

### 3. 數據庫存儲問題

如果數據庫字段類型或編碼設置不正確，反斜線可能在存儲時丟失。

## 🧪 診斷步驟

### 步驟 1：檢查數據庫中的實際內容

在瀏覽器控制台中執行：

```javascript
// 獲取題目數據
const response = await fetch('http://your-backend-url/api/question_bank/YOUR_QUESTION_ID/')
const data = await response.json()
console.log('Content:', JSON.stringify(data.content, null, 2))
```

檢查輸出中是否包含反斜線。

### 步驟 2：檢查 TipTap JSON 結構

```javascript
// 在 QuestionForm.vue 中，查看 formData.content
console.log('TipTap Content:', JSON.stringify(formData.value.content, null, 2))
```

查看文字節點中的反斜線是否正確存儲。

### 步驟 3：檢查轉換過程

```javascript
// 測試 contentToMarkdown
import { contentToMarkdown } from './composables/useTiptapConverter'

const testContent = {
  type: 'doc',
  content: [{
    type: 'paragraph',
    content: [{
      type: 'text',
      text: '$\\sin\\theta$'
    }]
  }]
}

console.log('Markdown:', contentToMarkdown(testContent))
// 應該輸出：$\sin\theta$
```

## 🔧 解決方案

### 方案 1：確保 TipTap JSON 正確存儲反斜線

在 `QuestionForm.vue` 中，確保保存時反斜線被正確處理：

```javascript
const saveQuestion = async () => {
  // 在保存前，確保內容中的反斜線被正確序列化
  const contentStr = JSON.stringify(formData.value.content)
  console.log('Saving content:', contentStr)
  
  // 檢查是否包含雙反斜線（正確）還是單反斜線（錯誤）
  if (contentStr.includes('\\sin') && !contentStr.includes('\\\\sin')) {
    console.warn('警告：反斜線可能沒有被正確轉義')
  }
  
  // 繼續保存...
}
```

### 方案 2：在 BlockEditor 中正確處理反斜線

如果問題出在 BlockEditor 的輸入處理，可以添加一個輸入過濾器：

```javascript
// 在 BlockEditor.vue 或相關組件中
editor.on('update', ({ editor }) => {
  const json = editor.getJSON()
  
  // 遞迴檢查並修復反斜線
  const fixBackslashes = (node) => {
    if (node.type === 'text' && node.text) {
      // 確保 LaTeX 命令中的反斜線被保留
      // 注意：這只是示例，實際實現需要更仔細
      if (node.text.includes('$') && !node.text.includes('\\')) {
        console.warn('檢測到可能缺少反斜線的 LaTeX 公式')
      }
    }
    
    if (node.content) {
      node.content.forEach(fixBackslashes)
    }
  }
  
  fixBackslashes(json)
})
```

### 方案 3：使用 LaTeX 專用節點

最佳解決方案是使用 TipTap 的 LaTeX 擴展，將 LaTeX 內容存儲在專用節點中：

```javascript
// 使用 latexBlock 或 inlineLatex 節點
{
  type: 'doc',
  content: [{
    type: 'paragraph',
    content: [
      { type: 'text', text: '利用 ' },
      { type: 'inlineLatex', attrs: { latex: '\\sin\\theta' } },
      { type: 'text', text: ' 可推得...' }
    ]
  }]
}
```

這樣反斜線會被存儲在 `attrs.latex` 中，不會被當作普通文字處理。

## 🎯 推薦的臨時解決方案

如果問題緊急，可以使用以下臨時方案：

### 在 contentToMarkdown 中添加反斜線保護

```javascript
// 在 useTiptapConverter.js 中
export function tiptapToMarkdown(node) {
  if (node.type === 'text') {
    let text = node.text || ''
    
    // 檢查是否在 LaTeX 公式中（簡單檢測）
    if (text.includes('$')) {
      // 確保反斜線被保留
      // 注意：這是簡化的處理，可能需要更複雜的邏輯
      text = text.replace(/\\/g, '\\\\') // 雙重轉義
    }
    
    // ... 其他處理
    return text
  }
  // ... 其他節點類型
}
```

**警告**：這個方案可能會導致反斜線被過度轉義，需要仔細測試。

## 📝 測試用例

創建以下測試用例來驗證修復：

```javascript
// 測試 1：簡單的 LaTeX 公式
const test1 = {
  type: 'doc',
  content: [{
    type: 'paragraph',
    content: [{ type: 'text', text: '$\\sin\\theta$' }]
  }]
}

// 測試 2：複雜的 LaTeX 公式
const test2 = {
  type: 'doc',
  content: [{
    type: 'paragraph',
    content: [{ 
      type: 'text', 
      text: '$\\cos 2\\theta = \\cos^{2}\\theta - \\sin^{2}\\theta$' 
    }]
  }]
}

// 測試 3：混合內容
const test3 = {
  type: 'doc',
  content: [{
    type: 'paragraph',
    content: [
      { type: 'text', text: '利用 ' },
      { type: 'text', text: '$\\sin\\theta$' },
      { type: 'text', text: ' 可推得' }
    ]
  }]
}

// 對每個測試用例執行
[test1, test2, test3].forEach((test, i) => {
  const markdown = contentToMarkdown(test)
  const html = renderMarkdownWithLatex(markdown)
  console.log(`Test ${i + 1}:`, { markdown, html })
})
```

## 🔍 進一步調查

如果以上方案都不能解決問題，請提供以下信息：

1. **數據庫中的原始數據**
   ```sql
   SELECT content FROM question_bank WHERE question_id = YOUR_ID;
   ```

2. **瀏覽器控制台的輸出**
   - 打開題目編輯頁面
   - 在控制台執行：`console.log(JSON.stringify(formData.value.content))`
   - 複製輸出

3. **重現步驟**
   - 具體說明如何重現問題
   - 例如：「在題庫中新增題目 → 輸入 $\\sin\\theta$ → 保存 → 重新打開編輯」

## 🎉 預期結果

修復後，應該滿足：

1. ✅ 在編輯器中輸入 `$\sin\theta$`
2. ✅ 保存到數據庫時，反斜線被正確存儲
3. ✅ 重新打開編輯時，反斜線仍然存在
4. ✅ 在預覽和顯示時，LaTeX 公式正確渲染

---

**注意**：這是一個診斷文檔。實際修復需要根據具體的問題原因來實施。建議先執行診斷步驟，確定問題的根本原因，然後選擇合適的解決方案。
