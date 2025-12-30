# 舊編輯器使用情況報告

生成日期: 2025-12-18

## 📊 總結

### ✅ 已完全遷移到 BlockEditor
- `frontend/src/views/ResourceEditor.vue` - ✅ 完成
- `frontend/src/views/TemplateEditor.vue` - ✅ 完成

### 🔄 仍在使用舊編輯器的檔案

#### 1. **frontend/src/views/QuestionForm.vue**
**用途**: 題目表單編輯器（題庫系統）

**使用場景**:
- 編輯題目內容 (content)
- 編輯正確答案 (correct_answer)
- 編輯詳解內容 (solution_content)

**使用組件**: `RichTextEditor` (3 個實例)

**建議**: 
- ⚠️ 保留使用 `RichTextEditor`
- 原因: 題目表單是獨立的編輯場景,不需要 BlockEditor 的複雜功能
- `RichTextEditor` 提供簡單的 Markdown + LaTeX 編輯,適合這個用途

---

#### 2. **frontend/src/views/StudentErrorLog.vue**
**用途**: 學生錯題本系統

**使用場景**:
- 編輯錯題內容 (content)
- 編輯正確答案 (correct_answer)
- 匯入題目時編輯內容

**使用組件**: `RichTextEditor` (4 個實例)

**建議**: 
- ⚠️ 保留使用 `RichTextEditor`
- 原因: 錯題本編輯是簡單的文字編輯,不需要複雜的區塊結構
- 保持界面簡潔,適合學生使用

---

### 📦 舊編輯器組件的依賴關係

#### RichTextEditor.vue
**依賴組件**:
- `MarkdownEditor.vue` - Markdown 編輯器
- `DraggablePreview.vue` - 預覽模式

**被使用於**:
- ✅ `QuestionForm.vue` (3 處)
- ✅ `StudentErrorLog.vue` (4 處)
- ❌ `ResourceEditor.vue` (已移除)

**建議**: ⚠️ **保留** - 仍在題庫和錯題本系統中使用

---

#### MarkdownEditor.vue
**被使用於**:
- `RichTextEditor.vue` (內部使用)

**建議**: ⚠️ **保留** - RichTextEditor 的核心組件

---

#### DraggablePreview.vue
**依賴**:
- `markdownBlockParser.js` - Markdown 區塊解析器

**被使用於**:
- `RichTextEditor.vue` (預覽模式)

**建議**: ⚠️ **保留** - RichTextEditor 的預覽功能

---

#### markdownBlockParser.js
**被使用於**:
- `DraggablePreview.vue`

**建議**: ⚠️ **保留** - DraggablePreview 的核心工具

---

### 📄 預覽組件

#### RichTextPreview.vue
**被使用於**:
- `OnlineQuizRunner.vue` - 線上測驗顯示題目
- `QuestionList.vue` - 題目列表預覽
- `ResourceList.vue` - 資源列表預覽

**建議**: ⚠️ **保留** - 用於預覽和顯示,不是編輯功能

---

#### QuestionBlock.vue (舊版)
**被使用於**:
- `ResourceList.vue` - 資源列表中顯示題目區塊
- `BlockEditor/QuestionBlockComponent.vue` - 新編輯器中引用

**建議**: ⚠️ **保留** - 用於顯示題目,被新舊系統共用

---

#### TemplateBlock.vue (舊版)
**被使用於**:
- `ResourceList.vue` - 資源列表中顯示模板區塊

**建議**: ⚠️ **保留** - 用於顯示模板

---

## 🎯 結論與建議

### ✅ 可以安全保留的組件

以下組件應該**保留**,因為它們仍在其他系統中被使用:

1. **RichTextEditor.vue** - 題庫和錯題本系統使用
2. **MarkdownEditor.vue** - RichTextEditor 的核心
3. **DraggablePreview.vue** - RichTextEditor 的預覽功能
4. **markdownBlockParser.js** - DraggablePreview 的工具
5. **RichTextPreview.vue** - 多處用於顯示內容
6. **QuestionBlock.vue** - 顯示題目組件
7. **TemplateBlock.vue** - 顯示模板組件

### ❌ 可以考慮移除的檔案

目前**沒有**可以安全移除的舊編輯器組件,因為:
- 題庫系統 (QuestionForm) 仍需要簡單的編輯器
- 錯題本系統 (StudentErrorLog) 仍需要簡單的編輯器
- 預覽組件 (RichTextPreview) 在多處被使用
- 顯示組件 (QuestionBlock, TemplateBlock) 被新舊系統共用

### 🔮 未來優化方向

如果想進一步簡化,可以考慮:

1. **統一題目編輯器**
   - 將 QuestionForm 中的 RichTextEditor 替換為簡化版的 BlockEditor
   - 只啟用基本功能(段落、LaTeX)
   - 預計工作量: 中等

2. **統一錯題本編輯器**
   - 將 StudentErrorLog 中的 RichTextEditor 替換為簡化版的 BlockEditor
   - 預計工作量: 中等

3. **保持現狀**
   - ✅ **推薦**: 保持 RichTextEditor 用於簡單編輯場景
   - BlockEditor 用於複雜的文檔編輯 (ResourceEditor, TemplateEditor)
   - 各司其職,不需要過度統一

---

## 📁 檔案清單

### 舊編輯器組件 (仍在使用)
```
frontend/src/components/
├── RichTextEditor.vue          ← 題庫、錯題本使用
├── MarkdownEditor.vue          ← RichTextEditor 依賴
├── DraggablePreview.vue        ← RichTextEditor 預覽
├── RichTextPreview.vue         ← 多處顯示使用
├── QuestionBlock.vue           ← 顯示題目
└── TemplateBlock.vue           ← 顯示模板

frontend/src/utils/
└── markdownBlockParser.js      ← DraggablePreview 依賴
```

### 新編輯器組件 (已整合)
```
frontend/src/components/BlockEditor/
├── BlockEditor.vue
├── components/
│   ├── LaTeXBlockComponent.vue
│   ├── TemplateBlockComponent.vue
│   ├── QuestionBlockComponent.vue
│   ├── ... (其他區塊組件)
├── extensions/
│   └── ... (Tiptap Extensions)
└── utils/
    └── structureConverter.js
```

---

## 🎨 系統架構

```
教學資源系統
├── 📝 文檔編輯 (ResourceEditor, TemplateEditor)
│   └── ✅ 使用 BlockEditor (Notion-like)
│
├── 📚 題庫系統 (QuestionForm)
│   └── ⚠️ 使用 RichTextEditor (簡單編輯)
│
├── 📖 錯題本系統 (StudentErrorLog)
│   └── ⚠️ 使用 RichTextEditor (簡單編輯)
│
└── 👁️ 內容顯示 (各種 Runner 和 List)
    └── ⚠️ 使用 RichTextPreview + QuestionBlock + TemplateBlock
```

---

**結論**: 舊編輯器組件仍在題庫和錯題本系統中發揮作用,**建議保留**。ResourceEditor 和 TemplateEditor 已成功遷移到 BlockEditor。
