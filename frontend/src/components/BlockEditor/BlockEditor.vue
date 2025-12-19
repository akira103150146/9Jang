<template>
  <div class="block-editor">
    <!-- 游標位置指示器 -->
    <div v-if="editor && currentNodeType" class="cursor-indicator">
      <span class="indicator-icon">{{ getNodeIcon(currentNodeType) }}</span>
      <span class="indicator-text">{{ getNodeLabel(currentNodeType) }}</span>
    </div>
    
    <editor-content :editor="editor" class="editor-content" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, provide, computed } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { LaTeXBlock, TemplateBlock, Diagram2DBlock, Diagram3DBlock, CircuitBlock, QuestionBlock, PageBreakBlock } from './extensions'
import { SlashCommands } from './extensions/SlashCommands'
import { KeyboardShortcuts } from './extensions/KeyboardShortcuts'
import { DragHandle } from './extensions/DragHandle'
import { Nesting } from './extensions/Nesting'

const props = defineProps({
  modelValue: {
    type: [Object, Array],
    default: () => ([])
  },
  templates: {
    type: Array,
    default: () => []
  },
  questions: {
    type: Array,
    default: () => []
  },
  autoPageBreak: {
    type: Boolean,
    default: false
  },
  paperSize: {
    type: String,
    default: 'A4', // 'A4' or 'B4'
    validator: (value) => ['A4', 'B4'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue'])

// 提供模板列表給子組件
provide('templates', computed(() => props.templates))
provide('questions', computed(() => props.questions))

// 追蹤當前游標所在的節點類型
const currentNodeType = ref(null)

// 初始化編輯器
const editor = useEditor({
  extensions: [
    StarterKit.configure({
      history: {
        depth: 100,
      },
    }),
    LaTeXBlock,
    TemplateBlock,
    Diagram2DBlock,
    Diagram3DBlock,
    CircuitBlock,
    QuestionBlock,
    PageBreakBlock,
    SlashCommands,
    KeyboardShortcuts,
    DragHandle,
    Nesting,
  ],
  content: convertToTiptapFormat(props.modelValue),
  editable: true,
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none',
    },
  },
  onUpdate: ({ editor }) => {
    // 設置標誌防止 watch 循環更新
    isUpdatingFromEditor = true
    const json = editor.getJSON()
    emit('update:modelValue', json)
    
    // 如果啟用自動換頁,檢查並插入換頁符
    if (props.autoPageBreak) {
      checkAndInsertPageBreaks(editor)
    }
    
    // 重置標誌
    setTimeout(() => {
      isUpdatingFromEditor = false
    }, 100)
  },
  onSelectionUpdate: ({ editor }) => {
    // 更新當前節點類型
    const { $from } = editor.state.selection
    const node = $from.parent
    currentNodeType.value = node ? node.type.name : null
  },
})

// 自動換頁檢查的防抖計時器
let autoPageBreakTimeout = null

// 檢查並自動插入換頁符
function checkAndInsertPageBreaks(editor) {
  // 使用防抖,避免頻繁觸發
  if (autoPageBreakTimeout) {
    clearTimeout(autoPageBreakTimeout)
  }
  
  autoPageBreakTimeout = setTimeout(() => {
    performPageBreakCheck(editor)
  }, 500) // 500ms 防抖
}

function performPageBreakCheck(editor) {
  if (!editor || !editor.view || !editor.view.dom) return
  
  // 取得編輯器 DOM 容器
  const editorDOM = editor.view.dom
  
  // 取得紙張高度 (單位: mm)
  const pageHeightMM = props.paperSize === 'A4' ? 297 : 353 // A4: 297mm, B4: 353mm
  const paddingMM = 20 * 2 // 上下 padding 各 20mm
  const contentHeightMM = pageHeightMM - paddingMM // 可用內容高度
  
  // 轉換為像素 (1mm ≈ 3.7795px at 96dpi)
  const mmToPx = 3.7795
  const pageHeightPx = contentHeightMM * mmToPx
  
  // 取得所有頂層節點的 DOM 元素
  const nodes = []
  const doc = editor.state.doc
  
  doc.forEach((node, offset, index) => {
    try {
      // 使用 editor.view.domAtPos 獲取 DOM 節點
      const domPos = editor.view.domAtPos(offset + 1)
      let domNode = domPos.node
      
      // 如果是文本節點,取其父元素
      if (domNode.nodeType === Node.TEXT_NODE) {
        domNode = domNode.parentElement
      }
      
      if (domNode && domNode instanceof HTMLElement) {
        nodes.push({
          node,
          domNode,
          pos: offset,
          height: domNode.offsetHeight
        })
      }
    } catch (e) {
      // 忽略錯誤
    }
  })
  
  // 計算需要插入換頁符的位置
  let currentPageHeight = 0
  const insertPositions = []
  
  nodes.forEach((item, index) => {
    // 如果是換頁符,重置高度
    if (item.node.type.name === 'pageBreak') {
      currentPageHeight = 0
      return
    }
    
    // 檢查是否需要換頁
    if (currentPageHeight + item.height > pageHeightPx && currentPageHeight > 0) {
      // 檢查前一個節點是否已經是換頁符
      if (index > 0 && nodes[index - 1].node.type.name !== 'pageBreak') {
        insertPositions.push(item.pos)
      }
      currentPageHeight = item.height
    } else {
      currentPageHeight += item.height
    }
  })
  
  // 從後往前插入換頁符,避免位置偏移
  insertPositions.reverse().forEach(pos => {
    try {
      editor.chain()
        .insertContentAt(pos, { type: 'pageBreak' })
        .run()
    } catch (e) {
      console.error('Failed to insert page break at position', pos, e)
    }
  })
}

// 取得節點圖標
const getNodeIcon = (nodeType) => {
  const icons = {
    'questionBlock': '❓',
    'templateBlock': '📄',
    'latexBlock': '𝑓',
    'diagram2DBlock': '📊',
    'diagram3DBlock': '🎲',
    'circuitBlock': '⚡',
    'pageBreak': '📄',
    'heading': '📝',
    'paragraph': '¶',
    'bulletList': '•',
    'orderedList': '1.',
    'codeBlock': '</>',
    'blockquote': '"'
  }
  return icons[nodeType] || '📝'
}

// 取得節點標籤
const getNodeLabel = (nodeType) => {
  const labels = {
    'questionBlock': '題目區塊',
    'templateBlock': '模板區塊',
    'latexBlock': 'LaTeX 區塊',
    'diagram2DBlock': '2D 圖表',
    'diagram3DBlock': '3D 圖表',
    'circuitBlock': '電路圖',
    'pageBreak': '換頁符',
    'heading': '標題',
    'paragraph': '段落',
    'bulletList': '無序列表',
    'orderedList': '有序列表',
    'codeBlock': '程式碼',
    'blockquote': '引用'
  }
  return labels[nodeType] || nodeType
}

// 清理計時器
onBeforeUnmount(() => {
  if (autoPageBreakTimeout) {
    clearTimeout(autoPageBreakTimeout)
  }
})

// 將現有的 structure 格式轉換為 Tiptap 格式
function convertToTiptapFormat(structure) {
  if (!structure || (Array.isArray(structure) && structure.length === 0)) {
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: []
        }
      ]
    }
  }
  
  // 如果已經是 Tiptap 格式
  if (structure.type === 'doc') {
    return structure
  }
  
  // 如果是舊的線性陣列格式，轉換為 Tiptap 格式
  if (Array.isArray(structure)) {
    const content = structure.map(block => {
      if (block.type === 'text') {
        // 處理文字區塊 - 需要解析 Markdown 內容
        const textContent = block.content || ''
        // 簡單處理：將文字轉換為段落
        // 實際應該解析 Markdown 並轉換為對應的節點
        return {
          type: 'paragraph',
          content: textContent ? [{ type: 'text', text: textContent }] : []
        }
      } else if (block.type === 'question') {
        return {
          type: 'questionBlock',
          attrs: {
            id: block.id || `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            questionId: block.question_id || null
          },
          content: []
        }
      } else if (block.type === 'template') {
        return {
          type: 'templateBlock',
          attrs: {
            id: block.id || `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            templateId: block.template_id || null
          },
          content: []
        }
      } else if (block.type === 'page_break') {
        return {
          type: 'pageBreak',
          content: []
        }
      }
      // 未知類型轉換為段落
      return {
        type: 'paragraph',
        content: [{ type: 'text', text: `[${block.type}]` }]
      }
    })
    
    return {
      type: 'doc',
      content: content.length > 0 ? content : [{ type: 'paragraph', content: [] }]
    }
  }
  
  return {
    type: 'doc',
    content: [{ type: 'paragraph', content: [] }]
  }
}

