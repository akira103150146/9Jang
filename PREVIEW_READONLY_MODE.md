# 預覽模式改為只讀模式

## 📋 修改日期
2025-12-29

## 🎯 修改目標

將 `RichTextPreview.vue` 從可編輯預覽模式改為純只讀預覽模式：
- ✅ 移除數學公式編輯功能
- ✅ 移除嵌入元件（2D/3D 圖形）編輯功能
- ✅ 保留跳轉到源代碼的功能

## 🔧 主要變更

### 1. 移除的組件引用

**移除前：**
```javascript
import MathPreviewEditorModal from './MathPreviewEditorModal.vue'
import EmbedJsonEditorModal from './EmbedJsonEditorModal.vue'
```

**移除後：**
這兩個組件不再被引用。

### 2. 移除的模板元素

**移除前：**
```vue
<template>
  <div class="rich-text-preview">
    <div ref="previewRoot" class="preview-content" v-html="renderedContent" @click="onPreviewClick"></div>
    <MathPreviewEditorModal
      v-if="mathEditor.open"
      :latex="mathEditor.latex"
      @cancel="closeMathEditor"
      @save="saveMathEditor"
    />
    <EmbedJsonEditorModal
      v-if="embedEditor.open"
      :title="embedEditor.type === 'diagram2d' ? '編輯 2D 圖形' : '編輯 3D 圖形'"
      :initial="embedEditor.raw"
      :preview-component="embedEditor.type === 'diagram2d' ? Diagram2DPreview : Diagram3DPreview"
      @cancel="closeEmbedEditor"
      @save="saveEmbedEditor"
    />
  </div>
</template>
```

**移除後：**
```vue
<template>
  <div class="rich-text-preview">
    <div ref="previewRoot" class="preview-content" v-html="renderedContent" @click="onPreviewClick"></div>
  </div>
</template>
```

### 3. 移除的狀態管理

**移除前：**
```javascript
const mathEditor = ref({
  open: false,
  pos: null,
  len: null,
  delim: '$',
  latex: '',
})

const embedEditor = ref({
  open: false,
  type: null,
  pos: null,
  len: null,
  raw: '{}',
})
```

**移除後：**
這些狀態變數已完全移除。

### 4. 簡化的點擊處理

**移除前：**
```javascript
const onPreviewClick = (event) => {
  // 處理嵌入元件編輯
  const embedEl = event?.target?.closest?.('[data-embed-type][data-embed][data-source-pos][data-source-len]')
  if (embedEl) {
    // ... 打開編輯器
    embedEditor.value = { open: true, type, pos, len, raw }
    return
  }

  // 處理數學公式編輯
  const mathEl = event?.target?.closest?.('[data-math-raw][data-source-pos][data-source-len]')
  if (mathEl) {
    // ... 打開編輯器
    mathEditor.value = { open: true, pos, len, delim, latex }
    return
  }

  // 處理跳轉到源代碼
  const el = event?.target?.closest?.('[data-source-pos],[data-source-line]')
  // ... 跳轉邏輯
}
```

**移除後：**
```javascript
const onPreviewClick = (event) => {
  // 移除數學公式和嵌入元件的編輯功能
  // 只保留跳轉到源代碼的功能
  const el = event?.target?.closest?.('[data-source-pos],[data-source-line]')
  if (!el) return
  const posAttr = el.getAttribute('data-source-pos')
  const lineAttr = el.getAttribute('data-source-line')
  const pos = posAttr != null ? Number(posAttr) : null
  const line = lineAttr != null ? Number(lineAttr) : null
  if (Number.isFinite(pos) && pos >= 0) {
    emit('jump-to', { pos, line: Number.isFinite(line) ? line : null })
    return
  }
  if (Number.isFinite(line) && line >= 1) {
    emit('jump-to', { pos: null, line })
  }
}
```

### 5. 移除的函數

以下函數已完全移除：
- ❌ `closeMathEditor()` - 關閉數學編輯器
- ❌ `saveMathEditor(newLatex)` - 保存數學公式編輯
- ❌ `closeEmbedEditor()` - 關閉嵌入元件編輯器
- ❌ `saveEmbedEditor(newRaw)` - 保存嵌入元件編輯

## 📊 代碼統計

| 項目 | 變更 |
|------|------|
| **移除的組件引用** | 2 個 |
| **移除的模板元素** | 2 個 Modal |
| **移除的 Refs** | 2 個 |
| **移除的函數** | 4 個 |
| **簡化的函數** | 1 個（`onPreviewClick`） |
| **移除的代碼行數** | ~80 行 |

