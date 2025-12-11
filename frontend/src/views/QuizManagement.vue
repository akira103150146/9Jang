<template>
  <div class="space-y-6">
    <header class="rounded-3xl border border-blue-100 bg-gradient-to-r from-white to-indigo-50 p-6 shadow-sm">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-semibold text-slate-500">教學模組</p>
          <h2 class="text-2xl font-bold text-slate-900">Quiz 管理</h2>
          <p class="mt-2 text-sm text-slate-500">管理所有 Quiz</p>
        </div>
        <button
          @click="openFormModal()"
          class="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:from-indigo-600 hover:to-purple-600"
        >
          新增 Quiz
        </button>
      </div>
    </header>

    <!-- 載入中 -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-slate-500">載入中...</div>
    </div>

    <!-- Quiz 列表 -->
    <section v-else class="grid gap-4 lg:grid-cols-2">
      <article
        v-for="quiz in quizzes"
        :key="quiz.quiz_id"
        class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Quiz #{{ quiz.quiz_id }}
            </p>
            <h3 class="mt-1 text-lg font-semibold text-slate-900">{{ quiz.title }}</h3>
            <p class="mt-1 text-sm text-slate-600">{{ quiz.course_name }}</p>
          </div>
          <span class="ml-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
            {{ quiz.questions_count }} 題
          </span>
        </div>
        <div class="mt-4 flex gap-2">
          <button
            @click="openFormModal(quiz)"
            class="rounded-full bg-indigo-500 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-600"
          >
            編輯
          </button>
          <button
            @click="deleteQuiz(quiz.quiz_id)"
            class="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600"
          >
            刪除
          </button>
        </div>
      </article>
      <div v-if="quizzes.length === 0" class="col-span-2 rounded-3xl border border-slate-100 bg-white p-12 text-center">
        <p class="text-slate-500">目前沒有 Quiz，點擊「新增 Quiz」開始建立。</p>
      </div>
    </section>

    <!-- 表單對話框 -->
    <div
      v-if="showFormModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
      @click.self="closeFormModal"
    >
      <div class="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-slate-900">
            {{ editingQuiz ? '編輯 Quiz' : '新增 Quiz' }}
          </h3>
          <button @click="closeFormModal" class="text-slate-400 hover:text-slate-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveQuiz" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">標題 *</label>
            <input
              v-model="formData.title"
              type="text"
              required
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">課程 *</label>
            <select
              v-model="formData.course"
              required
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">請選擇課程</option>
              <option v-for="course in courses" :key="course.course_id" :value="course.course_id">
                {{ course.course_name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">題目 *</label>
            <div class="border border-slate-300 rounded-lg p-3 max-h-[300px] overflow-y-auto">
              <div v-if="availableQuestions.length === 0" class="text-sm text-slate-400 text-center py-4">
                尚無題目，請先到題庫新增題目
              </div>
              <div v-else class="space-y-2">
                <label
                  v-for="question in availableQuestions"
                  :key="question.question_id"
                  class="flex items-start gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    :value="question.question_id"
                    v-model="formData.question_ids"
                    class="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div class="flex-1">
                    <p class="text-sm font-semibold text-slate-900">{{ question.chapter }}</p>
                    <p class="text-xs text-slate-500">{{ question.subject_name }} / {{ getLevelDisplay(question.level) }} / 難度 {{ question.difficulty }}</p>
                  </div>
                </label>
              </div>
            </div>
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
import { quizAPI, courseAPI, questionBankAPI } from '../services/api'

const quizzes = ref([])
const courses = ref([])
const availableQuestions = ref([])
const loading = ref(false)
const showFormModal = ref(false)
const editingQuiz = ref(null)
const saving = ref(false)

const formData = ref({
  title: '',
  course: '',
  question_ids: []
})

const getLevelDisplay = (level) => {
  const map = {
    'JHS': '國中',
    'SHS': '高中',
    'VCS': '高職'
  }
  return map[level] || level
}

const fetchQuizzes = async () => {
  loading.value = true
  try {
    const response = await quizAPI.getAll()
    quizzes.value = response.data.results || response.data || []
  } catch (error) {
    console.error('獲取 Quiz 失敗：', error)
  } finally {
    loading.value = false
  }
}

const fetchCourses = async () => {
  try {
    const response = await courseAPI.getAll()
    courses.value = response.data.results || response.data || []
  } catch (error) {
    console.error('獲取課程失敗：', error)
  }
}

const fetchQuestions = async () => {
  try {
    const response = await questionBankAPI.getAll()
    availableQuestions.value = response.data.results || response.data || []
  } catch (error) {
    console.error('獲取題目失敗：', error)
  }
}

const openFormModal = (quiz = null) => {
  editingQuiz.value = quiz
  if (quiz) {
    formData.value = {
      title: quiz.title,
      course: quiz.course,
      question_ids: quiz.question_details?.map(q => q.question_id) || []
    }
  } else {
    formData.value = {
      title: '',
      course: '',
      question_ids: []
    }
  }
  showFormModal.value = true
}

const closeFormModal = () => {
  showFormModal.value = false
  editingQuiz.value = null
}

const saveQuiz = async () => {
  saving.value = true
  try {
    if (editingQuiz.value) {
      await quizAPI.update(editingQuiz.value.quiz_id, formData.value)
    } else {
      await quizAPI.create(formData.value)
    }
    await fetchQuizzes()
    closeFormModal()
  } catch (error) {
    console.error('儲存 Quiz 失敗：', error)
    alert('儲存失敗，請稍後再試')
  } finally {
    saving.value = false
  }
}

const deleteQuiz = async (id) => {
  if (!confirm('確定要刪除這個 Quiz 嗎？')) return
  try {
    await quizAPI.delete(id)
    await fetchQuizzes()
  } catch (error) {
    console.error('刪除 Quiz 失敗：', error)
    alert('刪除失敗，請稍後再試')
  }
}

onMounted(() => {
  fetchQuizzes()
  fetchCourses()
  fetchQuestions()
})
</script>


