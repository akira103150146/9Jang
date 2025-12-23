<template>
  <div class="block-editor-container" :class="'paper-size-' + paperSize.toLowerCase()">
    <!-- 游標位置指示器 -->
    <div v-if="editor && currentNodeType" class="cursor-indicator">
      <span class="indicator-icon">{{ getNodeIcon(currentNodeType) }}</span>
      <span class="indicator-text">{{ getNodeLabel(currentNodeType) }}</span>
    </div>
    
    <!-- 頁碼覆蓋層（僅在非 readonly 且 showPageNumbers 為 true 時顯示） -->
    <div class="page-numbers-overlay" v-if="!readonly && showPageNumbers && pageCount > 0">
      <div 
        v-for="pageNum in pageCount" 
        :key="pageNum"
        class="page-number"
        :style="{ top: `${(pageNum - 1) * pageHeightPx + 8}px` }"
      >
        第 {{ pageNum }} 頁
      </div>
    </div>
    
    <!-- 白色紙張區域 -->
    <div class="paper-sheet">
      <editor-content :editor="editor" class="editor-content" />
    </div>
    
    <!-- 圖片選擇器 Modal -->
    <ImageSelectorModal
      :is-open="imageSelectorOpen"
      @close="imageSelectorOpen = false"
      @select="handleImageSelect"
      @upload-new="handleUploadNewImage"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, provide, computed, nextTick } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { LaTeXBlock, InlineLatex, ImagePlaceholder, TemplateBlock, Diagram2DBlock, Diagram3DBlock, CircuitBlock, QuestionBlock, PageBreakBlock } from './extensions'
import ImageSelectorModal from './components/ImageSelectorModal.vue'
import { SlashCommands } from './extensions/SlashCommands'
import { KeyboardShortcuts } from './extensions/KeyboardShortcuts'
import { DragHandle } from './extensions/DragHandle'
import { Nesting } from './extensions/Nesting'
import { AutoPageBreak } from './extensions/AutoPageBreak'
import { parseSmartPaste } from './utils/smartPasteParser'
import { createNodesFromTokens } from './utils/nodeConverter'

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
  },
  imageMappings: {
    type: Map,
    default: () => new Map()
  },
  readonly: {
    type: Boolean,
    default: false
  },
  showPageNumbers: {
    type: Boolean,
    default: true
  },
  ignoreExternalUpdates: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'request-upload'])

// 提供模板列表給子組件
provide('templates', computed(() => props.templates))
provide('questions', computed(() => props.questions))
// 提供圖片映射表給子組件
provide('imageMappings', computed(() => props.imageMappings))

// 追蹤當前游標所在的節點類型
const currentNodeType = ref(null)

// 頁碼計算
const pageCount = ref(1)
const pageHeightPx = computed(() => {
  // A4: 257mm 內容高度 * 3.7795 = 971px
  // B4: 313mm 內容高度 * 3.7795 = 1183px
  return props.paperSize === 'A4' ? 971 : 1183
})

// 圖片選擇器狀態
const imageSelectorOpen = ref(false)
const currentPlaceholderNode = ref(null)
const currentOnSelect = ref(null)


// 監聽圖片選擇器打開事件
onMounted(() => {
  const handleOpenImageSelector = (event) => {
    currentPlaceholderNode.value = event.detail.placeholderNode
    currentOnSelect.value = event.detail.onSelect
    imageSelectorOpen.value = true
  }
  
  window.addEventListener('openImageSelector', handleOpenImageSelector)
  
  onBeforeUnmount(() => {
    window.removeEventListener('openImageSelector', handleOpenImageSelector)
  })
})

// 初始化編輯器
const editor = useEditor({
  extensions: [
    StarterKit.configure({
      history: {
        depth: 100,
      },
    }),
    Image.configure({
      inline: false,
      allowBase64: false,
      HTMLAttributes: {
        class: 'editor-image',
      },
    }),
    LaTeXBlock,
    InlineLatex,
    ImagePlaceholder,
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
    AutoPageBreak.configure({
      pageHeightPx: pageHeightPx.value,
      enabled: props.autoPageBreak,
    }),
  ],
  content: convertToTiptapFormat(props.modelValue),
  editable: !props.readonly,
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none',
    },
    handlePaste: (view, event, slice) => {
      // 取得貼上的純文字內容
      const text = event.clipboardData?.getData('text/plain')
      
      if (!text) return false
      
      try {
        // 使用智能解析器解析內容
        const tokens = parseSmartPaste(text)
        
        // 如果沒有特殊格式，使用預設行為
        if (tokens.length === 1 && tokens[0].type === 'paragraph' && !tokens[0].hasInlineLatex) {
          // 檢查是否包含 Markdown 格式
          const hasMarkdown = /^#{1,6}\s+|^[-*+]\s+|^\d+\.\s+/.test(text)
          if (!hasMarkdown) {
            return false // 使用預設貼上行為
          }
        }
        
        // 防止預設貼上行為
        event.preventDefault()
        
        // 創建節點，傳入圖片映射表
        const nodes = createNodesFromTokens(tokens, editor.value, props.imageMappings)
        
        // 使用編輯器實例插入內容
        // editor 在 handlePaste 執行時應該已經初始化
        if (nodes.length > 0 && editor.value) {
          editor.value.chain().focus().insertContent(nodes).run()
        }
        
        return true
      } catch (error) {
        console.error('智能貼上處理失敗:', error)
        // 發生錯誤時使用預設行為
        return false
      }
    },
  },
  onUpdate: ({ editor }) => {
    // 設置標誌防止 watch 循環更新
    isUpdatingFromEditor = true
    const json = editor.getJSON()
    emit('update:modelValue', json)
    
    // 更新頁數
    updatePageCount()
    
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
  onCreate: ({ editor }) => {
    // Editor created
  },
})

