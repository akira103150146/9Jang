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
        <div class="relative">
          <label class="block text-sm font-semibold text-slate-700 mb-2">
            章節/單元 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.chapter"
            type="text"
            required
            @input="searchChapters"
            @focus="searchChapters"
            @blur="handleChapterBlur"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="例如：向量與空間（輸入關鍵字自動搜尋）"
          />
          <!-- 章節候選列表 -->
          <div
            v-if="chapterSuggestions.length > 0 && showChapterSuggestions"
            class="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            <div
              v-for="(suggestion, index) in chapterSuggestions"
              :key="index"
              @mousedown.prevent="selectChapter(suggestion.chapter)"
              class="px-3 py-2 hover:bg-indigo-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors"
            >
              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-900">{{ suggestion.chapter }}</span>
                <span class="text-xs text-slate-500">{{ suggestion.count }} 題</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 題目類型 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">
            題目類型 <span class="text-red-500">*</span>
          </label>
          <select
            v-model="formData.question_type"
            required
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="SINGLE_CHOICE">單選題</option>
            <option value="MULTIPLE_CHOICE">多選題</option>
            <option value="FILL_IN_BLANK">填充題</option>
            <option value="PROGRAMMING">程式題</option>
            <option value="LISTENING">聽力題</option>
          </select>
        </div>

        <!-- 選項（僅選擇題和多選題顯示） -->
        <div v-if="formData.question_type === 'SINGLE_CHOICE' || formData.question_type === 'MULTIPLE_CHOICE'">
          <label class="block text-sm font-semibold text-slate-700 mb-2">
            選項 <span class="text-red-500">*</span>
            <span class="text-xs font-normal text-slate-500 ml-2">（至少需要 2 個選項）</span>
          </label>
          <div class="space-y-2">
            <div
              v-for="(option, index) in formData.options"
              :key="index"
              class="flex items-center gap-2"
            >
              <span class="text-sm font-medium text-slate-600 w-8">{{ String.fromCharCode(65 + index) }}.</span>
              <input
                v-model="formData.options[index]"
                type="text"
                :placeholder="`選項 ${String.fromCharCode(65 + index)}`"
                class="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <button
                v-if="formData.options.length > 2"
                @click="removeOption(index)"
                type="button"
                class="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                title="移除選項"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <button
              @click="addOption"
              type="button"
              class="w-full rounded-lg border-2 border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              + 新增選項
            </button>
          </div>
        </div>

        <!-- 題目內容 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">
            題目內容 (Markdown + LaTeX) <span class="text-red-500">*</span>
          </label>
          <div class="space-y-3">
            <div class="border border-slate-300 rounded-lg overflow-hidden">
              <RichTextEditor
                :model-value="toRT(formData.content)"
                :placeholder="'輸入題目內容...\n\n支援 Markdown 語法：\n- **粗體**\n- *斜體*\n- `程式碼`\n\n支援 LaTeX 數學公式：\n- 行內公式：$x^2 + y^2 = r^2$\n- 區塊公式：$$\n\\int_0^1 x^2 dx = \\frac{1}{3}\n$$'"
                @update:model-value="(v) => (formData.content = fromRT(v))"
              />
            </div>
          </div>
          <p class="mt-1 text-xs text-slate-500">
            <span v-if="formData.question_type === 'SINGLE_CHOICE' || formData.question_type === 'MULTIPLE_CHOICE'">
              提示：貼上包含選項的題目（如 (A)選項1 (B)選項2），系統會自動提取選項。使用 $$...$$ 表示區塊公式，使用 $...$ 表示行內公式
            </span>
            <span v-else>
              提示：使用 $$...$$ 表示區塊公式，使用 $...$ 表示行內公式
            </span>
          </p>
        </div>

        <!-- 正確答案 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">
            正確答案 <span class="text-red-500">*</span>
            <span v-if="formData.question_type === 'SINGLE_CHOICE' || formData.question_type === 'MULTIPLE_CHOICE'" class="text-xs font-normal text-slate-500 ml-2">
              （選擇題可直接輸入答案，如：C 或 A,B,C）
            </span>
          </label>
          <div class="space-y-3">
            <div class="border border-slate-300 rounded-lg overflow-hidden">
              <RichTextEditor
                :model-value="toRT(formData.correct_answer)"
                :placeholder="formData.question_type === 'SINGLE_CHOICE' || formData.question_type === 'MULTIPLE_CHOICE' 
                  ? '輸入正確答案（例如：C 或 A,B,C）\n\n支援 Markdown 語法：\n- **粗體**\n- *斜體*\n- `程式碼`\n\n支援 LaTeX 數學公式：\n- 行內公式：$x = 5$\n- 區塊公式：$$\n\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}\n$$'
                  : '輸入正確答案...\n\n支援 Markdown 語法：\n- **粗體**\n- *斜體*\n- `程式碼`\n\n支援 LaTeX 數學公式：\n- 行內公式：$x = 5$\n- 區塊公式：$$\n\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}\n$$'"
                @update:model-value="(v) => (formData.correct_answer = fromRT(v))"
              />
            </div>
          </div>
          <p class="mt-1 text-xs text-slate-500">
            <span v-if="formData.question_type === 'SINGLE_CHOICE' || formData.question_type === 'MULTIPLE_CHOICE'">
              提示：直接輸入答案字母（如 C）或逗號分隔的多個答案（如 A,B,C），系統會自動判斷單選/多選
            </span>
            <span v-else>
              提示：使用 $$...$$ 表示區塊公式，使用 $...$ 表示行內公式
            </span>
          </p>
        </div>

        <!-- 詳解內容（使用 RichTextEditor） -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">
            詳解內容（富文本編輯器）
          </label>
          <div class="border border-slate-300 rounded-lg overflow-hidden">
            <RichTextEditor
              v-model="formData.solution_content"
              placeholder="開始輸入詳解內容..."
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
import RichTextEditor from '../components/RichTextEditor.vue'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => !!route.params.id)
const saving = ref(false)
const hashtags = ref([])
const subjects = ref([])
const importedStudentName = ref('')
const sourceOptions = ref(['九章自命題', '學生錯題', '學測', '會考', '統測', '模擬考', '基測', '其他'])
const customSource = ref('')

