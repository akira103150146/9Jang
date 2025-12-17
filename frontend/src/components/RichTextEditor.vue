<template>
  <div class="rich-text-editor">
    <div class="editor-toolbar">
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
    </div>
    <div class="editor-container">
      <MarkdownEditor ref="mdEditorRef" v-model="text" :placeholder="placeholder" />
    </div>
    <div class="preview-divider">
      <div class="divider-line"></div>
      <span class="divider-label">預覽</span>
      <div class="divider-line"></div>
    </div>
    <div class="preview-container">
      <RichTextPreview :content="text" @jump-to="jumpTo" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import MarkdownEditor from './MarkdownEditor.vue'
import RichTextPreview from './RichTextPreview.vue'

const props = defineProps({
  modelValue: {
    type: [String, Object],
    default: '',
  },
  placeholder: {
    type: String,
    default: '開始輸入...',
  },
})

const emit = defineEmits(['update:modelValue'])

const mdEditorRef = ref(null)
const text = ref('')

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

const appendSnippet = (snippet) => {
  text.value = `${text.value || ''}${snippet}`
  mdEditorRef.value?.focus?.()
}

const insertInlineLatex = () => appendSnippet('\n$ x^2 $\n')
const insertBlockLatex = () => appendSnippet('\n$$\n\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}\n$$\n')
const insertCodeBlock = () => appendSnippet('\n```text\n\n```\n')
const insertDiagram2D = () => appendSnippet('\n```diagram2d\n{}\n```\n')
const insertDiagram3D = () => appendSnippet('\n```diagram3d\n{}\n```\n')
const insertCircuit = () => appendSnippet('\n```circuit\n{}\n```\n')

const jumpTo = (payload) => {
  const replace = payload?.replace || null
  if (replace && Number.isFinite(replace.pos) && Number.isFinite(replace.len)) {
    const p = replace.pos
    const l = replace.len
    const rep = String(replace.text ?? '')
    text.value = `${text.value.slice(0, p)}${rep}${text.value.slice(p + l)}`
    mdEditorRef.value?.focusAtPos?.(p + rep.length)
    return
  }

  const pos = payload?.pos
  const line = payload?.line
  if (Number.isFinite(pos) && pos >= 0) {
    mdEditorRef.value?.focusAtPos?.(pos)
    return
  }
  if (Number.isFinite(line) && line >= 1) {
    mdEditorRef.value?.focusAtLine?.(line)
  }
}
</script>

<style scoped>
.rich-text-editor {
  border: 1px solid rgb(203, 213, 225);
  border-radius: 0.5rem;
  overflow: visible; /* 改為 visible，讓內部容器處理 overflow */
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
  border-bottom: 1px solid rgb(203, 213, 225);
}

.editor-content {
  min-height: 300px;
  padding: 1rem;
  overflow-wrap: break-word;
  word-wrap: break-word;
}

.preview-divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgb(248, 250, 252);
  border-bottom: 1px solid rgb(203, 213, 225);
}

.divider-line {
  flex: 1;
  height: 1px;
  background: rgb(203, 213, 225);
}

.divider-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgb(100, 116, 139);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.preview-container {
  min-height: 200px;
  padding: 1rem;
  overflow-y: auto;
  max-height: 500px;
  background: rgb(249, 250, 251);
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
