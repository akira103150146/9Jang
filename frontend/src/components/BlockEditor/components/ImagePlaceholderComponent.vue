<template>
  <NodeViewWrapper class="image-placeholder-wrapper">
    <div 
      class="placeholder-box"
      @click="openImageSelector"
      :class="{ 'hover': isHovering }"
      @mouseenter="isHovering = true"
      @mouseleave="isHovering = false"
    >
      <div class="icon">🖼️</div>
      <div class="info">
        <p class="filename">{{ filename }}</p>
        <p class="hint">圖片未找到，點擊選擇對應圖片</p>
        <p class="original-path">原路徑: {{ originalPath }}</p>
      </div>
      <button class="select-btn">選擇圖片</button>
    </div>
  </NodeViewWrapper>
</template>

<script setup>
import { ref, computed, inject, nextTick } from 'vue'
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'

const props = defineProps(nodeViewProps)

const isHovering = ref(false)

// 從父組件注入的映射表
const imageMappings = inject('imageMappings', new Map())

const filename = computed(() => props.node.attrs.filename)
const originalPath = computed(() => props.node.attrs.originalPath)

// 打開圖片選擇器
const openImageSelector = () => {
  // 通過 emit 事件通知父組件
  const event = new CustomEvent('openImageSelector', {
    detail: {
      placeholderNode: props.node,
      placeholderNodeId: props.node.attrs.id, // 傳遞節點 ID 用於匹配
      onSelect: (selectedUrl) => {
        // 使用 getPos() 直接獲取節點位置（這是 Tiptap NodeView 提供的方法）
        const pos = props.getPos()
        
        if (pos !== null && pos !== undefined) {
          // 獲取節點大小，用於正確刪除整個 block 節點
          const nodeSize = props.node.nodeSize
          
          // 替換為真實圖片節點 - 使用 replaceWith 直接替換節點
          // 這是最可靠的方法，因為它會在同一個 transaction 中完成替換
          const imageNode = props.editor.schema.nodes.image.create({
            src: selectedUrl,
            alt: props.node.attrs.alt || props.node.attrs.filename,
            title: props.node.attrs.filename
          })
          
          // 使用 replaceWith 替換節點
          const tr = props.editor.state.tr
          tr.replaceWith(pos, pos + nodeSize, imageNode)
          props.editor.view.dispatch(tr)
        }
      }
    }
  })
  window.dispatchEvent(event)
}
</script>

<style scoped>
.image-placeholder-wrapper {
  margin: 1rem 0;
}

.placeholder-box {
  border: 2px dashed #cbd5e0;
  border-radius: 8px;
  padding: 1.5rem;
  background: #f7fafc;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.placeholder-box.hover {
  border-color: #4299e1;
  background: #ebf8ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.icon {
  font-size: 3rem;
}

.info {
  flex: 1;
}

.filename {
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.hint {
  color: #718096;
  font-size: 0.875rem;
  margin: 0.25rem 0;
}

.original-path {
  color: #a0aec0;
  font-size: 0.75rem;
  font-family: monospace;
  margin: 0;
}

.select-btn {
  padding: 0.5rem 1rem;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.select-btn:hover {
  background: #3182ce;
}
</style>
