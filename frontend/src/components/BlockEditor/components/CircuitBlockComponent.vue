<template>
  <node-view-wrapper class="circuit-block-wrapper">
    <div class="circuit-block">
      <div class="circuit-header">
        <div class="circuit-badge">⚡ 電路圖</div>
        <button @click="isEditing = !isEditing" class="btn-edit">
          {{ isEditing ? '完成編輯' : '編輯配置' }}
        </button>
      </div>
      
      <div v-if="isEditing" class="config-editor">
        <textarea
          v-model="configText"
          placeholder="輸入電路圖配置..."
          class="config-input"
        />
        <button @click="handleSave" class="btn-save">儲存</button>
      </div>
      
      <div 
        ref="containerRef"
        class="circuit-container"
        :class="{ 'empty': !hasConfig }"
      >
        <div v-if="!hasConfig && !isEditing" class="empty-placeholder">
          點擊「編輯配置」添加電路圖
        </div>
        <svg 
          v-else
          :width="circuitConfig.width || 600"
          :height="circuitConfig.height || 400"
          class="circuit-svg"
          viewBox="0 0 600 400"
        >
          <!-- 繪製連線 -->
          <g v-for="wire in circuitConfig.wires || []" :key="`wire-${wire.from}-${wire.to}`">
            <line
              :x1="getNodePosition(wire.from).x"
              :y1="getNodePosition(wire.from).y"
              :x2="getNodePosition(wire.to).x"
              :y2="getNodePosition(wire.to).y"
              stroke="black"
              stroke-width="2"
            />
          </g>
          
          <!-- 繪製元件 -->
          <g v-for="component in circuitConfig.components || []" :key="component.id">
            <!-- 電阻 -->
            <g v-if="component.type === 'resistor'" :transform="`translate(${component.position.x}, ${component.position.y})`">
              <rect x="-20" y="-5" width="40" height="10" fill="white" stroke="black" stroke-width="2"/>
              <text x="0" y="-10" text-anchor="middle" font-size="12">{{ component.label }}</text>
              <text x="0" y="20" text-anchor="middle" font-size="10">{{ component.value }}</text>
            </g>
            
            <!-- 檢流計 -->
            <g v-else-if="component.type === 'galvanometer'" :transform="`translate(${component.position.x}, ${component.position.y})`">
              <circle cx="0" cy="0" r="15" fill="white" stroke="black" stroke-width="2"/>
              <text x="0" y="5" text-anchor="middle" font-size="14" font-weight="bold">{{ component.label }}</text>
            </g>
            
            <!-- 電池 -->
            <g v-else-if="component.type === 'battery'" :transform="`translate(${component.position.x}, ${component.position.y})`">
              <line x1="0" y1="-15" x2="0" y2="-5" stroke="black" stroke-width="3"/>
              <line x1="0" y1="5" x2="0" y2="15" stroke="black" stroke-width="1"/>
              <text x="15" y="5" font-size="12">{{ component.label }}</text>
              <text x="15" y="18" font-size="10">{{ component.value }}</text>
            </g>
          </g>
          
          <!-- 繪製節點 -->
          <g v-for="node in circuitConfig.nodes || []" :key="node.id">
            <circle
              :cx="node.position.x"
              :cy="node.position.y"
              r="3"
              fill="black"
            />
          </g>
        </svg>
      </div>
      
      <node-view-content class="content" />
    </div>
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { ref, computed, type Ref } from 'vue'
import { NodeViewWrapper, NodeViewContent, nodeViewProps, type NodeViewProps } from '@tiptap/vue-3'

/**
 * 電路配置類型
 */
interface CircuitConfig {
  width?: number
  height?: number
  nodes?: Array<{
    id: string
    position: { x: number; y: number }
  }>
  components?: Array<{
    id: string
    type: 'resistor' | 'galvanometer' | 'battery'
    position: { x: number; y: number }
    label?: string
    value?: string
  }>
  wires?: Array<{
    from: string
    to: string
  }>
}

const props = defineProps<NodeViewProps>()

const isEditing: Ref<boolean> = ref(false)
const configText: Ref<string> = ref(JSON.stringify((props.node.attrs.config as CircuitConfig) || {}, null, 2))
const containerRef: Ref<HTMLElement | null> = ref(null)

const hasConfig = computed((): boolean => {
  const config = props.node.attrs.config as CircuitConfig | undefined
  return config ? Object.keys(config).length > 0 : false
})

// 解析電路配置
const circuitConfig = computed((): CircuitConfig => {
  return (props.node.attrs.config as CircuitConfig) || {}
})

// 獲取節點或元件的位置
const getNodePosition = (id: string): { x: number; y: number } => {
  // 先在 nodes 中查找
  const node = circuitConfig.value.nodes?.find((n) => n.id === id)
  if (node) return node.position

  // 再在 components 中查找
  const component = circuitConfig.value.components?.find((c) => c.id === id)
  if (component) return component.position

  return { x: 0, y: 0 }
}

const handleSave = (): void => {
  try {
    const config: CircuitConfig = JSON.parse(configText.value)
    props.updateAttributes({ config })
    isEditing.value = false
  } catch (error) {
    alert('配置格式錯誤')
  }
}
</script>

<style scoped>
.circuit-block-wrapper {
  margin: 1rem 0;
}

.circuit-block {
  padding: 1rem;
  border: 2px solid rgb(234, 179, 8);
  border-radius: 0.5rem;
  background: rgb(254, 252, 232);
}

.circuit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.circuit-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  background: rgb(234, 179, 8);
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

.circuit-container {
  width: 100%;
  min-height: 400px;
  background: white;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
}

.circuit-container.empty {
  border: 2px dashed rgb(203, 213, 225);
}

.circuit-svg {
  max-width: 100%;
  height: auto;
}

.empty-placeholder {
  color: rgb(148, 163, 184);
  font-size: 0.875rem;
}

.content {
  margin-top: 1rem;
  padding-left: 1.5rem;
  border-left: 3px solid rgb(253, 224, 71);
}
</style>
