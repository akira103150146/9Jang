<template>
  <NodeViewWrapper as="div" class="math-2d-plotter">
    <div class="plotter-header">
      <h3>2D 數學圖形編輯器</h3>
      <button @click="handleSave" class="btn-save">保存</button>
    </div>
    <div class="plotter-container">
      <div class="plotter-sidebar">
        <div class="sidebar-section">
          <h4>添加元素</h4>
          <button @click="addPoint" class="sidebar-btn">點</button>
          <button @click="addLine" class="sidebar-btn">線</button>
          <button @click="addFunction" class="sidebar-btn">函數</button>
          <button @click="addPolygon" class="sidebar-btn">多邊形</button>
        </div>
        <div class="sidebar-section">
          <h4>函數輸入</h4>
          <input
            v-model="functionInput"
            @keyup.enter="addFunctionFromInput"
            placeholder="例如: x^2"
            class="function-input"
          />
        </div>
      </div>
      <div ref="boardContainer" class="plotter-board"></div>
    </div>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, type Ref } from 'vue'
import { NodeViewWrapper, nodeViewProps, type NodeViewProps } from '@tiptap/vue-3'
import JXG from 'jsxgraph'

const props = defineProps<NodeViewProps>()

interface DiagramElement {
  type: string
  id?: string | number
  name?: string
  data?: {
    x?: number
    y?: number
    expression?: string
    point1?: string | number
    point2?: string | number
    vertices?: (string | number)[]
    [key: string]: unknown
  }
  [key: string]: unknown
}

interface DiagramData {
  elements?: DiagramElement[]
  [key: string]: unknown
}

const boardContainer: Ref<HTMLElement | null> = ref(null)
const functionInput: Ref<string> = ref('')
let board: JXG.Board | null = null
const elements: Ref<DiagramElement[]> = ref([])

const initBoard = (): void => {
  if (!boardContainer.value) return

  board = JXG.JSXGraph.initBoard(boardContainer.value, {
    boundingbox: [-5, 5, 5, -5],
    axis: true,
    grid: true
  })

  // 載入現有數據
  const attrs = props.node.attrs as { diagram_data?: DiagramData }
  if (attrs.diagram_data && attrs.diagram_data.elements) {
    loadDiagramData(attrs.diagram_data)
  }
}

const addPoint = (): void => {
  if (!board) return
  const point = board.create('point', [0, 0], {
    name: `P${elements.value.length + 1}`,
    size: 4,
    fixed: false
  })
  elements.value.push({ type: 'point', id: point.id, data: { x: 0, y: 0 } })
  updateDiagramData()
}

const addLine = (): void => {
  if (!board || elements.value.length < 2) {
    alert('請先添加至少兩個點')
    return
  }
  const points = board.objectsList.filter((obj: { elType?: string }) => obj.elType === 'point')
  if (points.length < 2) {
    alert('請先添加至少兩個點')
    return
  }
  const line = board.create('line', [points[0], points[1]], {
    strokeColor: '#0000ff',
    strokeWidth: 2
  })
  elements.value.push({ type: 'line', id: line.id, data: { point1: (points[0] as { id?: unknown }).id, point2: (points[1] as { id?: unknown }).id } })
  updateDiagramData()
}

const addFunction = (): void => {
  if (!board) return
  const func = board.create('functiongraph', ['x^2'], {
    strokeColor: '#ff0000',
    strokeWidth: 2
  })
  elements.value.push({ type: 'function', id: func.id, data: { expression: 'x^2' } })
  updateDiagramData()
}

const addFunctionFromInput = (): void => {
  if (!board || !functionInput.value.trim()) return
  try {
    const func = board.create('functiongraph', [functionInput.value], {
      strokeColor: '#ff0000',
      strokeWidth: 2
    })
    elements.value.push({ type: 'function', id: func.id, data: { expression: functionInput.value } })
    functionInput.value = ''
    updateDiagramData()
  } catch (error) {
    const err = error as Error
    alert('函數表達式錯誤：' + err.message)
  }
}

