<template>
  <div class="rich-text-editor">
    <div class="editor-toolbar">
      <!-- 模式切換按鈕 -->
      <div class="toolbar-group">
        <button 
          @click="mode = 'edit'" 
          :class="{ 'is-active': mode === 'edit' }"
          class="toolbar-btn mode-toggle"
          title="編輯模式"
        >
          ✏️ 編輯
        </button>
        <button 
          @click="mode = 'preview'" 
          :class="{ 'is-active': mode === 'preview' }"
          class="toolbar-btn mode-toggle"
          title="預覽模式（可拖動重新排序）"
        >
          👁️ 預覽
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <!-- 編輯工具（僅在編輯模式顯示） -->
      <template v-if="mode === 'edit'">
        <div class="toolbar-group">
          <span class="toolbar-group-label">插入</span>
          <button @click="insertInlineLatex" class="toolbar-btn" title="插入行內公式 $...$">∑</button>
          <button @click="insertBlockLatex" class="toolbar-btn" title="插入區塊公式 $$...$$">∫</button>
          <button @click="insertCodeBlock" class="toolbar-btn" title="插入程式碼區塊">&lt;/&gt;</button>
        </div>

        <div class="toolbar-divider"></div>

        <div class="toolbar-group">
          <span class="toolbar-group-label">物件</span>
          <button @click="insertDiagram2D" class="toolbar-btn" title="插入 2D 圖形（以 fenced block 表示）">📊</button>
          <button @click="insertDiagram3D" class="toolbar-btn" title="插入 3D 圖形（以 fenced block 表示）">🎲</button>
          <button @click="insertCircuit" class="toolbar-btn" title="插入電路圖（以 fenced block 表示）">⚡</button>
        </div>

        <div class="toolbar-divider"></div>

        <div class="toolbar-group">
          <span class="toolbar-group-label">Snippets</span>
          <button @click="openSnippets" class="toolbar-btn" title="管理 Snippets（自動完成 / 自訂片段）">✨</button>
        </div>
      </template>

      <!-- 預覽模式提示 -->
      <div v-else class="toolbar-group">
        <span class="toolbar-hint">💡 拖動區塊以重新排序內容</span>
      </div>
    </div>

    <!-- 編輯模式 -->
    <div v-if="mode === 'edit'" class="editor-container">
      <MarkdownEditor ref="mdEditorRef" v-model="text" :placeholder="placeholder" :templates="templates" />
    </div>

    <!-- 預覽模式 -->
    <DraggablePreview 
      v-else 
      :content="text" 
      @update:content="handlePreviewUpdate"
      class="preview-mode-container"
    />

    <SnippetManagerModal
      v-if="snippetModalOpen"
      @close="snippetModalOpen = false"
      @insert="insertSnippetFromModal"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import MarkdownEditor from './MarkdownEditor.vue'
import DraggablePreview from './DraggablePreview.vue'
import SnippetManagerModal from './SnippetManagerModal.vue'

const props = defineProps({
  modelValue: {
    type: [String, Object],
    default: '',
  },
  placeholder: {
    type: String,
    default: '開始輸入...',
  },
  templates: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const mdEditorRef = ref(null)
const text = ref('')
const snippetModalOpen = ref(false)
const mode = ref('edit') // 'edit' | 'preview'

const normalizeIncoming = (value) => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    if (value.format === 'markdown' && typeof value.text === 'string') return value.text
    if (value.type === 'doc') {
      return '⚠️ 這筆詳解是舊版富文本(JSON)格式。\n目前此編輯器改為純文字 Markdown。\n建議：先用後端「匯出 Markdown」功能轉出，再貼回來編輯。\n'
    }
  }
  return ''
}

watch(
  () => props.modelValue,
  (v) => {
    const next = normalizeIncoming(v)
    if (text.value !== next) text.value = next
  },
  { immediate: true, deep: true }
)

watch(
  () => text.value,
  (v) => {
    emit('update:modelValue', { format: 'markdown', text: v })
  }
)

const insertAtCursorOrAppend = (snippet, cursorOffset = 0) => {
  const s = String(snippet ?? '')
  if (mdEditorRef.value?.insertText) {
    mdEditorRef.value.insertText(s, cursorOffset)
    return
  }
  // fallback：若內部 editor 尚未暴露 insertText，就退回 append
  text.value = `${text.value || ''}${s}`
  mdEditorRef.value?.focus?.()
}

