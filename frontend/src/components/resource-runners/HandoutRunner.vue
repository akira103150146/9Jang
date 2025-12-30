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

    <!-- 使用 BlockEditor 唯讀模式顯示預覽 -->
    <div class="border border-slate-200 rounded-lg overflow-hidden bg-white">
      <BlockEditor
        :model-value="filteredTiptapStructure"
        :templates="[]"
        :questions="[]"
        :auto-page-break="false"
        :paper-size="props.settings?.handout?.paperSize || 'A4'"
        :readonly="true"
        :show-page-numbers="true"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import BlockEditor from '../BlockEditor/BlockEditor.vue'
import { useEditorEventsProvider } from '../../composables/useEditorEvents'
import { learningResourceAPI } from '../../services/api'

// 初始化編輯器事件提供者（BlockEditor 需要）
useEditorEventsProvider()

const props = defineProps({
  resource: {
    type: Object,
    required: true
  },
  tiptap_structure: {
    type: Object,
    default: () => ({
      type: 'doc',
      content: [{ type: 'paragraph', content: [] }]
    })
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

// 根據選中的格式過濾內容（未來實現）
// 目前先顯示完整內容
const filteredTiptapStructure = computed(() => {
  // TODO: 根據 selectedFormat 過濾 tiptap_structure 內容
  // 例如：question_only 只顯示題目，隱藏答案和解析
  return props.tiptap_structure || {
    type: 'doc',
    content: [{ type: 'paragraph', content: [] }]
  }
})

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
