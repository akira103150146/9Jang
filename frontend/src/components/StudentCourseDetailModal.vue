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
                {{ course?.course_name }} - 學習資源
              </h3>
              
              <!-- Content -->
              <div class="mt-4 min-h-[400px]">
                <!-- Loading State -->
                <div v-if="loading" class="flex justify-center items-center h-64">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>

                <!-- All Resources -->
                <div v-else class="space-y-6">
                  <!-- PDF 講義區域 -->
                  <div v-if="pdfs.length > 0">
                    <h4 class="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                      </svg>
                      PDF 講義
                    </h4>
                    <div class="space-y-3">
                      <div v-for="pdf in pdfs" :key="pdf.pdf_id" class="border border-red-200 rounded-lg p-4 bg-red-50 hover:shadow-md transition-shadow">
                        <div class="flex justify-between items-start">
                          <div class="flex-1">
                            <div class="flex items-center gap-2">
                              <h5 class="text-lg font-medium text-gray-900">{{ pdf.title }}</h5>
                              <span class="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                PDF
                              </span>
                              <span v-if="pdf.allow_download" class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                可下載
                              </span>
                            </div>
                            <p v-if="pdf.description" class="text-sm text-gray-600 mt-1">
                              {{ pdf.description }}
                            </p>
                            <p class="text-sm text-gray-500 mt-1">
                              檔案大小：{{ (pdf.file_size / 1024 / 1024).toFixed(2) }} MB
                            </p>
                          </div>
                          <button @click="viewPdf(pdf)" class="bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600 flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            查看 PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 學習資源區域 -->
                  <div v-if="allResources.length > 0">
                    <h4 class="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <svg class="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                      </svg>
                      學習資源
                    </h4>
                    <div class="space-y-3">
                      <div v-for="resource in allResources" :key="resource.resource_id" class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div class="flex justify-between items-start">
                          <div class="flex-1">
                            <div class="flex items-center gap-2">
                              <h5 class="text-lg font-medium text-gray-900">{{ resource.title }}</h5>
                              <span class="px-2 py-1 text-xs font-medium rounded-full" :class="getModeClass(resource.mode)">
                                {{ getModeLabel(resource.mode) }}
                              </span>
                            </div>
                            <p class="text-sm text-gray-500 mt-1">
                              上傳時間：{{ formatDate(resource.created_at) }}
                            </p>
                          </div>
                          <button @click="viewResource(resource)" class="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-100">
                            查看內容
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 空狀態 -->
                  <div v-if="pdfs.length === 0 && allResources.length === 0" class="text-center text-gray-500 py-8">
                    <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p class="text-lg font-medium">暫無學習資源</p>
                    <p class="text-sm text-gray-400 mt-1">老師尚未上傳任何講義或資源</p>
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

    <!-- Material View Modal - 手機優化版本 -->
    <div v-if="currentMaterial" class="fixed inset-0 z-[60] bg-white flex flex-col">
      <!-- 頂部導航欄 - 固定在頂部 -->
      <div class="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div class="flex items-center justify-between px-4 py-3">
          <button @click="currentMaterial = null" class="flex items-center text-gray-600 hover:text-gray-900">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span class="ml-1 text-sm font-medium">返回</span>
          </button>
          <h3 class="text-base font-semibold text-gray-900 truncate max-w-[50%]">
            {{ currentMaterial.title }}
          </h3>
          <div class="w-16"></div> <!-- 佔位元素，保持標題居中 -->
        </div>
        
        <!-- 顯示模式選擇器 - 手機友好的橫向滑動選項 -->
        <div class="px-4 pb-3 overflow-x-auto scrollbar-hide">
          <div class="flex gap-2 min-w-max">
            <button
              v-for="mode in displayModes"
              :key="mode.value"
              @click="currentDisplayMode = mode.value"
              class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
              :class="currentDisplayMode === mode.value 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            >
              {{ mode.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- 內容區域 - 可滾動 -->
      <div class="flex-1 overflow-y-auto bg-white">
        <div class="px-4 py-6 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <!-- 使用 BlockEditor 的只讀模式顯示內容 -->
          <BlockEditor
            v-if="currentMaterial.tiptap_structure"
            :model-value="currentMaterial.tiptap_structure"
            :readonly="true"
            :questions="[]"
            :templates="[]"
          />
          <div v-else class="text-gray-500 text-center py-8">
            暫無內容
          </div>
        </div>
      </div>

      <!-- 底部操作欄（可選） - 固定在底部 -->
      <div class="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 shadow-lg">
        <div class="flex gap-2">
          <button
            @click="toggleFullscreen"
            class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            全螢幕
          </button>
          <button
            @click="handlePrint"
            class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            列印/下載
          </button>
        </div>
      </div>
    </div>

    <!-- PDF 檢視器 Modal -->
    <PdfViewerModal
      :is-open="showPdfViewerModal"
      :pdf="selectedPdf"
      :course-id="course?.course_id || course?.id"
      @close="closePdfViewer"
    />

  </div>
</template>

<script>
import { ref, watch, provide } from 'vue'
import { learningResourceAPI, coursePdfAPI } from '../services/api'
import BlockEditor from './BlockEditor/BlockEditor.vue'
import PdfViewerModal from './PdfViewerModal.vue'
import { useEditorEventsProvider } from '../composables/useEditorEvents'

export default {
  name: 'StudentCourseDetailModal',
  components: {
    BlockEditor,
    PdfViewerModal
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
    // 初始化編輯器事件提供者（BlockEditor 需要）
    useEditorEventsProvider()
    
    const loading = ref(false)
    const allResources = ref([])
    const pdfs = ref([])
    
    // Material View State
    const currentMaterial = ref(null)
    
    // PDF Viewer State
    const showPdfViewerModal = ref(false)
    const selectedPdf = ref(null)
    
    // 顯示模式選項
    const displayModes = [
      { value: 'question-only', label: '📝 純題目' },
      { value: 'with-answer', label: '✅ 題目+答案' },
      { value: 'with-solution', label: '💡 題目+詳解' },
      { value: 'with-all', label: '📚 完整內容' }
    ]
    
    // 當前顯示模式
    const currentDisplayMode = ref('question-only')
    
    // 提供給 BlockEditor 和 QuestionBlock 使用
    provide('printMode', currentDisplayMode)

    const fetchData = async () => {
      if (!props.course) return
      
      loading.value = true
      try {
        const courseId = props.course.course_id || props.course.id
        
        // 獲取該課程的所有學習資源
        const resourcesRes = await learningResourceAPI.getAll({ course: courseId })
        const resourcesData = resourcesRes.data.results || resourcesRes.data
        allResources.value = Array.isArray(resourcesData) ? resourcesData : []
        
        // 獲取該課程的 PDF 講義
        try {
          const pdfsRes = await coursePdfAPI.getAll(courseId)
          pdfs.value = Array.isArray(pdfsRes.data) ? pdfsRes.data : []
        } catch (error) {
          console.error('Error fetching PDFs:', error)
          pdfs.value = []
        }
      } catch (error) {
        console.error('Error fetching course data:', error)
        allResources.value = []
      } finally {
        loading.value = false
      }
    }

    watch(() => props.isOpen, (newVal) => {
      if (newVal) {
        fetchData()
      } else {
        // Reset state when closed
        allResources.value = []
        pdfs.value = []
      }
    }, { immediate: true })

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

    const viewResource = (resource) => {
      currentMaterial.value = resource
      // 重置顯示模式為純題目
      currentDisplayMode.value = 'question-only'
    }
    
    // 全螢幕切換
    const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        }
      }
    }
    
    // 列印功能
    const handlePrint = () => {
      window.print()
    }

    const getModeLabel = (mode) => {
      const labels = {
        'HANDOUT': '講義',
        'ONLINE_QUIZ': '線上測驗',
        'LEETCODE': '程式題',
        'LISTENING_TEST': '聽力測驗',
        'FLASHCARD': '單字卡'
      }
      return labels[mode] || mode
    }

    const getModeClass = (mode) => {
      const classes = {
        'HANDOUT': 'bg-blue-100 text-blue-800',
        'ONLINE_QUIZ': 'bg-green-100 text-green-800',
        'LEETCODE': 'bg-purple-100 text-purple-800',
        'LISTENING_TEST': 'bg-yellow-100 text-yellow-800',
        'FLASHCARD': 'bg-pink-100 text-pink-800'
      }
      return classes[mode] || 'bg-gray-100 text-gray-800'
    }
    
    // PDF 相關操作
    const viewPdf = (pdf) => {
      selectedPdf.value = pdf
      showPdfViewerModal.value = true
    }
    
    const closePdfViewer = () => {
      showPdfViewerModal.value = false
      selectedPdf.value = null
    }

    return {
      loading,
      allResources,
      pdfs,
      close,
      formatDate,
      currentMaterial,
      displayModes,
      currentDisplayMode,
      viewResource,
      getModeLabel,
      getModeClass,
      toggleFullscreen,
      handlePrint,
      showPdfViewerModal,
      selectedPdf,
      viewPdf,
      closePdfViewer
    }
  }
}
</script>

