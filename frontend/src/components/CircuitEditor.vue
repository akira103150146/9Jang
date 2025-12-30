<template>
  <NodeViewWrapper as="div" class="circuit-editor">
    <div class="editor-header">
      <h3>電路圖編輯器</h3>
      <button @click="handleSave" class="btn-save">保存</button>
    </div>
    <div class="editor-container">
      <div class="editor-sidebar">
        <div class="sidebar-section">
          <h4>電路元件</h4>
          <button @click="addResistor" class="sidebar-btn">電阻</button>
          <button @click="addCapacitor" class="sidebar-btn">電容</button>
          <button @click="addInductor" class="sidebar-btn">電感</button>
          <button @click="addVoltageSource" class="sidebar-btn">電壓源</button>
          <button @click="addCurrentSource" class="sidebar-btn">電流源</button>
          <button @click="addSwitch" class="sidebar-btn">開關</button>
        </div>
      </div>
      <div ref="canvasContainer" class="editor-canvas"></div>
    </div>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, type Ref } from 'vue'
import { NodeViewWrapper, nodeViewProps, type NodeViewProps } from '@tiptap/vue-3'
// 使用簡單的 SVG 繪製方式，避免複雜的 SVG.js 依賴
// 實際使用時可以替換為 LogicFlow 或其他電路圖庫

const props = defineProps<NodeViewProps>()

interface CircuitElement {
  type: string
  id?: string
  data?: {
    position?: [number, number]
    value?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

interface CircuitData {
  elements?: CircuitElement[]
  [key: string]: unknown
}

const canvasContainer: Ref<HTMLElement | null> = ref(null)
let svgElement: SVGElement | null = null
const elements: Ref<CircuitElement[]> = ref([])

const initCanvas = (): void => {
  if (!canvasContainer.value) return

  // 創建 SVG 元素
  svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as SVGElement
  svgElement.setAttribute('width', '800')
  svgElement.setAttribute('height', '600')
  svgElement.setAttribute('viewBox', '0 0 800 600')
  svgElement.style.border = '1px solid #ccc'
  canvasContainer.value.appendChild(svgElement)

  // 載入現有數據
  const attrs = props.node.attrs as { circuit_data?: CircuitData }
  if (attrs.circuit_data && attrs.circuit_data.elements) {
    loadCircuitData(attrs.circuit_data)
  }
}

const addResistor = (): void => {
  if (!svgElement) return
  const x = 100 + elements.value.length * 150
  const y = 300

  // 繪製電阻符號（矩形）
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  rect.setAttribute('x', String(x))
  rect.setAttribute('y', String(y - 10))
  rect.setAttribute('width', '60')
  rect.setAttribute('height', '20')
  rect.setAttribute('fill', 'white')
  rect.setAttribute('stroke', '#000')
  rect.setAttribute('stroke-width', '2')
  svgElement.appendChild(rect)

  const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line')
  line1.setAttribute('x1', String(x))
  line1.setAttribute('y1', String(y))
  line1.setAttribute('x2', String(x + 60))
  line1.setAttribute('y2', String(y))
  line1.setAttribute('stroke', '#000')
  line1.setAttribute('stroke-width', '2')
  svgElement.appendChild(line1)

  const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line')
  line2.setAttribute('x1', String(x + 60))
  line2.setAttribute('y1', String(y))
  line2.setAttribute('x2', String(x + 120))
  line2.setAttribute('y2', String(y))
  line2.setAttribute('stroke', '#000')
  line2.setAttribute('stroke-width', '2')
  svgElement.appendChild(line2)

  const elementId = `resistor_${Date.now()}`
  rect.setAttribute('id', elementId)

  elements.value.push({
    type: 'resistor',
    id: elementId,
    data: { position: [x, y] as [number, number], value: '1kΩ' }
  })

  updateCircuitData()
}

const addCapacitor = (): void => {
  if (!svgElement) return
  const x = 100 + elements.value.length * 150
  const y = 300

  // 繪製電容符號（兩條平行線）
  const createLine = (x1: number, y1: number, x2: number, y2: number): SVGLineElement => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', String(x1))
    line.setAttribute('y1', String(y1))
    line.setAttribute('x2', String(x2))
    line.setAttribute('y2', String(y2))
    line.setAttribute('stroke', '#000')
    line.setAttribute('stroke-width', '2')
    svgElement!.appendChild(line)
    return line
  }

  createLine(x, y - 20, x, y + 20)
  createLine(x + 40, y - 20, x + 40, y + 20)
  createLine(x - 20, y, x, y)
  createLine(x + 40, y, x + 60, y)

  const elementId = `capacitor_${Date.now()}`

  elements.value.push({
    type: 'capacitor',
    id: elementId,
    data: { position: [x, y] as [number, number], value: '10μF' }
  })

  updateCircuitData()
}

const addInductor = () => {
  if (!svgElement) return
  const x = 100 + elements.value.length * 150
  const y = 300
  
  // 繪製電感符號（線圈）
  for (let i = 0; i < 4; i++) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circle.setAttribute('cx', x + i * 15)
    circle.setAttribute('cy', y)
    circle.setAttribute('r', '10')
    circle.setAttribute('fill', 'none')
    circle.setAttribute('stroke', '#000')
    circle.setAttribute('stroke-width', '2')
    svgElement.appendChild(circle)
  }
  
