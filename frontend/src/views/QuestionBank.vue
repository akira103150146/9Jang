<template>
  <div class="space-y-6">
    <header class="rounded-3xl border border-blue-100 bg-gradient-to-r from-white to-indigo-50 p-6 shadow-sm">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-semibold text-slate-500">教學模組</p>
          <h2 class="text-2xl font-bold text-slate-900">{{ headerTitle }}</h2>
          <p class="mt-2 text-sm text-slate-500">{{ headerDescription }}</p>
        </div>
      </div>
      
      <!-- Tabs -->
      <div class="mt-6 flex space-x-4 border-b border-slate-200">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="currentTab = tab.id"
          class="pb-2 text-sm font-medium transition-colors border-b-2"
          :class="currentTab === tab.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'"
        >
          {{ tab.name }}
        </button>
      </div>
      
    </header>

    <!-- 文件庫 Tab -->
    <div v-show="currentTab === 'resources'">
      <!-- 生成器功能區塊 -->
      <section class="rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50 p-5 shadow-sm mb-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold text-slate-900">生成教學資源</h3>
            <p class="text-sm text-slate-600 mt-1">根據篩選條件自動生成 Quiz、考卷或講義</p>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <!-- 標題 -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">標題 *</label>
            <input
              v-model="generatorForm.title"
              type="text"
              placeholder="例如：第一次小測驗"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <!-- 模式選擇 -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">模式 *</label>
            <select
              v-model="generatorForm.mode"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="HANDOUT">講義模式</option>
              <option value="ONLINE_QUIZ">線上測驗模式</option>
            </select>
          </div>

          <!-- 課程 -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">所屬課程（可選）</label>
            <select
              v-model="generatorForm.course_id"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">未綁定</option>
              <option v-for="course in courses" :key="course.course_id" :value="course.course_id">
                {{ course.course_name }}
              </option>
            </select>
          </div>

          <!-- 紙張大小 -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">紙張大小</label>
            <select
              v-model="generatorForm.paperSize"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="A4">A4 (210mm x 297mm)</option>
              <option value="B4">B4 (250mm x 353mm)</option>
            </select>
          </div>

          <!-- Template 選擇（可選） -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">插入 Template（可選）</label>
            <select
              v-model="generatorForm.template_id"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">不使用 Template</option>
              <option v-for="template in templates" :key="template.template_id" :value="template.template_id">
                {{ template.title }}
              </option>
            </select>
          </div>

          <!-- 個別化設定（僅線上測驗模式） -->
          <div v-if="generatorForm.mode === 'ONLINE_QUIZ'">
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  v-model="generatorForm.is_individualized"
                  id="is_individualized"
                  class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label for="is_individualized" class="text-xs font-semibold text-slate-700">
                  個別化考卷
                </label>
              </div>
              <div v-if="generatorForm.is_individualized">
                <select
                  v-model="generatorForm.student_group_ids"
                  multiple
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 min-h-[80px]"
                >
                  <option v-for="group in studentGroups" :key="group.group_id" :value="group.group_id">
                    {{ group.name }} ({{ group.students_count || 0 }} 位學生)
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3">
          <button
            @click="generateResource"
            :disabled="generating || !generatorForm.title.trim()"
            class="rounded-full bg-indigo-500 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ generating ? '生成中...' : '生成' }}
          </button>
        </div>
      </section>

      <!-- 生成結果預覽 -->
      <section v-if="generatedResource" class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm mb-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-slate-900">生成結果預覽</h3>
          <div class="flex gap-2">
            <button
              @click="saveGeneratedResource"
              :disabled="savingGenerated"
              class="rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50"
            >
              {{ savingGenerated ? '儲存中...' : '儲存' }}
            </button>
            <button
              @click="openInEditor"
              class="rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600"
            >
              在編輯器中開啟
            </button>
          </div>
        </div>
        <div class="space-y-4">
          <div>
            <p class="text-sm font-semibold text-slate-700">標題：{{ generatedResource.title }}</p>
            <p class="text-sm text-slate-600">共 {{ generatedResource.structure?.length || 0 }} 個區塊</p>
          </div>
        </div>
      </section>

      <ResourceList />
    </div>

    <!-- 題庫 Tab -->
    <div v-show="currentTab === 'questions'">
      <QuestionList />
    </div>

    <!-- 模板庫 Tab -->
    <div v-show="currentTab === 'templates'">
      <TemplateList />
    </div>

    <!-- 題目表單和相關對話框已移到 ResourceList 中 -->
  </div>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { generationAPI, courseAPI, studentGroupAPI, learningResourceAPI, contentTemplateAPI } from '../services/api'