const formData = ref({
  subject: '',
  level: '',
  chapter: '',
  question_type: 'SINGLE_CHOICE',
  options: ['', ''],
  content: '',
  correct_answer: '',
  solution_content: { format: 'markdown', text: '' },
  difficulty: 1,
  tag_ids: [],
  source: '九章自命題',
  metadata: {}
})

const chapterSuggestions = ref([])
const showChapterSuggestions = ref(false)
const searchChapterTimeout = ref(null)
const isAutoUpdating = ref(false) // 防止循環更新

const toRT = (v) => {
  if (typeof v === 'string') return v
  if (v && typeof v === 'object' && typeof v.text === 'string') return v
  return ''
}

const fromRT = (v) => {
  if (typeof v === 'string') return v
  if (v && typeof v === 'object' && typeof v.text === 'string') return v.text
  return ''
}

// 從題目內容中提取選項
const extractOptionsFromContent = (content) => {
  if (!content) return []
  
  // 處理不同格式的內容
  let contentText = ''
  if (typeof content === 'string') {
    contentText = content
  } else if (typeof content === 'object' && content.text) {
    contentText = content.text
  } else {
    return []
  }
  
  const options = []
  const foundOptions = []
  const seenLetters = new Set()
  
  // 匹配格式：(A)選項內容、(B)選項內容
  // 支援多種格式：
  // 1. (A)選項內容　(B)選項內容
  // 2. (A) 選項內容 (B) 選項內容
  // 3. A.選項內容 B.選項內容
  // 4. A. 選項內容 B. 選項內容
  
  // 優先匹配括號格式：(A)選項內容
  const bracketPattern = /\(([A-Z])\)\s*([^()]+?)(?=\s*\([A-Z]\)|$|[\n\r])/g
  let match
  while ((match = bracketPattern.exec(contentText)) !== null) {
    const letter = match[1]
    let optionText = match[2]?.trim() || ''
    
    // 清理選項文字（移除多餘空格、換行等）
    optionText = optionText.replace(/\s+/g, ' ').trim()
    
    if (!seenLetters.has(letter) && optionText && optionText.length > 0) {
      foundOptions.push({
        letter,
        text: optionText
      })
      seenLetters.add(letter)
    }
  }
  
  // 如果括號格式沒找到，嘗試點號格式：A.選項內容
  if (foundOptions.length < 2) {
    seenLetters.clear()
    foundOptions.length = 0
    const dotPattern = /([A-Z])\.\s*([^A-Z.]+?)(?=\s*[A-Z]\.|$|[\n\r])/g
    while ((match = dotPattern.exec(contentText)) !== null) {
      const letter = match[1]
      let optionText = match[2]?.trim() || ''
      
      optionText = optionText.replace(/\s+/g, ' ').trim()
      
      if (!seenLetters.has(letter) && optionText && optionText.length > 0) {
        foundOptions.push({
          letter,
          text: optionText
        })
        seenLetters.add(letter)
      }
    }
  }
  
  // 如果找到選項，按字母順序排序並返回
  if (foundOptions.length >= 2) {
    foundOptions.sort((a, b) => a.letter.localeCompare(b.letter))
    return foundOptions.map(opt => opt.text)
  }
  
  return []
}