// 監聽外部變更
// 添加一個標誌來防止循環更新
let isUpdatingFromEditor = false

watch(() => props.modelValue, (newValue) => {
  if (!editor.value || isUpdatingFromEditor) return

  const currentContent = editor.value.getJSON()
  const newContent = convertToTiptapFormat(newValue)

  // 避免不必要的更新
  if (JSON.stringify(currentContent) !== JSON.stringify(newContent)) {
    editor.value.commands.setContent(newContent, false)
  }
}, { deep: true })

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})
</script>

<style scoped>
.block-editor {
  width: 100%;
  min-height: 500px;
  padding: 20mm;
  position: relative;
}

/* 游標位置指示器 */
.cursor-indicator {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: linear-gradient(135deg, rgb(99, 102, 241), rgb(139, 92, 246));
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin-bottom: 1rem;
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.indicator-icon {
  font-size: 1.125rem;
}

.indicator-text {
  letter-spacing: 0.025em;
}

.editor-content {
  width: 100%;
  min-height: 400px;
}

/* Tiptap 編輯器樣式 */
:deep(.ProseMirror) {
  outline: none;
  min-height: 400px;
}

:deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}

/* Prose 樣式調整 */
:deep(.prose) {
  max-width: none;
  color: rgb(30, 41, 59);
}