import ResourceList from '../components/ResourceList.vue'
import TemplateList from '../components/TemplateList.vue'
import QuestionList from '../components/QuestionList.vue'

// Tabs Configuration
const currentTab = ref('questions')
const tabs = [
  { id: 'questions', name: '題庫' },
  { id: 'resources', name: '文件庫' },
  { id: 'templates', name: '模板庫' }
]

const headerTitle = computed(() => {
  const map = {
    'questions': '題庫管理',
    'resources': '教學資源管理',
    'templates': '內容模板管理'
  }
  return map[currentTab.value] || '題庫管理'
})

const headerDescription = computed(() => {
  const map = {
    'questions': '新增、編輯與管理題目，支援多種題目類型',
    'resources': '創建、編輯與管理教學資源，支援多種模式',
    'templates': '管理可重複使用的內容模板'
  }
  return map[currentTab.value] || '新增、編輯與管理題目'
})

const courses = ref([])
const studentGroups = ref([])
const templates = ref([])

// 生成器相關狀態
const generating = ref(false)
const savingGenerated = ref(false)
const generatedResource = ref(null)
const generatorForm = ref({
  title: '',
  mode: 'HANDOUT',
  course_id: '',
  paperSize: 'A4',
  template_id: '',
  is_individualized: false,
  student_group_ids: []
})


const fetchCourses = async () => {
  try {
    const response = await courseAPI.getAll()
    const data = response.data.results || response.data
    courses.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.warn('獲取課程失敗：', error)
    courses.value = []
  }
}

const fetchStudentGroups = async () => {
  try {
    const response = await studentGroupAPI.getAll()
    const data = response.data.results || response.data
    studentGroups.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.warn('獲取學生群組失敗：', error)
    studentGroups.value = []
  }
}

const fetchTemplates = async () => {
  try {
    const response = await contentTemplateAPI.getAll()
    const data = response.data.results || response.data
    templates.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.warn('獲取模板失敗：', error)
    templates.value = []
  }
}

// 將生成的題目列表轉換為 structure 格式
const convertQuestionsToStructure = (questions, templateId = null) => {
  const structure = []
  let idCounter = 1

  // 如果有選擇 Template，先插入 Template 區塊
  if (templateId) {
    structure.push({
      id: idCounter++,
      type: 'template',
      template_id: templateId
    })
  }

  // 添加題目區塊
  questions.forEach(question => {
    structure.push({
      id: idCounter++,
      type: 'question',
      question_id: question.question_id
    })
  })

  return structure
}

