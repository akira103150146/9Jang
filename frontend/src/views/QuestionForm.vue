<template>
  <div class="min-h-screen bg-slate-50">
    <div class="max-w-4xl mx-auto p-6">
      <!-- 頂部工具列 -->
      <header class="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm mb-6 rounded-lg">
        <div class="flex items-center gap-4">
          <button @click="goBack" class="text-slate-500 hover:text-indigo-600 transition-colors" title="返回">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div class="flex flex-col">
            <h1 class="text-lg font-bold text-slate-800 leading-tight">
              {{ isEdit ? '編輯題目' : '新增題目' }}
            </h1>
            <p v-if="isEdit && importedStudentName" class="text-xs text-amber-700 mt-1">
              來源學生：{{ importedStudentName }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            @click="goBack"
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            取消
          </button>
          <button
            @click="saveQuestion"
            :disabled="saving"
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {{ saving ? '儲存中...' : '儲存' }}
          </button>
        </div>
      </header>

      <!-- 表單內容 -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-6">
        <!-- 科目 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">
            科目 <span class="text-red-500">*</span>
          </label>
          <select
            v-model="formData.subject"
            required
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">請選擇科目</option>
            <option
              v-for="subject in subjects"
              :key="subject.subject_id"
              :value="subject.subject_id"
            >
              {{ subject.name }}{{ subject.code ? ` (${subject.code})` : '' }}
            </option>
          </select>
        </div>

        <!-- 適用年級 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">
            適用年級 <span class="text-red-500">*</span>
          </label>
          <select
            v-model="formData.level"
            required
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">請選擇</option>
            <option value="JHS">國中</option>
            <option value="SHS">高中</option>
            <option value="VCS">高職</option>
          </select>
        </div>

        <!-- 章節/單元 -->
        <ChapterSearchInput
          v-model="formData.chapter"
          :suggestions="chapterSuggestions"
          :show-suggestions="showChapterSuggestions"
          @search="searchChapters"
          @select="selectChapter"
          @blur="handleChapterBlur"
        />

        <!-- 題目類型 -->
        <QuestionTypeSelector v-model="formData.question_type" />

        <!-- 選項（僅選擇題和多選題顯示） -->
        <QuestionOptionsEditor
          v-model="formData.options"
          :show-options="formData.question_type === 'SINGLE_CHOICE' || formData.question_type === 'MULTIPLE_CHOICE'"
        />

        <!-- 題目內容 -->
        <QuestionContentEditor
          v-model="formData.content"
          :questions="allQuestions"
          :is-choice-question="formData.question_type === 'SINGLE_CHOICE' || formData.question_type === 'MULTIPLE_CHOICE'"
        />

        <!-- 正確答案 -->
        <QuestionAnswerEditor
          v-model="formData.correct_answer"
          :questions="allQuestions"
          :is-choice-question="formData.question_type === 'SINGLE_CHOICE' || formData.question_type === 'MULTIPLE_CHOICE'"
        />

        <!-- 詳解內容（使用 BlockEditor） -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">
            詳解內容（富文本編輯器）
          </label>
          <div class="border border-slate-300 rounded-lg solution-editor-wrapper">
            <BlockEditor
              v-model="formData.solution_content"
              :readonly="false"
              :questions="allQuestions"
            />
          </div>
          <p class="mt-1 text-xs text-slate-500">
            提示：支援富文本、數學公式、2D/3D 圖形等
          </p>
        </div>

        <!-- 難度 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">
            難度 (1-5) <span class="text-red-500">*</span>
          </label>
          <input
            v-model.number="formData.difficulty"
            type="number"
            min="1"
            max="5"
            required
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <!-- 題目來源 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">
            題目來源
          </label>
          <div class="flex gap-2 items-center">
            <select
              v-model="formData.source"
              class="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option v-for="option in sourceOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
            <input
              v-if="formData.source === '其他'"
              v-model="formData.customSource"
              type="text"
              placeholder="請輸入來源"
              class="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <p class="mt-1 text-xs text-slate-500">
            選擇題目來源，如果是老師手動新增則為「九章自命題」，從錯題本匯入則為「學生錯題」
          </p>
        </div>

        <!-- 標籤分類 -->

        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">標籤分類</label>
          <div class="border border-slate-300 rounded-lg p-3 min-h-[100px] max-h-[300px] overflow-y-auto">
            <div v-if="hashtags.length === 0" class="text-sm text-slate-400 text-center py-4">
              尚無標籤
            </div>
            <div v-else class="flex flex-wrap gap-2">
              <button
                v-for="tag in hashtags"
                :key="tag.tag_id"
                type="button"
                @click="toggleTag(tag.tag_id)"
                :class="[
                  'px-3 py-1 rounded-full text-xs font-semibold transition-all',
                  formData.tag_ids.includes(tag.tag_id)
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                ]"
              >
                #{{ tag.tag_name }}
                <span v-if="formData.tag_ids.includes(tag.tag_id)" class="ml-1">✓</span>
              </button>
            </div>
          </div>
          <p class="mt-1 text-xs text-slate-500">
            已選擇 {{ formData.tag_ids.length }} 個標籤
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { questionBankAPI, hashtagAPI, subjectAPI } from '../services/api'
import BlockEditor from '../components/BlockEditor/BlockEditor.vue'
import { useEditorEventsProvider } from '../composables/useEditorEvents'
import { useQuestionForm } from '../composables/question-form/useQuestionForm'
import { useQuestionOptions } from '../composables/question-form/useQuestionOptions'
import { useChapterSearch } from '../composables/question-form/useChapterSearch'
import { useTiptapParser } from '../composables/question-form/useTiptapParser'
import QuestionTypeSelector from '../components/question-form/QuestionTypeSelector.vue'
import QuestionOptionsEditor from '../components/question-form/QuestionOptionsEditor.vue'
import QuestionContentEditor from '../components/question-form/QuestionContentEditor.vue'
import QuestionAnswerEditor from '../components/question-form/QuestionAnswerEditor.vue'
import ChapterSearchInput from '../components/question-form/ChapterSearchInput.vue'

