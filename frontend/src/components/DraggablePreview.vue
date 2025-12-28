<template>
  <div class="draggable-preview">
    <div v-if="blocks.length === 0" class="empty-state">
      <p>沒有內容可預覽</p>
      <p class="text-sm text-slate-400">切換到編輯模式開始撰寫</p>
    </div>

    <div v-else class="blocks-container">
      <div
        v-for="(block, index) in blocks"
        :key="block.id"
        :data-block-id="block.id"
        :data-block-index="index"
        draggable="true"
        @dragstart="handleDragStart($event, block, index)"
        @dragend="handleDragEnd"
        @dragover.prevent="handleDragOver($event, index)"
        @drop="handleDrop($event, index)"
        class="block-wrapper"
        :class="{ 
          'dragging': draggingIndex === index,
          'drag-over': dragOverIndex === index
        }"
      >
        <!-- 拖動手柄 -->
        <div class="drag-handle" title="拖動以重新排序">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="5" r="1"/>
            <circle cx="9" cy="12" r="1"/>
            <circle cx="9" cy="19" r="1"/>
            <circle cx="15" cy="5" r="1"/>
            <circle cx="15" cy="12" r="1"/>
            <circle cx="15" cy="19" r="1"/>
          </svg>
        </div>

        <!-- 區塊類型標籤 -->
        <div class="block-type-badge">
          {{ getBlockTypeName(block.type) }}
        </div>

        <!-- 區塊內容 -->
        <div 
          class="block-content prose max-w-none"
          v-html="renderBlock(block)"
        ></div>

        <!-- 插入指示線 -->
        <div 
          v-if="dragOverIndex === index && draggingIndex !== index"
          class="insert-indicator"
          :class="{ 'insert-above': insertPosition === 'above', 'insert-below': insertPosition === 'below' }"
        ></div>
      </div>
    </div>

    <!-- 拖動提示 -->
    <div v-if="isDragging" class="drag-hint">
      放開滑鼠以重新排序
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { parseMarkdownToBlocks, blocksToMarkdown, getBlockTypeName } from '../utils/markdownBlockParser'
import { useMarkdownRenderer } from '../composables/useMarkdownRenderer'

const props = defineProps({
  content: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:content'])

const { renderMarkdownWithLatex } = useMarkdownRenderer()

// 狀態
const blocks = ref([])
const draggingIndex = ref(null)
const dragOverIndex = ref(null)
const insertPosition = ref('below') // 'above' or 'below'
const isDragging = computed(() => draggingIndex.value !== null)

// 監聽內容變化，重新解析區塊
watch(() => props.content, (newContent) => {
  blocks.value = parseMarkdownToBlocks(newContent)
}, { immediate: true })

// #region agent log
// 調試函數：測量分數線位置
const measureFractionLinePosition = () => {
  const root = document.querySelector('.draggable-preview')
  if (!root) return
  
  const fractions = root.querySelectorAll('.katex .mfrac')
  if (fractions.length === 0) return
  
  fractions.forEach((mfrac, idx) => {
    const fracLine = mfrac.querySelector('.frac-line')
    if (!fracLine) return
    
    const numerator = mfrac.querySelector('.vlist-t:first-child')
    const denominator = mfrac.querySelector('.vlist-t:last-child')
    
    if (!numerator || !denominator) return
    
    const mfracRect = mfrac.getBoundingClientRect()
    const lineRect = fracLine.getBoundingClientRect()
    const numRect = numerator.getBoundingClientRect()
    const denRect = denominator.getBoundingClientRect()
    
    const mfracHeight = mfracRect.height
    const lineTop = lineRect.top - mfracRect.top
    const lineBottom = lineRect.bottom - mfracRect.top
    const numHeight = numRect.height
    const denHeight = denRect.height
    
    const computedStyle = getComputedStyle(fracLine)
    const marginTop = parseFloat(computedStyle.marginTop) || 0
    const marginBottom = parseFloat(computedStyle.marginBottom) || 0
    
    const expectedCenter = mfracHeight / 2
    const actualCenter = lineTop + (lineBottom - lineTop) / 2
    const offsetFromCenter = actualCenter - expectedCenter
    
    fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'DraggablePreview.vue:measureFractionLinePosition',
        message: `分數線位置測量 #${idx}`,
        data: {
          mfracHeight,
          lineTop,
          lineBottom,
          numHeight,
          denHeight,
          marginTop,
          marginBottom,
          expectedCenter,
          actualCenter,
          offsetFromCenter,
          cssMarginTop: computedStyle.marginTop,
          cssMarginBottom: computedStyle.marginBottom,
          mfracPaddingTop: getComputedStyle(mfrac).paddingTop,
          mfracPaddingBottom: getComputedStyle(mfrac).paddingBottom
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'A'
      })
    }).catch(() => {})
  })
}

// 監聽 blocks 變化，在渲染後測量
watch(() => blocks.value, () => {
  nextTick(() => {
    setTimeout(() => {
      measureFractionLinePosition()
    }, 200)
  })
}, { deep: true })
// #endregion

// 渲染單個區塊
const renderBlock = (block) => {
  if (!block || !block.content) return ''
  return renderMarkdownWithLatex(block.content)
}

// 拖動開始
const handleDragStart = (event, block, index) => {
  draggingIndex.value = index
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', block.id)
  
  // 設置拖動時的視覺效果
  event.target.style.opacity = '0.5'
}

