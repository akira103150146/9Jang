<template>
  <div>
    <!-- 篩選表單 -->
    <div class="mb-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- 科目篩選 -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">科目</label>
          <select
            v-model="filters.subject_id"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">全部</option>
            <option v-for="subject in subjects" :key="subject.subject_id" :value="subject.subject_id">
              {{ subject.name }}
            </option>
          </select>
        </div>

        <!-- 年級篩選 -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">年級</label>
          <select
            v-model="filters.level"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">全部</option>
            <option value="JHS">國中</option>
            <option value="SHS">高中</option>
            <option value="VCS">高職</option>
          </select>
        </div>

        <!-- 章節篩選 -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">章節</label>
          <input
            v-model="filters.chapter"
            type="text"
            placeholder="輸入章節名稱..."
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <!-- 難度篩選 -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">難度</label>
          <select
            v-model="filters.difficulty"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">全部</option>
            <option value="1">1 星</option>
            <option value="2">2 星</option>
            <option value="3">3 星</option>
            <option value="4">4 星</option>
            <option value="5">5 星</option>
          </select>
        </div>

        <!-- 題目類型篩選 -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">題目類型</label>
          <select
            v-model="filters.question_type"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">全部</option>
            <option value="SINGLE_CHOICE">單選題</option>
            <option value="MULTIPLE_CHOICE">多選題</option>
            <option value="FILL_IN_BLANK">填充題</option>
            <option value="PROGRAMMING">程式題</option>
            <option value="LISTENING">聽力題</option>
          </select>
        </div>

        <!-- 標籤篩選 -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">標籤</label>
          <select
            v-model="filters.tag_id"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">全部</option>
            <option v-for="tag in tags" :key="tag.tag_id" :value="tag.tag_id">
              #{{ tag.tag_name }}
            </option>
          </select>
        </div>
      </div>

      <div class="mt-4 flex justify-end gap-2">
        <button
          @click="resetFilters"
          class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          重置
        </button>
        <button
          @click="handleSearch"
          class="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600"
        >
          搜尋
        </button>
      </div>
    </div>

    <!-- 操作按鈕 -->
    <div class="mb-6 flex justify-end gap-2">
      <button
        @click="createQuestion"
        class="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-indigo-600 hover:to-purple-600"
      >
        + 新增題目
      </button>
      <button
        @click="importQuestions"
        class="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-green-600 hover:to-emerald-600"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        匯入外部題本
      </button>
    </div>

    <!-- 題目列表 -->
    <div v-if="loading" class="text-center py-12 text-slate-500">載入中...</div>
    <div v-else-if="questions.length === 0" class="text-center py-12 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
      尚無題目，點擊右上角新增
    </div>
    <div v-else>
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <div
          v-for="question in questions"
          :key="question.question_id"
          @click="showQuestionPreview(question)"
          class="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
        >
        <div class="flex items-start justify-between mb-2">
          <span
            class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset"
            :class="getTypeColor(question.question_type)"
          >
            {{ getTypeName(question.question_type) }}
          </span>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click.stop="editQuestion(question.question_id)" class="p-1 text-slate-400 hover:text-indigo-600" title="編輯">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button @click.stop="deleteQuestion(question.question_id)" class="p-1 text-slate-400 hover:text-rose-600" title="刪除">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <h3 class="text-base font-bold text-slate-900 mb-1 line-clamp-1">
          Q{{ question.question_id }}
        </h3>

        <div class="text-xs text-slate-500 mb-2 flex items-center gap-2 flex-wrap">
          <span>{{ question.subject_name || '無科目' }}</span>
          <span>•</span>
          <span>{{ getLevelName(question.level) }}</span>
          <span>•</span>
          <span>{{ question.chapter || '無章節' }}</span>
        </div>

        <div class="text-sm text-slate-700 mb-3 line-clamp-3">
          {{ getContentPreview(question.content) }}
        </div>

        <div class="flex items-center justify-between mt-auto">
          <div class="flex items-center gap-2">
            <div class="flex items-center">
              <span class="text-xs text-slate-500">難度：</span>
              <div class="flex ml-1">
                <span v-for="i in 5" :key="i" class="text-xs" :class="i <= question.difficulty ? 'text-yellow-500' : 'text-slate-300'">★</span>
              </div>
            </div>
          </div>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="tag in (question.tags || []).slice(0, 3)"
              :key="tag"
              class="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded"
            >
              #{{ tag }}
            </span>
            <span v-if="(question.tags || []).length > 3" class="text-xs text-slate-400">
              +{{ (question.tags || []).length - 3 }}
            </span>
          </div>
        </div>
        </div>
      </div>

      <!-- 分頁控件 -->
      <div v-if="pagination.totalPages > 1" class="flex items-center justify-center gap-2 mt-6">
        <button
          @click="goToPage(pagination.currentPage - 1)"
          :disabled="pagination.currentPage === 1"
          class="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          上一頁
        </button>
        <span class="text-sm text-slate-600">
          第 {{ pagination.currentPage }} / {{ pagination.totalPages }} 頁（共 {{ pagination.totalCount }} 題）
        </span>
        <button
          @click="goToPage(pagination.currentPage + 1)"
          :disabled="pagination.currentPage === pagination.totalPages"
          class="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下一頁
        </button>
      </div>
    </div>

    <!-- 題目預覽 Modal -->
    <div
      v-if="previewQuestion"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click.self="closePreview"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-slate-200">
          <div class="flex items-center gap-3">
            <span
              class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset"
              :class="getTypeColor(previewQuestion.question_type)"
            >
              {{ getTypeName(previewQuestion.question_type) }}
            </span>
            <h2 class="text-xl font-bold text-slate-900">Q{{ previewQuestion.question_id }}</h2>
            <div class="text-sm text-slate-500">
              {{ previewQuestion.subject_name || '無科目' }} • {{ getLevelName(previewQuestion.level) }} • {{ previewQuestion.chapter || '無章節' }}
            </div>
          </div>
          <button
            @click="closePreview"
            class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="flex-1 overflow-y-auto p-6">
          <!-- 題目內容 -->
          <div class="mb-6">
            <h3 class="text-sm font-semibold text-slate-700 mb-2">題目內容</h3>
            <div class="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <RichTextPreview :content="getQuestionContent(previewQuestion)" />
            </div>
          </div>

          <!-- 選項（如果是選擇題） -->
          <div v-if="previewQuestion.question_type === 'SINGLE_CHOICE' || previewQuestion.question_type === 'MULTIPLE_CHOICE'" class="mb-6">
            <h3 class="text-sm font-semibold text-slate-700 mb-2">選項</h3>
            <div class="space-y-2">
              <div
                v-for="(option, index) in (previewQuestion.options || [])"
                :key="index"
                class="flex items-start gap-3 p-3 border border-slate-200 rounded-lg bg-white"
              >
                <span class="text-sm font-medium text-slate-600 w-6">{{ String.fromCharCode(65 + index) }}.</span>
                <div class="flex-1">
                  <RichTextPreview :content="option" />
                </div>
              </div>
            </div>
          </div>

          <!-- 正確答案 -->
          <div class="mb-6">
            <h3 class="text-sm font-semibold text-slate-700 mb-2">正確答案</h3>
            <div class="border border-slate-200 rounded-lg p-4 bg-green-50">
              <RichTextPreview :content="getQuestionAnswer(previewQuestion)" />
            </div>
          </div>

          <!-- 詳解 -->
          <div v-if="previewQuestion.solution_content" class="mb-6">
            <h3 class="text-sm font-semibold text-slate-700 mb-2">詳解</h3>
            <div class="border border-slate-200 rounded-lg p-4 bg-blue-50">
              <RichTextPreview :content="getQuestionSolution(previewQuestion)" />
            </div>
          </div>

          <!-- 其他資訊 -->
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="font-semibold text-slate-700">難度：</span>
              <div class="flex mt-1">
                <span v-for="i in 5" :key="i" class="text-sm" :class="i <= previewQuestion.difficulty ? 'text-yellow-500' : 'text-slate-300'">★</span>
              </div>
            </div>
            <div>
              <span class="font-semibold text-slate-700">標籤：</span>
              <div class="flex flex-wrap gap-1 mt-1">
                <span
                  v-for="tag in (previewQuestion.tags || [])"
                  :key="tag"
                  class="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded"
                >
                  #{{ tag }}
                </span>
                <span v-if="!previewQuestion.tags || previewQuestion.tags.length === 0" class="text-xs text-slate-400">無標籤</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
          <button
            @click="closePreview"
            class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            關閉
          </button>
          <button
            @click="editQuestion(previewQuestion.question_id)"
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            編輯題目
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { questionBankAPI, subjectAPI, hashtagAPI } from '../services/api'
import RichTextPreview from './RichTextPreview.vue'

