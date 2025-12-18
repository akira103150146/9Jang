<template>
  <div class="block-editor">
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
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none',
    },
  },
  onUpdate: ({ editor }) => {
    const json = editor.getJSON()
    emit('update:modelValue', json)
    
    // 如果啟用自動換頁,檢查並插入換頁符
    if (props.autoPageBreak) {
      checkAndInsertPageBreaks(editor)
    }
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
watch(() => props.modelValue, (newValue) => {
  if (!editor.value) return
  
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
  transition: background 0.2s;
}

:deep(.ProseMirror > [data-type]:hover) {
  background: rgb(249, 250, 251);
}

/* 嵌套區塊的縮排 */
:deep(.ProseMirror [data-type] [data-type]) {
  margin-left: 1.5rem;
  padding-left: 1rem;
  border-left: 2px solid rgb(226, 232, 240);
}
</style>
