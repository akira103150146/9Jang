<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
    @click.self="close"
  >
    <div class="relative max-w-5xl max-h-[90vh] mx-4">
      <button
        @click="close"
        class="absolute top-4 right-4 z-10 p-2 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
      <img
        :src="url"
        :alt="caption || '圖片預覽'"
        class="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
      />
      <div v-if="caption" class="mt-2 text-center text-white text-sm bg-black bg-opacity-50 rounded-lg p-2">
        {{ caption }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  open: boolean
  url: string
  caption: string
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const close = (): void => {
  emit('close')
}
</script>
