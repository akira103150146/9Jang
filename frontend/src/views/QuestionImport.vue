<template>
  <div class="min-h-screen bg-slate-50">
    <div class="max-w-4xl mx-auto p-6">
      <!-- 頂部工具列 -->
      <header class="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm mb-6 rounded-lg">
        <div class="flex items-center gap-4">
          <button @click="goBack" class="text-slate-500 hover:text-indigo-600 transition-colors" title="返回">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div class="flex flex-col">
            <h1 class="text-lg font-bold text-slate-800 leading-tight">
              匯入題目
            </h1>
            <p class="text-sm text-slate-500 mt-1">從 Word 檔案（.docx 或 .doc）匯入題目到題庫</p>
          </div>
        </div>
      </header>

      <!-- 表單內容 -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-6">
        <!-- 檔案上傳區域 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">
            選擇 Word 檔案 <span class="text-red-500">*</span>
          </label>
          <div
            @drop.prevent="handleDrop"
            @dragover.prevent="dragover = true"
            @dragleave.prevent="dragover = false"
            :class="[
              'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
              dragover ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300',
              selectedFile ? 'bg-slate-50' : 'bg-white'
            ]"
          >
            <input
              ref="fileInput"
              type="file"
              accept=".docx,.doc"
              @change="handleFileSelect"
              class="hidden"
            />
            <div v-if="!selectedFile" class="space-y-4">
              <svg class="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <div>
                <button
                  @click="$refs.fileInput.click()"
                  class="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  點擊選擇檔案
                </button>
                <span class="text-slate-500"> 或拖放檔案到此處</span>
              </div>
              <p class="text-xs text-slate-400">支援 .docx 和 .doc 格式</p>
            </div>
            <div v-else class="space-y-2">
              <div class="flex items-center justify-center gap-2">
                <svg class="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="text-left">
                  <p class="font-medium text-slate-900">{{ selectedFile.name }}</p>
                  <p class="text-xs text-slate-500">{{ formatFileSize(selectedFile.size) }}</p>
                </div>
              </div>
              <button
                @click="removeFile"
                class="text-sm text-red-600 hover:text-red-700"
              >
                移除檔案
              </button>
            </div>
          </div>
        </div>

        <!-- 匯入參數表單 -->
        <div class="space-y-4 border-t border-slate-200 pt-6">
          <h3 class="text-sm font-semibold text-slate-700 mb-4">匯入設定</h3>

          <!-- 科目 -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">
              科目 <span class="text-red-500">*</span>
            </label>
            <select
              v-model="importParams.subject_id"
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

          <!-- 年級 -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">
              適用年級 <span class="text-red-500">*</span>
            </label>
            <select
              v-model="importParams.level"
              required
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">請選擇</option>
              <option value="JHS">國中</option>
              <option value="SHS">高中</option>
              <option value="VCS">高職</option>
            </select>
          </div>

          <!-- 章節 -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">
              章節/單元 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="importParams.chapter"
              type="text"
              required
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="例如：向量與空間"
            />
          </div>
        </div>

        <!-- 操作按鈕 -->
        <div v-if="!showPreview" class="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            @click="goBack"
            class="px-5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            取消
          </button>
          <button
            @click="previewQuestions"
            :disabled="!canImport || previewing"
            class="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ previewing ? '解析中...' : '預覽題目' }}
          </button>
        </div>

        <!-- 預覽區域 -->
        <div v-if="showPreview" class="border-t border-slate-200 pt-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-slate-700">
              題目預覽（共 {{ previewData.questions?.length || 0 }} 題）
            </h3>
            <button
              @click="cancelPreview"
              class="text-sm text-slate-600 hover:text-slate-800"
            >
              返回修改
            </button>
          </div>

          <!-- 錯誤提示 -->
          <div v-if="previewData.errors && previewData.errors.length > 0" class="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p class="text-sm font-medium text-amber-800 mb-2">解析警告：</p>
            <ul class="list-disc list-inside text-xs text-amber-700 space-y-1">
              <li v-for="(error, index) in previewData.errors" :key="index">{{ error }}</li>
            </ul>
          </div>

          <!-- 題目列表 -->
          <div class="space-y-4 max-h-[600px] overflow-y-auto">
            <div
              v-for="(question, index) in previewData.questions"
              :key="index"
              class="border border-slate-200 rounded-lg p-4 bg-white"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold text-indigo-600">題目 {{ index + 1 }}</span>
                  <span v-if="question.question_number" class="text-xs text-slate-500">
                    （題號：{{ question.question_number }}）
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <span v-if="question.origin" class="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    出處：{{ question.origin }}
                  </span>
                  <span v-if="question.origin_detail" class="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    題源：{{ question.origin_detail }}
                  </span>
                  <span class="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    難度：{{ question.difficulty }}/5
                  </span>
                </div>
              </div>

              <!-- 題目內容 -->
              <div class="mb-3">
                <p class="text-xs font-semibold text-slate-500 mb-1">題目內容：</p>
                <div
                  class="text-sm text-slate-700 bg-slate-50 rounded p-3 markdown-preview"
                  v-html="renderMarkdown(question.content)"
                ></div>
              </div>

              <!-- 答案 -->
              <div>
                <p class="text-xs font-semibold text-slate-500 mb-1">答案與解析：</p>
                <div
                  class="text-sm text-slate-700 bg-slate-50 rounded p-3 markdown-preview"
                  v-html="renderMarkdown(question.correct_answer)"
                ></div>
              </div>
            </div>
          </div>

          <!-- 確認匯入按鈕 -->
          <div class="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              @click="cancelPreview"
              class="px-5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              取消
            </button>
            <button
              @click="confirmImport"
              :disabled="importing"
              class="px-5 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ importing ? '匯入中...' : `確認匯入 ${previewData.questions?.length || 0} 題` }}
            </button>
          </div>
        </div>

        <!-- 匯入結果 -->
        <div v-if="importResult" class="border-t border-slate-200 pt-6 space-y-4">
          <div
            :class="[
              'p-4 rounded-lg',
              importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            ]"
          >
            <div class="flex items-start gap-3">
              <svg
                v-if="importResult.success"
                class="h-5 w-5 text-green-600 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg
                v-else
                class="h-5 w-5 text-red-600 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="flex-1">
                <p
                  :class="[
                    'font-medium mb-2',
                    importResult.success ? 'text-green-800' : 'text-red-800'
                  ]"
                >
                  {{ importResult.success ? '匯入完成！' : '匯入失敗' }}
                </p>
                <div v-if="importResult.success" class="text-sm text-green-700 space-y-1">
                  <p>成功匯入：{{ importResult.created_count }} 題</p>
                  <p v-if="importResult.failed_count > 0">失敗：{{ importResult.failed_count }} 題</p>
                </div>
                <div v-else class="text-sm text-red-700">
                  <p>{{ importResult.error }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 成功後返回按鈕 -->
          <div v-if="importResult.success" class="flex justify-end">
            <button
              @click="router.push({ path: '/questions', query: { tab: route.query.returnTab || 'questions' } })"
              class="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              返回題庫
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { questionBankAPI, subjectAPI } from '../services/api'
import { useMarkdownRenderer } from '../composables/useMarkdownRenderer'

const router = useRouter()
const { renderMarkdownWithLatex } = useMarkdownRenderer()

const selectedFile = ref(null)
const dragover = ref(false)
const previewing = ref(false)
const importing = ref(false)
const showPreview = ref(false)
const previewData = ref(null)
const importResult = ref(null)
const subjects = ref([])

const importParams = ref({
  subject_id: '',
  level: '',
  chapter: ''
})

const canImport = computed(() => {
  return selectedFile.value &&
    importParams.value.subject_id &&
    importParams.value.level &&
    importParams.value.chapter
})

// 渲染 Markdown
const renderMarkdown = (text) => {
  if (!text) return ''
  return renderMarkdownWithLatex(text)
}

// 返回上一頁
const goBack = () => {
  // 檢查是否有 returnTab 查詢參數來決定返回哪個 tab
  const returnTab = route.query.returnTab || 'questions'
  
  // 總是跳轉到題庫頁面並帶上 tab 參數，確保正確切換到對應的 tab
  router.push({ path: '/questions', query: { tab: returnTab } })
}

// 處理檔案選擇
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    validateAndSetFile(file)
  }
}