const router = useRouter()

const questions = ref([])
const subjects = ref([])
const tags = ref([])
const loading = ref(false)
const previewQuestion = ref(null)

const pagination = reactive({
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  pageSize: 10
})

const filters = reactive({
  subject_id: '',
  level: '',
  chapter: '',
  difficulty: '',
  question_type: '',
  tag_id: ''
})

const getTypeColor = (type) => {
  const map = {
    'SINGLE_CHOICE': 'bg-blue-50 text-blue-700 ring-blue-600/20',
    'MULTIPLE_CHOICE': 'bg-purple-50 text-purple-700 ring-purple-600/20',
    'FILL_IN_BLANK': 'bg-green-50 text-green-700 ring-green-600/20',
    'PROGRAMMING': 'bg-orange-50 text-orange-700 ring-orange-600/20',
    'LISTENING': 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
  }
  return map[type] || 'bg-slate-50 text-slate-700 ring-slate-600/20'
}

const getTypeName = (type) => {
  const map = {
    'SINGLE_CHOICE': '單選題',
    'MULTIPLE_CHOICE': '多選題',
    'FILL_IN_BLANK': '填充題',
    'PROGRAMMING': '程式題',
    'LISTENING': '聽力題',
  }
  return map[type] || type
}

const getLevelName = (level) => {
  const map = {
    'JHS': '國中',
    'SHS': '高中',
    'VCS': '高職',
  }
  return map[level] || level
}