:deep(.prose p) {
  margin: 1em 0;
}

:deep(.prose h1) {
  font-size: 2em;
  font-weight: 700;
  margin: 1em 0 0.5em 0;
}

:deep(.prose h2) {
  font-size: 1.5em;
  font-weight: 600;
  margin: 1em 0 0.5em 0;
}

:deep(.prose h3) {
  font-size: 1.25em;
  font-weight: 600;
  margin: 1em 0 0.5em 0;
}

:deep(.prose ul),
:deep(.prose ol) {
  padding-left: 1.5em;
  margin: 1em 0;
}

:deep(.prose code) {
  background: rgb(241, 245, 249);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}

:deep(.prose pre) {
  background: rgb(241, 245, 249);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1em 0;
}

:deep(.prose pre code) {
  background: transparent;
  padding: 0;
}

:deep(.prose blockquote) {
  border-left: 4px solid rgb(226, 232, 240);
  padding-left: 1rem;
  margin: 1em 0;
  color: rgb(100, 116, 139);
  font-style: italic;
}

/* 拖動手柄樣式 */
:deep(.drag-handle-widget) {
  position: absolute;
  left: -24px;
  top: 4px;
  width: 20px;
  height: 20px;
  cursor: grab;
  color: rgb(148, 163, 184);
  opacity: 0;
  transition: opacity 0.2s, color 0.2s;
  z-index: 10;
  pointer-events: auto;
}

:deep(.drag-handle-widget:hover) {
  color: rgb(99, 102, 241);
}

:deep(.ProseMirror > [data-type]:hover .drag-handle-widget) {
  opacity: 1;
}

/* 區塊 hover 效果 */
:deep(.ProseMirror > [data-type]) {
  position: relative;
  padding-left: 0;
  transition: background 0.2s, box-shadow 0.2s, border-color 0.2s;
  border-radius: 4px;
}

:deep(.ProseMirror > [data-type]:hover) {
  background: rgb(249, 250, 251);
}

/* 選中區塊的視覺反饋 */
:deep(.ProseMirror > [data-type].ProseMirror-selectednode),
:deep(.ProseMirror > [data-type].has-focus) {
  background: rgb(238, 242, 255) !important;
  box-shadow: 0 0 0 2px rgb(99, 102, 241);
  border-radius: 4px;
}

/* 游標所在區塊的邊框提示 */
:deep(.ProseMirror-focused > [data-type]:has(.ProseMirror-focused)) {
  outline: 2px solid rgb(99, 102, 241);
  outline-offset: 2px;
  border-radius: 4px;
}

/* 嵌套區塊的縮排 */
:deep(.ProseMirror [data-type] [data-type]) {
  margin-left: 1.5rem;
  padding-left: 1rem;
  border-left: 2px solid rgb(226, 232, 240);
}
</style>
