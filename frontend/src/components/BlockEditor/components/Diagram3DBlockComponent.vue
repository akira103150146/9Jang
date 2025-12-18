<template>
  <node-view-wrapper class="diagram3d-block-wrapper">
    <div class="diagram3d-block">
      <div class="diagram-header">
        <div class="diagram-badge">🎲 3D 圖形</div>
        <button @click="isEditing = !isEditing" class="btn-edit">
          {{ isEditing ? '完成編輯' : '編輯配置' }}
        </button>
      </div>
      
      <div v-if="isEditing" class="config-editor">
        <textarea
          v-model="configText"
          placeholder="輸入 Three.js 配置..."
          class="config-input"
        />
        <button @click="handleSave" class="btn-save">儲存</button>
      </div>
      
      <div 
        ref="containerRef"
        class="diagram-container"
        :class="{ 'empty': !hasConfig }"
      >
        <div v-if="!hasConfig && !isEditing" class="empty-placeholder">
          點擊「編輯配置」添加 3D 圖形
        </div>
      </div>
      
      <node-view-content class="content" />
    </div>
  </node-view-wrapper>
</template>

<script setup>
import { ref, computed } from 'vue'
import { NodeViewWrapper, NodeViewContent, nodeViewProps } from '@tiptap/vue-3'

const props = defineProps(nodeViewProps)

const isEditing = ref(false)
const configText = ref(JSON.stringify(props.node.attrs.config || {}, null, 2))
const containerRef = ref(null)

const hasConfig = computed(() => {
  return props.node.attrs.config && Object.keys(props.node.attrs.config).length > 0
})

const handleSave = () => {
  try {
    const config = JSON.parse(configText.value)
    props.updateAttributes({ config })
    isEditing.value = false
    // TODO: 初始化 Three.js 場景
  } catch (error) {
    alert('配置格式錯誤')
  }
}
</script>

<style scoped>
.diagram3d-block-wrapper {
  margin: 1rem 0;
}

.diagram3d-block {
  padding: 1rem;
  border: 2px solid rgb(168, 85, 247);
  border-radius: 0.5rem;
  background: rgb(250, 245, 255);
}

.diagram-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.diagram-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  background: rgb(168, 85, 247);
  color: white;
  border-radius: 9999px;
}

.btn-edit, .btn-save {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  background: white;
  border: 1px solid rgb(226, 232, 240);
  transition: all 0.2s;
}

.config-editor {
  margin-bottom: 1rem;
}

.config-input {
  width: 100%;
  min-height: 150px;
  padding: 0.75rem;
  border: 1px solid rgb(226, 232, 240);
  border-radius: 0.375rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  resize: vertical;
  margin-bottom: 0.5rem;
}

.diagram-container {
  width: 100%;
  height: 400px;
  background: white;
  border-radius: 0.5rem;
}

.diagram-container.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed rgb(203, 213, 225);
}

.empty-placeholder {
  color: rgb(148, 163, 184);
  font-size: 0.875rem;
}

.content {
  margin-top: 1rem;
  padding-left: 1.5rem;
  border-left: 3px solid rgb(216, 180, 254);
}
</style>
