# 列印功能修復

## 📋 問題描述

用戶報告：點選列印時顯示「沒有可列印內容」

## 🔍 根本原因

在移除 A4 分頁功能後，列印函數 `generatePrintPreview` 仍然在尋找舊的分頁元素：
- `.print-paper`
- `.paper-container`

但現在使用的是連續編輯模式，元素結構已改為：
- `.continuous-editor`
- `.block-editor-container`
- `.ProseMirror`

因此找不到任何頁面元素，導致顯示「沒有可列印內容」的錯誤。

## 🔧 修復方案

### 1. 修改內容檢測邏輯

#### 修改前

```javascript
// 獲取所有有內容的頁面 - 支持 .print-paper 和 .paper-container
const printPaperElements = document.querySelectorAll('.print-paper')
const paperContainerElements = document.querySelectorAll('.paper-container')
const allPaperElements = [...printPaperElements, ...paperContainerElements]

const pagesWithContent = Array.from(allPaperElements).filter(page => {
  const hasBlocks = page.querySelector('[data-block-id]')
  const hasText = page.textContent.trim().length > 0
  const hasProseMirror = page.querySelector('.ProseMirror')
  return hasBlocks || hasText || hasProseMirror
})

if (pagesWithContent.length === 0) {
  if (triggerPrint) {
    alert('沒有可列印的內容')
    return null
  }
}
```

#### 修改後

```javascript
// 獲取編輯器容器（連續編輯模式）
const editorContainer = document.querySelector('.continuous-editor') || 
                        document.querySelector('.block-editor-container') ||
                        document.querySelector('.ProseMirror')

// 檢查是否有內容
if (!editorContainer) {
  if (triggerPrint) {
    alert('沒有可列印的內容')
    return null
  }
  return null
}

// 檢查編輯器是否有實際內容
const hasText = editorContainer.textContent.trim().length > 0
const hasProseMirror = editorContainer.querySelector('.ProseMirror')
const hasContent = hasText || hasProseMirror

if (!hasContent) {
  if (triggerPrint) {
    alert('沒有可列印的內容')
    return null
  }
  // 預覽模式:顯示空白頁面
  // ...
}
```

**變更說明：**
- ✅ 改為尋找 `.continuous-editor`、`.block-editor-container` 或 `.ProseMirror`
- ✅ 使用單一容器而非多個頁面
- ✅ 簡化內容檢測邏輯

### 2. 修改列印樣式

#### 修改前

```css
@page {
  size: ${paperSize};
  margin: 0;
}
body {
  margin: 0;
  padding: 0;
  background: white;
}
.print-paper, .paper-container {
  width: ${paperWidth};
  min-height: ${paperHeight};
  padding: 20mm;
  margin: 0 auto;
  background: white;
  box-sizing: border-box;
  page-break-after: always;
  break-after: page;
}
.print-paper:last-child, .paper-container:last-child {
  page-break-after: auto;
  break-after: auto;
}
```

#### 修改後

```css
@page {
  size: ${paperSize};
  margin: 20mm;
}
body {
  margin: 0;
  padding: 0;
  background: white;
}
.print-container {
  width: 100%;
  max-width: ${paperWidth};
  margin: 0 auto;
  background: white;
  box-sizing: border-box;
}
/* 題目區塊避免分頁 */
.question-display {
  break-inside: avoid;
  page-break-inside: avoid;
}
/* 大題標題避免分頁 */
.section-block {
  break-inside: avoid;
  page-break-inside: avoid;
}
```

**變更說明：**
- ✅ 將 `@page` 的 margin 設為 20mm（之前是 0，由容器 padding 控制）
- ✅ 移除強制分頁的 `page-break-after: always`
- ✅ 改為由瀏覽器自動分頁
- ✅ 添加 `break-inside: avoid` 避免題目和大題標題被分頁切斷

### 3. 修改內容複製邏輯

#### 修改前

```javascript
// 複製頁面內容到 iframe
const container = iframeDoc.createElement('div')
container.style.background = 'white'

pagesWithContent.forEach((page, index) => {
  const clone = page.cloneNode(true)
  
  // 確保所有樣式都被複製
  const computedStyle = window.getComputedStyle(page)
  clone.style.cssText = computedStyle.cssText
  clone.style.margin = '0'
  clone.style.marginBottom = index < pagesWithContent.length - 1 ? '20mm' : '0'
  container.appendChild(clone)
})

iframeDoc.body.appendChild(container)
```

#### 修改後

```javascript
// 複製編輯器內容到 iframe
const container = iframeDoc.createElement('div')
container.className = 'print-container'
container.style.background = 'white'

// 複製編輯器內容
const clone = editorContainer.cloneNode(true)

// 移除編輯器特定的類別和屬性
clone.classList.remove('continuous-editor')
clone.removeAttribute('contenteditable')

// 移除所有編輯相關的元素（如工具列、選單等）
const editableElements = clone.querySelectorAll('[contenteditable]')
editableElements.forEach(el => el.removeAttribute('contenteditable'))

// 移除懸停工具列
const toolbars = clone.querySelectorAll('.question-toolbar, .section-toolbar')
toolbars.forEach(toolbar => toolbar.remove())

container.appendChild(clone)
iframeDoc.body.appendChild(container)
```

**變更說明：**
- ✅ 複製單一編輯器容器而非多個頁面
- ✅ 移除 `contenteditable` 屬性（避免列印時顯示編輯游標）
- ✅ 移除懸停工具列（`.question-toolbar`, `.section-toolbar`）
- ✅ 清理編輯器特定的類別

## 📊 修復對比

### 修復前

```
用戶點擊列印
    ↓
查找 .print-paper 和 .paper-container
    ↓
找不到任何元素（因為已移除分頁）
    ↓
pagesWithContent.length === 0
    ↓
顯示「沒有可列印的內容」❌
```

