<template>
  <div class="online-quiz-runner">
    <!-- 測驗資訊 -->
    <div class="mb-6 rounded-lg border border-slate-200 bg-white p-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-slate-900">{{ resource.title }}</h2>
        <div v-if="timeLimit > 0" class="text-sm font-semibold" :class="timeRemaining < 60 ? 'text-red-600' : 'text-slate-700'">
          剩餘時間：{{ formatTime(timeRemaining) }}
        </div>
      </div>
      <div v-if="props.settings?.onlineQuiz?.timeLimit" class="text-xs text-slate-500">
        時間限制：{{ formatTime(props.settings.onlineQuiz.timeLimit) }}
      </div>
    </div>

    <!-- 題目列表 -->
    <div class="space-y-6">
      <div
        v-for="(questionId, index) in questionIds"
        :key="questionId"
        class="rounded-lg border border-slate-200 bg-white p-6"
      >
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-slate-900">第 {{ index + 1 }} 題</h3>
            <span
              class="text-xs px-2 py-1 rounded"
              :class="getQuestionTypeClass(getQuestionType(questionId))"
            >
              {{ getQuestionTypeName(getQuestionType(questionId)) }}
            </span>
          </div>

          <!-- 題目內容 - 使用 BlockEditor 唯讀模式顯示 -->
          <div class="border border-slate-100 rounded-lg p-4 bg-slate-50">
            <BlockEditor
              :model-value="getQuestionTiptapStructure(questionId)"
              :templates="[]"
              :questions="[]"
              :auto-page-break="false"
              :readonly="true"
              :show-page-numbers="false"
            />
          </div>

          <!-- 作答區域 -->
          <div v-if="getQuestionType(questionId) === 'SINGLE_CHOICE'" class="space-y-2">
            <label
              v-for="(option, optIndex) in getQuestionOptions(questionId)"
              :key="optIndex"
              class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-indigo-300 cursor-pointer"
              :class="submission[questionId] === String.fromCharCode(65 + optIndex) ? 'bg-indigo-50 border-indigo-500' : ''"
            >
              <input
                type="radio"
                :name="`question-${questionId}`"
                :value="String.fromCharCode(65 + optIndex)"
                v-model="submission[questionId]"
                class="text-indigo-600 focus:ring-indigo-500"
              />
              <span class="font-medium">{{ String.fromCharCode(65 + optIndex) }}.</span>
              <span class="flex-1">{{ option }}</span>
            </label>
          </div>

          <div v-else-if="getQuestionType(questionId) === 'MULTIPLE_CHOICE'" class="space-y-2">
            <label
              v-for="(option, optIndex) in getQuestionOptions(questionId)"
              :key="optIndex"
              class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-indigo-300 cursor-pointer"
              :class="(submission[questionId] || []).includes(String.fromCharCode(65 + optIndex)) ? 'bg-indigo-50 border-indigo-500' : ''"
            >
              <input
                type="checkbox"
                :value="String.fromCharCode(65 + optIndex)"
                v-model="submission[questionId]"
                class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span class="font-medium">{{ String.fromCharCode(65 + optIndex) }}.</span>
              <span class="flex-1">{{ option }}</span>
            </label>
          </div>

          <div v-else-if="getQuestionType(questionId) === 'FILL_IN_BLANK'" class="space-y-2">
            <textarea
              v-model="submission[questionId]"
              rows="3"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="請輸入答案..."
            />
            <p class="text-xs text-slate-500">此題為填充題，僅供參考，不計入分數</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 提交按鈕 -->
    <div class="mt-6 flex justify-end gap-2">
      <button
        @click="submitQuiz"
        :disabled="submitting"
        class="px-6 py-2 rounded-lg bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 disabled:opacity-50"
      >
        {{ submitting ? '提交中...' : '提交答案' }}
      </button>
    </div>

    <!-- 結果顯示 -->
    <div v-if="quizResult" class="mt-6 rounded-lg border border-slate-200 bg-white p-6">
      <h3 class="text-lg font-bold text-slate-900 mb-4">測驗結果</h3>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-sm text-slate-700">總題數：</span>
          <span class="text-sm font-semibold text-slate-900">{{ quizResult.total_questions }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-slate-700">可評分題數：</span>
          <span class="text-sm font-semibold text-slate-900">{{ quizResult.gradable_questions }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-slate-700">答對題數：</span>
          <span class="text-sm font-semibold text-green-600">{{ quizResult.correct_count }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-slate-700">分數：</span>
          <span class="text-lg font-bold text-indigo-600">{{ quizResult.score.toFixed(1) }} 分</span>
        </div>
      </div>

      <!-- 詳細結果 -->
      <div v-if="props.settings?.onlineQuiz?.showAnswerAfterSubmit" class="mt-6 space-y-4">
        <h4 class="text-sm font-semibold text-slate-700">詳細結果</h4>
        <div
          v-for="detail in quizResult.details"
          :key="detail.question_id"
          class="p-3 rounded border"
          :class="detail.gradable && detail.correct ? 'bg-green-50 border-green-200' : detail.gradable && !detail.correct ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'"
        >
          <div class="text-sm">
            <span class="font-semibold">題目 #{{ detail.question_id }}：</span>
            <span v-if="detail.gradable">
              <span :class="detail.correct ? 'text-green-600' : 'text-red-600'">
                {{ detail.correct ? '✓ 正確' : '✗ 錯誤' }}
              </span>
              <span class="text-slate-500 ml-2">
                你的答案：{{ Array.isArray(detail.student_answer) ? detail.student_answer.join(', ') : detail.student_answer }} | 正確答案：{{ Array.isArray(detail.correct_answer) ? detail.correct_answer.join(', ') : detail.correct_answer }}
              </span>
            </span>
            <span v-else class="text-slate-500">
              參考答案：{{ Array.isArray(detail.correct_answer) ? detail.correct_answer.join(', ') : detail.correct_answer }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import BlockEditor from '../BlockEditor/BlockEditor.vue'
import { learningResourceAPI, questionBankAPI } from '../../services/api'

const props = defineProps({
  resource: {
    type: Object,
    required: true
  },
  tiptap_structure: {
    type: Object,
    default: () => ({
      type: 'doc',
      content: []
    })
  },
  settings: {
    type: Object,
    default: () => ({})
  }
})

const submission = ref({})
const submitting = ref(false)
const quizResult = ref(null)
const timeRemaining = ref(0)
const timeLimit = computed(() => props.settings?.onlineQuiz?.timeLimit || 0)
const questionsData = ref({})

let timer = null

// 從 Tiptap JSON 結構中提取所有 questionBlock 節點的 questionId
const questionIds = computed(() => {
  const ids = []
  if (!props.tiptap_structure || !props.tiptap_structure.content) {
    return ids
  }
  
  function traverseNodes(nodes) {
    if (!Array.isArray(nodes)) return
    
    nodes.forEach(node => {
      if (node.type === 'questionBlock' && node.attrs?.questionId) {
        ids.push(node.attrs.questionId)
      }
      // 遞迴處理子節點
      if (node.content && Array.isArray(node.content)) {
        traverseNodes(node.content)
      }
    })
  }
  
  traverseNodes(props.tiptap_structure.content)
  return ids
})

// 載入題目資料
const loadQuestions = async () => {
  for (const questionId of questionIds.value) {
    try {
      const response = await questionBankAPI.getById(questionId)
      const question = response.data
      questionsData.value[questionId] = {
        ...question,
        question_type: question.question_type || 'SINGLE_CHOICE',
        options: question.options || []
      }
    } catch (error) {
      console.error(`載入題目 ${questionId} 失敗：`, error)
    }
  }
}

// 為每個題目創建 Tiptap 結構（僅包含題目內容）
const getQuestionTiptapStructure = (questionId) => {
  const question = questionsData.value[questionId]
  if (!question) {
    return {
      type: 'doc',
      content: [{ type: 'paragraph', content: [] }]
    }
  }
  
  // 如果題目有 tiptap_structure，直接使用
  // 否則從 content 創建簡單的結構
  if (question.content && typeof question.content === 'object' && question.content.type === 'doc') {
    return question.content
  }
  
  // 從 Markdown 內容創建簡單結構
  const content = typeof question.content === 'string' ? question.content : ''
  return {
    type: 'doc',
    content: content ? [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: content }]
      }
    ] : [{ type: 'paragraph', content: [] }]
  }
}

const getQuestionContent = (questionId) => {
  const question = questionsData.value[questionId]
  if (!question) return ''
  // 如果 content 是 Markdown 格式，直接返回
  if (typeof question.content === 'string') {
    return question.content
  }
  // 如果是 RichText 格式，提取 text
  if (question.content && typeof question.content === 'object' && question.content.text) {
    return question.content.text
  }
  return ''
}

const getQuestionOptions = (questionId) => {
  const question = questionsData.value[questionId]
  if (!question) return []
  // 確保 options 是陣列
  if (Array.isArray(question.options)) {
    return question.options.filter(opt => opt?.trim())
  }
  return []
}

const getQuestionType = (questionId) => {
  const question = questionsData.value[questionId]
  return question?.question_type || 'SINGLE_CHOICE'
}

const getQuestionTypeName = (type) => {
  const map = {
    'SINGLE_CHOICE': '單選題',
    'MULTIPLE_CHOICE': '多選題',
    'FILL_IN_BLANK': '填充題'
  }
  return map[type] || type
}

const getQuestionTypeClass = (type) => {
  const map = {
    'SINGLE_CHOICE': 'bg-blue-100 text-blue-700',
    'MULTIPLE_CHOICE': 'bg-purple-100 text-purple-700',
    'FILL_IN_BLANK': 'bg-green-100 text-green-700'
  }
  return map[type] || 'bg-slate-100 text-slate-700'
}

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  } else {
    return `${minutes}:${String(secs).padStart(2, '0')}`
  }
}

const submitQuiz = async () => {
  if (!confirm('確定要提交答案嗎？提交後將無法修改。')) return

  submitting.value = true
  try {
    // 將 submission 轉換為字串格式的 key（後端 API 期望的格式）
    const formattedSubmission = {}
    Object.keys(submission.value).forEach(key => {
      formattedSubmission[key] = submission.value[key]
    })
    
    const response = await learningResourceAPI.grade(props.resource.resource_id, {
      submission: formattedSubmission
    })
    quizResult.value = response.data
  } catch (error) {
    console.error('提交失敗：', error)
    if (error.response?.data?.detail) {
      alert(`提交失敗：${error.response.data.detail}`)
    } else {
      alert('提交失敗，請稍後再試')
    }
  } finally {
    submitting.value = false
  }
}

// 計時器
onMounted(async () => {
  await loadQuestions()
  
  if (timeLimit.value > 0 && !quizResult.value) {
    timeRemaining.value = timeLimit.value
    timer = setInterval(() => {
      if (timeRemaining.value > 0) {
        timeRemaining.value--
      } else {
        clearInterval(timer)
        alert('時間到！將自動提交答案')
        submitQuiz()
      }
    }, 1000)
  }
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>