<style scoped>
/* 隱藏橫向滾動條但保持滾動功能 */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* 列印樣式 */
@media print {
  /* 隱藏頂部導航和底部操作欄 */
  .sticky {
    position: static !important;
  }
  
  /* 隱藏返回按鈕、模式選擇器、底部操作欄 */
  button,
  .border-b,
  .border-t,
  .shadow-sm,
  .shadow-lg {
    display: none !important;
  }
  
  /* 只顯示內容 */
  .flex-1.overflow-y-auto {
    overflow: visible !important;
  }
  
  /* 確保內容適合頁面 */
  @page {
    margin: 20mm;
  }
  
  /* 題目區塊樣式 */
  :deep(.question-display) {
    break-inside: avoid;
    page-break-inside: avoid;
    margin-bottom: 1.5rem !important;
  }
  
  /* 答案和詳解區域 */
  :deep(.answer-section),
  :deep(.solution-section) {
    break-inside: avoid;
    page-break-inside: avoid;
    background: white !important;
    border: none !important;
    border-left: none !important;
    padding: 0.75rem 0 !important;
    margin-top: 0.75rem !important;
    margin-bottom: 0.5rem !important;
  }
  
  :deep(.answer-label),
  :deep(.solution-label) {
    font-size: 0.875rem !important;
    font-weight: 700 !important;
    color: black !important;
    margin-bottom: 0.5rem !important;
    display: block !important;
  }
  
  :deep(.answer-content),
  :deep(.solution-content) {
    font-size: 0.875rem !important;
    color: black !important;
    line-height: 1.6 !important;
    margin-top: 0.25rem !important;
  }
  
  /* 確保題目內容有適當間距 */
  :deep(.question-text) {
    margin-bottom: 0.5rem !important;
    line-height: 1.6 !important;
  }
  
  :deep(.question-content) {
    line-height: 1.6 !important;
  }
  
  /* 確保 KaTeX 數學公式正確顯示 */
  :deep(.katex),
  :deep(.katex *) {
    color: black !important;
  }
  
  /* 確保圖片不會太大 */
  :deep(img) {
    max-width: 100% !important;
    height: auto !important;
    page-break-inside: avoid !important;
  }
}
</style>