// 處理拖放
const handleDrop = (event) => {
  dragover.value = false
  const file = event.dataTransfer.files[0]
  if (file) {
    validateAndSetFile(file)
  }
}

// 驗證並設置檔案
const validateAndSetFile = (file) => {
  // 驗證檔案類型
  if (!file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
    alert('請選擇 .docx 或 .doc 格式的檔案')
    return
  }

  selectedFile.value = file
  importResult.value = null
  showPreview.value = false
  previewData.value = null
}

// 移除檔案
const removeFile = () => {
  selectedFile.value = null
  importResult.value = null
  showPreview.value = false
  previewData.value = null
  if (document.querySelector('input[type="file"]')) {
    document.querySelector('input[type="file"]').value = ''
  }
}

// 格式化檔案大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// 預覽題目
const previewQuestions = async () => {
  if (!canImport.value) {
    alert('請填寫所有必填欄位並選擇檔案')
    return
  }

  previewing.value = true
  previewData.value = null
  showPreview.value = false

  try {
    // 創建 FormData
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('subject_id', importParams.value.subject_id)
    formData.append('level', importParams.value.level)
    formData.append('chapter', importParams.value.chapter)

    // 發送預覽請求
    const response = await questionBankAPI.previewFromWord(formData)
    
    if (response.data.success) {
      previewData.value = response.data
      showPreview.value = true
    } else {
      alert(response.data.error || '預覽失敗')
    }
  } catch (error) {
    alert(error.response?.data?.error || error.message || '預覽失敗，請稍後再試')
  } finally {
    previewing.value = false
  }
}

// 取消預覽
const cancelPreview = () => {
  showPreview.value = false
  previewData.value = null
}

// 確認匯入
const confirmImport = async () => {
  if (!previewData.value || !previewData.value.questions) {
    alert('沒有可匯入的題目')
    return
  }

  importing.value = true
  importResult.value = null

  try {
    // 創建 FormData
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('subject_id', importParams.value.subject_id)
    formData.append('level', importParams.value.level)
    formData.append('chapter', importParams.value.chapter)

    // 發送匯入請求
    const response = await questionBankAPI.importFromWord(formData)

    importResult.value = {
      success: true,
      ...response.data
    }
  } catch (error) {
    importResult.value = {
      success: false,
      error: error.response?.data?.error || error.message || '匯入失敗，請稍後再試',
      errors: error.response?.data?.errors || []
    }
  } finally {
    importing.value = false
  }
}

// 載入科目列表
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

onMounted(() => {
  fetchSubjects()
})
</script>

<style scoped>
/* 自訂樣式 */
</style>
