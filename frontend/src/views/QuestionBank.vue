<template>
  <div class="space-y-6">
    <header class="rounded-3xl border border-blue-100 bg-gradient-to-r from-white to-indigo-50 p-6 shadow-sm">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-semibold text-slate-500">教學模組</p>
          <h2 class="text-2xl font-bold text-slate-900">題庫與標籤系統</h2>
          <p class="mt-2 text-sm text-slate-500">支援 Markdown + LaTeX，含標籤管理</p>
        </div>
        <button
          @click="openFormModal()"
          class="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:from-indigo-600 hover:to-purple-600"
        >
          新增題目
        </button>
      </div>
      <p v-if="usingMock" class="mt-3 text-sm text-amber-600">
        目前顯示示意資料（mock data），待後端 API 可用後即可串接。
      </p>
    </header>

    <!-- 載入中 -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-slate-500">載入中...</div>
    </div>

    <!-- 題目列表 -->
    <section v-else class="grid gap-4 lg:grid-cols-2">
      <article
        v-for="question in questionBank"
        :key="question.question_id"
        class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Q{{ question.question_id }} ・ {{ question.subject_name || question.subject?.name || '無科目' }} / {{ getLevelDisplay(question.level) }}
            </p>
            <h3 class="mt-1 text-lg font-semibold text-slate-900">{{ question.chapter }}</h3>
          </div>
          <span class="ml-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
            難度 {{ question.difficulty }}
          </span>
        </div>
        <div class="mt-3 text-sm text-slate-700 whitespace-pre-wrap">{{ question.content }}</div>
        <div v-if="question.correct_answer" class="mt-3 text-xs text-slate-600">
          <span class="font-semibold">答案：</span>{{ question.correct_answer }}
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
          <span
            v-for="tag in question.tags || []"
            :key="tag"
            class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
          >
            #{{ tag }}
          </span>
          <span v-if="!question.tags || question.tags.length === 0" class="text-xs text-slate-400">
            無標籤
          </span>
        </div>
        <div class="mt-4 flex gap-2">
          <button
            @click="openFormModal(question)"
            class="rounded-full bg-indigo-500 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-600"
          >
            編輯
          </button>
          <button
            @click="deleteQuestion(question.question_id, question.chapter)"
            class="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600"
          >
            刪除
          </button>
        </div>
      </article>
      <div v-if="questionBank.length === 0" class="col-span-2 rounded-3xl border border-slate-100 bg-white p-12 text-center">
        <p class="text-slate-500">目前沒有題目，點擊「新增題目」開始建立題庫。</p>
      </div>
    </section>

    <!-- 新增標籤對話框 -->
    <div
      v-if="showTagForm"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
      @click.self="showTagForm = false"
    >
      <div class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-slate-900">新增標籤</h3>
          <button @click="showTagForm = false" class="text-slate-400 hover:text-slate-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveTag" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">標籤名稱 *</label>
            <input
              v-model="tagFormData.tag_name"
              type="text"
              required
              maxlength="50"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="例如：必考三角、陷阱題、被動語態"
            />
            <p class="mt-1 text-xs text-slate-500">標籤名稱將以 # 開頭顯示</p>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="showTagForm = false"
              class="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="savingTag"
              class="rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-50"
            >
              {{ savingTag ? '儲存中...' : '儲存' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 新增科目對話框 -->
    <div
      v-if="showSubjectForm"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
      @click.self="showSubjectForm = false"
    >
      <div class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-slate-900">新增科目</h3>
          <button @click="showSubjectForm = false" class="text-slate-400 hover:text-slate-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveSubject" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">科目名稱 *</label>
            <input
              v-model="subjectFormData.name"
              type="text"
              required
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="例如：數學"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">科目代碼</label>
            <input
              v-model="subjectFormData.code"
              type="text"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="例如：Math（選填）"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">描述</label>
            <textarea
              v-model="subjectFormData.description"
              rows="3"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="科目描述（選填）"
            ></textarea>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="showSubjectForm = false"
              class="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="savingSubject"
              class="rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-50"
            >
              {{ savingSubject ? '儲存中...' : '儲存' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 題目表單對話框 -->
    <div
      v-if="showFormModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
      @click.self="closeFormModal"
    >
      <div class="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-slate-900">
            {{ editingQuestion ? '編輯題目' : '新增題目' }}
          </h3>
          <button @click="closeFormModal" class="text-slate-400 hover:text-slate-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveQuestion" class="space-y-4">
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-sm font-semibold text-slate-700">科目 *</label>
              <button
                type="button"
                @click.prevent.stop="openSubjectForm"
                class="text-xs text-indigo-600 hover:text-indigo-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-200 rounded px-2 py-1 transition-colors"
              >
                + 新增科目
              </button>
            </div>
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

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">適用年級 *</label>
            <select
              v-model="formData.level"
              required
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">請選擇</option>
              <option value="JHS">Junior High School</option>
              <option value="SHS">Senior High School</option>
              <option value="VCS">Vocational School</option>
            </select>
          </div>

          <div class="relative">
            <label class="block text-sm font-semibold text-slate-700 mb-1">章節/單元 *</label>
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
                  <div class="flex items-center gap-2">
                    <span
                      v-if="suggestion.relevance === 2"
                      class="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded"
                    >
                      精確匹配
                    </span>
                    <span class="text-xs text-slate-500">
                      {{ suggestion.count }} 題
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">題目內容 (Markdown + LaTeX) *</label>
            <textarea
              v-model="formData.content"
              required
              rows="6"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="輸入題目內容..."
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">正確答案 *</label>
            <textarea
              v-model="formData.correct_answer"
              required
              rows="3"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="輸入正確答案..."
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">難度 (1-5) *</label>
            <input
              v-model.number="formData.difficulty"
              type="number"
              min="1"
              max="5"
              required
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">圖片路徑</label>
            <input
              v-model="formData.image_path"
              type="text"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="圖片檔案路徑（選填）"
            />
          </div>

          <!-- 標籤選擇區域 -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-semibold text-slate-700">標籤分類</label>
              <button
                type="button"
                @click.prevent.stop="openTagForm"
                class="text-xs text-indigo-600 hover:text-indigo-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-200 rounded px-2 py-1 transition-colors"
              >
                + 新增標籤
              </button>
            </div>
            <div class="border border-slate-300 rounded-lg p-3 min-h-[100px] max-h-[200px] overflow-y-auto">
              <div v-if="hashtags.length === 0" class="text-sm text-slate-400 text-center py-4">
                尚無標籤，點擊「新增標籤」開始建立
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

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="closeFormModal"
              class="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-50"
            >
              {{ saving ? '儲存中...' : '儲存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { questionBankAPI, hashtagAPI, subjectAPI } from '../services/api'
import { mockQuestionBank } from '../data/mockData'

const questionBank = ref([])
const hashtags = ref([])
const subjects = ref([])
const loading = ref(false)
const usingMock = ref(false)
const showFormModal = ref(false)
const showSubjectForm = ref(false)
const showTagForm = ref(false)
const editingQuestion = ref(null)
const saving = ref(false)
const savingSubject = ref(false)
const savingTag = ref(false)
const chapterSuggestions = ref([])
const showChapterSuggestions = ref(false)
const searchChapterTimeout = ref(null)

const formData = ref({
  subject: '',
  level: '',
  chapter: '',
  content: '',
  correct_answer: '',
  difficulty: 1,
  image_path: '',
  tag_ids: []
})

const subjectFormData = ref({
  name: '',
  code: '',
  description: ''
})

const tagFormData = ref({
  tag_name: ''
})

const getLevelDisplay = (level) => {
  const map = {
    'JHS': '國中',
    'SHS': '高中',
    'VCS': '高職'
  }
  return map[level] || level
}

const fetchQuestions = async () => {
  loading.value = true
  try {
    const response = await questionBankAPI.getAll()
    const data = response.data.results || response.data
    questionBank.value = Array.isArray(data) ? data : []
    usingMock.value = false
  } catch (error) {
    console.warn('獲取題目失敗，使用 mock 資料：', error)
    questionBank.value = mockQuestionBank
    usingMock.value = true
  } finally {
    loading.value = false
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

const openSubjectForm = () => {
  showSubjectForm.value = true
}

const searchChapters = async () => {
  // 清除之前的延遲
  if (searchChapterTimeout.value) {
    clearTimeout(searchChapterTimeout.value)
  }
  
  const query = formData.value.chapter?.trim() || ''
  
  // 如果輸入太短，不搜尋
  if (query.length < 1) {
    chapterSuggestions.value = []
    showChapterSuggestions.value = false
    return
  }
  
  // 延遲搜尋，避免頻繁請求
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
  // 延遲隱藏，讓點擊事件先執行
  setTimeout(() => {
    showChapterSuggestions.value = false
  }, 200)
}

const saveSubject = async () => {
  savingSubject.value = true
  try {
    const response = await subjectAPI.create(subjectFormData.value)
    subjects.value.push(response.data)
    // 自動選擇剛新增的科目
    formData.value.subject = response.data.subject_id
    showSubjectForm.value = false
    // 重置表單
    subjectFormData.value = {
      name: '',
      code: '',
      description: ''
    }
  } catch (error) {
    console.error('儲存科目失敗：', error)
    if (error.response?.data) {
      const errorMsg = typeof error.response.data === 'string' 
        ? error.response.data 
        : JSON.stringify(error.response.data)
      alert(`儲存失敗：${errorMsg}`)
    } else {
      alert('儲存失敗，請稍後再試')
    }
  } finally {
    savingSubject.value = false
  }
}

const openTagForm = () => {
  showTagForm.value = true
}

const toggleTag = (tagId) => {
  const index = formData.value.tag_ids.indexOf(tagId)
  if (index > -1) {
    // 如果已選擇，則移除
    formData.value.tag_ids.splice(index, 1)
  } else {
    // 如果未選擇，則添加
    formData.value.tag_ids.push(tagId)
  }
}

const saveTag = async () => {
  savingTag.value = true
  try {
    // 檢查標籤是否已存在
    const existingTag = hashtags.value.find(
      tag => tag.tag_name.toLowerCase() === tagFormData.value.tag_name.toLowerCase().trim()
    )
    
    if (existingTag) {
      // 如果標籤已存在，直接選擇它
      if (!formData.value.tag_ids.includes(existingTag.tag_id)) {
        formData.value.tag_ids.push(existingTag.tag_id)
      }
      showTagForm.value = false
      tagFormData.value.tag_name = ''
      alert('標籤已存在，已自動選擇')
      return
    }

    // 創建新標籤（creator 可選，允許為 null）
    const response = await hashtagAPI.create({
      tag_name: tagFormData.value.tag_name.trim()
    })
    
    // 添加新標籤到列表
    hashtags.value.push(response.data)
    // 自動選擇剛新增的標籤
    formData.value.tag_ids.push(response.data.tag_id)
    showTagForm.value = false
    // 重置表單
    tagFormData.value.tag_name = ''
  } catch (error) {
    console.error('儲存標籤失敗：', error)
    if (error.response?.data) {
      let errorMsg = ''
      if (typeof error.response.data === 'string') {
        errorMsg = error.response.data
      } else if (error.response.data.tag_name) {
        // Django 錯誤格式
        errorMsg = Array.isArray(error.response.data.tag_name)
          ? error.response.data.tag_name[0]
          : error.response.data.tag_name
      } else {
        errorMsg = JSON.stringify(error.response.data)
      }
      alert(`儲存失敗：${errorMsg}`)
    } else {
      alert('儲存失敗，請稍後再試')
    }
  } finally {
    savingTag.value = false
  }
}

const openFormModal = (question = null) => {
  editingQuestion.value = question
  if (question) {
    // 獲取題目的標籤 ID
    // 優先使用 tag_ids（如果 API 返回），否則從 tags 名稱列表中查找
    let tagIds = []
    if (question.tag_ids && Array.isArray(question.tag_ids)) {
      tagIds = question.tag_ids
    } else if (question.tags && Array.isArray(question.tags)) {
      // 如果有標籤名稱列表，需要找到對應的 tag_id
      question.tags.forEach(tagName => {
        const tag = hashtags.value.find(t => t.tag_name === tagName)
        if (tag) {
          tagIds.push(tag.tag_id)
        }
      })
    }
    
    formData.value = {
      subject: question.subject?.subject_id || question.subject, // 支援對象或ID
      level: question.level,
      chapter: question.chapter,
      content: question.content,
      correct_answer: question.correct_answer,
      difficulty: question.difficulty,
      image_path: question.image_path || '',
      tag_ids: tagIds
    }
  } else {
    formData.value = {
      subject: '',
      level: '',
      chapter: '',
      content: '',
      correct_answer: '',
      difficulty: 1,
      image_path: '',
      tag_ids: []
    }
  }
  showFormModal.value = true
}

const closeFormModal = () => {
  showFormModal.value = false
  editingQuestion.value = null
  // 重置表單
  formData.value = {
    subject: '',
    level: '',
    chapter: '',
    content: '',
    correct_answer: '',
    difficulty: 1,
    image_path: '',
    tag_ids: []
  }
}

const saveQuestion = async () => {
  saving.value = true
  try {
    // 準備數據，將 tag_ids 改為 tag_ids_input（對應後端寫入欄位）
    const data = {
      ...formData.value,
      tag_ids_input: formData.value.tag_ids,
      // 移除 tag_ids，因為它是只讀的
      tag_ids: undefined
    }
    delete data.tag_ids
    
    if (editingQuestion.value) {
      await questionBankAPI.update(editingQuestion.value.question_id, data)
    } else {
      await questionBankAPI.create(data)
    }
    closeFormModal()
    fetchQuestions()
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

const deleteQuestion = async (id, chapter) => {
  if (!confirm(`確定要刪除題目「${chapter}」嗎？`)) {
    return
  }

  try {
    await questionBankAPI.delete(id)
    fetchQuestions()
  } catch (error) {
    console.error('刪除失敗:', error)
    alert('刪除失敗，請稍後再試')
  }
}

onMounted(() => {
  fetchSubjects()
  fetchQuestions()
  fetchHashtags()
})
</script>
