# Block Editor 實作狀態報告

## 實作日期
2025-12-18

## 已完成功能

### ✅ 1. Tiptap 基礎設置
- [x] 安裝依賴 (@tiptap/suggestion, tippy.js)
- [x] 創建 BlockEditor 核心組件
- [x] 設置基礎編輯器配置

### ✅ 2. 自訂區塊 Extensions
- [x] **LaTeXBlock** - 數學公式編輯與渲染
  - 支援編輯模式/預覽模式切換
  - 使用 KaTeX 渲染
  - 支援 displayMode 和 inline 模式

- [x] **TemplateBlock** - 模板引用
  - 從 API 載入模板內容
  - 顯示模板預覽
  - 支援更換模板

- [x] **Diagram2DBlock** - 2D 圖形
  - JSXGraph 配置編輯
  - 圖形容器渲染

- [x] **Diagram3DBlock** - 3D 圖形
  - Three.js 配置支援
  - 3D 場景容器

- [x] **CircuitBlock** - 電路圖
  - 電路圖配置編輯

### ✅ 3. 斜線命令系統
- [x] SlashCommands Extension
- [x] SlashMenu UI 組件
- [x] 13 種命令項目配置
- [x] 搜尋過濾功能
- [x] 鍵盤導航（方向鍵、Enter、Escape）

### ✅ 4. 鍵盤快捷鍵
- [x] Enter - 換行/新增段落
- [x] Backspace - 刪除空區塊
- [x] Tab/Shift+Tab - 列表縮排
- [x] Cmd+Shift+↑/↓ - 上下移動區塊
- [x] Cmd+D - 複製區塊
- [x] Cmd+Shift+D - 刪除區塊

### ✅ 5. 測試頁面
- [x] BlockEditorTest.vue
- [x] 路由：`/block-editor-test`
- [x] JSON 輸出顯示

## 部分完成功能

### ⚠️ 拖動與嵌套功能
- [x] DragHandle 組件創建
- [x] DragHandle Extension 基礎結構
- [ ] 完整的拖動邏輯實作
- [ ] 嵌套層級調整（Tab/Shift+Tab）
- [ ] 視覺反饋（插入指示線）

**狀態**: 基礎結構已創建，但完整的拖動邏輯需要更深入的 ProseMirror 知識。建議使用 `@tiptap/extension-drag-handle` 或類似的現有解決方案。

## 未完成功能

### ❌ 清理舊檔案
**原因**: 以下檔案仍在被其他組件使用：
- `RichTextEditor.vue` - 被 ResourceEditor, TemplateEditor, QuestionForm 使用
- `DraggablePreview.vue` - 被 ResourceEditor 使用
- `markdownBlockParser.js` - 可能被其他組件使用

**建議**: 
1. 先將所有使用舊編輯器的組件遷移到 BlockEditor
2. 然後再移除舊檔案
3. 或者保留舊檔案作為備用方案

## 檔案結構

```
frontend/src/components/BlockEditor/
├── BlockEditor.vue                    ✅ 主編輯器
├── extensions/
│   ├── LaTeXBlock.js                  ✅
│   ├── TemplateBlock.js               ✅
│   ├── Diagram2DBlock.js              ✅
│   ├── Diagram3DBlock.js              ✅
│   ├── CircuitBlock.js                ✅
│   ├── SlashCommands.js               ✅
│   ├── KeyboardShortcuts.js           ✅
│   ├── DragHandle.js                  ⚠️ 基礎結構
│   └── index.js                       ✅
├── components/
│   ├── LaTeXBlockComponent.vue        ✅
│   ├── TemplateBlockComponent.vue      ✅
│   ├── Diagram2DBlockComponent.vue     ✅
│   ├── Diagram3DBlockComponent.vue    ✅
│   ├── CircuitBlockComponent.vue       ✅
│   ├── SlashMenu.vue                  ✅
│   └── DragHandle.vue                 ⚠️ 基礎結構
└── utils/
    └── commandItems.js                ✅
```

## 使用方式

### 基本使用
```vue
<template>
  <BlockEditor
    v-model="content"
    :templates="templates"
    :questions="questions"
  />
</template>

<script setup>
import BlockEditor from '@/components/BlockEditor/BlockEditor.vue'

const content = ref({
  type: 'doc',
  content: []
})
</script>
```

### 斜線命令
輸入 `/` 觸發選單，支援：
- 📝 文字 / 段落
- H1/H2/H3 標題
- ∑ LaTeX 公式
- 📄 模板
- 📊 2D 圖形
- 🎲 3D 圖形
- ⚡ 電路圖
- 列表、引用、程式碼等

### 鍵盤快捷鍵
- `Enter` - 換行
- `Backspace` - 刪除空區塊
- `Tab` / `Shift+Tab` - 列表縮排
- `Cmd+Shift+↑/↓` - 移動區塊
- `Cmd+D` - 複製區塊
- `Cmd+Shift+D` - 刪除區塊

## 測試

訪問測試頁面：
```
http://172.18.69.55:5173/block-editor-test
```

## 下一步建議

### 短期（1-2天）
1. ✅ 完成鍵盤快捷鍵（已完成）
2. ⚠️ 實作簡單的拖動功能（使用現有 Extension）
3. 修復任何編譯錯誤

### 中期（3-5天）
1. 完整的拖動與嵌套功能
2. 整合到 ResourceEditor（替換舊編輯器）
3. 資料格式轉換工具（舊格式 → 新格式）

### 長期（1-2週）
1. 進階拖動功能（跨層級拖動）
2. 複製、貼上區塊
3. 撤銷/重做優化
4. 匯出功能（PDF, Markdown 等）

## 已知問題

1. **Placeholder Extension** - 已移除，因為有依賴問題
2. **拖動功能** - 需要更深入的 ProseMirror 知識或使用現有 Extension
3. **嵌套功能** - Tab/Shift+Tab 目前只支援列表，不支援一般區塊嵌套

## 技術債務

1. 需要將 ResourceEditor 遷移到 BlockEditor
2. 需要將 TemplateEditor 遷移到 BlockEditor
3. 需要資料格式遷移工具
4. 需要完整的拖動功能實作

## 參考資源

- [Tiptap 官方文檔](https://tiptap.dev/)
- [ProseMirror 指南](https://prosemirror.net/docs/guide/)
- [@tiptap/extension-drag-handle](https://github.com/ueberdosis/tiptap/tree/main/packages/extension-drag-handle) - 可考慮使用
