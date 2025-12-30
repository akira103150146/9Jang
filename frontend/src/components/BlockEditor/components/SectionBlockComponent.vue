<template>
  <node-view-wrapper class="section-block-wrapper">
    <div 
      class="section-block"
      :class="{ 'is-hovered': isHovered && !isReadonly }"
      @mouseenter="!isReadonly && (isHovered = true)"
      @mouseleave="isHovered = false"
    >
      <!-- 懸停時顯示的操作選單 (僅在編輯模式) -->
      <div v-if="!isReadonly && isHovered" class="section-toolbar">
        <button @click="handleDelete" class="btn-delete">
          🗑️ 刪除
        </button>
      </div>
      
      <!-- 大題標題 -->
      <div class="section-header">
        <input 
          v-if="!isReadonly"
          v-model="sectionTitle"
          @blur="updateTitle"
          @keydown.enter="$event.target.blur()"
          class="section-title-input"
          placeholder="輸入大題標題（例如：第一大題、選擇題）"
        />
        <div v-else class="section-title-display">
          {{ sectionTitle || '未命名大題' }}
        </div>
      </div>
      
      <node-view-content class="content" />
    </div>
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, type Ref } from 'vue'
import { NodeViewWrapper, NodeViewContent, nodeViewProps, type NodeViewProps } from '@tiptap/vue-3'

const props = defineProps<NodeViewProps>()

// 檢查是否為 readonly 模式
const isReadonly = computed<boolean>(() => !props.editor.isEditable)

const isHovered: Ref<boolean> = ref(false)
const sectionTitle: Ref<string> = ref((props.node.attrs.title as string) || '')

const updateTitle = (): void => {
  props.updateAttributes({ title: sectionTitle.value })
}

const handleDelete = (): void => {
  const pos = props.getPos()
  if (pos === null || pos === undefined) return
  props.editor.chain().focus().deleteRange({
    from: pos,
    to: pos + props.node.nodeSize
  }).run()
}

onMounted(() => {
  sectionTitle.value = (props.node.attrs.title as string) || ''
})
</script>

<style scoped>
.section-block-wrapper {
  margin: 2rem 0 1rem 0;
  position: relative;
}

.section-block {
  position: relative;
  border: 2px solid transparent;
  border-radius: 0.5rem;
  padding: 0.5rem;
  transition: all 0.2s;
}

.section-block.is-hovered {
  border-color: rgb(99, 102, 241);
  background: rgb(238, 242, 255);
}

.section-toolbar {
  position: absolute;
  top: -12px;
  right: 1rem;
  z-index: 10;
  animation: fadeIn 0.2s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.btn-delete {
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  background: white;
  border: 1px solid rgb(226, 232, 240);
  color: rgb(51, 65, 85);
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-delete:hover {
  background: rgb(254, 242, 242);
  border-color: rgb(239, 68, 68);
  color: rgb(220, 38, 38);
}

.section-header {
  padding: 0.5rem 0;
}

.section-title-input {
  width: 100%;
  font-size: 1.25rem;
  font-weight: 700;
  color: rgb(30, 41, 59);
  border: none;
  background: transparent;
  outline: none;
  padding: 0.5rem;
  border-bottom: 2px solid transparent;
  transition: border-color 0.2s;
}

.section-title-input:focus {
  border-bottom-color: rgb(99, 102, 241);
}

.section-title-input::placeholder {
  color: rgb(203, 213, 225);
}

.section-title-display {
  width: 100%;
  font-size: 1.25rem;
  font-weight: 700;
  color: rgb(30, 41, 59);
  padding: 0.5rem;
}

.content {
  margin-top: 0.5rem;
}

@media print {
  .section-toolbar {
    display: none !important;
  }
  
  .section-block {
    border: none !important;
    background: white !important;
    padding: 0 !important;
  }
  
  .section-title-input {
    padding: 0.25rem 0 !important;
    border: none !important;
  }
  
  .content {
    display: none !important;
  }
}
</style>
