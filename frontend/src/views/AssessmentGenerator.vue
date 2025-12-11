<template>
  <div class="space-y-6">
    <header class="rounded-3xl border border-blue-100 bg-gradient-to-r from-white to-indigo-50 p-6 shadow-sm">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-semibold text-slate-500">教學模組</p>
          <h2 class="text-2xl font-bold text-slate-900">Quiz/考卷/講義生成器</h2>
          <p class="mt-2 text-sm text-slate-500">根據篩選條件自動生成教學材料</p>
        </div>
      </div>
    </header>

    <!-- 生成類型選擇 -->
    <section class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 class="text-lg font-semibold text-slate-900 mb-4">選擇生成類型</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          @click="generationType = 'quiz'"
          :class="[
            'rounded-2xl border-2 p-4 text-left transition-all',
            generationType === 'quiz'
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-slate-200 hover:border-indigo-300'
          ]"
        >
          <h4 class="font-semibold text-slate-900">Quiz</h4>
          <p class="text-sm text-slate-600 mt-1">小測驗（最多50題）</p>
        </button>
        <button
          @click="generationType = 'exam'"
          :class="[
            'rounded-2xl border-2 p-4 text-left transition-all',
            generationType === 'exam'
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-slate-200 hover:border-indigo-300'
          ]"
        >
          <h4 class="font-semibold text-slate-900">考卷</h4>
          <p class="text-sm text-slate-600 mt-1">正式考卷（最多100題）</p>
        </button>
        <button
          @click="generationType = 'material'"
          :class="[
            'rounded-2xl border-2 p-4 text-left transition-all',
            generationType === 'material'
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-slate-200 hover:border-indigo-300'
          ]"
        >
          <h4 class="font-semibold text-slate-900">上課講義</h4>
          <p class="text-sm text-slate-600 mt-1">教學講義（最多200題）</p>
        </button>
      </div>
    </section>

    <!-- 篩選條件 -->
    <section class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 class="text-lg font-semibold text-slate-900 mb-4">設定篩選條件</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">章節</label>
          <input
            v-model="filters.chapter"
            type="text"
            placeholder="輸入章節關鍵字"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">難度</label>
          <select
            v-model="filters.difficulty"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">全部</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">標籤</label>
          <select
            v-model="filters.tag_ids"
            multiple
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 min-h-[80px]"
          >
            <option v-for="tag in hashtags" :key="tag.tag_id" :value="tag.tag_id">
              #{{ tag.tag_name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">題目來源</label>
          <select
            v-model="filters.source"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">全部</option>
            <option value="teacher_created">老師新增</option>
            <option value="imported_from_error_log">從錯題本匯入</option>
          </select>
        </div>

        <div v-if="generationType === 'exam'">
          <label class="block text-xs font-semibold text-slate-700 mb-1">課程</label>
          <select
            v-model="formData.course_id"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">請選擇課程</option>
            <option v-for="course in courses" :key="course.course_id" :value="course.course_id">
              {{ course.course_name }}
            </option>
          </select>
        </div>

        <div v-if="generationType === 'material'">
          <label class="block text-xs font-semibold text-slate-700 mb-1">課程</label>
          <select
            v-model="formData.course_id"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">請選擇課程</option>
            <option v-for="course in courses" :key="course.course_id" :value="course.course_id">
              {{ course.course_name }}
            </option>
          </select>
        </div>
      </div>

      <!-- 考卷特殊設定 -->
      <div v-if="generationType === 'exam'" class="mt-4 space-y-3">
        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            v-model="formData.is_individualized"
            id="is_individualized"
            class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label for="is_individualized" class="text-sm font-semibold text-slate-700">
            個別化考卷（僅特定學生群組可見）
          </label>
        </div>
        <div v-if="formData.is_individualized">
          <label class="block text-xs font-semibold text-slate-700 mb-1">學生群組</label>
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
      </div>

      <!-- 標題設定 -->
      <div class="mt-4">
        <label class="block text-xs font-semibold text-slate-700 mb-1">標題</label>
        <input
          v-model="formData.title"
          type="text"
          :placeholder="generationType === 'quiz' ? '例如：第一次小測驗' : generationType === 'exam' ? '例如：期中考試' : '例如：第一章講義'"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      <!-- 講義內容（僅講義） -->
      <div v-if="generationType === 'material'" class="mt-4">
        <label class="block text-xs font-semibold text-slate-700 mb-1">講義內容 (Markdown + LaTeX)</label>
        <textarea
          v-model="formData.content"
          rows="6"
          placeholder="輸入講義內容..."
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        ></textarea>
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <button
          @click="generate"
          :disabled="generating"
          class="rounded-full bg-indigo-500 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-50"
        >
          {{ generating ? '生成中...' : '生成' }}
        </button>
      </div>
    </section>

    <!-- 預覽結果 -->
    <section v-if="generatedData" class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-slate-900">生成結果預覽</h3>
        <div class="flex gap-2">
          <button
            @click="saveGenerated"
            :disabled="saving"
            class="rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50"
          >
            {{ saving ? '儲存中...' : '儲存' }}
          </button>
          <button
            @click="printPreview"
            class="rounded-full bg-slate-500 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-600"
          >
            列印
          </button>
        </div>
      </div>
      <div class="space-y-4">
        <div>
          <p class="text-sm font-semibold text-slate-700">標題：{{ generatedData.title }}</p>
          <p class="text-sm text-slate-600">共 {{ generatedData.total_count }} 題</p>
        </div>
        <div class="max-h-[600px] overflow-y-auto border border-slate-200 rounded-lg p-4">
          <div v-for="(question, index) in generatedData.questions" :key="index" class="mb-6 pb-6 border-b border-slate-200 last:border-b-0">
            <div class="flex items-start justify-between mb-2">
              <p class="text-xs font-semibold text-slate-500">第 {{ index + 1 }} 題</p>
              <span class="text-xs text-slate-500">{{ question.subject }} / {{ question.level }} / 難度 {{ question.difficulty }}</span>
            </div>
            <div class="text-sm text-slate-700 markdown-preview" v-html="renderMarkdownWithLatex(question.content)"></div>
            <div class="mt-2 text-xs text-slate-600">
              <span class="font-semibold">答案：</span>
              <span class="markdown-preview" v-html="renderMarkdownWithLatex(question.correct_answer)"></span>
            </div>
            <div v-if="question.tags && question.tags.length > 0" class="mt-2 flex flex-wrap gap-1">
              <span
                v-for="tag in question.tags"
                :key="tag"
                class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
              >
                #{{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { subjectAPI, hashtagAPI, courseAPI, generationAPI, quizAPI, examAPI, courseMaterialAPI, studentGroupAPI } from '../services/api'
