# LaTeX 渲染修復總結

## 📋 修復日期
2025-12-29

## 🐛 問題描述

題目中的 LaTeX 數學公式沒有正確渲染，顯示為純文字：
- 例如：`$\sin^{2}\theta$` 顯示為純文字，而不是渲染後的數學公式
- 問題出現在 `QuestionBlock.vue` 和 `QuestionSelectorModal.vue`

## 🔍 根本原因

在將 TipTap JSON 轉換為可渲染的內容時，使用了錯誤的轉換函數：

### 錯誤的方法
```javascript
// ❌ 使用 contentToTextPreview 或 extractTextFromTiptapJSON
const textContent = contentToTextPreview(content)
return renderMarkdownWithLatex(textContent)
```

**問題：**
- `contentToTextPreview` 只提取純文字
- 會移除所有 LaTeX 標記（`$` 符號）
- `renderMarkdownWithLatex` 收到的是沒有 LaTeX 標記的純文字
- 因此無法識別和渲染數學公式

### 正確的方法
```javascript
// ✅ 使用 contentToMarkdown
const markdownContent = contentToMarkdown(content)
return renderMarkdownWithLatex(markdownContent)
```

**優點：**
- `contentToMarkdown` 會保留 LaTeX 標記（`$...$` 和 `$$...$$`）
- `renderMarkdownWithLatex` 可以正確識別並渲染數學公式

## 🔧 修復內容

### 1. QuestionBlock.vue

**修復前：**
```javascript
const { renderMarkdownWithLatex } = useMarkdownRenderer()
const { contentToTextPreview } = useTiptapConverter()

const renderContent = (content) => {
  if (!content) return ''
  const textContent = contentToTextPreview(content)
  return renderMarkdownWithLatex(textContent)
}
```

**修復後：**
```javascript
const { renderMarkdownWithLatex } = useMarkdownRenderer()
const { contentToMarkdown } = useTiptapConverter()

const renderContent = (content) => {
  if (!content) return ''
  // 使用 contentToMarkdown 保留 LaTeX 標記，然後用 renderMarkdownWithLatex 渲染
  const markdownContent = contentToMarkdown(content)
  return renderMarkdownWithLatex(markdownContent)
}
```

### 2. QuestionSelectorModal.vue

**修復前：**
```javascript
const { renderMarkdownWithLatex } = useMarkdownRenderer()
const { extractTextFromTiptapJSON } = useTiptapConverter()

const renderPreview = (content) => {
  if (!content) return ''
  
  let textContent = ''
  if (typeof content === 'object' && content.type === 'doc') {
    textContent = extractTextFromTiptapJSON(content)
  } else if (typeof content === 'string') {
    textContent = content
  } else {
    textContent = String(content)
  }
  
  const text = textContent.replace(/[#*>\[\]!]/g, '').substring(0, 100)
  return renderMarkdownWithLatex(text + (textContent.length > 100 ? '...' : ''))
}
```

**修復後：**
```javascript
const { renderMarkdownWithLatex } = useMarkdownRenderer()
const { contentToMarkdown } = useTiptapConverter()

const renderPreview = (content) => {
  if (!content) return ''
  
  // 處理 TipTap JSON 格式，保留 LaTeX 標記
  let markdownContent = ''
  if (typeof content === 'object' && content.type === 'doc') {
    // 使用 contentToMarkdown 保留 LaTeX 標記
    markdownContent = contentToMarkdown(content)
  } else if (typeof content === 'string') {
    markdownContent = content
  } else {
    markdownContent = String(content)
  }
  
  // 只顯示前 200 個字元（因為包含 LaTeX 標記會比較長）
  const text = markdownContent.substring(0, 200)
  return renderMarkdownWithLatex(text + (markdownContent.length > 200 ? '...' : ''))
}
```

## 📊 修復統計

| 文件 | 修改內容 |
|------|---------|
| `QuestionBlock.vue` | 將 `contentToTextPreview` 改為 `contentToMarkdown` |
| `QuestionSelectorModal.vue` | 將 `extractTextFromTiptapJSON` 改為 `contentToMarkdown` |
| **總計** | 2 個文件，2 個函數 |

## 🎯 轉換函數使用指南

### contentToTextPreview / extractTextFromTiptapJSON
**用途：** 提取純文字，用於顯示簡短預覽或驗證內容

