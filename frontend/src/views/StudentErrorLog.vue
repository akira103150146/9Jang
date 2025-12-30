<template>
  <div class="space-y-6">
    <header class="rounded-3xl border border-blue-100 bg-gradient-to-r from-white to-purple-50 p-6 shadow-sm">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-semibold text-slate-500">學生學習追蹤</p>
          <h2 class="text-2xl font-bold text-slate-900">{{ studentName }} 的錯題本</h2>
          <p class="mt-2 text-sm text-slate-500">追蹤學習進度與複習狀態</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="openAddErrorModal"
            class="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:from-purple-600 hover:to-indigo-600"
          >
            + 新增錯題
          </button>
          <router-link
            to="/students"
            class="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            返回學生列表
          </router-link>
        </div>
      </div>
      
      <!-- Tabs -->
      <div class="mt-6 flex space-x-4 border-b border-slate-200">
        <button
          @click="currentTab = 'errors'"
          class="pb-2 text-sm font-medium transition-colors border-b-2"
          :class="currentTab === 'errors' ? 'border-purple-500 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'"
        >
          系統錯題
        </button>
        <button
          v-if="canViewNotes"
          @click="currentTab = 'notes'"
          class="pb-2 text-sm font-medium transition-colors border-b-2"
          :class="currentTab === 'notes' ? 'border-purple-500 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'"
        >
          學生筆記
        </button>
      </div>
    </header>

    <!-- 系統錯題 Tab 內容 -->
    <ErrorLogTab
      v-show="currentTab === 'errors'"
      :error-logs="errorLogs"
      :loading="loading"
      :questions="questions"
      @open-add-modal="openAddErrorModal"
      @view-detail="viewErrorDetail"
      @update-status="updateErrorStatus"
      @increment-count="incrementErrorCount"
      @delete="(errorLog) => deleteErrorLog(errorLog.error_log_id, errorLog.question_chapter || '')"
    />

    <!-- 學生筆記 Tab 內容 -->
    <StudentNotesTab
      v-show="currentTab === 'notes'"
      :student-notes="studentNotes"
      :loading="loadingNotes"
      @view-detail="viewNoteDetail"
    />

    <!-- 新增錯題模態框 -->
    <AddErrorModal
      :is-open="showAddErrorModal"
      v-model:error-form-data="errorFormData"
      :questions="questions"
      :subjects="subjects"
      :hashtags="hashtags"
      :chapter-suggestions="chapterSuggestions"
      :show-chapter-suggestions="showChapterSuggestions"
      :local-images="localImages"
      :saving="saving"
      :uploading-images="uploadingImages"
      @close="closeAddErrorModal"
      @save="saveErrorLog"
      @toggle-question-source="toggleQuestionSource"
      @load-question="loadQuestionFromBank"
      @open-subject-form="showSubjectForm = true"
      @open-tag-form="showTagForm = true"
      @search-chapters="searchChapters"
      @handle-chapter-blur="handleChapterBlur"
      @select-chapter="selectChapter"
      @toggle-tag="toggleTag"
      @pick-images="onPickImages"
      @remove-image="removeLocalImage"
    />

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
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              placeholder="例如：數學"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">科目代碼</label>
            <input
              v-model="subjectFormData.code"
              type="text"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              placeholder="例如：MATH（選填）"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">描述</label>
            <textarea
              v-model="subjectFormData.description"
              rows="3"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
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
              class="rounded-full bg-purple-500 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-600 disabled:opacity-50"
            >
              {{ savingSubject ? '儲存中...' : '儲存' }}
            </button>
          </div>
        </form>
      </div>
    </div>

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
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              placeholder="例如：錯題、需複習"
            />
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
              class="rounded-full bg-purple-500 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-600 disabled:opacity-50"
            >
              {{ savingTag ? '儲存中...' : '儲存' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 錯題詳情模態框 -->
    <ErrorDetailModal
      :is-open="showDetailModal"
      :selected-error="selectedError"
      :question-detail="questionDetail"
      :can-import-to-question-bank="canImportToQuestionBank"
      @close="closeErrorDetail"
      @import-to-question-bank="importSelectedErrorToQuestionBank"
      @update-status="updateErrorStatus"
    />

    <!-- 筆記詳情模態框 -->
    <NoteDetailModal
      :is-open="showNoteDetailModal"
      :selected-note="selectedNote"
      :can-import-to-question-bank="canImportToQuestionBank"
      @close="closeNoteDetail"
      @open-import="openImportModal"
    />

    <!-- 匯入題庫模態框 -->
    <ImportToQuestionBankModal
      :is-open="showImportModal"
      :selected-note="selectedNote"
      v-model:import-form-data="importFormData"
      :subjects="subjects"
      :hashtags="hashtags"
      :importing="importing"
      @close="closeImportModal"
      @import="importNoteToQuestionBank"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { questionBankAPI, studentAPI, subjectAPI, hashtagAPI, authAPI } from '../services/api'
import { useErrorLog, type ErrorFormData } from '../composables/useErrorLog'
import { useStudentNotes, type ImportFormData } from '../composables/useStudentNotes'

// Components
import ErrorLogTab from '../components/error-log/ErrorLogTab.vue'
import StudentNotesTab from '../components/error-log/StudentNotesTab.vue'
import ErrorDetailModal from '../components/error-log/ErrorDetailModal.vue'
import AddErrorModal from '../components/error-log/AddErrorModal.vue'
import NoteDetailModal from '../components/error-log/NoteDetailModal.vue'
import ImportToQuestionBankModal from '../components/error-log/ImportToQuestionBankModal.vue'

const route = useRoute()
const studentId = parseInt(route.params.id as string)

const currentTab = ref<'errors' | 'notes'>('errors')
const studentName = ref('')
const currentRole = ref('')
const questions = ref<Array<{ question_id: number; chapter?: string; subject_name?: string; [key: string]: unknown }>>([])
const subjects = ref<Array<{ subject_id: number; name: string; code?: string; [key: string]: unknown }>>([])
const hashtags = ref<Array<{ tag_id: number; tag_name: string; [key: string]: unknown }>>([])
const showSubjectForm = ref(false)
const showTagForm = ref(false)
const savingSubject = ref(false)
const savingTag = ref(false)
const subjectFormData = ref({
  name: '',
  code: '',
  description: ''
})
const tagFormData = ref({
  tag_name: ''
})

// 使用 composables
const errorLogComposable = useErrorLog(
  studentId,
  questions,
  hashtags,
  () => {
    // 錯題更新回調
  }
)

const notesComposable = useStudentNotes(studentId)

// 從 composables 提取狀態和方法
const {
  errorLogs,
  loading,
  saving,
  uploadingImages,
  showAddErrorModal,
  showDetailModal,
  selectedError,
  questionDetail,
  localImages,
  errorFormData,
  chapterSuggestions,
  showChapterSuggestions,
  fetchErrorLogs,
  openAddErrorModal,
  closeAddErrorModal,
  saveErrorLog,
  viewErrorDetail,
  closeErrorDetail,
  updateErrorStatus,
  incrementErrorCount,
  deleteErrorLog,
  importSelectedErrorToQuestionBank,
  onPickImages,
  removeLocalImage,
  searchChapters,
  selectChapter,
  handleChapterBlur,
  toggleTag,
  loadQuestionFromBank,
  toggleQuestionSource
} = errorLogComposable

const {
  studentNotes,
  loadingNotes,
  importing,
  showNoteDetailModal,
  showImportModal,
  selectedNote,
  importFormData,
  fetchStudentNotes,
  viewNoteDetail,
  closeNoteDetail,
  openImportModal,
  closeImportModal,
  importNoteToQuestionBank
} = notesComposable

const canImportToQuestionBank = computed(() => {
  return currentRole.value === 'TEACHER' || currentRole.value === 'ADMIN'
})

const canViewNotes = computed(() => {
  return currentRole.value === 'TEACHER' || currentRole.value === 'ADMIN'
})

const fetchStudentInfo = async (): Promise<void> => {
  try {
    const response = await studentAPI.getById(studentId)
    studentName.value = response.data.name
  } catch (error) {
    console.warn('獲取學生資訊失敗：', error)
    studentName.value = '學生'
  }
}

const fetchCurrentRole = async (): Promise<void> => {
  try {
    const res = await authAPI.getCurrentUser()
    currentRole.value = res.data?.role || ''
  } catch (e) {
    currentRole.value = ''
  }
}

const fetchQuestions = async (): Promise<void> => {
  try {
    const response = await questionBankAPI.getAll()
    const data = response.data.results || response.data
    questions.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.warn('獲取題目失敗：', error)
    questions.value = []
  }
}

const fetchSubjects = async (): Promise<void> => {
  try {
    const response = await subjectAPI.getAll()
    const data = response.data.results || response.data
    subjects.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.warn('獲取科目失敗：', error)
    subjects.value = []
  }
}

const fetchHashtags = async (): Promise<void> => {
  try {
    const response = await hashtagAPI.getAll()
    const data = response.data.results || response.data
    hashtags.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.warn('獲取標籤失敗：', error)
    hashtags.value = []
  }
}

const saveSubject = async (): Promise<void> => {
  savingSubject.value = true
  try {
    const response = await subjectAPI.create(subjectFormData.value)
    subjects.value.push(response.data)
    errorFormData.value.subject = response.data.subject_id.toString()
    showSubjectForm.value = false
    subjectFormData.value = {
      name: '',
      code: '',
      description: ''
    }
  } catch (error) {
    console.error('儲存科目失敗：', error)
    const err = error as { response?: { data?: unknown } }
    if (err.response?.data) {
      const errorData = err.response.data
      const errorMsg = typeof errorData === 'string' 
        ? errorData 
        : JSON.stringify(errorData)
      alert(`儲存失敗：${errorMsg}`)
    } else {
      alert('儲存失敗，請稍後再試')
    }
  } finally {
    savingSubject.value = false
  }
}

const saveTag = async (): Promise<void> => {
  savingTag.value = true
  try {
    const existingTag = hashtags.value.find(
      tag => tag.tag_name.toLowerCase() === tagFormData.value.tag_name.toLowerCase().trim()
    )
    
    if (existingTag) {
      if (!errorFormData.value.tag_ids.includes(existingTag.tag_id)) {
        errorFormData.value.tag_ids.push(existingTag.tag_id)
      }
      showTagForm.value = false
      tagFormData.value.tag_name = ''
      return
    }

    const response = await hashtagAPI.create({
      tag_name: tagFormData.value.tag_name.trim()
    })
    
    hashtags.value.push(response.data)
    errorFormData.value.tag_ids.push(response.data.tag_id)
    showTagForm.value = false
    tagFormData.value.tag_name = ''
  } catch (error) {
    console.error('儲存標籤失敗：', error)
    const err = error as { response?: { data?: unknown } }
    if (err.response?.data) {
      const errorData = err.response.data
      let errorMsg = ''
      if (typeof errorData === 'string') {
        errorMsg = errorData
      } else if (typeof errorData === 'object' && errorData !== null && 'tag_name' in errorData) {
        const tagError = (errorData as { tag_name?: string | string[] }).tag_name
        errorMsg = Array.isArray(tagError)
          ? tagError[0]
          : tagError || JSON.stringify(errorData)
      } else {
        errorMsg = JSON.stringify(errorData)
      }
      alert(`儲存失敗：${errorMsg}`)
    } else {
      alert('儲存失敗，請稍後再試')
    }
  } finally {
    savingTag.value = false
  }
}

onMounted(async () => {
  await fetchCurrentRole()
  fetchStudentInfo()
  fetchErrorLogs()
  fetchQuestions()
  fetchSubjects()
  fetchHashtags()
  
  // 如果是老師或管理員，載入學生筆記
  if (currentRole.value === 'TEACHER' || currentRole.value === 'ADMIN') {
    await fetchStudentNotes()
  }
})
</script>