const insertInlineLatex = () => insertAtCursorOrAppend('$  $', -2)
const insertBlockLatex = () => insertAtCursorOrAppend('$$\n\n$$', -3)
const insertCodeBlock = () => insertAtCursorOrAppend('```text\n\n```', -4)
const insertDiagram2D = () => insertAtCursorOrAppend('```diagram2d\n{}\n```', -4)
const insertDiagram3D = () => insertAtCursorOrAppend('```diagram3d\n{}\n```', -4)
const insertCircuit = () => insertAtCursorOrAppend('```circuit\n{}\n```', -4)

const openSnippets = () => {
  snippetModalOpen.value = true
}

const insertSnippetFromModal = (snippet) => {
  const insert = snippet?.insert ?? ''
  const cursorOffset = snippet?.cursorOffset ?? 0
  insertAtCursorOrAppend(insert, cursorOffset)
  snippetModalOpen.value = false
}

const handlePreviewUpdate = (newContent) => {
  text.value = newContent
}
</script>

<style scoped>
.rich-text-editor {
  border: 1px solid rgb(203, 213, 225);
  border-radius: 0.5rem;
  overflow: visible;
  background: white;
  display: flex;
  flex-direction: column;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 0.5rem;
  border-bottom: 1px solid rgb(203, 213, 225);
  background: rgb(248, 250, 252);
  flex-wrap: nowrap;
  overflow-x: auto;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0 0.5rem;
}

.toolbar-group-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgb(100, 116, 139);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-right: 0.25rem;
  white-space: nowrap;
}

.toolbar-hint {
  font-size: 0.875rem;
  color: rgb(100, 116, 139);
  font-weight: 500;
  white-space: nowrap;
}

.toolbar-btn {
  padding: 0.5rem;
  border: none;
  background: transparent;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: rgb(51, 65, 85);
}

.toolbar-btn:hover {
  background: rgb(226, 232, 240);
}

.toolbar-btn.is-active {
  background: rgb(99, 102, 241);
  color: white;
}

.toolbar-btn.mode-toggle {
  font-weight: 600;
  padding: 0.5rem 1rem;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: rgb(203, 213, 225);
  margin: 0 0.5rem;
  flex-shrink: 0;
}

.editor-container {
  min-height: 300px;
  max-height: 600px;
  overflow-y: auto;
}

.editor-content {
  min-height: 300px;
  padding: 1rem;
  overflow-wrap: break-word;
  word-wrap: break-word;
}

.preview-mode-container {
  /* DraggablePreview 組件會處理自己的樣式 */
}

:deep(.ProseMirror) {
  outline: none;
  min-height: 300px;
  max-height: none; /* 移除最大高度限制，讓內容自然擴展 */
  direction: ltr; /* 確保文字方向正確 */
  text-align: left; /* 確保文字對齊 */
  color: rgb(0, 0, 0) !important; /* 強制黑色文字 */
  background: white !important; /* 強制白色背景 */
  font-size: 16px !important; /* 強制正常字體大小 */
  overflow-wrap: break-word; /* 允許長單詞換行 */
  word-wrap: break-word;
  overflow-x: hidden; /* 隱藏橫向滾動 */
  overflow-y: visible; /* 允許縱向擴展，由父容器處理滾動 */
}

:deep(.ProseMirror *) {
  color: rgb(0, 0, 0) !important;
  background: transparent !important;
  font-size: 16px !important; /* 強制正常字體大小 */
}

:deep(.ProseMirror p) {
  color: rgb(0, 0, 0) !important;
  background: transparent !important;
  font-size: 16px !important;
}

:deep(.ProseMirror span) {
  color: rgb(0, 0, 0) !important;
  background: transparent !important;
  font-size: 16px !important;
}

/* 確保所有文本節點使用正常字體大小 */
:deep(.ProseMirror .ProseMirror-text) {
  font-size: 16px !important;
}

/* 確保標題使用正常字體大小 */
:deep(.ProseMirror h1) {
  font-size: 2em !important;
}

:deep(.ProseMirror h2) {
  font-size: 1.5em !important;
}

:deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: rgb(148, 163, 184);
  pointer-events: none;
  height: 0;
}
</style>
