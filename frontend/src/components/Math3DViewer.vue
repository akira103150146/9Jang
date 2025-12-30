<template>
  <NodeViewWrapper as="div" class="math-3d-viewer">
    <div class="viewer-header">
      <h3>3D 數學視覺化</h3>
      <div class="viewer-actions">
        <button @click="addVector" class="btn-action">添加向量</button>
        <button @click="addCube" class="btn-action">添加立方體</button>
        <button @click="addSphere" class="btn-action">添加球體</button>
        <button @click="handleSave" class="btn-save">保存</button>
      </div>
    </div>
    <div ref="canvasContainer" class="viewer-canvas"></div>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, type Ref } from 'vue'
import { NodeViewWrapper, nodeViewProps, type NodeViewProps } from '@tiptap/vue-3'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const props = defineProps<NodeViewProps>()

interface Object3DData {
  type: string
  id?: string
  data?: {
    start?: [number, number, number]
    end?: [number, number, number]
    size?: number
    color?: number
    position?: [number, number, number]
    radius?: number
    [key: string]: unknown
  }
  [key: string]: unknown
}

interface Diagram3DData {
  objects?: Object3DData[]
  [key: string]: unknown
}

const canvasContainer: Ref<HTMLElement | null> = ref(null)
const scene: Ref<THREE.Scene | null> = ref(null)
const camera: Ref<THREE.PerspectiveCamera | null> = ref(null)
const renderer: Ref<THREE.WebGLRenderer | null> = ref(null)
const controls: Ref<OrbitControls | null> = ref(null)
const objects: Ref<Object3DData[]> = ref([])
let animationId: number | null = null
let handleResizeFn: (() => void) | null = null

const initScene = (): void => {
  if (!canvasContainer.value) return

  // 創建場景
  scene.value = new THREE.Scene()
  scene.value.background = new THREE.Color(0xf0f0f0)

  // 創建相機
  camera.value = new THREE.PerspectiveCamera(
    75,
    canvasContainer.value.clientWidth / canvasContainer.value.clientHeight,
    0.1,
    1000
  )
  camera.value.position.set(5, 5, 5)
  camera.value.lookAt(0, 0, 0)

  // 創建渲染器
  renderer.value = new THREE.WebGLRenderer({ antialias: true })
  renderer.value.setSize(canvasContainer.value.clientWidth, canvasContainer.value.clientHeight)
  canvasContainer.value.appendChild(renderer.value.domElement)

  // 添加網格
  const gridHelper = new THREE.GridHelper(10, 10)
  scene.value.add(gridHelper)

  // 添加軸
  const axesHelper = new THREE.AxesHelper(5)
  scene.value.add(axesHelper)

  // 添加軌道控制器
  controls.value = new OrbitControls(camera.value, renderer.value.domElement)
  controls.value.enableDamping = true

  // 載入現有數據
  const attrs = props.node.attrs as { diagram_data?: Diagram3DData }
  if (attrs.diagram_data && attrs.diagram_data.objects) {
    loadDiagramData(attrs.diagram_data)
  }

  // 動畫循環
  const animate = (): void => {
    animationId = requestAnimationFrame(animate)
    if (controls.value && renderer.value && scene.value && camera.value) {
      controls.value.update()
      renderer.value.render(scene.value, camera.value)
    }
  }
  animate()

  // 處理窗口大小變化
  handleResizeFn = (): void => {
    if (!canvasContainer.value || !camera.value || !renderer.value) return
    camera.value.aspect = canvasContainer.value.clientWidth / canvasContainer.value.clientHeight
    camera.value.updateProjectionMatrix()
    renderer.value.setSize(canvasContainer.value.clientWidth, canvasContainer.value.clientHeight)
  }
  window.addEventListener('resize', handleResizeFn)
}

const addVector = (): void => {
  if (!scene.value) return

  const start = new THREE.Vector3(0, 0, 0)
  const end = new THREE.Vector3(1, 1, 1)
  const direction = new THREE.Vector3().subVectors(end, start).normalize()
  const length = start.distanceTo(end)

  const arrowHelper = new THREE.ArrowHelper(direction, start, length, 0xff0000, 0.2, 0.1)
  scene.value.add(arrowHelper)

  objects.value.push({
    type: 'vector',
    id: arrowHelper.uuid,
    data: {
      start: [start.x, start.y, start.z] as [number, number, number],
      end: [end.x, end.y, end.z] as [number, number, number]
    }
  })

  updateDiagramData()
}

const addCube = (): void => {
  if (!scene.value) return

  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  const cube = new THREE.Mesh(geometry, material)
  cube.position.set(0, 0.5, 0)
  scene.value.add(cube)

  objects.value.push({
    type: 'cube',
    id: cube.uuid,
    data: {
      size: 1,
      position: [0, 0.5, 0] as [number, number, number],
      color: 0x00ff00
    }
  })

  updateDiagramData()
}