const getContentPreview = (content) => {
  if (!content) return '無內容'
  // 移除 Markdown 格式標記
  const text = content.replace(/#{1,6}\s+/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/`/g, '')
    .replace(/\$/g, '')
    .trim()
  return text.length > 100 ? text.substring(0, 100) + '...' : text
}

const fetchQuestions = async () => {
  // #region agent log
  fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'QuestionList.vue:266',message:'fetchQuestions called',data:{filters:JSON.parse(JSON.stringify(filters))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  loading.value = true
  try {
    const params = {}
    if (filters.subject_id) params.subject = filters.subject_id
    if (filters.level) params.level = filters.level
    if (filters.chapter) params.chapter = filters.chapter
    if (filters.difficulty) params.difficulty = filters.difficulty
    if (filters.question_type) params.question_type = filters.question_type
    if (filters.tag_id) params.tags = [filters.tag_id]

    // #region agent log
    fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'QuestionList.vue:277',message:'API request params',data:{params:JSON.parse(JSON.stringify(params))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    // 添加分頁參數
    params.page = pagination.currentPage
    params.page_size = pagination.pageSize

    const response = await questionBankAPI.getAll({ params })
    
    // #region agent log
    fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'QuestionList.vue:280',message:'API response received',data:{hasResults:!!response.data.results,resultsLength:response.data.results?.length||0,dataLength:Array.isArray(response.data)?response.data.length:0,responseKeys:Object.keys(response.data||{})},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    const questionsData = response.data.results || response.data || []
    
    // 更新分頁資訊
    if (response.data.count !== undefined) {
      pagination.totalCount = response.data.count
      pagination.totalPages = Math.ceil(response.data.count / pagination.pageSize)
    } else {
      // 如果沒有分頁資訊，假設只有一頁
      pagination.totalCount = questionsData.length
      pagination.totalPages = 1
    }
    
    // #region agent log
    fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'QuestionList.vue:283',message:'Questions data processed',data:{questionsDataLength:questionsData.length,firstQuestionId:questionsData[0]?.question_id||null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    // 確保每個題目都有必要的欄位
    questions.value = questionsData.map(q => ({
      ...q,
      question_type: q.question_type || 'SINGLE_CHOICE',
      options: q.options || [],
      tags: q.tags || []
    }))
    
    // #region agent log
    fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'QuestionList.vue:290',message:'Questions set to reactive',data:{questionsLength:questions.value.length,questionIds:questions.value.map(q=>q.question_id).slice(0,5)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'QuestionList.vue:293',message:'Error fetching questions',data:{errorMessage:error.message,errorStatus:error.response?.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    console.error('獲取題目失敗：', error)
    questions.value = []
  } finally {
    loading.value = false
  }
}

const fetchSubjects = async () => {
  try {
    const response = await subjectAPI.getAll()
    subjects.value = response.data.results || response.data || []
  } catch (error) {
    console.warn('獲取科目失敗：', error)
    subjects.value = []
  }
}

const fetchTags = async () => {
  try {
    const response = await hashtagAPI.getAll()
    tags.value = response.data.results || response.data || []
  } catch (error) {
    console.warn('獲取標籤失敗：', error)
    tags.value = []
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  fetchQuestions()
}

const resetFilters = () => {
  filters.subject_id = ''
  filters.level = ''
  filters.chapter = ''
  filters.difficulty = ''
  filters.question_type = ''
  filters.tag_id = ''
  pagination.currentPage = 1
  fetchQuestions()
}

const goToPage = (page) => {
  if (page >= 1 && page <= pagination.totalPages) {
    pagination.currentPage = page
    fetchQuestions()
    // 滾動到頂部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const showQuestionPreview = async (question) => {
  // 如果只有基本信息，需要獲取完整題目詳情
  if (!question.content || !question.correct_answer) {
    try {
      const response = await questionBankAPI.getById(question.question_id)
      previewQuestion.value = response.data
    } catch (error) {
      console.error('獲取題目詳情失敗：', error)
      previewQuestion.value = question
    }
  } else {
    previewQuestion.value = question
  }
}

const closePreview = () => {
  previewQuestion.value = null
}

const getQuestionContent = (question) => {
  if (!question) return ''
  if (typeof question.content === 'string') return question.content
  if (question.content && typeof question.content === 'object' && question.content.text) {
    return question.content.text
  }
  return ''
}

const getQuestionAnswer = (question) => {
  if (!question) return ''
  if (typeof question.correct_answer === 'string') return question.correct_answer
  if (question.correct_answer && typeof question.correct_answer === 'object' && question.correct_answer.text) {
    return question.correct_answer.text
  }
  return ''
}

const getQuestionSolution = (question) => {
  if (!question || !question.solution_content) return ''
  if (typeof question.solution_content === 'string') return question.solution_content
  if (question.solution_content && typeof question.solution_content === 'object' && question.solution_content.text) {
    return question.solution_content.text
  }
  return ''
}

const createQuestion = () => {
  router.push('/questions/new')
}

const importQuestions = () => {
  router.push('/questions/import')
}

const editQuestion = (id) => {
  router.push(`/questions/edit/${id}`)
}

const deleteQuestion = async (id) => {
  if (!confirm('確定要刪除此題目嗎？此操作無法復原。')) return
  try {
    await questionBankAPI.delete(id)
    fetchQuestions()
  } catch (error) {
    console.error('刪除失敗：', error)
    alert('刪除失敗')
  }
}

onMounted(() => {
  // #region agent log
  fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'QuestionList.vue:347',message:'Component mounted',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  fetchSubjects()
  fetchTags()
  fetchQuestions()
})

// 監聽路由變化，當從其他頁面返回時刷新列表
onActivated(() => {
  // #region agent log
  fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'QuestionList.vue:356',message:'Component activated (route returned)',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  fetchQuestions()
})
</script>
