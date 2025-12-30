<template>
  <node-view-wrapper class="diagram2d-block-wrapper">
    <div class="diagram2d-block">
      <div class="diagram-header">
        <div class="diagram-badge">📊 2D 圖形</div>
        <button @click="handleEdit" class="btn-edit">
          {{ isEditing ? '完成編輯' : '編輯配置' }}
        </button>
      </div>
      
      <!-- 配置編輯器 -->
      <div v-if="isEditing" class="config-editor">
        <textarea
          v-model="configText"
          @blur="handleSaveConfig"
          placeholder='輸入 JSXGraph 配置 JSON...\n例如:\n{\n  "boundingbox": [-5, 5, 5, -5],\n  "axis": true\n}'
          class="config-input"
        />
      </div>
      
      <!-- 圖形容器 -->
      <div 
        ref="boardRef" 
        :id="boardId"
        class="diagram-container"
        :class="{ 'empty': !hasConfig }"
      >
        <div v-if="!hasConfig && !isEditing" class="empty-placeholder">
          點擊「編輯配置」添加 2D 圖形
        </div>
      </div>
      
      <!-- 子區塊內容 -->
      <node-view-content class="content" />
    </div>
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, type Ref } from 'vue'
import { NodeViewWrapper, NodeViewContent, nodeViewProps, type NodeViewProps } from '@tiptap/vue-3'

interface JSXGraphConfig {
  boundingbox?: number[]
  axis?: boolean
  showCopyright?: boolean
  showNavigation?: boolean
  [key: string]: unknown
}

declare global {
  interface Window {
    JXG?: {
      JSXGraph: {
        initBoard: (id: string, config: JSXGraphConfig) => {
          board: {
            suspendUpdate: () => void
          }
        }
      }
    }
  }
}

const props = defineProps<NodeViewProps>()

const isEditing: Ref<boolean> = ref(false)
const configText: Ref<string> = ref('')
const boardRef: Ref<HTMLElement | null> = ref(null)
const boardId = computed<string>(() => `jsxgraph-${props.node.attrs.id as string}`)
const board: Ref<{ board: { suspendUpdate: () => void } } | null> = ref(null)

const hasConfig = computed<boolean>(() => {
  const config = props.node.attrs.config as JSXGraphConfig | undefined
  return config ? Object.keys(config).length > 0 : false
})

// 初始化配置文本
onMounted(() => {
  if (hasConfig.value) {
    configText.value = JSON.stringify(props.node.attrs.config, null, 2)
    initBoard()
  }
})

// 清理
onBeforeUnmount(() => {
  if (board.value) {
    try {
      board.value.board?.suspendUpdate()
      // JSXGraph cleanup if needed
    } catch (e) {
      console.error('Error cleaning up JSXGraph:', e)
    }
  }
})

const handleEdit = (): void => {
  isEditing.value = !isEditing.value
  if (isEditing.value && hasConfig.value) {
    configText.value = JSON.stringify(props.node.attrs.config, null, 2)
  }
}

const handleSaveConfig = (): void => {
  try {
    const config: JSXGraphConfig = JSON.parse(configText.value)
    props.updateAttributes({
      config
    })
    initBoard()
  } catch (error) {
    console.error('Invalid JSON config:', error)
    alert('配置格式錯誤，請檢查 JSON 格式')
  }
}

const initBoard = async (): Promise<void> => {
  if (!hasConfig.value || !boardRef.value) return

  try {
    // 動態載入 JSXGraph
    if (typeof window.JXG === 'undefined') {
      console.warn('JSXGraph not loaded')
      return
    }

    // 清除舊的 board
    if (board.value) {
      try {
        board.value.board?.suspendUpdate()
      } catch (e) {
        // ignore
      }
    }

    // 創建新的 board
    const config: JSXGraphConfig = {
      boundingbox: [-5, 5, 5, -5],
      axis: true,
      showCopyright: false,
      showNavigation: false,
      ...(props.node.attrs.config as JSXGraphConfig)
    }

    board.value = window.JXG!.JSXGraph.initBoard(boardId.value, config)
  } catch (error) {
    console.error('Failed to initialize JSXGraph:', error)
  }
}

// 監聽配置變化
watch(
  () => props.node.attrs.config as JSXGraphConfig | undefined,
  () => {
    if (!isEditing.value && hasConfig.value) {
      initBoard()
    }
  },
  { deep: true }
)
</script>

<style scoped>
.diagram2d-block-wrapper {
  margin: 1rem 0;
}

.diagram2d-block {
  position: relative;
  padding: 1rem;
  border: 2px solid rgb(59, 130, 246);
  border-radius: 0.5rem;
  background: rgb(239, 246, 255);
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
  background: rgb(59, 130, 246);
  color: white;
  border-radius: 9999px;
}

.btn-edit {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  background: white;
  border: 1px solid rgb(226, 232, 240);
  color: rgb(51, 65, 85);
  transition: all 0.2s;
}

.btn-edit:hover {
  background: rgb(241, 245, 249);
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
  background: white;
}

.config-input:focus {
  outline: none;
  border-color: rgb(59, 130, 246);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.diagram-container {
  width: 100%;
  height: 400px;
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
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
  border-left: 3px solid rgb(147, 197, 253);
}
</style>
