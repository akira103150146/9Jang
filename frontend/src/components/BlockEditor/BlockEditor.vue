<template>
  <div class="block-editor-container" :class="{ 'readonly-mode': readonly }">
    <!-- 游標位置指示器 (僅在編輯模式顯示) -->
    <div v-if="!readonly && editor && currentNodeType" class="cursor-indicator">
      <span class="indicator-icon">{{ getNodeIcon(currentNodeType) }}</span>
      <span class="indicator-text">{{ getNodeLabel(currentNodeType) }}</span>
    </div>
    
    <!-- 編輯器內容 -->
    <div class="editor-wrapper">
      <editor-content :editor="editor" class="editor-content" />
    </div>
    
    <!-- 圖片選擇器 Modal (僅在編輯模式顯示) -->
    <ImageSelectorModal
      v-if="!readonly"
      :is-open="imageSelectorOpen"
      @close="imageSelectorOpen = false"
      @select="handleImageSelect"
      @upload-new="handleUploadNewImage"
      @image-uploaded="handleImageUploaded"
    />
    
    <!-- 模板選擇器 Modal (僅在編輯模式顯示) -->
    <TemplateSelectorModal
      v-if="!readonly"
      v-model="templateSelectorOpen"
      :templates="templates"
      @select="handleTemplateSelect"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, provide, computed } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { LaTeXBlock, InlineLatex, ImagePlaceholder, TemplateBlock, Diagram2DBlock, Diagram3DBlock, CircuitBlock, QuestionBlock, PageBreakBlock, SectionBlock } from './extensions'
import ImageSelectorModal from './components/ImageSelectorModal.vue'
import TemplateSelectorModal from './components/TemplateSelectorModal.vue'
import { SlashCommands } from './extensions/SlashCommands'
import { KeyboardShortcuts } from './extensions/KeyboardShortcuts'
import { DragHandle } from './extensions/DragHandle'
import { Nesting } from './extensions/Nesting'
import { useEditorPaste } from '../../composables/useEditorPaste'
import { useEditorSync } from '../../composables/useEditorSync'
import { useEditorEvents } from '../../composables/useEditorEvents'
import { convertToTiptapFormat } from '../../utils/tiptapConverter'
import { getNodeIcon, getNodeLabel } from '../../constants/nodeTypes'

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
  questionsPagination: {
    type: Object,
    default: () => ({
      currentPage: 1,
      pageSize: 10,
      totalCount: 0,
      hasNext: false,
      isLoading: false
    })
  },
  imageMappings: {
    type: Map,
    default: () => new Map()
  },
  readonly: {
    type: Boolean,
    default: false
  },
  ignoreExternalUpdates: {
    type: Boolean,
    default: false
  },
  // 是否為講義模式（用於過濾命令，例如隱藏分頁符號命令）
  isHandoutMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'request-upload', 'load-more-questions'])

// 提供模板列表給子組件
provide('templates', computed(() => props.templates))
provide('questions', computed(() => props.questions))
provide('questionsPagination', computed(() => props.questionsPagination))
provide('loadMoreQuestions', () => emit('load-more-questions'))
// 提供圖片映射表給子組件
provide('imageMappings', computed(() => props.imageMappings))
// 提供模式資訊給子組件（用於過濾命令）
provide('isHandoutMode', computed(() => props.isHandoutMode))

// 追蹤當前游標所在的節點類型
const currentNodeType = ref(null)

// 圖片選擇器狀態
const imageSelectorOpen = ref(false)
const currentPlaceholderNode = ref(null)
const currentOnSelect = ref(null)
const templateSelectorOpen = ref(false)
const currentTemplateOnSelect = ref(null)


// 使用編輯器事件系統
const editorEvents = useEditorEvents()

// 監聽圖片選擇器打開事件
const handleOpenImageSelector = (options) => {
  currentPlaceholderNode.value = options.placeholderNode
  currentOnSelect.value = options.onSelect
  imageSelectorOpen.value = true
}

