<template>
  <div class="relative inline-block">
    <img
      :src="imageUrl"
      :style="{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.3s ease' }"
      class="max-w-full h-auto border border-slate-200 rounded-lg shadow-sm"
      :alt="alt || '圖片'"
    />
    <div class="absolute top-2 right-2 flex gap-2">
      <button
        @click="rotate(90)"
        class="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white shadow-md transition-colors"
        title="順時針旋轉 90 度"
      >
        ↻ 90°
      </button>
      <button
        @click="rotate(-90)"
        class="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white shadow-md transition-colors"
        title="逆時針旋轉 90 度"
      >
        ↺ 90°
      </button>
      <button
        @click="reset"
        class="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white shadow-md transition-colors"
        title="重置旋轉"
      >
        ⟲
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  imageUrl: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  }
})

const rotation = ref(0)

const rotate = (degrees) => {
  rotation.value = (rotation.value + degrees) % 360
}

const reset = () => {
  rotation.value = 0
}
</script>
