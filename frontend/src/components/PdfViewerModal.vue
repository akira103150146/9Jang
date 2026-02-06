<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-hidden" @click.self="close">
    <div class="flex items-center justify-center min-h-screen p-4">
      <div class="fixed inset-0 bg-black bg-opacity-75 transition-opacity" @click="close"></div>
      
      <div class="relative bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900">{{ pdf?.title }}</h3>
            <p v-if="pdf?.description" class="text-sm text-gray-500 mt-1">{{ pdf.description }}</p>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="pdf?.allow_download"
              @click="downloadPdf"
              class="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              下載 PDF
            </button>
            <button
              @click="close"
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <!-- PDF Viewer -->
        <div class="flex-1 overflow-hidden bg-gray-100">
          <div v-if="error" class="flex items-center justify-center h-full p-4">
            <div class="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p class="text-red-600 font-semibold mb-2">無法載入 PDF</p>
              <p class="text-gray-600 text-sm">{{ error }}</p>
            </div>
          </div>
          <iframe
            v-else-if="pdfUrl"
            :src="pdfUrl"
            class="w-full h-full"
            style="min-height: 600px;"
            @load="onIframeLoad"
            @error="onIframeError"
          />
          <div v-else class="flex items-center justify-center h-full">
            <div class="text-center">
              <svg class="animate-spin h-8 w-8 text-gray-400 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p class="text-gray-500">載入中...</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <div class="text-sm text-gray-500">
            檔案大小: {{ formatFileSize(pdf?.file_size || 0) }}
          </div>
          <button
            @click="close"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, type Ref } from 'vue'
import { coursePdfAPI, type CoursePdf } from '../services/api'
import { getToken } from '../services/api/token'
import { useToast } from '../composables/useToast'

interface Props {
  isOpen: boolean
  pdf: CoursePdf | null
  courseId: number
}

const props = defineProps<Props>()

interface Emits {
  (e: 'close'): void
}

const emit = defineEmits<Emits>()

const toast = useToast()
const pdfUrl: Ref<string> = ref('')
const error: Ref<string> = ref('')

const close = (): void => {
  // 清理 Blob URL 以釋放記憶體
  if (pdfUrl.value && pdfUrl.value.startsWith('blob:')) {
    window.URL.revokeObjectURL(pdfUrl.value)
  }
  emit('close')
  error.value = ''
  pdfUrl.value = ''
}

const downloadPdf = (): void => {
  if (!props.pdf) return
  const token = getToken()
  const downloadUrl = coursePdfAPI.getDownloadUrl(props.courseId, props.pdf.pdf_id)
  
  // 使用帶有 token 的方式下載
  fetch(downloadUrl, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`下載失敗: ${response.status}`)
      }
      return response.blob()
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = props.pdf?.title || 'document.pdf'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    })
    .catch(err => {
      console.error('下載 PDF 失敗:', err)
      toast.error('下載 PDF 失敗，請稍後再試')
    })
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const onIframeLoad = (): void => {
  // iframe 載入完成
  error.value = ''
}

const onIframeError = (): void => {
  error.value = '無法載入 PDF，請確認您有權限檢視此檔案'
  toast.error('無法載入 PDF')
}

const loadPdf = async (): Promise<void> => {
  if (!props.pdf) return
  
  error.value = ''
  pdfUrl.value = ''
  
  try {
    const token = getToken()
    const viewUrl = coursePdfAPI.getViewUrl(props.courseId, props.pdf.pdf_id)
    
    // 使用 fetch 下載 PDF，這樣可以在 header 中傳遞 token
    const response = await fetch(viewUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        error.value = '您尚未登入或登入已過期'
        toast.error('請重新登入')
      } else if (response.status === 403) {
        error.value = '您沒有權限檢視此 PDF'
        toast.error('沒有權限檢視此 PDF')
      } else {
        error.value = `無法載入 PDF (錯誤代碼: ${response.status})`
        toast.error('無法載入 PDF')
      }
      return
    }
    
    // 將 PDF 轉換為 Blob URL
    const blob = await response.blob()
    const blobUrl = window.URL.createObjectURL(blob)
    pdfUrl.value = blobUrl
  } catch (err) {
    console.error('載入 PDF 失敗:', err)
    error.value = '載入 PDF 時發生錯誤'
    toast.error('載入 PDF 失敗')
  }
}

watch(
  () => [props.isOpen, props.pdf],
  ([newIsOpen, newPdf]) => {
    if (newIsOpen && newPdf) {
      loadPdf()
    } else {
      // 清理 Blob URL
      if (pdfUrl.value && pdfUrl.value.startsWith('blob:')) {
        window.URL.revokeObjectURL(pdfUrl.value)
      }
      pdfUrl.value = ''
      error.value = ''
    }
  },
  { immediate: true }
)
</script>
