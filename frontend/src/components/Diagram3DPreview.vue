<template>
  <div class="diagram-preview-3d">
    <div v-if="backupImage" class="backup-image">
      <img :src="backupImage" alt="3D 圖形" style="max-width: 100%; height: auto;" />
    </div>
    <div v-else ref="canvasContainer" class="canvas"></div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
})

const canvasContainer = ref(null)
let scene = null
let camera = null
let renderer = null
let controls = null
let animationId = null
let handleResizeFn = null

const diagramData = computed(() => {
  if (props.data && typeof props.data === 'object' && props.data.diagram_data) return props.data.diagram_data
  return props.data || {}
})

const backupImage = computed(() => {
  if (!props.data || typeof props.data !== 'object') return ''
  return props.data.backup_image || props.data.backupImage || ''
})

const loadDiagramData = (data) => {
  if (!scene || !data || !Array.isArray(data.objects)) return
  data.objects.forEach((obj) => {
    try {
      switch (obj.type) {
        case 'vector': {
          const start = new THREE.Vector3(...(obj.data?.start || [0, 0, 0]))
          const end = new THREE.Vector3(...(obj.data?.end || [1, 1, 1]))
          const direction = new THREE.Vector3().subVectors(end, start).normalize()
          const length = start.distanceTo(end)
          const arrow = new THREE.ArrowHelper(direction, start, length, 0xef4444, 0.2, 0.1)
          scene.add(arrow)
          break
        }
        case 'cube': {
          const size = obj.data?.size ?? 1
          const geometry = new THREE.BoxGeometry(size, size, size)
          const material = new THREE.MeshBasicMaterial({ color: obj.data?.color ?? 0x22c55e, wireframe: true })
          const cube = new THREE.Mesh(geometry, material)
          const pos = obj.data?.position || [0, 0.5, 0]
          cube.position.set(pos[0], pos[1], pos[2])
          scene.add(cube)
          break
        }
        case 'sphere': {
          const radius = obj.data?.radius ?? 0.5
          const geometry = new THREE.SphereGeometry(radius, 24, 24)
          const material = new THREE.MeshBasicMaterial({ color: obj.data?.color ?? 0x3b82f6, wireframe: true })
          const sphere = new THREE.Mesh(geometry, material)
          const pos = obj.data?.position || [2, 0.5, 0]
          sphere.position.set(pos[0], pos[1], pos[2])
          scene.add(sphere)
          break
        }
        default:
          break
      }
    } catch (e) {
      // ignore single object failure
    }
  })
}

onMounted(() => {
  if (backupImage.value) return
  if (!canvasContainer.value) return

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf8fafc)

  camera = new THREE.PerspectiveCamera(75, canvasContainer.value.clientWidth / canvasContainer.value.clientHeight, 0.1, 1000)
  camera.position.set(5, 5, 5)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(canvasContainer.value.clientWidth, canvasContainer.value.clientHeight)
  canvasContainer.value.appendChild(renderer.domElement)

  scene.add(new THREE.GridHelper(10, 10))
  scene.add(new THREE.AxesHelper(5))

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  loadDiagramData(diagramData.value)

  const animate = () => {
    animationId = requestAnimationFrame(animate)
    controls?.update()
    renderer?.render(scene, camera)
  }
  animate()

  handleResizeFn = () => {
    if (!canvasContainer.value || !camera || !renderer) return
    camera.aspect = canvasContainer.value.clientWidth / canvasContainer.value.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(canvasContainer.value.clientWidth, canvasContainer.value.clientHeight)
  }
  window.addEventListener('resize', handleResizeFn)
})

onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId)
  animationId = null
  if (handleResizeFn) window.removeEventListener('resize', handleResizeFn)
  handleResizeFn = null
  controls?.dispose?.()
  controls = null
  if (renderer && canvasContainer.value && renderer.domElement?.parentNode === canvasContainer.value) {
    canvasContainer.value.removeChild(renderer.domElement)
  }
  renderer?.dispose?.()
  renderer = null
  scene = null
  camera = null
})
</script>

<style scoped>
.diagram-preview-3d {
  border: 1px dashed rgb(203, 213, 225);
  border-radius: 0.5rem;
  background: rgb(248, 250, 252);
  padding: 0.75rem;
}

.canvas {
  width: 100%;
  height: 420px;
}
</style>