// 監聽模板選擇器打開事件
const handleOpenTemplateSelector = (options) => {
  currentTemplateOnSelect.value = options.onSelect
  templateSelectorOpen.value = true
}

// 註冊事件監聽器（新的事件系統）
const unregisterImageSelector = editorEvents.onImageSelectorOpen(handleOpenImageSelector)
const unregisterTemplateSelector = editorEvents.onTemplateSelectorOpen(handleOpenTemplateSelector)

// 橋接：保持向後兼容，監聽 window 事件並轉發到新系統
// 這允許 commandItems.js 等純 JS 文件繼續使用 window 事件
const bridgeWindowEvent = (event) => {
  if (event.type === 'openImageSelector' && event.detail) {
    handleOpenImageSelector(event.detail)
  } else if (event.type === 'openTemplateSelector' && event.detail) {
    handleOpenTemplateSelector(event.detail)
  }
}

onMounted(() => {
  // 監聽 window 事件作為後備（向後兼容）
  window.addEventListener('openImageSelector', bridgeWindowEvent)
  window.addEventListener('openTemplateSelector', bridgeWindowEvent)
})

onBeforeUnmount(() => {
  unregisterImageSelector()
  unregisterTemplateSelector()
  window.removeEventListener('openImageSelector', bridgeWindowEvent)
  window.removeEventListener('openTemplateSelector', bridgeWindowEvent)
})

// 處理模板選擇
const handleTemplateSelect = (templateId) => {
  if (currentTemplateOnSelect.value) {
    currentTemplateOnSelect.value(templateId)
    currentTemplateOnSelect.value = null
  }
}

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
    SectionBlock,
    PageBreakBlock,
    SlashCommands.configure({
      isHandoutMode: props.isHandoutMode,
    }),
    KeyboardShortcuts,
    DragHandle,
    Nesting,
  ],
  content: convertToTiptapFormat(props.modelValue),
  editable: !props.readonly,
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none',
    },
    handlePaste: async (view, event, slice) => {
      const { handlePaste: pasteHandler } = useEditorPaste({
        editor: () => editor.value,
        imageMappings: () => props.imageMappings
      })
      return await pasteHandler(view, event, slice)
    },
  },
  onUpdate: ({ editor: editorInstance }) => {
    editorSync.handleEditorUpdate({ editor: editorInstance })
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

// 節點圖標和標籤函數已從 constants/nodeTypes.js 導入

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

const handleImageUploaded = (data) => {
  // 通知父組件圖片已上傳，需要保存映射表
  editorEvents.notifyImageMappingUpdated(data)
}


// 暴露 editor 實例給父組件
defineExpose({
  editor
})

// convertToTiptapFormat 已從 utils/tiptapConverter.js 導入

// 使用編輯器同步 composable
const editorSync = useEditorSync({
  editor,
  onUpdate: (json) => {
    emit('update:modelValue', json)
  },
  ignoreExternalUpdates: props.ignoreExternalUpdates,
  convertToTiptapFormat,
  modelValue: () => props.modelValue
})

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})
</script>

<style scoped>
/* 編輯器外層容器 */
.block-editor-container {
  width: 100%;
  min-height: 100vh;
  background: white;
  position: relative;
}

/* 編輯器包裝器 */
.editor-wrapper {
  background: white;
  width: 100%;
  padding: 0;
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

/* 列印時的處理 */
@media print {
  /* 隱藏游標指示器 */
  .cursor-indicator {
    display: none !important;
  }
  
  /* 設置頁面大小和邊距 */
  @page {
    size: A4;
    margin: 20mm;
  }
  
  .block-editor-container {
    background: white;
    padding: 0;
    min-height: auto;
  }
  
  .editor-wrapper {
    max-width: 100%;
    margin: 0;
    padding: 0;
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
  
  /* 手動分頁符號 */
  :deep(.page-break) {
    page-break-after: always;
    break-after: page;
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