// 更新頁數計算
function updatePageCount() {
  if (!editor.value || !editor.value.view || !editor.value.view.dom) {
    pageCount.value = 1
    return
  }
  
  nextTick(() => {
    const cursorIndicator = document.querySelector('.cursor-indicator');
    
    // 方法 1: 計算手動插入的分頁符號數量
    let manualPageBreaks = 0
    if (editor.value.state && editor.value.state.doc) {
      editor.value.state.doc.descendants((node) => {
        if (node.type.name === 'pageBreak') {
          manualPageBreaks++
        }
      })
    }
    
    
    // 如果有手動分頁符號，頁數 = 分頁符號數 + 1
    if (manualPageBreaks > 0) {
      pageCount.value = manualPageBreaks + 1
      return
    }
    
    // 方法 2: 如果沒有手動分頁符號，根據內容高度計算
    const editorDOM = editor.value.view.dom
    let editorHeight = editorDOM.scrollHeight
    const editorOffsetHeight = editorDOM.offsetHeight
    const editorClientHeight = editorDOM.clientHeight
    const computedStyle = window.getComputedStyle(editorDOM)
    const paddingTop = parseFloat(computedStyle.paddingTop) || 0
    const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0
    const marginTop = parseFloat(computedStyle.marginTop) || 0
    const marginBottom = parseFloat(computedStyle.marginBottom) || 0
    
    // 檢查游標提示方塊對高度的影響並調整
    const containerDOM = editorDOM.closest('.block-editor-container');
    const containerHeight = containerDOM ? containerDOM.scrollHeight : 0;
    let cursorIndicatorHeight = 0;
    if (cursorIndicator) {
      cursorIndicatorHeight = cursorIndicator.offsetHeight;
      const cursorMarginBottom = parseFloat(window.getComputedStyle(cursorIndicator).marginBottom) || 0;
      cursorIndicatorHeight += cursorMarginBottom;
    }
    
    // 調整高度：扣除游標提示方塊的影響
    const adjustedHeight = editorHeight - cursorIndicatorHeight;
    
    
    // 使用調整後的高度計算頁數
    const heightForCalculation = adjustedHeight > 0 ? adjustedHeight : editorHeight;
    const visibleSeparators = Math.floor(heightForCalculation / pageHeightPx.value)
    const remainder = heightForCalculation % pageHeightPx.value
    const isOnBoundary = remainder < 20 || remainder > pageHeightPx.value - 20
    const calculatedPages = isOnBoundary ? visibleSeparators : visibleSeparators + 1
    pageCount.value = Math.max(1, calculatedPages)
    
    // 計算每個頁碼的實際位置（考慮游標提示方塊的偏移）
    const pageNumberPositions = []
    for (let i = 1; i <= pageCount.value; i++) {
      // 頁碼位置 = (頁數-1) * 每頁高度 + 游標提示方塊高度 + 8px偏移
      const topPosition = (i - 1) * pageHeightPx.value + cursorIndicatorHeight + 8
      pageNumberPositions.push({pageNum: i, topPosition})
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

// 圖片選擇器處理函數
const handleImageSelect = (url) => {
  if (currentOnSelect.value) {
    currentOnSelect.value(url)
    currentOnSelect.value = null
    currentPlaceholderNode.value = null
  }
}

const handleUploadNewImage = () => {
  emit('request-upload')
}


// 暴露 editor 實例給父組件
defineExpose({
  editor
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
  // 如果正在從頁面編輯器更新，忽略外部變化（避免覆蓋編輯器內容）
  if (!editor.value || isUpdatingFromEditor || props.ignoreExternalUpdates) {
    return
  }

  const currentContent = editor.value.getJSON()
  const newContent = convertToTiptapFormat(newValue)

  // 避免不必要的更新
  if (JSON.stringify(currentContent) !== JSON.stringify(newContent)) {
    editor.value.commands.setContent(newContent, false)
    // 內容更新後重新計算頁數
    updatePageCount()
  }
}, { deep: true })

// 初始化時計算頁數
onMounted(() => {
  nextTick(() => {
    updatePageCount()
  })
})

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})
</script>

<style scoped>
/* 編輯器外層容器 - 白色背景 */
.block-editor-container {
  width: 100%;
  min-height: 100vh;
  background: white;
  position: relative;
}

/* 紙張區域（不再需要額外樣式，直接使用白色背景） */
.paper-sheet {
  background: white;
  width: 100%;
  padding: 0;
  min-height: 297mm;
  overflow-y: auto; /* 允許垂直滾動 */
  max-height: calc(100vh - 200px); /* 限制最大高度，留出空間給頂部導航欄 */
}

/* 列印時的樣式調整 */
@media print {
  /* 移除外層容器的背景和 padding */
  .block-editor-container {
    background: white;
    padding: 0;
    min-height: auto;
  }
  
  /* 移除紙張的陰影和邊距限制 */
  .paper-sheet {
    max-width: 100%;
    margin: 0;
    padding: 0;
    min-height: auto;
    box-shadow: none;
  }
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

/* 列印時隱藏游標指示器 */
@media print {
  .cursor-indicator {
    display: none !important;
  }
}

/* 頁面分隔線 - A4 紙張 (使用 mm 單位確保精確度) */
.paper-size-a4 :deep(.ProseMirror) {
  position: relative;
  /* 使用 mm 單位,並考慮 padding */
  /* 257mm (內容) = 297mm (A4) - 40mm (上下 padding) */
  background-image: repeating-linear-gradient(
    transparent,
    transparent calc(257mm),
    rgba(229, 231, 235, 0.5) calc(257mm),
    rgba(229, 231, 235, 0.5) calc(257mm + 2px)
  );
  background-position: 0 0;
  /* 重要:確保 box-sizing 一致 */
  box-sizing: border-box;
}

/* 頁面分隔線 - B4 紙張 (使用 mm 單位確保精確度) */
.paper-size-b4 :deep(.ProseMirror) {
  position: relative;
  /* 313mm (內容) = 353mm (B4) - 40mm (上下 padding) */
  background-image: repeating-linear-gradient(
    transparent,
    transparent calc(313mm),
    rgba(229, 231, 235, 0.5) calc(313mm),
    rgba(229, 231, 235, 0.5) calc(313mm + 2px)
  );
  background-position: 0 0;
  /* 重要:確保 box-sizing 一致 */
  box-sizing: border-box;
}

/* 頁碼覆蓋層 */
.page-numbers-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  pointer-events: none;
  z-index: 10;
}

.page-number {
  position: absolute;
  right: 1rem;
  background: rgba(255, 255, 255, 0.95);
  padding: 0.375rem 0.875rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  backdrop-filter: blur(4px);
}

/* 列印時的頁碼處理 */
@media print {
  /* 保留頁碼覆蓋層，但調整樣式 */
  .page-numbers-overlay {
    display: block !important;
  }
  
  .page-number {
    background: transparent !important;
    box-shadow: none !important;
    border: none !important;
    color: #6b7280 !important;
    font-size: 10pt !important;
    padding: 0.25rem 0.5rem !important;
  }
}

/* 列印時的處理 */
@media print {
  /* 設置頁面大小和邊距 - A4 */
  .paper-size-a4 {
    @page {
      size: A4;
      margin: 20mm;
    }
  }
  
  /* 設置頁面大小和邊距 - B4 */
  .paper-size-b4 {
    @page {
      size: B4;
      margin: 20mm;
    }
  }
  
  /* 隱藏分隔線 */
  :deep(.ProseMirror) {
    background-image: none !important;
  }

  /* 頁碼樣式調整 */
  .page-number {
    background: transparent;
    box-shadow: none;
    border: none;
    color: #9ca3af;
    font-size: 0.625rem;
  }
  
  /* 防止元素被分頁切斷 */
  :deep(.ProseMirror > *) {
    page-break-inside: avoid;
    break-inside: avoid;
  }
  
  /* LaTeX 區塊不要被切斷 */
  :deep(.latex-block),
  :deep(.katex-display) {
    page-break-inside: avoid;
    break-inside: avoid;
  }
  
  /* 圖片不要被切斷 */
  :deep(img) {
    page-break-inside: avoid;
    break-inside: avoid;
    max-width: 100%;
  }
  
  /* 列表項不要被切斷 */
  :deep(li) {
    page-break-inside: avoid;
    break-inside: avoid;
  }
  
  /* 標題後面至少保留一些內容 */
  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4),
  :deep(h5),
  :deep(h6) {
    page-break-after: avoid;
    break-after: avoid;
  }
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
  /* 不設置 overflow，讓父容器 .paper-sheet 處理滾動 */
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