// 檢測正確答案是否為多選
const detectAnswerType = (answer) => {
  if (!answer) return formData.value.question_type
  
  // 處理不同格式的答案（使用 fromRT 來統一處理）
  const answerText = fromRT(answer)
  if (!answerText || !answerText.trim()) {
    return formData.value.question_type
  }
  
  const trimmedAnswer = answerText.trim()
  
  // 提取純文字（移除 Markdown 格式、LaTeX 等）
  // 只保留字母、逗號、分號、空格
  const cleanAnswer = trimmedAnswer.replace(/[^A-Z,，;\s]/gi, '').trim()
  
  // 如果答案為空，保持原類型
  if (!cleanAnswer) return formData.value.question_type
  
  // 如果包含逗號、分號或空格分隔的多個字母，視為多選
  // 匹配格式：A,B,C 或 A, B, C 或 A，B，C
  const multiChoicePattern = /^[A-Z]([,，;\s]+[A-Z])+$/i
  if (multiChoicePattern.test(cleanAnswer)) {
    return 'MULTIPLE_CHOICE'
  }
  
  // 單個字母視為單選
  const singleChoicePattern = /^[A-Z]$/i
  if (singleChoicePattern.test(cleanAnswer)) {
    return 'SINGLE_CHOICE'
  }
  
  // 其他情況保持原類型
  return formData.value.question_type
}

// 返回上一頁
const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/questions')
  }
}

