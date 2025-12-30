<template>
  <div class="diagram-preview-2d">
    <div v-if="backupImage" class="backup-image" v-html="backupImageHtml"></div>
    <div v-else ref="boardContainer" class="board"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, type Ref } from 'vue'
import JXG from 'jsxgraph'

interface DiagramElement {
  type: string
  name?: string
  data?: {
    x?: number
    y?: number
    expression?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

interface DiagramData {
  elements?: DiagramElement[]
  [key: string]: unknown
}

interface Data {
  diagram_data?: DiagramData
  backup_image?: string
  backupImage?: string
  [key: string]: unknown
}

interface Props {
  data?: Data | DiagramData
}

const props = withDefaults(defineProps<Props>(), {
  data: () => ({})
})

const boardContainer: Ref<HTMLElement | null> = ref(null)
let board: JXG.Board | null = null

const diagramData = computed<DiagramData>(() => {
  // 允許傳入 {diagram_data, backup_image} 或直接是 diagram_data
  if (props.data && typeof props.data === 'object' && 'diagram_data' in props.data) {
    return (props.data as Data).diagram_data || {}
  }
  return (props.data as DiagramData) || {}
})

const backupImage = computed<string>(() => {
  if (!props.data || typeof props.data !== 'object') return ''
  const data = props.data as Data
  return data.backup_image || data.backupImage || ''
})

const backupImageHtml = computed<string>(() => {
  const src = backupImage.value
  if (!src) return ''
  // 有些備援是 data:image/svg+xml;base64,... 也可能直接是 <svg> 字串
  if (typeof src === 'string' && src.startsWith('data:image/svg+xml')) {
    return `<img src="${src}" alt="2D 圖形" style="max-width: 100%; height: auto;" />`
  }
  if (typeof src === 'string' && src.startsWith('<svg')) return src
  return `<img src="${src}" alt="2D 圖形" style="max-width: 100%; height: auto;" />`
})

const loadDiagramData = (data: DiagramData): void => {
  if (!board || !data || !Array.isArray(data.elements)) return
  data.elements.forEach((element) => {
    try {
      switch (element.type) {
        case 'point':
          board!.create('point', [element.data?.x ?? 0, element.data?.y ?? 0], {
            name: element.name || '',
            size: 3,
            fixed: true
          })
          break
        case 'function':
          board!.create('functiongraph', [element.data?.expression || 'x^2'], {
            strokeColor: '#ef4444',
            strokeWidth: 2
          })
          break
        default:
          break
      }
    } catch (e) {
      // ignore single element failure
    }
  })
}

onMounted(() => {
  if (backupImage.value) return
  if (!boardContainer.value) return
  board = JXG.JSXGraph.initBoard(boardContainer.value, {
    boundingbox: [-5, 5, 5, -5],
    axis: true,
    grid: true,
    pan: { enabled: true },
    zoom: { enabled: true, wheel: true },
  })
  loadDiagramData(diagramData.value)
})

onBeforeUnmount(() => {
  if (board) {
    JXG.JSXGraph.freeBoard(board)
    board = null
  }
})
</script>

<style scoped>
.diagram-preview-2d {
  border: 1px dashed rgb(203, 213, 225);
  border-radius: 0.5rem;
  background: rgb(248, 250, 252);
  padding: 0.75rem;
}

.board {
  width: 100%;
  height: 420px;
}

.backup-image :deep(svg) {
  max-width: 100%;
  height: auto;
}
</style>

