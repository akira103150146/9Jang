<template>
  <div class="relative group rounded-lg border border-transparent hover:border-indigo-200 hover:bg-indigo-50/10 p-4 transition-colors">
    <div v-if="loading" class="py-4 text-center text-slate-400 text-sm">
      載入題目中...
    </div>
    <div v-else-if="error" class="py-4 text-center text-rose-500 text-sm">
      題目載入失敗 (ID: {{ questionId }})
    </div>
    <div v-else-if="question" class="question-content">
      <div class="flex items-start justify-between mb-2">
        <div class="text-xs text-slate-500 font-semibold tracking-wider uppercase">
          Q{{ question.question_id }} · {{ question.subject_name || '無科目' }}
          <span
            v-if="question.imported_student_name"
            class="ml-2 inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700"
          >
            來源學生：{{ question.imported_student_name }}
          </span>
        </div>
        <div class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
          {{ question.chapter }}
        </div>
      </div>
      
      <!-- 題目內容 -->
      <div 
        class="prose prose-sm max-w-none text-slate-800"
        v-html="renderContent(question.content)"
      ></div>
      
      <!-- 圖片 -->
      <div v-if="question.image_path" class="mt-3">
        <img :src="question.image_path" class="max-h-40 rounded shadow-sm" alt="題目圖片">
      </div>
      
      <!-- 答案 (編輯模式可見，列印時可選隱藏) -->
      <div class="mt-4 pt-3 border-t border-slate-100 hidden group-hover:block print:hidden">
        <span class="text-xs font-bold text-slate-400 mr-2">答案</span>
        <span class="text-sm text-slate-600 font-mono" v-html="renderContent(question.correct_answer)"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { questionBankAPI } from '../services/api'
import { useMarkdownRenderer } from '../composables/useMarkdownRenderer'
import { useTiptapConverter } from '../composables/useTiptapConverter'

const props = defineProps({
  questionId: {
    type: [Number, String],
    required: true
  }
})

const { renderMarkdownWithLatex } = useMarkdownRenderer()
const { extractTextFromTiptapJSON } = useTiptapConverter()
const question = ref(null)
const loading = ref(true)
const error = ref(false)

// 處理內容渲染：支援 TipTap JSON 格式和 Markdown 字串
const renderContent = (content) => {
  if (!content) return ''
  
  // 如果是 TipTap JSON 格式
  if (typeof content === 'object' && content.type === 'doc') {
    // 使用 composable 提取文字內容
    const textContent = extractTextFromTiptapJSON(content)
    return renderMarkdownWithLatex(textContent)
  }
  
  // 如果是字串，直接渲染
  if (typeof content === 'string') {
    return renderMarkdownWithLatex(content)
  }
  
  // 其他情況，轉換為字串
  return String(content)
}

const fetchQuestion = async () => {
  if (!props.questionId) return
  
  loading.value = true
  error.value = false
  
  try {
    const response = await questionBankAPI.getById(props.questionId)
    question.value = response.data
  } catch (e) {
    console.error('Fetch question error', e)
    error.value = true
  } finally {
    loading.value = false
  }
}

watch(() => props.questionId, () => {
  fetchQuestion()
})

onMounted(() => {
  fetchQuestion()
})
</script>

<style scoped>
/* 避免題目內部被分頁切斷 */
.question-content {
  break-inside: avoid;
  page-break-inside: avoid;
}
</style>