const route = useRoute()
const router = useRouter()

// 初始化編輯器事件提供者（BlockEditor 需要）
useEditorEventsProvider()

// 使用 composables
const {
  formData,
  saving,
  isEdit,
  isAutoUpdating,
  isQuestionLoaded,
  extractTextFromTiptapJSON,
  saveQuestion: saveQuestionFromComposable,
  goBack: goBackFromComposable,
  fetchQuestion: fetchQuestionFromComposable,
} = useQuestionForm()

// 使用章節搜尋 composable
const {
  chapterSuggestions,
  showChapterSuggestions,
  searchChapters,
  selectChapter,
  handleChapterBlur,
} = useChapterSearch(formData)

// 使用選項管理 composable
const {
  addOption,
  removeOption,
} = useQuestionOptions(formData, isAutoUpdating, isQuestionLoaded)

// 使用 Tiptap 解析器 composable
const { ensureTiptapFormat } = useTiptapParser()

const hashtags = ref([])
const subjects = ref([])
const importedStudentName = ref('')
const sourceOptions = ref(['九章自命題', '學生錯題', '學測', '會考', '統測', '模擬考', '基測', '其他'])
const customSource = ref('')
const allQuestions = ref([]) // 所有題目列表，用於 BlockEditor 的題目選擇器

// 返回上一頁（覆蓋 composable 的 goBack 以支持 returnTab）
const goBack = () => {
  // 檢查是否有 returnTab 查詢參數來決定返回哪個 tab
  const returnTab = route.query.returnTab || 'questions'
  
  // 總是跳轉到題庫頁面並帶上 tab 參數，確保正確切換到對應的 tab
  router.push({ path: '/questions', query: { tab: returnTab } })
}

// 載入題目資料（編輯模式）- 擴展 composable 的 fetchQuestion
const fetchQuestion = async () => {
  if (!isEdit.value) {
    isQuestionLoaded.value = true
    return
  }
  
  try {
    const response = await questionBankAPI.getById(route.params.id)
    const question = response.data
    importedStudentName.value = question.imported_student_name || ''
    
    // 獲取題目的標籤 ID
    let tagIds = []
    if (question.tag_ids && Array.isArray(question.tag_ids)) {
      tagIds = question.tag_ids
    } else if (question.tags && Array.isArray(question.tags)) {
      question.tags.forEach(tagName => {
        const tag = hashtags.value.find(t => t.tag_name === tagName)
        if (tag) tagIds.push(tag.tag_id)
      })
    }
    
    isAutoUpdating.value = true
    formData.value = {
      subject: question.subject?.subject_id || question.subject,
      level: question.level,
      chapter: question.chapter,
      question_type: question.question_type || 'SINGLE_CHOICE',
      options: question.options || (question.question_type === 'SINGLE_CHOICE' || question.question_type === 'MULTIPLE_CHOICE' ? ['', ''] : []),
      content: ensureTiptapFormat(question.content),
      correct_answer: ensureTiptapFormat(question.correct_answer),
      solution_content: ensureTiptapFormat(question.solution_content),
      difficulty: question.difficulty,
      tag_ids: tagIds,
      metadata: question.metadata || {}
    }
    isAutoUpdating.value = false
    isQuestionLoaded.value = true
  } catch (error) {
    console.error('載入題目失敗：', error)
    alert('載入題目失敗，請稍後再試')
    router.push('/questions')
  }
}

