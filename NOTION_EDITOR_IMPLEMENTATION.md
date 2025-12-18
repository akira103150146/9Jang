# Notion-like 樹狀編輯器實作總結

## 實作日期
2025-12-18

## 實作狀態

### ✅ 已完成
1. **Tiptap 基礎設置**
   - 安裝 @tiptap/suggestion, tippy.js
   - 創建 BlockEditor 核心組件

2. **自訂區塊 Extensions**
   - ✅ LaTeXBlock - 數學公式編輯
   - ✅ TemplateBlock - 模板引用
   - ✅ Diagram2DBlock - 2D 圖形 (JSXGraph)
   - ✅ Diagram3DBlock - 3D 圖形 (Three.js)
   - ✅ CircuitBlock - 電路圖

3. **斜線命令系統**
   - ✅ SlashCommands Extension
   - ✅ SlashMenu UI 組件
   - ✅ 命令項目配置 (commandItems.js)
   - 支援搜尋過濾
   - 支援鍵盤導航

4. **測試頁面**
   - ✅ BlockEditorTest.vue - 獨立測試頁面
   - 路由：`/block-editor-test`

### ⏸️ 未完成（需要更多時間）
1. **拖動與嵌套功能**
   - 原因：Tiptap 的拖動需要深度整合 ProseMirror Transaction API
   - 建議：使用 @tiptap/extension-drag-handle 或自訂 Plugin

2. **鍵盤快捷鍵**
   - 原因：需要實作複雜的節點操作邏輯
   - 可以稍後逐步添加

3. **完整整合到 ResourceEditor**
   - 原因：需要資料格式轉換和遷移策略
   - 測試頁面已可驗證基本功能

## 已創建檔案

### 核心組件
- `frontend/src/components/BlockEditor/BlockEditor.vue` - 主編輯器

### Extensions
- `frontend/src/components/BlockEditor/extensions/LaTeXBlock.js`
- `frontend/src/components/BlockEditor/extensions/TemplateBlock.js`
- `frontend/src/components/BlockEditor/extensions/Diagram2DBlock.js`
- `frontend/src/components/BlockEditor/extensions/Diagram3DBlock.js`
- `frontend/src/components/BlockEditor/extensions/CircuitBlock.js`
- `frontend/src/components/BlockEditor/extensions/SlashCommands.js`
- `frontend/src/components/BlockEditor/extensions/index.js`

### 組件
- `frontend/src/components/BlockEditor/components/LaTeXBlockComponent.vue`
- `frontend/src/components/BlockEditor/components/TemplateBlockComponent.vue`
- `frontend/src/components/BlockEditor/components/Diagram2DBlockComponent.vue`
- `frontend/src/components/BlockEditor/components/Diagram3DBlockComponent.vue`
- `frontend/src/components/BlockEditor/components/CircuitBlockComponent.vue`
- `frontend/src/components/BlockEditor/components/SlashMenu.vue`

### 工具
- `frontend/src/components/BlockEditor/utils/commandItems.js` - 斜線命令配置

### 測試
- `frontend/src/views/BlockEditorTest.vue` - 測試頁面

## 使用方式

### 訪問測試頁面
```
http://172.18.69.55:5173/block-editor-test
```

### 基本使用
```vue
<template>
  <BlockEditor
    v-model="content"
    :templates="availableTemplates"
    :questions="availableQuestions"
  />
</template>

<script setup>
import { ref } from 'vue'
import BlockEditor from '@/components/BlockEditor/BlockEditor.vue'

const content = ref({
  type: 'doc',
  content: []
})
</script>
```

### 斜線命令
輸入 `/` 可以觸發斜線選單，支援：
- 📝 文字 / 段落
- H1/H2/H3 標題
- ∑ LaTeX 公式
- 📄 模板
- 📊 2D 圖形
- 🎲 3D 圖形
- ⚡ 電路圖
- 列表、引用、程式碼等

### LaTeX 區塊使用
1. 輸入 `/` 選擇「LaTeX 公式」
2. 點擊區塊進入編輯模式
3. 輸入 LaTeX 公式（例如：`E = mc^2`）
4. 點擊「儲存」或在外部點擊

### 模板區塊使用
1. 輸入 `/` 選擇「模板」
2. 從下拉選單選擇模板
3. 模板內容會自動載入並渲染

## 技術特點

### 1. 基於 Tiptap
- 使用成熟的富文本編輯器框架
- 支援 ProseMirror 文檔樹狀結構
- 易於擴展自訂節點

### 2. Vue 3 Node Views
- 每個自訂區塊都是獨立的 Vue 組件
- 支援完整的 Vue 生態（響應式、生命週期等）
- 可以輕鬆整合現有組件（KaTeX, JSXGraph 等）

### 3. 斜線命令
- 使用 @tiptap/suggestion 實作
- Tippy.js 提供浮動選單
- 支援模糊搜尋和鍵盤導航

### 4. 資料格式
```javascript
{
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: '文字內容' }]
    },
    {
      type: 'latexBlock',
      attrs: {
        id: 'block-xxx',
        formula: 'E = mc^2',
        displayMode: true
      },
      content: []  // 可以有子區塊（未來支援嵌套）
    }
  ]
}
```

## 已知限制

1. **Placeholder Extension 相容性問題**
   - 暫時移除 Placeholder
   - 未來可以用其他方式實作

2. **拖動功能未實作**
   - 需要整合 ProseMirror 的拖動 Plugin
   - 可以使用 @tiptap/extension-drag-handle

3. **嵌套功能未實作**
   - Node Views 已支援 `content: 'block*'`
   - 需要實作 Tab/Shift+Tab 的節點移動邏輯

4. **鍵盤快捷鍵不完整**
   - 基本的 Enter, Backspace 由 StarterKit 提供
   - 需要自訂更多快捷鍵

## 下一步建議

### 短期（1-2天）
1. 修復 Placeholder 或實作替代方案
2. 添加基本的鍵盤快捷鍵
3. 實作簡單的拖動（使用現有 Extension）

### 中期（3-5天）
1. 完整的嵌套功能（Tab 縮排）
2. 整合到 ResourceEditor
3. 資料格式轉換工具（舊格式 → 新格式）

### 長期（1-2週）
1. 進階拖動功能（跨層級拖動）
2. 複製、貼上區塊
3. 撤銷/重做優化
4. 匯出功能（PDF, Markdown 等）

## 參考資源

- [Tiptap 官方文檔](https://tiptap.dev/)
- [ProseMirror 指南](https://prosemirror.net/docs/guide/)
- [@tiptap/suggestion 範例](https://tiptap.dev/docs/editor/extensions/functionality/suggestion)
- [Notion API 參考](https://developers.notion.com/)

## 相關檔案

- 舊編輯器：`frontend/src/components/RichTextEditor.vue`
- 舊預覽：`frontend/src/components/DraggablePreview.vue`
- 計劃文檔：`.cursor/plans/notion-like_樹狀編輯器_550cfc68.plan.md`