const addPolygon = (): void => {
  if (!board || elements.value.length < 3) {
    alert('請先添加至少三個點')
    return
  }
  const points = board.objectsList.filter((obj: { elType?: string }) => obj.elType === 'point')
  if (points.length < 3) {
    alert('請先添加至少三個點')
    return
  }
  const polygon = board.create('polygon', points.slice(0, 3), {
    fillColor: '#00ff00',
    fillOpacity: 0.3
  })
  elements.value.push({
    type: 'polygon',
    id: polygon.id,
    data: { vertices: points.slice(0, 3).map((p: { id?: unknown }) => p.id) }
  })
  updateDiagramData()
}

const loadDiagramData = (data: DiagramData): void => {
  if (!board || !data.elements) return
  // 根據數據重建圖形
  data.elements.forEach((element: DiagramElement) => {
    switch (element.type) {
      case 'point':
        board!.create('point', [element.data?.x || 0, element.data?.y || 0], { name: element.name })
        break
      case 'function':
        board.create('functiongraph', [element.data.expression], { strokeColor: '#ff0000' })
        break
      // 其他類型的元素...
    }
  })
}

const updateDiagramData = (): void => {
  if (!board) return

  const diagramData: DiagramData & { backup_image?: string } = {
    elements: elements.value.map((el) => {
      const obj = board!.objectsList.find((o: { id?: unknown }) => o.id === el.id)
      if (!obj) return el

      const objWithMethods = obj as { X?: () => number; Y?: () => number }
      switch (el.type) {
        case 'point':
          return { type: 'point', data: { x: objWithMethods.X?.() || 0, y: objWithMethods.Y?.() || 0 } }
        case 'function':
          return { type: 'function', data: { expression: el.data?.expression || '' } }
        default:
          return el
      }
    })
  }

  // 生成備援 SVG
  let backupImage = ''
  try {
    const boardWithRenderer = board as { renderer?: { svgRoot?: Node } }
    if (boardWithRenderer && boardWithRenderer.renderer && boardWithRenderer.renderer.svgRoot) {
      const svg = boardWithRenderer.renderer.svgRoot.cloneNode(true)
      const svgString = new XMLSerializer().serializeToString(svg)
      backupImage = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)))
    }
  } catch (error) {
    console.error('生成 SVG 備援圖片失敗：', error)
  }

  diagramData.backup_image = backupImage

  // 更新 Tiptap 節點屬性
  props.updateAttributes({
    diagram_data: diagramData as DiagramData,
    backup_image: backupImage
  })
}

const handleSave = (): void => {
  updateDiagramData()
}

watch(
  () => props.node.attrs as { diagram_data?: DiagramData },
  (newAttrs) => {
    if (newAttrs.diagram_data && newAttrs.diagram_data.elements && board) {
      // 重新載入數據
      loadDiagramData(newAttrs.diagram_data)
    }
  },
  { deep: true }
)

onMounted(() => {
  initBoard()
})

onBeforeUnmount(() => {
  if (board) {
    JXG.JSXGraph.freeBoard(board)
    board = null
  }
})
</script>

<style scoped>
.math-2d-plotter {
  border: 1px solid rgb(203, 213, 225);
  border-radius: 0.5rem;
  overflow: hidden;
  background: white;
}

.plotter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid rgb(203, 213, 225);
  background: rgb(248, 250, 252);
}

.plotter-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.btn-save {
  padding: 0.5rem 1rem;
  background: rgb(99, 102, 241);
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 14px;
}

.btn-save:hover {
  background: rgb(79, 70, 229);
}

.plotter-container {
  display: flex;
  height: 500px;
}

.plotter-sidebar {
  width: 200px;
  padding: 1rem;
  border-right: 1px solid rgb(203, 213, 225);
  background: rgb(248, 250, 252);
  overflow-y: auto;
}

.sidebar-section {
  margin-bottom: 1.5rem;
}

.sidebar-section h4 {
  margin: 0 0 0.5rem 0;
  font-size: 14px;
  font-weight: 600;
  color: rgb(51, 65, 85);
}

.sidebar-btn {
  display: block;
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  background: white;
  border: 1px solid rgb(203, 213, 225);
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.sidebar-btn:hover {
  background: rgb(226, 232, 240);
}

.function-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid rgb(203, 213, 225);
  border-radius: 0.25rem;
  font-size: 14px;
}

.plotter-board {
  flex: 1;
  min-height: 500px;
}
</style>
