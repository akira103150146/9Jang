<template>
  <div
    class="drag-handle"
    :class="{ 'is-dragging': isDragging }"
    @mousedown="handleMouseDown"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="9" cy="5" r="1"/>
      <circle cx="9" cy="12" r="1"/>
      <circle cx="9" cy="19" r="1"/>
      <circle cx="15" cy="5" r="1"/>
      <circle cx="15" cy="12" r="1"/>
      <circle cx="15" cy="19" r="1"/>
    </svg>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  editor: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['drag-start', 'drag-end'])

const isDragging = ref(false)

const handleMouseDown = (event) => {
  event.preventDefault()
  isDragging.value = true
  
  const { view } = props.editor
  const { state } = view
  const { selection } = state
  
  // 找到當前節點的位置
  const pos = selection.$anchor.before(selection.$anchor.depth)
  
  emit('drag-start', {
    node: props.node,
    pos,
    event
  })
  
  // 監聽滑鼠移動和放開
  const handleMouseMove = (e) => {
    // 拖動邏輯在父組件處理
  }
  
  const handleMouseUp = () => {
    isDragging.value = false
    emit('drag-end')
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}
</script>

<style scoped>
.drag-handle {
  position: absolute;
  left: -24px;
  top: 4px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  color: rgb(148, 163, 184);
  opacity: 0;
  transition: opacity 0.2s, color 0.2s;
  z-index: 10;
}

.drag-handle:hover {
  color: rgb(99, 102, 241);
}

.drag-handle.is-dragging {
  cursor: grabbing;
  opacity: 1;
}

/* 當父元素 hover 時顯示 */
:deep(.block-wrapper:hover) .drag-handle {
  opacity: 1;
}
</style>