// 載入科目和標籤
const fetchSourceOptions = async () => {
  try {
    const response = await questionBankAPI.getSourceOptions()
    if (response.data && response.data.options) {
      sourceOptions.value = [...response.data.options, '其他']
    }
  } catch (error) {
    console.error('獲取來源選項失敗：', error)
  }
}

const fetchSubjects = async () => {
  try {
    const response = await subjectAPI.getAll()
    const data = response.data.results || response.data
    subjects.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.warn('獲取科目失敗：', error)
    subjects.value = []
  }
}

const fetchHashtags = async () => {
  try {
    const response = await hashtagAPI.getAll()
    const data = response.data.results || response.data
    hashtags.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.warn('獲取標籤失敗：', error)
  }
}

// 章節搜尋、選擇和失焦處理已由 useChapterSearch composable 提供

const toggleTag = (tagId) => {
  const index = formData.value.tag_ids.indexOf(tagId)
  if (index > -1) {
    formData.value.tag_ids.splice(index, 1)
  } else {
    formData.value.tag_ids.push(tagId)
  }
}

// 新增和移除選項已由 useQuestionOptions composable 提供

// 儲存題目
// 處理來源字段
const getSourceValue = () => {
  if (formData.value.source === '其他' && customSource.value) {
    return customSource.value
  }
  return formData.value.source || '九章自命題'
}

// 儲存題目（使用 composable 的 saveQuestion，但需要處理自定義來源）
const saveQuestion = async () => {
  // 處理來源字段
  const sourceValue = formData.value.source === '其他' && customSource.value
    ? customSource.value
    : formData.value.source || '九章自命題'
  
  // 臨時更新 source 值
  const originalSource = formData.value.source
  formData.value.source = sourceValue
  
  try {
    await saveQuestionFromComposable()
  } finally {
    // 恢復原始 source 值
    formData.value.source = originalSource
  }
}

// 選項自動提取和答案類型檢測已由 useQuestionOptions composable 處理

// 獲取所有題目列表（用於 BlockEditor 的題目選擇器）
const fetchAllQuestions = async () => {
  try {
    const response = await questionBankAPI.getAll()
    allQuestions.value = response.data || []
  } catch (error) {
    console.error('獲取題目列表失敗：', error)
  }
}

onMounted(async () => {
  await Promise.all([
    fetchSubjects(),
    fetchHashtags(),
    fetchAllQuestions() // 獲取所有題目
  ])
  
  // 載入完成標籤後再載入題目（因為需要標籤來映射 tag_ids）
  await fetchQuestion()
  // 標記題目已載入，啟用自動提取功能（新增模式也需要啟用）
  isQuestionLoaded.value = true
})
</script>

<style scoped>
.markdown-preview {
  line-height: 1.6;
}

/* 讓編輯器高度自動調整，隨內容增加而變高 */
.question-editor-wrapper :deep(.block-editor-container),
.answer-editor-wrapper :deep(.block-editor-container),
.solution-editor-wrapper :deep(.block-editor-container) {
  min-height: auto;
}

.question-editor-wrapper :deep(.paper-sheet),
.answer-editor-wrapper :deep(.paper-sheet),
.solution-editor-wrapper :deep(.paper-sheet) {
  max-height: none !important; /* 移除最大高度限制 */
  min-height: 200px; /* 設置最小高度 */
  height: auto; /* 自動高度 */
  overflow-y: auto; /* 當內容超出時顯示滾動條 */
}

.question-editor-wrapper :deep(.editor-content),
.answer-editor-wrapper :deep(.editor-content),
.solution-editor-wrapper :deep(.editor-content) {
  min-height: 200px; /* 設置最小高度 */
  height: auto; /* 自動高度 */
}

.question-editor-wrapper :deep(.ProseMirror),
.answer-editor-wrapper :deep(.ProseMirror),
.solution-editor-wrapper :deep(.ProseMirror) {
  min-height: 200px; /* 設置最小高度 */
  height: auto; /* 自動高度 */
}
</style>
