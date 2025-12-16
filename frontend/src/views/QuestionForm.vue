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

        <!-- 題目內容 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">
            題目內容 (Markdown + LaTeX) <span class="text-red-500">*</span>
          </label>
          <div class="space-y-3">
            <div class="border border-slate-300 rounded-lg overflow-hidden">
              <MarkdownEditor
                v-model="formData.content"
                :placeholder="'輸入題目內容...\n\n支援 Markdown 語法：\n- **粗體**\n- *斜體*\n- `程式碼`\n\n支援 LaTeX 數學公式：\n- 行內公式：$x^2 + y^2 = r^2$\n- 區塊公式：$$\n\\int_0^1 x^2 dx = \\frac{1}{3}\n$$'"
              />
            </div>
            <div class="border-t border-slate-200 pt-3">
              <div class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">即時預覽</div>
              <div
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-slate-50 min-h-[150px] max-h-[400px] overflow-y-auto markdown-preview"
                v-html="renderedContent"
              ></div>
            </div>
          </div>
          <p class="mt-1 text-xs text-slate-500">
            提示：使用 $$...$$ 表示區塊公式，使用 $...$ 表示行內公式
          </p>
        </div>

        <!-- 正確答案 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">
            正確答案 (Markdown + LaTeX) <span class="text-red-500">*</span>
          </label>
          <div class="space-y-3">
            <div class="border border-slate-300 rounded-lg overflow-hidden">
              <MarkdownEditor
                v-model="formData.correct_answer"
                :placeholder="'輸入正確答案...\n\n支援 Markdown 語法：\n- **粗體**\n- *斜體*\n- `程式碼`\n\n支援 LaTeX 數學公式：\n- 行內公式：$x = 5$\n- 區塊公式：$$\n\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}\n$$'"
              />
            </div>
            <div class="border-t border-slate-200 pt-3">
              <div class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">即時預覽</div>
              <div
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-slate-50 min-h-[100px] max-h-[300px] overflow-y-auto markdown-preview"
                v-html="renderedCorrectAnswer"
              ></div>
            </div>
          </div>
          <p class="mt-1 text-xs text-slate-500">
            提示：使用 $$...$$ 表示區塊公式，使用 $...$ 表示行內公式
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
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { questionBankAPI, hashtagAPI, subjectAPI } from '../services/api'
import MarkdownEditor from '../components/MarkdownEditor.vue'
import { useMarkdownRenderer } from '../composables/useMarkdownRenderer'

const route = useRoute()
const router = useRouter()
const { renderMarkdownWithLatex } = useMarkdownRenderer()

const isEdit = computed(() => !!route.params.id)
const saving = ref(false)
const hashtags = ref([])
const subjects = ref([])

const formData = ref({
  subject: '',
  level: '',
  chapter: '',
  content: '',
  correct_answer: '',
  difficulty: 1,
  tag_ids: []
})

const chapterSuggestions = ref([])
const showChapterSuggestions = ref(false)
const searchChapterTimeout = ref(null)

const renderedContent = computed(() => renderMarkdownWithLatex(formData.value.content))
const renderedCorrectAnswer = computed(() => renderMarkdownWithLatex(formData.value.correct_answer))

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
    
    formData.value = {
      subject: question.subject?.subject_id || question.subject,
      level: question.level,
      chapter: question.chapter,
      content: question.content,
      correct_answer: question.correct_answer,
      difficulty: question.difficulty,
      tag_ids: tagIds
    }
  } catch (error) {
    console.error('載入題目失敗：', error)
    alert('載入題目失敗，請稍後再試')
    router.push('/questions')
  }
}

// 載入科目和標籤
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

// 儲存題目
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
    const data = {
      ...formData.value,
      tag_ids_input: formData.value.tag_ids,
      tag_ids: undefined
    }
    delete data.tag_ids
    
    if (isEdit.value) {
      await questionBankAPI.update(route.params.id, data)
    } else {
      await questionBankAPI.create(data)
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

onMounted(async () => {
  await Promise.all([
    fetchSubjects(),
    fetchHashtags()
  ])
  // 載入完成標籤後再載入題目（因為需要標籤來映射 tag_ids）
  await fetchQuestion()
})
</script>

<style scoped>
.markdown-preview {
  line-height: 1.6;
}
</style>
