<template>
  <div 
    class="relative inline-block overflow-hidden"
    @mousedown="startDrag"
    @touchstart="handleTouchStart"
    @mousemove="onDrag"
    @touchmove="handleTouchMove"
    @mouseup="endDrag"
    @mouseleave="endDrag"
    @touchend="handleTouchEnd"
    @wheel="handleWheel"
    :style="{ cursor: isDragging ? 'grabbing' : (scale > 1 ? 'grab' : 'default') }"
  >
    <img
      :src="imageUrl"
      :style="{ 
        transform: `translate(${translateX}px, ${translateY}px) rotate(${rotation}deg) scale(${scale})`, 
        transition: isDragging || isZooming ? 'none' : 'transform 0.3s ease',
        transformOrigin: 'center center'
      }"
      class="max-w-full h-auto border border-slate-200 rounded-lg shadow-sm select-none"
      :alt="alt || '圖片'"
      draggable="false"
    />
    <div class="absolute top-2 right-2 flex flex-col gap-2 z-10">
      <!-- 縮放控制 -->
      <div class="flex gap-2">
        <button
          @click.stop="zoomIn"
          class="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white shadow-md transition-colors"
          title="放大"
        >
          +
        </button>
        <button
          @click.stop="zoomOut"
          class="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white shadow-md transition-colors"
          title="縮小"
        >
          −
        </button>
        <button
          @click.stop="resetZoom"
          class="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white shadow-md transition-colors"
          title="重置縮放"
        >
          ⌂
        </button>
      </div>
      <!-- 旋轉控制 -->
      <div class="flex gap-2">
        <button
          @click.stop="rotate(90)"
          class="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white shadow-md transition-colors"
          title="順時針旋轉 90 度"
        >
          ↻ 90°
        </button>
        <button
          @click.stop="rotate(-90)"
          class="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white shadow-md transition-colors"
          title="逆時針旋轉 90 度"
        >
          ↺ 90°
        </button>
        <button
          @click.stop="reset"
          class="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white shadow-md transition-colors"
          title="重置旋轉"
        >
          ⟲
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue'

interface Props {
  imageUrl: string
  alt?: string
}

const props = withDefaults(defineProps<Props>(), {
  alt: ''
})

interface Touch {
  clientX: number
  clientY: number
}

interface Position {
  x: number
  y: number
}

const rotation: Ref<number> = ref(0)
const scale: Ref<number> = ref(1)
const translateX: Ref<number> = ref(0)
const translateY: Ref<number> = ref(0)

// 拖拽相關
const isDragging: Ref<boolean> = ref(false)
const dragStartX: Ref<number> = ref(0)
const dragStartY: Ref<number> = ref(0)
const dragStartTranslateX: Ref<number> = ref(0)
const dragStartTranslateY: Ref<number> = ref(0)

// 兩指縮放相關
const isZooming: Ref<boolean> = ref(false)
const initialDistance: Ref<number> = ref(0)
const initialScale: Ref<number> = ref(1)
const touches: Ref<Touch[]> = ref([])

const rotate = (degrees: number): void => {
  rotation.value = (rotation.value + degrees) % 360
}

const reset = (): void => {
  rotation.value = 0
}

const zoomIn = (): void => {
  scale.value = Math.min(scale.value + 0.25, 3) // 最大放大到 3 倍
  // 放大時不重置位置，讓用戶可以繼續查看同一區域
}

const zoomOut = (): void => {
  scale.value = Math.max(scale.value - 0.25, 0.25) // 最小縮小到 0.25 倍
  // 如果縮小到 1 倍或以下，重置位置
  if (scale.value <= 1) {
    translateX.value = 0
    translateY.value = 0
  }
}

const resetZoom = (): void => {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
}

const getEventPos = (e: MouseEvent | TouchEvent): Position => {
  if ('touches' in e && e.touches && e.touches.length > 0) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  const mouseEvent = e as MouseEvent
  return { x: mouseEvent.clientX, y: mouseEvent.clientY }
}

const getDistance = (touch1: Touch, touch2: Touch): number => {
  const dx = touch2.clientX - touch1.clientX
  const dy = touch2.clientY - touch1.clientY
  return Math.sqrt(dx * dx + dy * dy)
}

const getCenter = (touch1: Touch, touch2: Touch): Position => {
  return {
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2
  }
}

const handleTouchStart = (e: TouchEvent): void => {
  touches.value = Array.from(e.touches)

  // 兩指縮放
  if (touches.value.length === 2) {
    isZooming.value = true
    isDragging.value = false
    initialDistance.value = getDistance(touches.value[0], touches.value[1])
    initialScale.value = scale.value
    e.preventDefault()
  }
  // 單指拖拽
  else if (touches.value.length === 1 && scale.value > 1) {
    startDrag(e)
  }
}

const handleTouchMove = (e: TouchEvent): void => {
  touches.value = Array.from(e.touches)

  // 兩指縮放
  if (touches.value.length === 2 && isZooming.value) {
    const currentDistance = getDistance(touches.value[0], touches.value[1])
    const scaleChange = currentDistance / initialDistance.value
    const newScale = initialScale.value * scaleChange

    // 限制縮放範圍
    const clampedScale = Math.max(0.25, Math.min(3, newScale))
    scale.value = clampedScale

    // 如果縮小到 1 倍或以下，重置位置
    if (scale.value <= 1) {
      translateX.value = 0
      translateY.value = 0
    }

    e.preventDefault()
  }
  // 單指拖拽
  else if (touches.value.length === 1 && isDragging.value) {
    onDrag(e)
  }
}

const handleTouchEnd = (e: TouchEvent): void => {
  touches.value = Array.from(e.touches)

  // 如果只剩一根手指或沒有手指，結束縮放和拖拽
  if (touches.value.length < 2) {
    isZooming.value = false
    if (touches.value.length === 0) {
      endDrag()
    }
  }
}

const startDrag = (e: MouseEvent | TouchEvent): void => {
  // 只有在放大狀態下才允許拖拽
  if (scale.value <= 1) return

  // 如果正在縮放，不允許拖拽
  if (isZooming.value) return

  isDragging.value = true
  const pos = getEventPos(e)
  dragStartX.value = pos.x
  dragStartY.value = pos.y
  dragStartTranslateX.value = translateX.value
  dragStartTranslateY.value = translateY.value
  e.preventDefault()
}

const onDrag = (e: MouseEvent | TouchEvent): void => {
  if (!isDragging.value || isZooming.value) return

  const pos = getEventPos(e)
  const deltaX = pos.x - dragStartX.value
  const deltaY = pos.y - dragStartY.value

  translateX.value = dragStartTranslateX.value + deltaX
  translateY.value = dragStartTranslateY.value + deltaY

  e.preventDefault()
}

const endDrag = (): void => {
  isDragging.value = false
}

// 滑鼠滾輪縮放
const handleWheel = (e: WheelEvent): void => {
  e.preventDefault()

  // 計算縮放增量（向下滾動縮小，向上滾動放大）
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  const newScale = scale.value + delta

  // 限制縮放範圍
  const clampedScale = Math.max(0.25, Math.min(3, newScale))
  scale.value = clampedScale

  // 如果縮小到 1 倍或以下，重置位置
  if (scale.value <= 1) {
    translateX.value = 0
    translateY.value = 0
  }

  // 設置縮放標記，禁用過渡動畫
  isZooming.value = true
  setTimeout(() => {
    isZooming.value = false
  }, 300)
}
</script>
