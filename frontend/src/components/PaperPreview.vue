<template>
  <div class="rounded-lg border border-slate-200 bg-white p-4">
    <h3 class="text-sm font-semibold text-slate-700 mb-3">紙張預覽</h3>
    
    <div class="flex justify-center items-start bg-slate-100 p-4 rounded-lg overflow-auto">
      <div
        :class="paperClass"
        class="bg-white shadow-lg"
        :style="paperStyle"
      >
        <div class="p-8" :style="contentStyle">
          <!-- 預覽內容 -->
          <div v-if="structure.length === 0" class="text-center text-slate-400 py-12">
            拖放題目或模板到此處
          </div>
          <div v-else>
            <!-- 這裡可以顯示結構化的內容預覽 -->
            <div
              v-for="(block, index) in structure"
              :key="block.id || index"
              class="mb-4"
            >
              <div v-if="block.type === 'question'" class="p-2 bg-blue-50 rounded border border-blue-200">
                <span class="text-xs text-blue-700">題目 #{{ block.question_id }}</span>
              </div>
              <div v-else-if="block.type === 'template'" class="p-2 bg-green-50 rounded border border-green-200">
                <span class="text-xs text-green-700">模板 #{{ block.template_id }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type PaperSize = 'A4' | 'B4'
type Orientation = 'portrait' | 'landscape'
type Format = 'question_only' | string

interface PaperDimension {
  width: number
  height: number
}

interface Margins {
  top: number
  right: number
  bottom: number
  left: number
}

interface Block {
  id?: string
  type: string
  question_id?: number
  template_id?: number
  [key: string]: unknown
}

interface Props {
  paperSize?: PaperSize
  orientation?: Orientation
  structure?: Block[]
  margins?: Margins
  format?: Format
}

const props = withDefaults(defineProps<Props>(), {
  paperSize: 'A4',
  orientation: 'portrait',
  structure: () => [],
  margins: () => ({ top: 20, right: 20, bottom: 20, left: 20 }),
  format: 'question_only'
})

// 紙張尺寸（mm 轉 px，假設 96 DPI）
const paperDimensions: Record<PaperSize, PaperDimension> = {
  A4: { width: 210, height: 297 },
  B4: { width: 250, height: 353 }
}

const paperClass = computed<string>(() => {
  return props.orientation === 'landscape' ? 'landscape' : 'portrait'
})

const paperStyle = computed<Record<string, string>>(() => {
  const dim = paperDimensions[props.paperSize]
  const scale = 0.5 // 縮放比例，方便預覽
  const width = props.orientation === 'landscape' ? dim.height : dim.width
  const height = props.orientation === 'landscape' ? dim.width : dim.height

  return {
    width: `${width * scale}mm`,
    height: `${height * scale}mm`,
    minHeight: `${height * scale}mm`
  }
})

const contentStyle = computed<Record<string, string>>(() => {
  return {
    paddingTop: `${props.margins.top}px`,
    paddingRight: `${props.margins.right}px`,
    paddingBottom: `${props.margins.bottom}px`,
    paddingLeft: `${props.margins.left}px`
  }
})
</script>

<style scoped>
.portrait {
  aspect-ratio: 210 / 297;
}

.landscape {
  aspect-ratio: 297 / 210;
}
</style>
