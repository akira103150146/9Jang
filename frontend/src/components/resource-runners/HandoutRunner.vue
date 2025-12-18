<template>
  <div class="handout-runner">
    <!-- 輸出格式選擇 -->
    <div class="mb-4 flex gap-2">
      <button
        v-for="format in outputFormats"
        :key="format.value"
        @click="selectedFormat = format.value"
        class="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        :class="selectedFormat === format.value
          ? 'bg-indigo-500 text-white'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
      >
        {{ format.label }}
      </button>
      <button
        @click="exportPDF"
        class="ml-auto px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-600"
      >
        匯出 PDF
      </button>
    </div>

    <!-- 紙張預覽 -->
    <PaperPreview
      :paper-size="props.settings?.handout?.paperSize || 'A4'"
      :orientation="props.settings?.handout?.orientation || 'portrait'"
      :structure="structure"
      :format="selectedFormat"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PaperPreview from '../PaperPreview.vue'
import { learningResourceAPI } from '../../services/api'

const props = defineProps({
  resource: {
    type: Object,
    required: true
  },
  structure: {
    type: Array,
    default: () => []
  },
  settings: {
    type: Object,
    default: () => ({})
  }
})

const selectedFormat = ref('question_only')

const outputFormats = [
  { value: 'question_only', label: '題目卷' },
  { value: 'question_solution_answer', label: '題目+詳解+答案' },
  { value: 'solution_only', label: '詳解卷' },
  { value: 'answer_only', label: '答案卷' }
]

const exportPDF = async () => {
  try {
    const response = await learningResourceAPI.export(props.resource.resource_id, selectedFormat.value)
    // TODO: 處理 PDF 下載
    alert('PDF 匯出功能開發中，目前返回資料：' + JSON.stringify(response.data))
  } catch (error) {
    console.error('匯出失敗：', error)
    alert('匯出失敗，請稍後再試')
  }
}
</script>