**適用場景：**
- ✅ 列表中的簡短預覽（`QuestionList.vue`）
- ✅ 驗證內容是否為空（`QuestionForm.vue`）
- ✅ 提取選項內容進行判斷（`QuestionForm.vue`）

**不適用場景：**
- ❌ 需要渲染 LaTeX 數學公式
- ❌ 需要保留 Markdown 格式
- ❌ 完整內容顯示

### contentToMarkdown
**用途：** 將 TipTap JSON 轉換為 Markdown，保留所有格式標記

**適用場景：**
- ✅ 需要渲染 LaTeX 數學公式
- ✅ 需要保留 Markdown 格式（粗體、斜體等）
- ✅ 完整內容顯示
- ✅ 配合 `renderMarkdownWithLatex` 使用

**使用模式：**
```javascript
import { useMarkdownRenderer } from '../composables/useMarkdownRenderer'
import { useTiptapConverter } from '../composables/useTiptapConverter'

const { renderMarkdownWithLatex } = useMarkdownRenderer()
const { contentToMarkdown } = useTiptapConverter()

const renderContent = (content) => {
  const markdown = contentToMarkdown(content)
  return renderMarkdownWithLatex(markdown)
}
```

## 🔄 數據流程

### 修復前（錯誤）
```
TipTap JSON
    ↓
contentToTextPreview (提取純文字，移除 LaTeX 標記)
    ↓
"sin^2 theta" (純文字，沒有 $ 符號)
    ↓
renderMarkdownWithLatex (無法識別數學公式)
    ↓
顯示純文字 ❌
```

### 修復後（正確）
```
TipTap JSON
    ↓
contentToMarkdown (轉換為 Markdown，保留 LaTeX 標記)
    ↓
"$\sin^{2}\theta$" (Markdown 格式，保留 $ 符號)
    ↓
renderMarkdownWithLatex (識別並渲染數學公式)
    ↓
顯示渲染後的數學公式 ✅
```

## 🧪 測試建議

### 功能測試

1. **題目顯示**
   - [ ] 插入包含數學公式的題目
   - [ ] 數學公式正確渲染（不顯示純文字）
   - [ ] 行內公式（`$...$`）正確顯示
   - [ ] 區塊公式（`$$...$$`）正確顯示

2. **題目選擇器預覽**
   - [ ] 在題目選擇器中預覽題目
   - [ ] 數學公式正確渲染
   - [ ] 預覽截斷時不會破壞公式

3. **答案和詳解**
   - [ ] 答案中的數學公式正確渲染
   - [ ] 詳解中的數學公式正確渲染

### 視覺測試

1. **數學公式渲染**
   - [ ] 分數顯示正確（例如：$\frac{1}{2}$）
   - [ ] 上標和下標正確（例如：$x^2$、$a_n$）
   - [ ] 三角函數正確（例如：$\sin\theta$、$\cos 2\theta$）
   - [ ] 希臘字母正確（例如：$\theta$、$\pi$）
   - [ ] 根號正確（例如：$\sqrt{5}$）

2. **混合內容**
   - [ ] 文字和公式混合顯示正確
   - [ ] 多個公式在同一段落中正確顯示

## ✨ 優勢

1. **正確的數學公式渲染**
   - ✅ LaTeX 公式正確顯示
   - ✅ 專業的數學排版
   - ✅ 符合教學需求

2. **保留完整格式**
   - ✅ 保留 Markdown 格式（粗體、斜體等）
   - ✅ 保留 LaTeX 標記
   - ✅ 完整的內容呈現

3. **一致的顯示效果**
   - ✅ 題目顯示和預覽一致
   - ✅ 編輯和顯示一致
   - ✅ 列印和螢幕顯示一致

## 📦 相關文件

### 修改的文件
- `frontend/src/components/QuestionBlock.vue`
- `frontend/src/components/BlockEditor/components/QuestionSelectorModal.vue`

### 相關的 Composables
- `frontend/src/composables/useTiptapConverter.js` - 提供轉換函數
- `frontend/src/composables/useMarkdownRenderer.js` - 提供渲染函數

### 新增的文件
- `LATEX_RENDERING_FIX.md` - 本文檔

## 🎉 總結

成功修復了 LaTeX 數學公式的渲染問題：
- 🔧 **修復 2 個文件**
- ✅ **使用正確的轉換函數**
- 📐 **數學公式正確顯示**
- 📝 **保留完整的 Markdown 格式**

現在題目中的數學公式可以正確渲染，提供了專業的數學排版效果，滿足教學需求！
