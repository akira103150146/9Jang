<template>
  <div class="space-y-6">
    <header class="rounded-3xl border border-blue-100 bg-gradient-to-r from-white to-indigo-50 p-6 shadow-sm">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-semibold text-slate-500">教學模組</p>
          <h2 class="text-2xl font-bold text-slate-900">考卷管理</h2>
          <p class="mt-2 text-sm text-slate-500">管理所有考卷，支援個別化教學</p>
        </div>
        <button
          @click="openFormModal()"
          class="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:from-indigo-600 hover:to-purple-600"
        >
          新增考卷
        </button>
      </div>
    </header>

    <!-- 載入中 -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-slate-500">載入中...</div>
    </div>

    <!-- 考卷列表 -->
    <section v-else class="grid gap-4 lg:grid-cols-2">
      <article
        v-for="exam in exams"
        :key="exam.exam_id"
        class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">
              考卷 #{{ exam.exam_id }}
            </p>
            <h3 class="mt-1 text-lg font-semibold text-slate-900">{{ exam.title }}</h3>
            <p class="mt-1 text-sm text-slate-600">{{ exam.course_name }}</p>
            <div v-if="exam.is_individualized" class="mt-2">
              <span class="rounded-full bg-purple-50 px-2 py-1 text-xs font-semibold text-purple-600">
                個別化考卷
              </span>
              <p class="text-xs text-slate-500 mt-1">
                群組：{{ exam.student_group_names?.join(', ') || '無' }}
              </p>
            </div>
          </div>
          <span class="ml-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
            {{ exam.questions_count }} 題
          </span>
        </div>
        <div class="mt-4 flex gap-2">
          <button
            @click="openFormModal(exam)"
            class="rounded-full bg-indigo-500 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-600"
          >
            編輯
          </button>
          <button
            @click="deleteExam(exam.exam_id)"
            class="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600"
          >
            刪除
          </button>
        </div>
      </article>
      <div v-if="exams.length === 0" class="col-span-2 rounded-3xl border border-slate-100 bg-white p-12 text-center">
        <p class="text-slate-500">目前沒有考卷，點擊「新增考卷」開始建立。</p>
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
            {{ editingExam ? '編輯考卷' : '新增考卷' }}
          </h3>
          <button @click="closeFormModal" class="text-slate-400 hover:text-slate-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveExam" class="space-y-4">
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
            <label class="flex items-center gap-2">
              <input
                type="checkbox"
                v-model="formData.is_individualized"
                class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span class="text-sm font-semibold text-slate-700">個別化考卷（僅特定學生群組可見）</span>
            </label>
          </div>

          <div v-if="formData.is_individualized">
            <label class="block text-sm font-semibold text-slate-700 mb-1">學生群組</label>
            <select
              v-model="formData.student_group_ids"
              multiple
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 min-h-[100px]"
            >
              <option v-for="group in studentGroups" :key="group.group_id" :value="group.group_id">
                {{ group.name }} ({{ group.students_count }} 位學生)
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
import { examAPI, courseAPI, questionBankAPI, studentGroupAPI } from '../services/api'

const exams = ref([])
const courses = ref([])
const studentGroups = ref([])
const availableQuestions = ref([])
const loading = ref(false)
const showFormModal = ref(false)
const editingExam = ref(null)
const saving = ref(false)

const formData = ref({
  title: '',
  course: '',
  is_individualized: false,
  student_group_ids: [],
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

const fetchExams = async () => {
  loading.value = true
  try {
    const response = await examAPI.getAll()
    exams.value = response.data.results || response.data || []
  } catch (error) {
    console.error('獲取考卷失敗：', error)
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

const fetchStudentGroups = async () => {
  try {
    const response = await studentGroupAPI.getAll()
    studentGroups.value = response.data.results || response.data || []
  } catch (error) {
    console.error('獲取學生群組失敗：', error)
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

const openFormModal = (exam = null) => {
  editingExam.value = exam
  if (exam) {
    formData.value = {
      title: exam.title,
      course: exam.course,
      is_individualized: exam.is_individualized || false,
      student_group_ids: exam.student_group_ids || [],
      question_ids: exam.question_details?.map(q => q.question_id) || []
    }
  } else {
    formData.value = {
      title: '',
      course: '',
      is_individualized: false,
      student_group_ids: [],
      question_ids: []
    }
  }
  showFormModal.value = true
}

const closeFormModal = () => {
  showFormModal.value = false
  editingExam.value = null
}

const saveExam = async () => {
  saving.value = true
  try {
    if (editingExam.value) {
      await examAPI.update(editingExam.value.exam_id, formData.value)
    } else {
      await examAPI.create(formData.value)
    }
    await fetchExams()
    closeFormModal()
  } catch (error) {
    console.error('儲存考卷失敗：', error)
    alert('儲存失敗，請稍後再試')
  } finally {
    saving.value = false
  }
}

const deleteExam = async (id) => {
  if (!confirm('確定要刪除這個考卷嗎？')) return
  try {
    await examAPI.delete(id)
    await fetchExams()
  } catch (error) {
    console.error('刪除考卷失敗：', error)
    alert('刪除失敗，請稍後再試')
  }
}

onMounted(() => {
  fetchExams()
  fetchCourses()
  fetchStudentGroups()
  fetchQuestions()
})
</script>


