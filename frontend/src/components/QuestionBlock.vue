<template>
  <div class="question-display" :data-question-number="questionNumber">
    <div v-if="loading" class="py-4 text-center text-slate-400 text-sm">
      載入題目中...
    </div>
    <div v-else-if="error" class="py-4 text-center text-rose-500 text-sm">
      題目載入失敗 (ID: {{ questionId }})
    </div>
    <div v-else-if="question" class="question-content">
      <!-- 題號 -->
      <div v-if="questionNumber" class="question-number">
        {{ questionNumber }}.
      </div>
      
      <div class="question-body">
        <!-- 題目內容 -->
        <div 
          class="prose prose-sm max-w-none text-slate-800 question-text"
          v-html="renderContent(question.content)"
        ></div>
        
        <!-- 圖片 -->
        <div v-if="question.image_path" class="mt-3">
          <img :src="question.image_path" class="max-h-60 rounded" alt="題目圖片">
        </div>
        
        <!-- 答案區域 - 根據顯示模式控制 -->
        <div 
          v-if="question.correct_answer && showAnswer" 
          class="answer-section"
        >
          <div class="answer-label">答案：</div>
          <div class="answer-content" v-html="renderContent(question.correct_answer)"></div>
        </div>
        
        <!-- 詳解區域 - 根據顯示模式控制 -->
        <div 
          v-if="question.solution_content && showSolution" 
          class="solution-section"
        >
          <div class="solution-label">詳解：</div>
          <div class="solution-content" v-html="renderContent(question.solution_content)"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, inject, computed } from 'vue'
import { questionBankAPI } from '../services/api'
import { useMarkdownRenderer } from '../composables/useMarkdownRenderer'
import { useTiptapConverter } from '../composables/useTiptapConverter'

const props = defineProps({
  questionId: {
    type: [Number, String],
    required: true
  },
  showMetadata: {
    type: Boolean,
    default: false
  },
  questionNumber: {
    type: Number,
    default: null
  }
})

// 注入顯示模式
const printMode = inject('printMode', ref('with-all'))

// 計算是否顯示答案和詳解
const showAnswer = computed(() => {
  const mode = printMode.value
  const result = mode === 'with-answer' || mode === 'with-all'
  // #region agent log
  fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'QuestionBlock.vue:showAnswer:computed',message:'Computing showAnswer',data:{questionId:props.questionId,mode:mode,result:result},timestamp:Date.now(),sessionId:'debug-session',runId:'print-css-debug-2',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  return result
})

const showSolution = computed(() => {
  const mode = printMode.value
  const result = mode === 'with-solution' || mode === 'with-all'
  // #region agent log
  fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'QuestionBlock.vue:showSolution:computed',message:'Computing showSolution',data:{questionId:props.questionId,mode:mode,result:result},timestamp:Date.now(),sessionId:'debug-session',runId:'print-css-debug-2',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  return result
})

const { renderMarkdownWithLatex } = useMarkdownRenderer()
const { contentToMarkdown } = useTiptapConverter()
const question = ref(null)
const loading = ref(true)
const error = ref(false)

const renderContent = (content) => {
  if (!content) return ''
  // #region agent log
  fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'QuestionBlock.vue:renderContent:start',message:'Rendering content',data:{questionId:props.questionId,contentType:typeof content,contentIsString:typeof content === 'string',contentIsObject:typeof content === 'object',contentPreview:typeof content === 'string' ? content.substring(0, 100) : JSON.stringify(content).substring(0, 100)},timestamp:Date.now(),sessionId:'debug-session',runId:'print-css-debug-3',hypothesisId:'I'})}).catch(()=>{});
  // #endregion
  // 使用 contentToMarkdown 保留 LaTeX 標記，然後用 renderMarkdownWithLatex 渲染
  const markdownContent = contentToMarkdown(content)
  // #region agent log
  fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'QuestionBlock.vue:renderContent:afterMarkdown',message:'After contentToMarkdown',data:{questionId:props.questionId,markdownLength:markdownContent.length,markdownPreview:markdownContent.substring(0, 200),hasLatex:markdownContent.includes('$')},timestamp:Date.now(),sessionId:'debug-session',runId:'print-css-debug-3',hypothesisId:'I'})}).catch(()=>{});
  // #endregion
  const rendered = renderMarkdownWithLatex(markdownContent)
  // #region agent log
  fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'QuestionBlock.vue:renderContent:afterRender',message:'After renderMarkdownWithLatex',data:{questionId:props.questionId,renderedLength:rendered.length,renderedPreview:rendered.substring(0, 200),hasKatex:rendered.includes('katex')},timestamp:Date.now(),sessionId:'debug-session',runId:'print-css-debug-3',hypothesisId:'I'})}).catch(()=>{});
  // #endregion
  return rendered
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
.question-display {
  break-inside: avoid;
  page-break-inside: avoid;
}

.question-content {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}

.question-number {
  font-weight: 600;
  color: rgb(51, 65, 85);
  flex-shrink: 0;
  min-width: 2rem;
  font-size: 0.875rem;
}

.question-body {
  flex: 1;
}

.question-text {
  flex: 1;
}

/* 答案和詳解區域 */
.answer-section,
.solution-section {
  margin-top: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.375rem;
  background: rgb(249, 250, 251);
  border-left: 3px solid rgb(99, 102, 241);
}

.solution-section {
  border-left-color: rgb(34, 197, 94);
}

.answer-label,
.solution-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: rgb(71, 85, 105);
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.answer-content,
.solution-content {
  font-size: 0.875rem;
  color: rgb(51, 65, 85);
}

/* 列印樣式 */
@media print {
  .answer-section,
  .solution-section {
    break-inside: avoid;
    page-break-inside: avoid;
    background: white !important;
    border: none !important;
    border-left: none !important;
    padding: 0.75rem 0 !important;
    margin-top: 0.75rem !important;
    margin-bottom: 0.5rem !important;
  }
  
  .answer-label,
  .solution-label {
    font-size: 0.875rem !important;
    font-weight: 700 !important;
    color: black !important;
    margin-bottom: 0.5rem !important;
    display: block !important;
  }
  
  .answer-content,
  .solution-content {
    font-size: 0.875rem !important;
    color: black !important;
    line-height: 1.6 !important;
    margin-top: 0.25rem !important;
  }
  
  /* 確保題目內容也有適當間距 */
  .question-text {
    margin-bottom: 0.5rem !important;
  }
  
  /* 確保 KaTeX 數學公式正確顯示 */
  .katex,
  .katex * {
    color: black !important;
    font-size: inherit !important;
  }
  
  /* 確保圖片不會太大 */
  img {
    max-width: 100% !important;
    height: auto !important;
    page-break-inside: avoid !important;
  }
}
</style>