const addSphere = (): void => {
  if (!scene.value) return

  const geometry = new THREE.SphereGeometry(0.5, 32, 32)
  const material = new THREE.MeshBasicMaterial({ color: 0x0000ff })
  const sphere = new THREE.Mesh(geometry, material)
  sphere.position.set(2, 0.5, 0)
  scene.value.add(sphere)

  objects.value.push({
    type: 'sphere',
    id: sphere.uuid,
    data: {
      radius: 0.5,
      position: [2, 0.5, 0] as [number, number, number],
      color: 0x0000ff
    }
  })

  updateDiagramData()
}

const loadDiagramData = (data: Diagram3DData): void => {
  if (!scene.value || !data.objects) return

  data.objects.forEach((obj: Object3DData) => {
    switch (obj.type) {
      case 'vector': {
        const startArr = obj.data?.start || [0, 0, 0]
        const endArr = obj.data?.end || [1, 1, 1]
        const start = new THREE.Vector3(...(startArr as [number, number, number]))
        const end = new THREE.Vector3(...(endArr as [number, number, number]))
        const direction = new THREE.Vector3().subVectors(end, start).normalize()
        const length = start.distanceTo(end)
        const arrowHelper = new THREE.ArrowHelper(direction, start, length, 0xff0000)
        scene.value!.add(arrowHelper)
        break
      }
      case 'cube': {
        const size = obj.data?.size || 1
        const cubeGeometry = new THREE.BoxGeometry(size, size, size)
        const cubeMaterial = new THREE.MeshBasicMaterial({ color: (obj.data?.color as number) || 0x00ff00 })
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
        const pos = (obj.data?.position || [0, 0, 0]) as [number, number, number]
        cube.position.set(pos[0], pos[1], pos[2])
        scene.value!.add(cube)
        break
      }
      case 'sphere': {
        const radius = obj.data?.radius || 0.5
        const sphereGeometry = new THREE.SphereGeometry(radius, 32, 32)
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: (obj.data?.color as number) || 0x0000ff })
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
        const pos = (obj.data?.position || [0, 0, 0]) as [number, number, number]
        sphere.position.set(pos[0], pos[1], pos[2])
        scene.value!.add(sphere)
        break
      }
    }
  })
}

const exportToImage = (): string => {
  if (!renderer.value || !scene.value || !camera.value) return ''

  // 確保場景已渲染
  if (controls.value) {
    controls.value.update()
  }
  renderer.value.render(scene.value, camera.value)

  // 導出為 Base64 PNG
  try {
    return renderer.value.domElement.toDataURL('image/png')
  } catch (error) {
    console.error('導出圖片失敗：', error)
    return ''
  }
}

const updateDiagramData = (): void => {
  const diagramData: Diagram3DData & { backup_image?: string } = {
    objects: objects.value
  }

  // 生成備援圖片
  const backupImage = exportToImage()
  diagramData.backup_image = backupImage

  // 更新 Tiptap 節點屬性
  props.updateAttributes({
    diagram_data: diagramData as Diagram3DData,
    backup_image: backupImage
  })
}

const handleSave = (): void => {
  updateDiagramData()
}

watch(
  () => props.node.attrs as { diagram_data?: Diagram3DData },
  (newAttrs) => {
    if (newAttrs.diagram_data && newAttrs.diagram_data.objects && scene.value) {
      // 重新載入數據
      loadDiagramData(newAttrs.diagram_data)
    }
  },
  { deep: true }
)

onMounted(() => {
  initScene()
})

onBeforeUnmount(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  if (controls.value) {
    controls.value.dispose()
    controls.value = null
  }
  if (renderer.value && canvasContainer.value && renderer.value.domElement && renderer.value.domElement.parentNode === canvasContainer.value) {
    canvasContainer.value.removeChild(renderer.value.domElement)
  }
  if (renderer.value) {
    renderer.value.dispose()
    renderer.value = null
  }
  if (scene.value) {
    // 清理場景中的所有對象
    while(scene.value.children.length > 0) {
      scene.value.remove(scene.value.children[0])
    }
    scene.value = null
  }
  if (camera.value) {
    camera.value = null
  }
  if (handleResizeFn) {
    window.removeEventListener('resize', handleResizeFn)
    handleResizeFn = null
  }
})
</script>

<style scoped>
.math-3d-viewer {
  border: 1px solid rgb(203, 213, 225);
  border-radius: 0.5rem;
  overflow: hidden;
  background: white;
}

.viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid rgb(203, 213, 225);
  background: rgb(248, 250, 252);
}

.viewer-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.viewer-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-action,
.btn-save {
  padding: 0.5rem 1rem;
  background: rgb(99, 102, 241);
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 14px;
}

.btn-action:hover,
.btn-save:hover {
  background: rgb(79, 70, 229);
}

.viewer-canvas {
  width: 100%;
  height: 500px;
}
</style>
