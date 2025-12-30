<template>
  <div class="fixed inset-0 z-[60] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="$emit('close')"></div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          
          <!-- Header -->
          <div class="border-b pb-4 mb-4 flex justify-between items-center">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              {{ assessmentTitle }}
            </h3>
            <div class="flex items-center space-x-4">
              <div v-if="!loading" class="text-sm text-gray-500">
                題號: {{ currentIndex + 1 }} / {{ questions.length }}
              </div>
              <button @click="$emit('close')" class="text-gray-400 hover:text-gray-500">
                <span class="sr-only">Close</span>
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>

          <!-- Empty State -->
          <div v-else-if="questions.length === 0" class="text-center py-12 text-gray-500">
            此測驗暫無題目
          </div>

          <!-- Question Content -->
          <div v-else class="space-y-6">
            <div class="prose max-w-none">
              <div class="whitespace-pre-wrap text-lg">{{ currentQuestion.content }}</div>
              <div v-if="currentQuestion.image_path" class="mt-4">
                 <img :src="getImageUrl(currentQuestion.image_path)" alt="Question Image" class="max-h-64 rounded-lg shadow-sm" />
              </div>
            </div>

            <!-- Answer Section -->
            <div class="bg-gray-50 p-6 rounded-lg space-y-6 border border-gray-200">
              <h4 class="font-medium text-gray-900 text-lg border-b border-gray-200 pb-2">作答區域</h4>
              
              <!-- Multiple Choice -->
              <div class="space-y-3">
                <label class="block text-sm font-medium text-gray-700">選擇題答案 (若為選擇題請選填)</label>
                <div class="flex flex-wrap gap-4">
                  <label v-for="opt in ['A', 'B', 'C', 'D', 'E']" :key="opt" class="inline-flex items-center p-3 border rounded-md hover:bg-white cursor-pointer transition-colors" :class="{'bg-indigo-50 border-indigo-300': answers[currentQuestion.question_id].answer_text === opt, 'bg-white border-gray-200': answers[currentQuestion.question_id].answer_text !== opt}">
                    <input type="radio" v-model="answers[currentQuestion.question_id].answer_text" :value="opt" class="form-radio h-5 w-5 text-indigo-600 focus:ring-indigo-500">
                    <span class="ml-2 font-medium text-gray-900">{{ opt }}</span>
                  </label>
                </div>
              </div>

              <!-- File Upload -->
              <div class="space-y-3">
                 <label class="block text-sm font-medium text-gray-700">上傳手寫/計算過程 (非選擇題或需附檔)</label>
                 <div class="flex items-center space-x-4">
                   <label class="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                     <span>選擇檔案</span>
                     <input type="file" @change="handleFileUpload($event, currentQuestion.question_id)" accept="image/*,.pdf" class="sr-only"/>
                   </label>
                   <span v-if="uploading[currentQuestion.question_id]" class="text-sm text-gray-500">
                     上傳中...
                   </span>
                   <span v-else-if="answers[currentQuestion.question_id].image_path" class="flex items-center text-green-600 text-sm font-medium">
                     <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> 
                     已上傳檔案
                   </span>
                   <span v-else class="text-sm text-gray-400">未選擇檔案</span>
                 </div>
              </div>
            </div>

            <!-- Navigation -->
            <div class="flex justify-between pt-6 border-t border-gray-200">
              <button 
                @click="prevQuestion" 
                :disabled="currentIndex === 0"
                class="bg-white py-2 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一題
              </button>

              <div class="flex space-x-3">
                <button 
                  v-if="currentIndex < questions.length - 1"
                  @click="nextQuestion" 
                  class="bg-indigo-600 py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  下一題
                </button>

                <button 
                  v-else
                  @click="submitAssessment" 
                  :disabled="submitting"
                  class="bg-green-600 py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 flex items-center"
                >
                  <svg v-if="submitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  提交試卷
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { learningResourceAPI, uploadImageAPI, getBackendBaseURL } from '../services/api'

export default {
  name: 'AssessmentRunner',
  props: {
    assessmentType: {
      type: String,
      required: true,
      validator: (value) => ['quiz', 'exam'].includes(value)
    },
    assessmentData: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'submit'],
  setup(props, { emit }) {
    const loading = ref(true)
    const submitting = ref(false)
    const questions = ref([])
    const currentIndex = ref(0)
    const answers = ref({})
    const uploading = ref({})

    const assessmentTitle = computed(() => {
      return props.assessmentData?.title || (props.assessmentType === 'quiz' ? '測驗' : '考卷')
    })

    const currentQuestion = computed(() => {
      return questions.value[currentIndex.value]
    })

    const initAnswers = (qs) => {
      const initialAnswers = {}
      qs.forEach(q => {
        initialAnswers[q.question_id] = {
          question_id: q.question_id,
          answer_text: '',
          image_path: ''
        }
      })
      answers.value = initialAnswers
    }

    const fetchDetails = async () => {
      loading.value = true
      try {
        let res
        // 統一使用 learningResourceAPI
        const resourceId = props.assessmentType === 'quiz' ? props.assessmentData.quiz_id : props.assessmentData.exam_id
        res = await learningResourceAPI.getById(resourceId)
        questions.value = res.data.questions || []
        initAnswers(questions.value)
      } catch (error) {
        console.error('Error fetching assessment details:', error)
        alert('無法載入題目，請稍後再試')
        emit('close')
      } finally {
        loading.value = false
      }
    }

    const getImageUrl = (path) => {
      if (!path) return null
      if (path.startsWith('http')) return path
      // Handle path that might or might not start with /media/
      const cleanPath = path.startsWith('/') ? path.slice(1) : path
      return `${getBackendBaseURL()}/${cleanPath.startsWith('media/') ? cleanPath : 'media/' + cleanPath}`
    }

    const prevQuestion = () => {
      if (currentIndex.value > 0) {
        currentIndex.value--
      }
    }

    const nextQuestion = () => {
      if (currentIndex.value < questions.value.length - 1) {
        currentIndex.value++
      }
    }

    const handleFileUpload = async (event, questionId) => {
      const file = event.target.files[0]
      if (!file) return

      uploading.value = { ...uploading.value, [questionId]: true }
      try {
        const res = await uploadImageAPI.upload(file)
        answers.value[questionId].image_path = res.data.image_path
      } catch (error) {
        console.error('Upload failed:', error)
        alert('上傳失敗，請重試')
      } finally {
        uploading.value = { ...uploading.value, [questionId]: false }
      }
    }

    const submitAssessment = async () => {
      if (!confirm('確定要提交試卷嗎？提交後無法修改。')) return

      submitting.value = true
      try {
        const payload = {
          answers: Object.values(answers.value)
        }
        
        // 統一使用 learningResourceAPI
        const resourceId = props.assessmentType === 'quiz' ? props.assessmentData.quiz_id : props.assessmentData.exam_id
        await learningResourceAPI.submit(resourceId, payload)
        
        alert('提交成功！')
        emit('submit')
      } catch (error) {
        console.error('Submission failed:', error)
        alert('提交失敗：' + (error.response?.data?.detail || '請稍後再試'))
      } finally {
        submitting.value = false
      }
    }

    onMounted(() => {
      fetchDetails()
    })

    return {
      loading,
      submitting,
      questions,
      currentIndex,
      currentQuestion,
      answers,
      assessmentTitle,
      getImageUrl,
      prevQuestion,
      nextQuestion,
      handleFileUpload,
      submitAssessment,
      uploading
    }
  }
}
</script>