### 修復後

```
用戶點擊列印
    ↓
查找 .continuous-editor 或 .block-editor-container
    ↓
找到編輯器容器 ✅
    ↓
檢查是否有內容
    ↓
複製編輯器內容到 iframe
    ↓
應用列印樣式
    ↓
觸發列印 ✅
```

## 🎯 列印流程

### 完整列印流程

1. **用戶點擊「列印 / 預覽 PDF」按鈕**
   ```javascript
   const print = async () => {
     // 創建臨時 iframe 用於列印
     const printFrame = document.createElement('iframe')
     // ...
   }
   ```

2. **調用 `generatePrintPreview`**
   ```javascript
   await generatePrintPreview(iframeDoc, iframeWindow, true)
   ```

3. **檢測編輯器容器**
   ```javascript
   const editorContainer = document.querySelector('.continuous-editor') || 
                           document.querySelector('.block-editor-container') ||
                           document.querySelector('.ProseMirror')
   ```

4. **檢查內容**
   ```javascript
   const hasText = editorContainer.textContent.trim().length > 0
   const hasProseMirror = editorContainer.querySelector('.ProseMirror')
   const hasContent = hasText || hasProseMirror
   ```

5. **複製樣式表**
   - 複製所有 CSS 規則
   - 載入 KaTeX CSS（用於數學公式）
   - 添加列印專用樣式

6. **複製內容**
   ```javascript
   const clone = editorContainer.cloneNode(true)
   // 清理編輯器相關屬性
   clone.removeAttribute('contenteditable')
   // 移除工具列
   const toolbars = clone.querySelectorAll('.question-toolbar, .section-toolbar')
   toolbars.forEach(toolbar => toolbar.remove())
   ```

7. **觸發列印**
   ```javascript
   iframeWindow.focus()
   iframeWindow.print()
   ```

## 🧪 測試用例

### 測試 1：空白文檔

1. 打開一個新的資源編輯器
2. 不輸入任何內容
3. 點擊「列印」
4. 預期結果：顯示「沒有可列印的內容」

### 測試 2：有內容的文檔

1. 打開資源編輯器
2. 插入一些題目或輸入文字
3. 點擊「列印」
4. 預期結果：
   - ✅ 不顯示錯誤訊息
   - ✅ 開啟列印預覽視窗
   - ✅ 顯示正確的內容

### 測試 3：不同顯示模式

1. 插入題目
2. 選擇「純題目」模式
3. 點擊「列印」
4. 預期結果：列印時只顯示題目，不顯示答案和詳解

5. 選擇「題目+答案」模式
6. 點擊「列印」
7. 預期結果：列印時顯示題目和答案，不顯示詳解

8. 選擇「題目+詳解」模式
9. 點擊「列印」
10. 預期結果：列印時顯示題目和詳解，不顯示答案

11. 選擇「題目+答案+詳解」模式
12. 點擊「列印」
13. 預期結果：列印時顯示所有內容

### 測試 4：複雜內容

1. 插入多個題目
2. 插入大題標題（Section Block）
3. 插入 LaTeX 數學公式
4. 點擊「列印」
5. 預期結果：
   - ✅ 所有內容正確顯示
   - ✅ LaTeX 公式正確渲染
   - ✅ 題目不會被分頁切斷
   - ✅ 大題標題不會被分頁切斷

### 測試 5：編輯器工具列不出現在列印

1. 插入題目
2. 滑鼠懸停在題目上（顯示綠色工具列）
3. 點擊「列印」
4. 預期結果：
   - ✅ 列印預覽中不顯示綠色工具列
   - ✅ 列印預覽中不顯示「更換題目」、「刪除」按鈕

## ✨ 優勢

### 1. 適配連續編輯模式

- ✅ 正確識別連續編輯器容器
- ✅ 不再依賴舊的分頁元素
- ✅ 與新的編輯器架構一致

### 2. 簡化列印邏輯

- ✅ 不需要處理多個頁面
- ✅ 由瀏覽器自動處理分頁
- ✅ 減少複雜的頁面計算

### 3. 更好的列印效果

- ✅ 題目不會被分頁切斷
- ✅ 大題標題不會被分頁切斷
- ✅ 自動分頁更自然
- ✅ 移除編輯器特定的視覺元素

### 4. 與顯示模式整合

- ✅ 列印時根據當前顯示模式
- ✅ 所見即所得
- ✅ 不需要額外的 CSS 控制

## 📦 相關文件

### 修改的文件

1. **frontend/src/views/ResourceEditor.vue**
   - 修改 `generatePrintPreview` 函數
   - 更新內容檢測邏輯
   - 更新列印樣式
   - 更新內容複製邏輯

### 相關文檔

- **DISPLAY_MODE_CONTROL.md** - 顯示模式控制
- **PAGING_REMOVAL_SUMMARY.md** - 分頁功能移除
- **CONTINUOUS_EDITOR_MIGRATION.md** - 連續編輯器遷移

### 新增的文件

- **PRINT_FUNCTION_FIX.md** - 本文檔

## 🎉 總結

成功修復了列印功能，使其適配新的連續編輯模式：

- ✅ **修復內容檢測**：改為尋找 `.continuous-editor` 等新元素
- ✅ **簡化列印樣式**：移除強制分頁，由瀏覽器自動處理
- ✅ **清理列印內容**：移除編輯器工具列和屬性
- ✅ **保持顯示一致**：列印結果與編輯畫面一致
- ✅ **支援所有模式**：純題目、題目+答案、題目+詳解、全部顯示

現在用戶可以正常列印文檔，並且列印結果會根據當前選擇的顯示模式來顯示內容！🎊