## 🎯 功能變更

### 保留的功能

✅ **預覽顯示**
- Markdown 渲染
- LaTeX 數學公式顯示
- 圖片顯示
- 2D/3D 圖形預覽
- 電路圖預覽

✅ **跳轉功能**
- 點擊預覽內容跳轉到源代碼位置
- 支援行號和字符位置跳轉

### 移除的功能

❌ **數學公式編輯**
- 不能點擊數學公式打開編輯器
- 不能在預覽中直接修改公式

❌ **嵌入元件編輯**
- 不能點擊 2D/3D 圖形打開編輯器
- 不能在預覽中直接修改圖形數據

## 🎨 用戶體驗變更

### 變更前

**點擊數學公式：**
```
點擊 $x^2$ → 打開數學編輯器 → 可以修改公式 → 保存
```

**點擊圖形：**
```
點擊 2D 圖形 → 打開圖形編輯器 → 可以修改數據 → 保存
```

### 變更後

**點擊數學公式：**
```
點擊 $x^2$ → 跳轉到源代碼中的公式位置
```

**點擊圖形：**
```
點擊 2D 圖形 → 跳轉到源代碼中的圖形定義位置
```

## 💡 設計理念

### 為什麼改為只讀模式？

1. **一致性**
   - 題目預覽（`QuestionBlock.vue`）是只讀的
   - 現在 Markdown 預覽也是只讀的
   - 統一的用戶體驗

2. **簡化交互**
   - 減少用戶困惑（什麼時候可以編輯，什麼時候不能）
   - 明確的編輯流程：在編輯器中編輯 → 在預覽中查看

3. **數據一致性**
   - 避免在預覽中編輯導致的數據同步問題
   - 所有編輯都在源代碼中進行

4. **更好的性能**
   - 減少組件數量
   - 減少狀態管理
   - 更快的渲染速度

## 🔄 工作流程

### 現在的編輯流程

```
編輯 Markdown 源代碼
    ↓
實時預覽更新
    ↓
點擊預覽內容 → 跳轉到源代碼
    ↓
在源代碼中編輯
    ↓
預覽自動更新
```

### 數學公式編輯示例

**以前：**
1. 在編輯器中輸入 `$x^2$`
2. 預覽顯示 x²
3. 點擊預覽中的 x² → 打開編輯器
4. 修改為 `x^3`
5. 保存 → 源代碼更新

**現在：**
1. 在編輯器中輸入 `$x^2$`
2. 預覽顯示 x²
3. 點擊預覽中的 x² → 跳轉到源代碼中的 `$x^2$`
4. 直接在源代碼中修改為 `$x^3$`
5. 預覽自動更新

## ✨ 優勢

1. **更簡潔的代碼**
   - ✅ 移除 ~80 行代碼
   - ✅ 減少 2 個組件依賴
   - ✅ 減少 2 個狀態變數
   - ✅ 減少 4 個函數

2. **更清晰的職責**
   - ✅ 預覽組件只負責顯示
   - ✅ 編輯器負責編輯
   - ✅ 職責分離更明確

3. **更好的性能**
   - ✅ 減少組件渲染
   - ✅ 減少事件處理
   - ✅ 更快的響應速度

4. **更一致的體驗**
   - ✅ 與題目預覽行為一致
   - ✅ 減少用戶困惑
   - ✅ 更直觀的工作流程

## 📦 相關文件

### 修改的文件
- `frontend/src/components/RichTextPreview.vue` - 主要變更

### 不再使用的組件
- `frontend/src/components/MathPreviewEditorModal.vue` - 數學編輯器 Modal（可以刪除）
- `frontend/src/components/EmbedJsonEditorModal.vue` - 嵌入元件編輯器 Modal（可以刪除）

### 新增的文件
- `PREVIEW_READONLY_MODE.md` - 本文檔

## 🎉 總結

成功將 `RichTextPreview.vue` 改為純只讀預覽模式：
- 📉 **移除 ~80 行代碼**
- 🎨 **更簡潔的組件**
- ⚡ **更好的性能**
- 🔄 **更清晰的工作流程**
- ✨ **更一致的用戶體驗**

現在預覽組件專注於顯示內容，所有編輯操作都在源代碼編輯器中進行，提供了更清晰、更直觀的編輯體驗。