// 生成資源
const generateResource = async () => {
  if (!generatorForm.value.title.trim()) {
    alert('請輸入標題')
    return
  }

  generating.value = true
  try {
    // 使用統一的生成 API
    const generateParams = {
      mode: generatorForm.value.mode,
      subject_id: null,
      level: null,
      chapter: null,
      difficulty: null,
      tag_ids: [],
      source: null,
      title: generatorForm.value.title.trim(),
      course_id: generatorForm.value.course_id || null,
      template_id: generatorForm.value.template_id || null,
      is_individualized: generatorForm.value.mode === 'ONLINE_QUIZ' ? generatorForm.value.is_individualized : false,
      student_group_ids: generatorForm.value.mode === 'ONLINE_QUIZ' && generatorForm.value.is_individualized ? generatorForm.value.student_group_ids : []
    }
    
    const response = await generationAPI.generateResource(generateParams)

    // 將生成的題目列表轉換為 structure 格式
    const questions = response.data.questions || []
    const structure = convertQuestionsToStructure(questions, generatorForm.value.template_id || null)

    // 構建生成的資源對象
    generatedResource.value = {
      title: generatorForm.value.title.trim(),
      mode: generatorForm.value.mode,
      course: generatorForm.value.course_id || null,
      student_group_ids: generatorForm.value.mode === 'ONLINE_QUIZ' && generatorForm.value.is_individualized ? generatorForm.value.student_group_ids : [],
      settings: (() => {
        const modeKey = generatorForm.value.mode === 'HANDOUT' ? 'handout' : 'onlineQuiz'
        if (generatorForm.value.mode === 'HANDOUT') {
          return {
            handout: {
              paperSize: generatorForm.value.paperSize,
              orientation: 'portrait',
              outputFormats: ['question_only']
            }
          }
        } else {
          return {
            onlineQuiz: {
              timeLimit: 3600,
              autoGrade: true,
              showAnswerAfterSubmit: true,
              allowRetake: false,
              shuffleQuestions: false,
              shuffleOptions: false
            }
          }
        }
      })(),
      structure: structure,
      questions: questions // 保留原始題目列表用於預覽
    }
  } catch (error) {
    console.error('生成失敗：', error)
    if (error.response?.data) {
      const errorMsg = typeof error.response.data === 'string' 
        ? error.response.data 
        : JSON.stringify(error.response.data)
      alert(`生成失敗：${errorMsg}`)
    } else {
      alert('生成失敗，請稍後再試')
    }
  } finally {
    generating.value = false
  }
}

// 儲存生成的資源
const saveGeneratedResource = async () => {
  if (!generatedResource.value) return

  savingGenerated.value = true
  try {
    const payload = {
      title: generatedResource.value.title,
      mode: generatedResource.value.mode,
      course: generatedResource.value.course,
      student_group_ids: generatedResource.value.student_group_ids,
      settings: generatedResource.value.settings,
      structure: generatedResource.value.structure
    }

    const response = await learningResourceAPI.create(payload)
    alert('儲存成功！')
    generatedResource.value = null
    // 重置表單
    generatorForm.value = {
      title: '',
      mode: 'HANDOUT',
      course_id: '',
      paperSize: 'A4',
      template_id: '',
      is_individualized: false,
      student_group_ids: []
    }
  } catch (error) {
    console.error('儲存失敗：', error)
    if (error.response?.data) {
      const errorMsg = typeof error.response.data === 'string' 
        ? error.response.data 
        : JSON.stringify(error.response.data)
      alert(`儲存失敗：${errorMsg}`)
    } else {
      alert('儲存失敗，請稍後再試')
    }
  } finally {
    savingGenerated.value = false
  }
}

// 在編輯器中開啟生成的資源
const openInEditor = async () => {
  if (!generatedResource.value) return

  // 先儲存資源
  savingGenerated.value = true
  try {
    const payload = {
      title: generatedResource.value.title,
      mode: generatedResource.value.mode,
      course: generatedResource.value.course,
      student_group_ids: generatedResource.value.student_group_ids,
      settings: generatedResource.value.settings,
      structure: generatedResource.value.structure
    }

    const response = await learningResourceAPI.create(payload)
    // 跳轉到編輯器
    router.push(`/resources/edit/${response.data.resource_id}`)
  } catch (error) {
    console.error('儲存失敗：', error)
    alert('儲存失敗，無法開啟編輯器')
  } finally {
    savingGenerated.value = false
  }
}

onMounted(() => {
  fetchCourses()
  fetchStudentGroups()
  fetchTemplates()
})
</script>