// 載入題目資料（編輯模式）
const fetchQuestion = async () => {
  if (!isEdit.value) return
  
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
      content: question.content,
      correct_answer: question.correct_answer,
      solution_content: question.solution_content || { format: 'markdown', text: '' },
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

// 搜尋章節
const searchChapters = async () => {
  if (searchChapterTimeout.value) {
    clearTimeout(searchChapterTimeout.value)
  }
  const query = formData.value.chapter?.trim() || ''
  if (query.length < 1) {
    chapterSuggestions.value = []
    showChapterSuggestions.value = false
    return
  }
  searchChapterTimeout.value = setTimeout(async () => {
    try {
      const response = await questionBankAPI.searchChapters(
        query,
        formData.value.subject || null,
        formData.value.level || null
      )
      chapterSuggestions.value = response.data || []
      showChapterSuggestions.value = chapterSuggestions.value.length > 0
    } catch (error) {
      console.warn('搜尋章節失敗：', error)
      chapterSuggestions.value = []
      showChapterSuggestions.value = false
    }
  }, 300)
}

const selectChapter = (chapter) => {
  formData.value.chapter = chapter
  showChapterSuggestions.value = false
  chapterSuggestions.value = []
}

const handleChapterBlur = () => {
  setTimeout(() => {
    showChapterSuggestions.value = false
  }, 200)
}

const toggleTag = (tagId) => {
  const index = formData.value.tag_ids.indexOf(tagId)
  if (index > -1) {
    formData.value.tag_ids.splice(index, 1)
  } else {
    formData.value.tag_ids.push(tagId)
  }
}

// 新增選項
const addOption = () => {
  if (formData.value.options.length < 10) {
    formData.value.options.push('')
  }
}

// 移除選項
const removeOption = (index) => {
  if (formData.value.options.length > 2) {
    formData.value.options.splice(index, 1)
  }
}

// 儲存題目
// 處理來源字段
const getSourceValue = () => {
  if (formData.value.source === '其他' && customSource.value) {
    return customSource.value
  }
  return formData.value.source || '九章自命題'
}

const saveQuestion = async () => {
  // 驗證必填欄位
  if (!formData.value.subject) {
    alert('請選擇科目')
    return
  }
  if (!formData.value.level) {
    alert('請選擇適用年級')
    return
  }
  if (!formData.value.chapter?.trim()) {
    alert('請輸入章節/單元')
    return
  }
  if (!formData.value.content?.trim()) {
    alert('請輸入題目內容')
    return
  }
  if (!formData.value.correct_answer?.trim()) {
    alert('請輸入正確答案')
    return
  }

  saving.value = true
  try {
    // RichTextEditor 現在用 Markdown 純文字：確保送到後端仍是 JSONField 可接受的物件
    // 處理選項：如果不是選擇題，設為空陣列
    const options = (formData.value.question_type === 'SINGLE_CHOICE' || formData.value.question_type === 'MULTIPLE_CHOICE')
      ? formData.value.options.filter(opt => opt?.trim())
      : []

    const data = {
      ...formData.value,
      options: options,
      tag_ids_input: formData.value.tag_ids,
      tag_ids: undefined
    }
    delete data.tag_ids

    if (typeof formData.value.solution_content === 'string') {
      formData.value.solution_content = { format: 'markdown', text: formData.value.solution_content }
    } else if (formData.value.solution_content && typeof formData.value.solution_content === 'object') {
      if (!('format' in formData.value.solution_content) && 'text' in formData.value.solution_content) {
        formData.value.solution_content.format = 'markdown'
      }
    }

    let createdQuestion = null
    if (isEdit.value) {
      await questionBankAPI.update(route.params.id, data)
    } else {
      // #region agent log
      fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'QuestionForm.vue:630',message:'Creating question',data:{subject:data.subject,level:data.level,chapter:data.chapter},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      const createResponse = await questionBankAPI.create(data)
      createdQuestion = createResponse.data
      // #region agent log
      fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'QuestionForm.vue:634',message:'Question created successfully',data:{questionId:createdQuestion?.question_id||createdQuestion?.id||null,responseData:Object.keys(createResponse.data||{})},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
    }
    
    alert('儲存成功！')
    goBack()
  } catch (error) {
    console.error('儲存題目失敗：', error)
    if (error.response?.data) {
      const errorMsg = typeof error.response.data === 'string' 
        ? error.response.data 
        : JSON.stringify(error.response.data)
      alert(`儲存失敗：${errorMsg}`)
    } else {
      alert('儲存失敗，請稍後再試')
    }
  } finally {
    saving.value = false
  }
}

// 標記是否已載入題目（避免載入時觸發自動提取）
const isQuestionLoaded = ref(false)

// 監聽題目內容變化，自動提取選項
watch(() => formData.value.content, (newContent, oldContent) => {
  if (isAutoUpdating.value || !isQuestionLoaded.value) return
  
  // 只在選擇題類型時自動提取
  if (formData.value.question_type !== 'SINGLE_CHOICE' && formData.value.question_type !== 'MULTIPLE_CHOICE') {
    return
  }
  
  // 只在新增模式或選項為空時自動提取
  const shouldExtract = !isEdit.value || 
    (formData.value.options.length === 0 || formData.value.options.every(opt => !opt?.trim()))
  
  if (shouldExtract) {
    const extractedOptions = extractOptionsFromContent(newContent)
    if (extractedOptions.length >= 2) {
      isAutoUpdating.value = true
      formData.value.options = [...extractedOptions]
      // 確保至少有2個選項，最多10個
      while (formData.value.options.length < 2) {
        formData.value.options.push('')
      }
      while (formData.value.options.length > 10) {
        formData.value.options.pop()
      }
      isAutoUpdating.value = false
    }
  }
}, { deep: true })

// 監聽正確答案變化，自動判斷單選/多選
watch(() => formData.value.correct_answer, (newAnswer) => {
  if (isAutoUpdating.value || !isQuestionLoaded.value) return
  
  // 只在選擇題類型時自動判斷
  if (formData.value.question_type !== 'SINGLE_CHOICE' && formData.value.question_type !== 'MULTIPLE_CHOICE') {
    return
  }
  
  const detectedType = detectAnswerType(newAnswer)
  if (detectedType !== formData.value.question_type) {
    isAutoUpdating.value = true
    formData.value.question_type = detectedType
    
    // 如果是多選題但選項不足，確保有足夠的選項
    if (detectedType === 'MULTIPLE_CHOICE' && formData.value.options.length < 2) {
      while (formData.value.options.length < 2) {
        formData.value.options.push('')
      }
    }
    
    isAutoUpdating.value = false
  }
}, { deep: true })

onMounted(async () => {
  await Promise.all([
    fetchSubjects(),
    fetchHashtags()
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
</style>