import { useMarkdownRenderer } from '../composables/useMarkdownRenderer'

const { renderMarkdownWithLatex } = useMarkdownRenderer()

const generationType = ref('quiz')
const filters = ref({
  subject_id: '',
  level: '',
  chapter: '',
  difficulty: '',
  tag_ids: [],
  source: ''
})
const formData = ref({
  title: '',
  course_id: '',
  is_individualized: false,
  student_group_ids: [],
  content: ''
})
const subjects = ref([])
const hashtags = ref([])
const courses = ref([])
const studentGroups = ref([])
const generating = ref(false)
const saving = ref(false)
const generatedData = ref(null)

const fetchSubjects = async () => {
  try {
    const response = await subjectAPI.getAll()
    subjects.value = response.data.results || response.data || []
  } catch (error) {
    console.error('獲取科目失敗：', error)
  }
}

const fetchHashtags = async () => {
  try {
    const response = await hashtagAPI.getAll()
    hashtags.value = response.data.results || response.data || []
  } catch (error) {
    console.error('獲取標籤失敗：', error)
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

const generate = async () => {
  generating.value = true
  try {
    const data = {
      ...filters.value,
      title: formData.value.title || `自動生成的${generationType.value === 'quiz' ? 'Quiz' : generationType.value === 'exam' ? '考卷' : '講義'}`,
      course_id: formData.value.course_id
    }

    let response
    if (generationType.value === 'quiz') {
      response = await generationAPI.generateQuiz(data)
    } else if (generationType.value === 'exam') {
      response = await generationAPI.generateExam({
        ...data,
        is_individualized: formData.value.is_individualized,
        student_group_ids: formData.value.student_group_ids
      })
    } else {
      response = await generationAPI.generateMaterial({
        ...data,
        content: formData.value.content
      })
    }

    generatedData.value = response.data
  } catch (error) {
    console.error('生成失敗：', error)
    alert('生成失敗，請稍後再試')
  } finally {
    generating.value = false
  }
}

const saveGenerated = async () => {
  if (!generatedData.value) return

  saving.value = true
  try {
    const saveData = {
      title: generatedData.value.title,
      course: generatedData.value.course_id,
      question_ids: generatedData.value.questions.map(q => q.question_id)
    }

    if (generationType.value === 'quiz') {
      await quizAPI.create(saveData)
    } else if (generationType.value === 'exam') {
      await examAPI.create({
        ...saveData,
        is_individualized: formData.value.is_individualized,
        student_group_ids: formData.value.student_group_ids
      })
    } else {
      await courseMaterialAPI.create({
        ...saveData,
        content: formData.value.content
      })
    }

    alert('儲存成功！')
    generatedData.value = null
  } catch (error) {
    console.error('儲存失敗：', error)
    alert('儲存失敗，請稍後再試')
  } finally {
    saving.value = false
  }
}

const printPreview = () => {
  window.print()
}

onMounted(() => {
  fetchSubjects()
  fetchHashtags()
  fetchCourses()
  fetchStudentGroups()
})
</script>


