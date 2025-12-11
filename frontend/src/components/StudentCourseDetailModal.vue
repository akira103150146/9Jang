<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="close"></div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                {{ course?.course_name }} - 課程內容
              </h3>
              
              <!-- Tabs -->
              <div class="mt-4 border-b border-gray-200">
                <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                  <a 
                    v-for="tab in tabs" 
                    :key="tab.id"
                    href="#"
                    class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                    :class="[
                      currentTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    ]"
                    @click.prevent="currentTab = tab.id"
                  >
                    {{ tab.name }}
                    <span v-if="tab.count" class="ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {{ tab.count }}
                    </span>
                  </a>
                </nav>
              </div>

              <!-- Content -->
              <div class="mt-4 min-h-[400px]">
                <!-- Loading State -->
                <div v-if="loading" class="flex justify-center items-center h-64">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>

                <!-- Handouts Tab -->
                <div v-else-if="currentTab === 'materials'" class="space-y-4">
                  <div v-if="materials.length === 0" class="text-center text-gray-500 py-8">
                    暫無講義資料
                  </div>
                  <div v-for="material in materials" :key="material.material_id" class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div class="flex justify-between items-start">
                      <div>
                        <h4 class="text-lg font-medium text-gray-900">{{ material.title }}</h4>
                        <p class="text-sm text-gray-500 mt-1">上傳時間：{{ formatDate(material.created_at) }}</p>
                      </div>
                      <button @click="viewMaterial(material)" class="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-indigo-100">
                        查看內容
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Quizzes Tab -->
                <div v-else-if="currentTab === 'quizzes'" class="space-y-4">
                  <div v-if="quizzes.length === 0" class="text-center text-gray-500 py-8">
                    暫無測驗資料
                  </div>
                  <div v-for="quiz in quizzes" :key="quiz.quiz_id" class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div class="flex justify-between items-start">
                      <div>
                        <h4 class="text-lg font-medium text-gray-900">{{ quiz.title }}</h4>
                        <p class="text-sm text-gray-500 mt-1">題目數量：{{ quiz.questions_count }}</p>
                      </div>
                      <button @click="startAssessment('quiz', quiz)" class="bg-green-50 text-green-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-green-100">
                        開始測驗
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Exams Tab -->
                <div v-else-if="currentTab === 'exams'" class="space-y-4">
                  <div v-if="exams.length === 0" class="text-center text-gray-500 py-8">
                    暫無考卷資料
                  </div>
                  <div v-for="exam in exams" :key="exam.exam_id" class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div class="flex justify-between items-start">
                      <div>
                        <h4 class="text-lg font-medium text-gray-900">{{ exam.title }}</h4>
                        <p class="text-sm text-gray-500 mt-1">
                          <span v-if="exam.available_from">開放時間：{{ formatDate(exam.available_from) }}</span>
                          <span v-if="exam.available_until"> ~ {{ formatDate(exam.available_until) }}</span>
                        </p>
                      </div>
                      <button 
                        @click="startAssessment('exam', exam)" 
                        class="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        :disabled="!isExamAvailable(exam)"
                      >
                        {{ getExamStatusText(exam) }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" @click="close">
            關閉
          </button>
        </div>
      </div>
    </div>

    <!-- Assessment Runner Modal -->
    <AssessmentRunner
      v-if="currentAssessment"
      :assessment-type="assessmentType"
      :assessment-data="currentAssessment"
      @close="closeAssessment"
      @submit="handleAssessmentSubmit"
    />

    <!-- Material View Modal -->
    <div v-if="currentMaterial" class="fixed inset-0 z-[60] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="currentMaterial = null"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">{{ currentMaterial.title }}</h3>
            <div class="prose max-w-none overflow-y-auto max-h-[60vh]">
              <!-- We can use a markdown renderer here later if needed, for now just pre-wrap -->
              <div class="whitespace-pre-wrap">{{ currentMaterial.content }}</div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" @click="currentMaterial = null">
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, watch, computed } from 'vue'
import { courseMaterialAPI, quizAPI, examAPI } from '../services/api'
import AssessmentRunner from './AssessmentRunner.vue'

export default {
  name: 'StudentCourseDetailModal',
  components: {
    AssessmentRunner
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    course: {
      type: Object,
      required: true
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const currentTab = ref('materials')
    const loading = ref(false)
    const materials = ref([])
    const quizzes = ref([])
    const exams = ref([])
    
    // Assessment State
    const currentAssessment = ref(null)
    const assessmentType = ref(null) // 'quiz' or 'exam'
    
    // Material View State
    const currentMaterial = ref(null)

    const tabs = computed(() => [
      { id: 'materials', name: '講義', count: materials.value.length },
      { id: 'quizzes', name: '隨堂測驗', count: quizzes.value.length },
      { id: 'exams', name: '考卷', count: exams.value.length },
    ])

    const fetchData = async () => {
      if (!props.course) return
      
      loading.value = true
      try {
        // Fetch materials
        const materialsRes = await courseMaterialAPI.getAll({ course_id: props.course.course_id })
        materials.value = materialsRes.data

        // Fetch quizzes
        const quizzesRes = await quizAPI.getAll({ course_id: props.course.course_id })
        quizzes.value = quizzesRes.data

        // Fetch exams
        const examsRes = await examAPI.getAll({ course_id: props.course.course_id })
        exams.value = examsRes.data
      } catch (error) {
        console.error('Error fetching course data:', error)
        // You might want to show a toast notification here
      } finally {
        loading.value = false
      }
    }

    watch(() => props.isOpen, (newVal) => {
      if (newVal) {
        fetchData()
      } else {
        // Reset state when closed
        materials.value = []
        quizzes.value = []
        exams.value = []
        currentTab.value = 'materials'
      }
    })

    const close = () => {
      emit('close')
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const viewMaterial = (material) => {
      currentMaterial.value = material
    }

    const startAssessment = (type, item) => {
      assessmentType.value = type
      currentAssessment.value = item
    }

    const closeAssessment = () => {
      currentAssessment.value = null
      assessmentType.value = null
    }

    const handleAssessmentSubmit = async (result) => {
      // Logic handled in AssessmentRunner, just refresh data or show success here if needed
      closeAssessment()
    }

    const isExamAvailable = (exam) => {
      const now = new Date()
      if (exam.available_from && new Date(exam.available_from) > now) return false
      if (exam.available_until && new Date(exam.available_until) < now) return false
      return true
    }

    const getExamStatusText = (exam) => {
      if (!isExamAvailable(exam)) return '非開放時間'
      return '開始考試'
    }

    return {
      currentTab,
      loading,
      materials,
      quizzes,
      exams,
      tabs,
      close,
      formatDate,
      currentMaterial,
      viewMaterial,
      currentAssessment,
      assessmentType,
      startAssessment,
      closeAssessment,
      handleAssessmentSubmit,
      isExamAvailable,
      getExamStatusText
    }
  }
}
</script>