  const elementId = `inductor_${Date.now()}`
  elements.value.push({
    type: 'inductor',
    id: elementId,
    data: { position: [x, y], value: '1mH' },
  })
  
  updateCircuitData()
}

const addVoltageSource = () => {
  if (!svgElement) return
  const x = 100 + elements.value.length * 150
  const y = 300
  
  // 繪製電壓源符號（圓圈）
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  circle.setAttribute('cx', x)
  circle.setAttribute('cy', y)
  circle.setAttribute('r', '20')
  circle.setAttribute('fill', 'white')
  circle.setAttribute('stroke', '#000')
  circle.setAttribute('stroke-width', '2')
  svgElement.appendChild(circle)
  
  const elementId = `voltage_${Date.now()}`
  elements.value.push({
    type: 'voltage',
    id: elementId,
    data: { position: [x, y], value: '5V' },
  })
  
  updateCircuitData()
}

const addCurrentSource = () => {
  if (!svgElement) return
  const x = 100 + elements.value.length * 150
  const y = 300
  
  // 繪製電流源符號（圓圈加箭頭）
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  circle.setAttribute('cx', x)
  circle.setAttribute('cy', y)
  circle.setAttribute('r', '20')
  circle.setAttribute('fill', 'white')
  circle.setAttribute('stroke', '#000')
  circle.setAttribute('stroke-width', '2')
  svgElement.appendChild(circle)
  
  const elementId = `current_${Date.now()}`
  elements.value.push({
    type: 'current',
    id: elementId,
    data: { position: [x, y], value: '1A' },
  })
  
  updateCircuitData()
}

const addSwitch = () => {
  if (!svgElement) return
  const x = 100 + elements.value.length * 150
  const y = 300
  
  // 繪製開關符號
  const createLine = (x1, y1, x2, y2) => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', x1)
    line.setAttribute('y1', y1)
    line.setAttribute('x2', x2)
    line.setAttribute('y2', y2)
    line.setAttribute('stroke', '#000')
    line.setAttribute('stroke-width', '2')
    svgElement.appendChild(line)
    return line
  }
  
  createLine(x - 20, y, x, y)
  createLine(x, y - 20, x + 20, y)
  createLine(x + 20, y, x + 40, y)
  
  const elementId = `switch_${Date.now()}`
  elements.value.push({
    type: 'switch',
    id: elementId,
    data: { position: [x, y], state: 'open' },
  })
  
  updateCircuitData()
}

const loadCircuitData = (data) => {
  if (!svgElement || !data.elements) return
  // 根據數據重建電路圖
  data.elements.forEach(element => {
    switch (element.type) {
      case 'resistor':
        addResistor()
        break
      case 'capacitor':
        addCapacitor()
        break
      case 'inductor':
        addInductor()
        break
      case 'voltage':
        addVoltageSource()
        break
      case 'current':
        addCurrentSource()
        break
      case 'switch':
        addSwitch()
        break
    }
  })
}

const updateCircuitData = () => {
  if (!svgElement) return
  
  const circuitData = {
    elements: elements.value,
  }
  
  // 生成備援 SVG
  let backupImage = ''
  try {
    const svgString = new XMLSerializer().serializeToString(svgElement)
    backupImage = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)))
  } catch (error) {
    console.error('生成 SVG 備援圖片失敗：', error)
  }
  
  circuitData.backup_image = backupImage
  
  // 更新 Tiptap 節點屬性
  props.updateAttributes({
    circuit_data: circuitData,
    backup_image: backupImage,
  })
}

const handleSave = () => {
  updateCircuitData()
}

watch(() => props.node.attrs, (newAttrs) => {
  if (newAttrs.circuit_data && newAttrs.circuit_data.elements && svgElement) {
    // 清空現有內容
    while (svgElement.firstChild) {
      svgElement.removeChild(svgElement.firstChild)
    }
    elements.value = []
    // 重新載入數據
    loadCircuitData(newAttrs.circuit_data)
  }
}, { deep: true })

onMounted(() => {
  initCanvas()
})

onBeforeUnmount(() => {
  if (svgElement && svgElement.parentNode) {
    svgElement.parentNode.removeChild(svgElement)
    svgElement = null
  }
})
</script>

<style scoped>
.circuit-editor {
  border: 1px solid rgb(203, 213, 225);
  border-radius: 0.5rem;
  overflow: hidden;
  background: white;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid rgb(203, 213, 225);
  background: rgb(248, 250, 252);
}

.editor-header h3 {
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

.editor-container {
  display: flex;
  height: 600px;
}

.editor-sidebar {
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

.editor-canvas {
  flex: 1;
  min-height: 600px;
  background: white;
}
</style>