// 拖動結束
const handleDragEnd = (event) => {
  event.target.style.opacity = '1'
  draggingIndex.value = null
  dragOverIndex.value = null
  insertPosition.value = 'below'
}

// 拖動經過
const handleDragOver = (event, index) => {
  event.preventDefault()
  
  if (draggingIndex.value === null || draggingIndex.value === index) {
    return
  }

  dragOverIndex.value = index
  
  // 計算插入位置（上方或下方）
  const rect = event.currentTarget.getBoundingClientRect()
  const mouseY = event.clientY
  const blockMiddle = rect.top + rect.height / 2
  
  insertPosition.value = mouseY < blockMiddle ? 'above' : 'below'
}

// 放下
const handleDrop = (event, targetIndex) => {
  event.preventDefault()
  
  if (draggingIndex.value === null || draggingIndex.value === targetIndex) {
    draggingIndex.value = null
    dragOverIndex.value = null
    return
  }

  // 計算新的插入位置
  let newIndex = targetIndex
  if (insertPosition.value === 'below') {
    newIndex = targetIndex + 1
  }

  // 調整索引（如果從前面拖到後面）
  if (draggingIndex.value < newIndex) {
    newIndex--
  }

  // 重新排序區塊
  const reorderedBlocks = [...blocks.value]
  const [movedBlock] = reorderedBlocks.splice(draggingIndex.value, 1)
  reorderedBlocks.splice(newIndex, 0, movedBlock)

  // 更新區塊
  blocks.value = reorderedBlocks

  // 轉換回 Markdown 並發送更新事件
  const newMarkdown = blocksToMarkdown(reorderedBlocks)
  emit('update:content', newMarkdown)

  // 重置狀態
  draggingIndex.value = null
  dragOverIndex.value = null
  insertPosition.value = 'below'
}
</script>

<style scoped>
.draggable-preview {
  min-height: 300px;
  max-height: 600px;
  overflow-y: auto;
  padding: 1rem;
  background: rgb(249, 250, 251);
  position: relative;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: rgb(148, 163, 184);
  text-align: center;
}

.blocks-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.block-wrapper {
  position: relative;
  background: white;
  border: 2px solid rgb(226, 232, 240);
  border-radius: 0.5rem;
  padding: 1rem 1rem 1rem 3rem;
  cursor: move;
  transition: all 0.2s ease;
  user-select: none;
}

.block-wrapper:hover {
  border-color: rgb(99, 102, 241);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
}

.block-wrapper:hover .drag-handle {
  opacity: 1;
}

.block-wrapper.dragging {
  opacity: 0.5;
  border-color: rgb(99, 102, 241);
  background: rgb(238, 242, 255);
}

.block-wrapper.drag-over {
  border-color: rgb(99, 102, 241);
}

.drag-handle {
  position: absolute;
  left: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(148, 163, 184);
  opacity: 0;
  transition: opacity 0.2s ease;
  cursor: grab;
}

.drag-handle:active {
  cursor: grabbing;
}

.block-type-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.125rem 0.5rem;
  background: rgb(238, 242, 255);
  color: rgb(99, 102, 241);
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.block-wrapper:hover .block-type-badge {
  opacity: 1;
}

.block-content {
  color: rgb(30, 41, 59);
  line-height: 1.7;
}

/* 確保 prose 樣式不會破壞數學公式 */
.block-content :deep(.katex) {
  line-height: normal !important;
}

.block-content :deep(p) {
  margin: 0.5rem 0;
}

.block-content :deep(h1),
.block-content :deep(h2),
.block-content :deep(h3),
.block-content :deep(h4),
.block-content :deep(h5),
.block-content :deep(h6) {
  margin: 0.75rem 0 0.5rem 0;
  font-weight: 600;
}

.block-content :deep(code) {
  background: rgb(241, 245, 249);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}

.block-content :deep(pre) {
  background: rgb(241, 245, 249);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}

.block-content :deep(pre code) {
  background: transparent;
  padding: 0;
}

.block-content :deep(ul),
.block-content :deep(ol) {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.block-content :deep(blockquote) {
  border-left: 4px solid rgb(226, 232, 240);
  padding-left: 1rem;
  margin: 0.5rem 0;
  color: rgb(100, 116, 139);
  font-style: italic;
}

.insert-indicator {
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  background: rgb(99, 102, 241);
  border-radius: 9999px;
  pointer-events: none;
  z-index: 10;
}

.insert-indicator.insert-above {
  top: -0.6rem;
}

.insert-indicator.insert-below {
  bottom: -0.6rem;
}

.insert-indicator::before {
  content: '';
  position: absolute;
  left: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background: rgb(99, 102, 241);
  border-radius: 50%;
}

.insert-indicator::after {
  content: '';
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background: rgb(99, 102, 241);
  border-radius: 50%;
}

.drag-hint {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgb(30, 41, 59);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  z-index: 50;
  animation: fadeInUp 0.3s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate(-50%, 1rem);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

/* 滾動條樣式 */
.draggable-preview::-webkit-scrollbar {
  width: 8px;
}

.draggable-preview::-webkit-scrollbar-track {
  background: rgb(241, 245, 249);
}

.draggable-preview::-webkit-scrollbar-thumb {
  background: rgb(203, 213, 225);
  border-radius: 4px;
}

.draggable-preview::-webkit-scrollbar-thumb:hover {
  background: rgb(148, 163, 184);
}
</style>
