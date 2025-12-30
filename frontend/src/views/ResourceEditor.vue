<template>
  <div class="flex h-screen bg-slate-50 overflow-hidden">
    <!-- 左側邊欄：設定與資源庫 -->
    <aside class="w-80 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col shadow-lg z-10 transition-all duration-300" :class="{ '-ml-80': !sidebarOpen }">
      <div class="p-4 border-b border-slate-100 flex items-center justify-between">
        <h2 class="font-bold text-slate-800">資源編輯器</h2>
        <button @click="sidebarOpen = false" class="text-slate-400 hover:text-slate-600 lg:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- 標題列 -->
      <div class="border-b border-slate-100 py-3 text-center">
        <span class="text-sm font-medium text-slate-600">{{ viewMode ? '唯讀模式' : '文件設定' }}</span>
      </div>

      <div class="flex-1 overflow-y-auto p-4">
        <!-- 設定面板 -->
        <div class="space-y-6">
          <!-- 基本資訊 -->
          <div class="space-y-3">
            <label class="block text-sm font-medium text-slate-700">標題</label>
            <input v-model="resource.title" type="text" :disabled="viewMode" class="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed" placeholder="輸入文件標題...">
          </div>

          <!-- 模式選擇 -->
          <div class="space-y-3">
            <label class="block text-sm font-medium text-slate-700">模式</label>
            <select v-model="resource.mode" :disabled="viewMode" class="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed">
              <option value="HANDOUT">講義模式</option>
              <option value="ONLINE_QUIZ">線上測驗模式</option>
            </select>
          </div>

          <!-- 課程綁定（多選） -->
          <div class="space-y-3">
            <label class="block text-sm font-medium text-slate-700">綁定課程（可多選）</label>
            <div class="space-y-2 max-h-40 overflow-y-auto border border-slate-200 rounded p-2">
              <div v-for="c in courses" :key="c.course_id" class="flex items-center">
                <input
                  type="checkbox"
                  :id="`course-${c.course_id}`"
                  :value="c.course_id"
                  v-model="resource.course_ids"
                  :disabled="viewMode"
                  class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <label :for="`course-${c.course_id}`" class="ml-2 text-sm text-slate-700">
                  {{ c.course_name }}
                </label>
              </div>
              <div v-if="courses.length === 0" class="text-sm text-slate-500 italic">
                沒有可用的課程
              </div>
            </div>
          </div>

          <!-- 學生標籤 -->
          <div class="space-y-3">
            <label class="block text-sm font-medium text-slate-700">可見學生標籤</label>
            <div class="space-y-2 max-h-40 overflow-y-auto border border-slate-200 rounded p-2">
              <div v-for="g in studentGroups" :key="g.group_id" class="flex items-center">
                <input
                  type="checkbox"
                  :id="`group-${g.group_id}`"
                  :value="g.group_id"
                  v-model="resource.student_group_ids"
                  :disabled="viewMode"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                <label :for="`group-${g.group_id}`" class="ml-2 block text-sm text-gray-900">
                  {{ g.name }}
                </label>
              </div>
            </div>
          </div>

          <!-- 圖片上傳 -->
          <div class="space-y-3">
            <label class="block text-sm font-medium text-slate-700">圖片管理</label>
            <button 
              @click="openImageFolderUpload" 
              class="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              :disabled="viewMode || uploadingImages"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              {{ uploadingImages ? '上傳中...' : '上傳圖片資料夾' }}
              <span v-if="imageMappings.size > 0" class="ml-2 px-2 py-0.5 bg-white text-indigo-600 rounded-full text-xs font-semibold">
                {{ imageMappings.size }}
              </span>
            </button>
            <p v-if="imageMappings.size > 0" class="text-xs text-slate-500">
              已上傳 {{ imageMappings.size }} 張圖片
            </p>
            <div v-if="imageMappings.size > 0" class="flex gap-2">
              <button 
                @click="replaceAllImages" 
                class="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                :disabled="viewMode || replacingImages"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {{ replacingImages ? '替換中...' : '替換' }}
              </button>
              <button 
                @click="clearImageMappings" 
                class="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center"
                :disabled="viewMode"
                title="清空當前文件的圖片映射表"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <input
              ref="imageFolderInput"
              type="file"
              multiple
              accept="image/png,image/jpeg,image/jpg,image/gif"
              @change="handleImageFolderUpload"
              style="display: none"
            />
          </div>

          <!-- 列印浮水印設定 -->
          <div class="space-y-3">
            <label class="block text-sm font-medium text-slate-700">列印浮水印</label>
            <div class="space-y-2">
              <!-- 啟用浮水印 -->
              <div class="flex items-center">
                <input
                  type="checkbox"
                  id="enable-watermark"
                  v-model="watermarkEnabled"
                  :disabled="viewMode"
                  class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <label for="enable-watermark" class="ml-2 text-sm text-slate-700">
                  啟用浮水印
                </label>
              </div>
              
              <!-- 浮水印圖片上傳 -->
              <div v-if="watermarkEnabled">
                <button 
                  @click="openWatermarkUpload" 
                  class="w-full px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  :disabled="viewMode"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {{ watermarkImage ? '更換浮水印' : '上傳浮水印圖片' }}
                </button>
                <input
                  ref="watermarkInput"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                  @change="handleWatermarkUpload"
                  style="display: none"
                />
                
                <!-- 浮水印預覽 -->
                <div v-if="watermarkImage" class="mt-2 p-2 bg-slate-50 rounded border border-slate-200">
                  <img :src="watermarkImage" alt="浮水印預覽" class="max-h-20 mx-auto opacity-30">
                  <button 
                    @click="removeWatermark" 
                    class="mt-2 w-full px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    :disabled="viewMode"
                  >
                    移除浮水印
                  </button>
                </div>
                
                <!-- 浮水印不透明度 -->
                <div class="mt-2">
                  <label class="block text-xs text-slate-600 mb-1">
                    不透明度: {{ watermarkOpacity }}%
                  </label>
                  <input
                    type="range"
                    v-model.number="watermarkOpacity"
                    min="5"
                    max="30"
                    step="5"
                    :disabled="viewMode || !watermarkImage"
                    class="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 標籤 -->
          <div class="space-y-3">
            <label class="block text-sm font-medium text-slate-700">標籤</label>
            <div class="flex flex-wrap gap-2 mb-2">
              <span v-for="tagId in resource.tag_ids" :key="tagId" class="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                #{{ getTagName(tagId) }}
                <button v-if="!viewMode" @click="removeTag(tagId)" class="ml-1 text-indigo-600 hover:text-indigo-900">×</button>
              </span>
            </div>
            <select v-if="!viewMode" @change="addTag($event.target.value)" class="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
              <option value="">+ 新增標籤</option>
              <option v-for="t in availableTags" :key="t.tag_id" :value="t.tag_id">
                {{ t.tag_name }}
              </option>
            </select>
          </div>

          <!-- JSON 結構顯示 (開發用) -->
          <div class="space-y-3 mt-6 pt-6 border-t border-slate-200">
            <div class="flex justify-between items-center">
              <label class="block text-sm font-medium text-slate-700">JSON 結構 (開發)</label>
              <button @click="showJson = !showJson" class="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                {{ showJson ? '隱藏' : '顯示' }}
              </button>
            </div>
            <div v-show="showJson" class="space-y-3">
              <div>
                <span class="text-xs font-semibold text-slate-600 block mb-1">Tiptap Structure:</span>
                <pre class="bg-slate-50 p-2 rounded text-[10px] overflow-auto max-h-40 border border-slate-200">{{ JSON.stringify(tiptapStructureRef, null, 2) }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主要編輯區 -->
    <main class="flex-1 flex flex-col min-w-0 bg-slate-100/50">
      <!-- 頂部工具列 -->
      <header class="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm z-10">
        <div class="flex items-center gap-4">
          <button @click="goBack" class="text-slate-500 hover:text-indigo-600 transition-colors" title="返回">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <button @click="sidebarOpen = !sidebarOpen" class="text-slate-500 hover:text-indigo-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div class="flex flex-col">
            <h1 class="text-lg font-bold text-slate-800 leading-tight">
              {{ resource.title || '未命名文件' }}
            </h1>
            <span class="text-xs text-slate-400 flex items-center gap-1">
              <span v-if="isSaving" class="text-amber-500">儲存中...</span>
              <span v-else-if="lastSaved" class="text-green-600">已儲存於 {{ formatTime(lastSaved) }}</span>
              <span v-else>尚未儲存</span>
            </span>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- 顯示模式選擇 -->
          <select 
            v-model="printModeSelection" 
            :disabled="isPreparingPrint"
            class="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="question-only">純題目</option>
            <option value="with-answer">題目+答案</option>
            <option value="with-solution">題目+詳解</option>
            <option value="with-all">題目+答案+詳解</option>
          </select>
          
          <button 
            @click="print" 
            :disabled="isPreparingPrint"
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            {{ isPreparingPrint ? '準備中...' : '列印 / 預覽 PDF' }}
          </button>
          <button v-if="!viewMode" @click="saveResource(true)" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            儲存
          </button>
        </div>
      </header>

      <!-- 畫布區域 -->
      <div 
        class="flex-1 overflow-auto relative bg-slate-100"
      >
        <!-- 編輯區域 - 統一使用單一連續編輯器 -->
        <div class="relative print:shadow-none continuous-editor mx-auto bg-white shadow-sm my-8 max-w-4xl"
          :style="{
            padding: '40px',
            minHeight: '100vh'
          }"
        >
          <BlockEditor
            ref="blockEditorRef"
            :model-value="tiptapStructure"
            @update:model-value="handleBlockEditorUpdate"
            :templates="templates"
            :questions="questions"
            :questions-pagination="questionsPagination"
            @load-more-questions="loadMoreQuestions"
            :image-mappings="imageMappings"
            @request-upload="openImageFolderUpload"
          />
        </div>
      </div>
    </main>
    
    <!-- 列印準備 Loading Modal -->
    <div 
      v-if="isPreparingPrint" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click.stop
    >
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <div class="flex flex-col items-center space-y-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <div class="text-center">
            <h3 class="text-lg font-medium text-gray-900 mb-2">準備列印預覽</h3>
            <p class="text-sm text-gray-500">{{ printPreparationMessage }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, computed, nextTick, shallowRef, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { learningResourceAPI, courseAPI, studentGroupAPI, hashtagAPI, contentTemplateAPI, uploadImageAPI, questionBankAPI } from '../services/api'
import BlockEditor from '../components/BlockEditor/BlockEditor.vue'
import { useMarkdownRenderer } from '../composables/useMarkdownRenderer'

const props = defineProps({
  id: {
    type: String,
    default: null
  },
  viewMode: {
    type: Boolean,
    default: false
  }
})

// Simple debounce function
const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

const route = useRoute()
const router = useRouter()
const { renderMarkdownWithLatex } = useMarkdownRenderer()

// 返回上一頁
const goBack = () => {
  // 檢查是否有 returnTab 查詢參數來決定返回哪個 tab
  const returnTab = route.query.returnTab || 'questions'
  
  // 總是跳轉到題庫頁面並帶上 tab 參數，確保正確切換到對應的 tab
  router.push({ path: '/questions', query: { tab: returnTab } })
}

// State
const sidebarOpen = ref(true)
const isSaving = ref(false)
const lastSaved = ref(null)
const isInitializing = ref(true) // 標記是否正在初始化，避免觸發自動保存
const courses = ref([])
const studentGroups = ref([])
const availableTags = ref([])
const questions = ref([])
const templates = ref([])

// 題目分頁狀態
const questionsPagination = ref({
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
  hasNext: false,
  isLoading: false
})

// Resource Data
const resource = reactive({
  title: '未命名文件',
  mode: 'HANDOUT',
  course_ids: [],
  student_group_ids: [],
  tag_ids: [],
  settings: {}
})

const showJson = ref(false) // 預設隱藏 JSON

// 統一使用 Tiptap JSON 格式
const tiptapStructureRef = ref({
  type: 'doc',
  content: [{ type: 'paragraph', content: [] }]
})

// 圖片映射表: Map<原檔名, 後端URL>
// 每個資源文件有獨立的映射表，使用資源 ID 作為 key
const imageMappings = ref(new Map())
const imageFolderInput = ref(null)
const uploadingImages = ref(false)
const replacingImages = ref(false)
const blockEditorRef = ref(null)

// 列印模式選擇
const printModeSelection = ref('question-only')

// 追蹤模式切換歷史
const printModeHistory = ref([])

// 列印準備狀態
const isPreparingPrint = ref(false)
const printPreparationMessage = ref('正在準備列印內容...')

// 浮水印設定
const watermarkEnabled = ref(false)
const watermarkImage = ref(null)
const watermarkOpacity = ref(10) // 預設 10%
const watermarkInput = ref(null)

// 提供給子組件使用
provide('printMode', printModeSelection)

// 監聽模式切換
watch(printModeSelection, (newMode, oldMode) => {
  printModeHistory.value.push({
    from: oldMode,
    to: newMode,
    timestamp: Date.now()
  })
  // 只保留最近 5 次切換記錄
  if (printModeHistory.value.length > 5) {
    printModeHistory.value.shift()
  }
  // #region agent log
  fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResourceEditor.vue:printModeSelection:watch',message:'Print mode changed',data:{from:oldMode,to:newMode,history:printModeHistory.value},timestamp:Date.now(),sessionId:'debug-session',runId:'print-css-debug-2',hypothesisId:'F'})}).catch(()=>{});
  // #endregion
})

// 獲取當前資源的映射表 key
const getImageMappingKey = () => {
  // 如果有資源 ID，使用資源 ID；否則使用臨時 key（基於標題）
  const resourceId = route.params.id
  if (resourceId) {
    return `resource_${resourceId}`
  }
  // 新文件使用標題作為臨時 key
  return `temp_${resource.title || 'untitled'}`
}

// 載入當前資源的映射表
const loadImageMappings = () => {
  const key = getImageMappingKey()
  const saved = localStorage.getItem(`imageMappings_${key}`)
  if (saved) {
    try {
      imageMappings.value = new Map(JSON.parse(saved))
    } catch (error) {
      console.error('載入圖片映射表失敗:', error)
      imageMappings.value = new Map()
    }
  } else {
    imageMappings.value = new Map()
  }
}

// 保存當前資源的映射表
const saveImageMappings = () => {
  const key = getImageMappingKey()
  localStorage.setItem(`imageMappings_${key}`, 
    JSON.stringify(Array.from(imageMappings.value.entries()))
  )
}

// 清空當前資源的映射表
const clearImageMappings = () => {
  if (confirm('確定要清空當前文件的圖片映射表嗎？這不會刪除已上傳的圖片，只是清除映射關係。')) {
    imageMappings.value.clear()
    saveImageMappings()
    alert('已清空當前文件的圖片映射表')
  }
}

// Tiptap 格式的 structure（用於 BlockEditor）
// 統一使用 Tiptap JSON 格式，無需轉換
const tiptapStructure = computed({
  get() {
    return tiptapStructureRef.value
  },
  set(value) {
    tiptapStructureRef.value = value
  }
})

// 處理 BlockEditor 更新
const handleBlockEditorUpdate = (newStructure) => {
  tiptapStructure.value = newStructure
  // 自動儲存會觸發
}

// 節點高度估算函數
function estimateNodeHeight(node) {
  const baseHeights = {
    paragraph: 60,
    heading: { 1: 100, 2: 80, 3: 70, 4: 60, 5: 50, 6: 50 },
    latexBlock: 150,
    image: 200,
    imagePlaceholder: 200,
    bulletList: 80,
    orderedList: 80,
    blockquote: 80,
    codeBlock: 100,
    questionBlock: 300,
    templateBlock: 200,
    diagram2DBlock: 200,
    diagram3DBlock: 200,
    circuitBlock: 200,
  }
  
  // 根據節點類型返回估算高度
  if (node.type === 'heading') {
    const level = node.attrs?.level || 1
    return baseHeights.heading[level] || 60
  }
  
  // 列表節點需要考慮子項數量
  if (node.type === 'bulletList' || node.type === 'orderedList') {
    const itemCount = node.content?.length || 1
    return baseHeights[node.type] * Math.max(1, itemCount)
  }
  
  return baseHeights[node.type] || 60
}

// 移除舊的分頁邏輯 - 現在使用單一連續編輯器

// 移除模式編輯器相關邏輯（已不需要）

// Refs (保留用於未來可能的功能)
const canvasContainer = ref(null)

const toRT = (v) => {
  if (typeof v === 'string') return v
  if (v && typeof v === 'object' && typeof v.text === 'string') return v
  return ''
}

const fromRT = (v) => {
  if (typeof v === 'string') return v
  if (v && typeof v === 'object' && typeof v.text === 'string') return v.text
  return ''
}

// Drag & Drop state
const draggingBlock = ref(null)
const dragOverPage = ref(null)
const dragOverIndex = ref(null)
const snapLine = reactive({
  show: false,
  type: 'horizontal', // 'horizontal' or 'vertical'
  position: 0
})

// Computed (移除題目和模板篩選相關)

// Methods
const getTagName = (id) => {
  const tag = availableTags.value.find(t => t.tag_id === id)
  return tag ? tag.tag_name : 'Unknown'
}

const addTag = (id) => {
  if (!id) return
  const tagId = parseInt(id)
  if (!resource.tag_ids.includes(tagId)) {
    resource.tag_ids.push(tagId)
  }
}

const removeTag = (id) => {
  const index = resource.tag_ids.indexOf(id)
  if (index > -1) resource.tag_ids.splice(index, 1)
}

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString()
}

const renderMarkdownPreview = (content) => {
  // Simple preview, strip tags or just render first line
  if (!content) return ''
  return renderMarkdownWithLatex(content.substring(0, 100) + (content.length > 100 ? '...' : ''))
}

// Block Operations - 已移除，現在直接通過 BlockEditor 操作 Tiptap JSON

// 舊的頁面計算函數已移除，現在由 BlockEditor 的自動換頁功能處理

// Drag & Drop - 從側邊欄拖動題目
// 移除拖拽相關函數：handleDragStart、handleDragOver、handleDrop

// 區塊拖動
const handleBlockDragStart = (event, block, index) => {
  draggingBlock.value = { ...block, originalIndex: index }
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', '') // 某些瀏覽器需要這個
  event.target.style.opacity = '0.5'
}

const handleBlockDragEnd = (event) => {
  event.target.style.opacity = '1'
  draggingBlock.value = null
  dragOverPage.value = null
  dragOverIndex.value = null
  snapLine.show = false
}

const handleBlockDragOver = (event, block, index) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
  
  if (!draggingBlock.value || draggingBlock.value.id === block.id) return
  
  const rect = event.currentTarget.getBoundingClientRect()
  const mouseY = event.clientY
  const blockMiddle = rect.top + rect.height / 2
  
  // 判斷插入位置
  const insertBefore = mouseY < blockMiddle
  const newIndex = insertBefore ? index : index + 1
  
  dragOverIndex.value = newIndex
  
  // 磁吸對齊：檢查是否接近其他區塊的邊緣
  checkSnapAlignment(event, block, index)
}

const handlePageDragOver = (event, pageIndex) => {
  event.preventDefault()
  if (!draggingBlock.value) return
  dragOverPage.value = pageIndex
}

const handlePageDrop = (event, pageIndex) => {
  event.preventDefault()
  event.stopPropagation() // 阻止事件冒泡到父元素
  
  // 如果沒有正在拖動的區塊，忽略（不再支持從側邊欄拖動）
  if (!draggingBlock.value) {
    return
  }
  
  // 拖拽功能已由 BlockEditor 內部處理，這裡不再需要
  
  // 重置狀態
  draggingBlock.value = null
  dragOverPage.value = null
  dragOverIndex.value = null
  snapLine.show = false
}

// 磁吸對齊檢查
const checkSnapAlignment = (event, block, index) => {
  if (!canvasContainer.value) return
  
  const containerRect = canvasContainer.value.getBoundingClientRect()
  const mouseY = event.clientY
  const mouseX = event.clientX
  
  const snapThreshold = 10 // 像素
  
  // 檢查水平對齊（與其他區塊的垂直位置對齊）
  let snapY = null
  let snapX = null
  
  // 獲取所有區塊元素
  const allBlocks = canvasContainer.value.querySelectorAll('[data-block-id]')
  
  for (const otherBlock of allBlocks) {
    if (otherBlock.getAttribute('data-block-id') === block.id.toString()) continue
    
    const blockRect = otherBlock.getBoundingClientRect()
    
    // 檢查頂部對齊
    if (Math.abs(mouseY - blockRect.top) < snapThreshold) {
      snapY = blockRect.top - containerRect.top
    }
    
    // 檢查底部對齊
    if (Math.abs(mouseY - blockRect.bottom) < snapThreshold) {
      snapY = blockRect.bottom - containerRect.top
    }
    
    // 檢查左側對齊
    if (Math.abs(mouseX - blockRect.left) < snapThreshold) {
      snapX = blockRect.left - containerRect.left
    }
    
    // 檢查右側對齊
    if (Math.abs(mouseX - blockRect.right) < snapThreshold) {
      snapX = blockRect.right - containerRect.left
    }
  }
  
  // 顯示對齊線
  if (snapY !== null) {
    snapLine.show = true
    snapLine.type = 'horizontal'
    snapLine.position = snapY
  } else if (snapX !== null) {
    snapLine.show = true
    snapLine.type = 'vertical'
    snapLine.position = snapX
  } else {
    snapLine.show = false
  }
}

// Data Fetching
const fetchInitialData = async () => {
  isInitializing.value = true // 開始初始化
  try {
    const [cRes, gRes, tRes, qRes, templateRes] = await Promise.all([
      courseAPI.getAll(),
      studentGroupAPI.getAll(),
      hashtagAPI.getAll(),
      questionBankAPI.getAll({ params: { page: 1, page_size: 10 } }), // 首次載入第一頁（10題）
      contentTemplateAPI.getAll()
    ])

    courses.value = cRes.data.results || cRes.data
    studentGroups.value = gRes.data.results || gRes.data
    availableTags.value = tRes.data.results || tRes.data
    questions.value = qRes.data.results || qRes.data
    templates.value = templateRes.data.results || templateRes.data
    
    // 更新分頁資訊
    questionsPagination.value = {
      currentPage: 1,
      pageSize: 10,
      totalCount: qRes.data.count || questions.value.length,
      hasNext: !!qRes.data.next,
      isLoading: false
    }

    // If edit mode
    if (route.params.id) {
      const res = await learningResourceAPI.getById(route.params.id)
      const data = res.data
      resource.title = data.title
      resource.mode = data.mode || 'HANDOUT'
      resource.course_ids = data.courses?.map(c => c.course_id) || []
      resource.student_group_ids = data.student_group_ids || []
      resource.tag_ids = data.tag_ids || []
      // 簡化 settings（移除不必要的講義設定）
      resource.settings = data.settings || {}
      // 統一使用 tiptap_structure
      if (data.tiptap_structure && data.tiptap_structure.type === 'doc') {
        tiptapStructureRef.value = data.tiptap_structure
      } else {
        // 如果沒有 tiptap_structure，使用空結構
        tiptapStructureRef.value = {
          type: 'doc',
          content: [{ type: 'paragraph', content: [] }]
        }
      }
      
      // 載入該資源的圖片映射表
      loadImageMappings()
    } else if (route.query.template_id) {
      // 如果從 template 創建，載入 template 內容
      try {
        const templateRes = await contentTemplateAPI.getById(route.query.template_id)
        const template = templateRes.data
        if (template.tiptap_structure && template.tiptap_structure.type === 'doc') {
          // 將 template 的 tiptap_structure 插入到文件開頭
          tiptapStructureRef.value = template.tiptap_structure
        }
      } catch (error) {
        console.error('載入模板失敗：', error)
      }
      
      // 如果是新文件，載入臨時映射表
      if (!route.params.id) {
        loadImageMappings()
      }
    }
  } catch (error) {
    console.error('Failed to load data', error)
  } finally {
    // 初始化完成後，等待一個 tick 再啟用自動保存
    await nextTick()
    setTimeout(() => {
      isInitializing.value = false
    }, 100)
  }
}

// 載入更多題目（無限滾動）
const loadMoreQuestions = async () => {
  if (questionsPagination.value.isLoading || !questionsPagination.value.hasNext) {
    return
  }
  
  questionsPagination.value.isLoading = true
  
  try {
    const nextPage = questionsPagination.value.currentPage + 1
    
    const qRes = await questionBankAPI.getAll({ 
      params: { 
        page: nextPage, 
        page_size: 10 
      } 
    })
    
    // 將新題目追加到現有列表
    const newQuestions = qRes.data.results || []
    questions.value = [...questions.value, ...newQuestions]
    
    // 更新分頁資訊
    questionsPagination.value = {
      currentPage: nextPage,
      pageSize: 10,
      totalCount: qRes.data.count || questionsPagination.value.totalCount,
      hasNext: !!qRes.data.next,
      isLoading: false
    }
  } catch (error) {
    console.error('載入更多題目失敗：', error)
    questionsPagination.value.isLoading = false
  }
}

// Saving
const saveResource = async (manual = false) => {
  if (!resource.title) return
  
  isSaving.value = true
  
  // #region agent log
  fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResourceEditor.vue:saveResource:before_payload',message:'Resource data before payload creation',data:{resource:JSON.parse(JSON.stringify(resource)),tiptapStructureType:typeof tiptapStructureRef.value,hasTiptapStructure:!!tiptapStructureRef.value},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A,B,C,D'})}).catch(()=>{});
  // #endregion
  
  // 過濾掉 course_ids 中的 null 值
  const cleanedCourseIds = (resource.course_ids || []).filter(id => id !== null && id !== undefined)
  
  // #region agent log
  fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResourceEditor.vue:saveResource:after_filter',message:'Filtered null values from course_ids',data:{originalCourseIds:resource.course_ids,cleanedCourseIds:cleanedCourseIds},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  const payload = {
    ...resource,
    course_ids: cleanedCourseIds,
    tiptap_structure: tiptapStructureRef.value,
    tag_ids_input: resource.tag_ids,
    student_group_ids: resource.student_group_ids
  }
  
  // #region agent log
  fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResourceEditor.vue:saveResource:payload_created',message:'Payload created',data:{payloadKeys:Object.keys(payload),courseIds:payload.course_ids,studentGroupIds:payload.student_group_ids,mode:payload.mode,title:payload.title,tagIdsInput:payload.tag_ids_input,hasTiptapStructure:!!payload.tiptap_structure},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B,C,D'})}).catch(()=>{});
  // #endregion
  
  // #region agent log
  try {
    const payloadStr = JSON.stringify(payload);
    fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResourceEditor.vue:saveResource:payload_serialized',message:'Payload serialization successful',data:{payloadLength:payloadStr.length,payloadPreview:payloadStr.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
  } catch (serError) {
    fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResourceEditor.vue:saveResource:payload_serialization_error',message:'Payload serialization FAILED',data:{error:serError.message},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
  }
  // #endregion
  
  try {
    let response
    if (route.params.id) {
      // #region agent log
      fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResourceEditor.vue:saveResource:before_update',message:'About to call API update',data:{resourceId:route.params.id},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      response = await learningResourceAPI.update(route.params.id, payload)
      // #region agent log
      fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResourceEditor.vue:saveResource:after_update',message:'API update successful',data:{responseStatus:response.status},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
    } else {
      response = await learningResourceAPI.create(payload)
      // Redirect to edit mode if created
      if (!route.params.id && manual) {
        const newResourceId = response.data.resource_id
        router.replace(`/resources/edit/${newResourceId}`)
        
        // 新資源創建後，將臨時映射表遷移到資源專屬的映射表
        const tempKey = getImageMappingKey()
        const resourceKey = `resource_${newResourceId}`
        const tempMappings = localStorage.getItem(`imageMappings_${tempKey}`)
        if (tempMappings) {
          localStorage.setItem(`imageMappings_${resourceKey}`, tempMappings)
          localStorage.removeItem(`imageMappings_${tempKey}`)
          loadImageMappings() // 重新載入映射表
        }
      }
    }
    lastSaved.value = new Date()
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResourceEditor.vue:saveResource:api_error',message:'API call failed',data:{errorMessage:error.message,errorResponse:error.response?.data,errorStatus:error.response?.status,errorStatusText:error.response?.statusText},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    console.error('Save failed', error)
    if (manual) {
      const errorMsg = error.response?.data?.detail || '儲存失敗，請稍後再試'
      alert(errorMsg)
    }
  } finally {
    isSaving.value = false
  }
}

// Auto-save (only in edit mode, not in view mode)
const debouncedSave = debounce(() => saveResource(false), 3000)

// 只在非查看模式下啟用自動保存 watcher
// 注意：不要監聽 isSaving 和 lastSaved，避免遞迴更新
if (!props.viewMode) {
  watch(
    [
      () => resource.title,
      () => resource.mode,
      () => resource.course_ids,
      () => resource.student_group_ids,
      () => resource.tag_ids,
      () => resource.settings,
      () => tiptapStructureRef.value
    ],
    () => {
      // 初始化期間不觸發自動保存
      if (isInitializing.value) return
      
      if (route.params.id || resource.title !== '未命名文件') { // Only auto-save if editing or title changed
        debouncedSave()
      }
    },
    { deep: true }
  )
}


// 生成預覽內容的通用函數
const generatePrintPreview = async (iframeDoc, iframeWindow, triggerPrint = false) => {
  // #region agent log
  fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResourceEditor.vue:generatePrintPreview:start',message:'generatePrintPreview called',data:{printModeSelection:printModeSelection.value,triggerPrint:triggerPrint,iframeBodyContent:iframeDoc.body ? iframeDoc.body.innerHTML.substring(0, 200) : 'no body'},timestamp:Date.now(),sessionId:'debug-session',runId:'print-css-debug-2',hypothesisId:'F'})}).catch(()=>{});
  // #endregion
  
  // 等待 Vue 響應式更新完成（模式切換後需要時間讓子組件重新渲染）
  await nextTick()
  // 額外等待一小段時間確保所有組件都已完成更新
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // 固定使用 A4 紙張大小
  const paperSize = 'A4'
  const paperWidth = '210mm'
  const paperHeight = '297mm'
  
  // 獲取編輯器容器（連續編輯模式）
  const editorContainer = document.querySelector('.continuous-editor') || 
                          document.querySelector('.block-editor-container') ||
                          document.querySelector('.ProseMirror')
  
  // 檢查是否有內容
  if (!editorContainer) {
    if (triggerPrint) {
      alert('沒有可列印的內容')
      return null
    }
    return null
  }
  
  // 檢查編輯器是否有實際內容
  const hasText = editorContainer.textContent.trim().length > 0
  const hasProseMirror = editorContainer.querySelector('.ProseMirror')
  const hasContent = hasText || hasProseMirror
  
  if (!hasContent) {
    if (triggerPrint) {
      alert('沒有可列印的內容')
      return null
    }
    // 預覽模式:顯示空白頁面
    const container = iframeDoc.createElement('div')
    container.style.background = 'white'
    container.style.width = paperSize === 'A4' ? '210mm' : '250mm'
    container.style.minHeight = paperSize === 'A4' ? '297mm' : '353mm'
    container.style.padding = '20mm'
    container.style.margin = '0 auto'
    iframeDoc.body.appendChild(container)
    return container
  }
  
  
  // 複製必要的樣式表
  const stylesheets = Array.from(document.styleSheets)
  let styleContent = ''
  let katexStylesheetFound = false
  let externalStylesheetsCount = 0
  
  // 首先確保 KaTeX CSS 被載入(從 CDN 或本地)
  const katexCSSLink = iframeDoc.createElement('link')
  katexCSSLink.rel = 'stylesheet'
  katexCSSLink.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css'
  katexCSSLink.crossOrigin = 'anonymous'
  iframeDoc.head.appendChild(katexCSSLink)
  
  for (const sheet of stylesheets) {
    try {
      if (sheet.href) {
        // 檢查是否為 KaTeX 樣式表
        if (sheet.href.includes('katex')) {
          katexStylesheetFound = true
        }
        // 外部樣式表
        const link = iframeDoc.createElement('link')
        link.rel = 'stylesheet'
        link.href = sheet.href
        iframeDoc.head.appendChild(link)
        externalStylesheetsCount++
      } else {
        // 內聯樣式表
        const rules = Array.from(sheet.cssRules || [])
        for (const rule of rules) {
          styleContent += rule.cssText + '\n'
        }
      }
    } catch (e) {
      // 跨域樣式表可能無法訪問，跳過
      console.warn('無法複製樣式表:', e)
    }
  }
  
  
  // 添加內聯樣式
  const styleEl = iframeDoc.createElement('style')
  
  styleEl.textContent = styleContent + `
    /* 基本樣式（用於預覽） */
    body {
      margin: 0;
      padding: 0;
      background: white;
    }
    
    .print-container {
      width: 100%;
      max-width: ${paperWidth};
      margin: 0 auto;
      background: white;
      box-sizing: border-box;
      position: relative;
    }
    
    /* 浮水印容器 */
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: 0.1;
      z-index: -1;
      pointer-events: none;
    }
    
    .watermark img {
      max-width: 300px;
      max-height: 300px;
    }
    
    /* 列印專用樣式 */
    @page {
      size: ${paperSize};
      margin: 0;
    }
    
    @media print {
      /* 移除瀏覽器預設的頁首頁尾 - 注意：瀏覽器的頁首頁尾無法完全通過 CSS 移除，
         但可以通過設置 margin: 0 來減少它們的空間。用戶需要在瀏覽器的列印設置中
         手動關閉頁首頁尾（在 Chrome/Edge 中：更多設置 > 選項 > 頁首和頁尾） */
      body::before,
      body::after {
        display: none !important;
      }
      
      /* 確保內容區域有適當的內邊距，因為 @page margin 設為 0 */
      .print-container {
        padding: 20mm !important;
      }
      
      /* 題目區塊避免分頁 */
      .question-display {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        margin-bottom: 1.5rem !important;
      }
      
      /* 大題標題避免分頁 */
      .section-block {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      
      /* 答案和詳解區域的列印樣式 - 使用更高特異性確保覆蓋 scoped 樣式 */
      .print-container .answer-section,
      .print-container .solution-section,
      .answer-section,
      .solution-section {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        background: white !important;
        border: none !important;
        border-left: none !important;
        padding: 0.75rem 0 !important;
        margin-top: 0.75rem !important;
        margin-bottom: 0.5rem !important;
      }
      
      .print-container .answer-label,
      .print-container .solution-label,
      .answer-label,
      .solution-label {
        font-size: 0.875rem !important;
        font-weight: 700 !important;
        color: black !important;
        margin-bottom: 0.5rem !important;
        display: block !important;
      }
      
      .print-container .answer-content,
      .print-container .solution-content,
      .answer-content,
      .solution-content {
        font-size: 0.875rem !important;
        color: black !important;
        line-height: 1.6 !important;
        margin-top: 0.25rem !important;
      }
      
      /* 確保題目內容有適當間距 */
      .print-container .question-text,
      .question-text {
        margin-bottom: 0.5rem !important;
        line-height: 1.6 !important;
        color: black !important;
      }
      
      .print-container .question-content,
      .question-content {
        line-height: 1.6 !important;
        color: black !important;
      }
      
      /* 確保所有文字顏色為黑色 */
      * {
        color: black !important;
      }
      
      /* 確保圖片不會太大 */
      .print-container img,
      img {
        max-width: 100% !important;
        height: auto !important;
        page-break-inside: avoid !important;
        display: block !important;
        margin: 0.5rem 0 !important;
      }
      
      /* KaTeX 樣式 - 確保在列印時正確顯示 */
      .print-container .katex,
      .katex {
        color: black !important;
        font-size: 1.1em !important;
        line-height: 1.6 !important;
      }
      
      .print-container .katex *,
      .katex * {
        color: black !important;
      }
      
      /* 修復根號線拉長問題：限制根號內部元素的最大高度 */
      .print-container .katex .sqrt .vlist-t,
      .katex .sqrt .vlist-t {
        max-height: 1.2em !important;
        overflow: hidden !important;
      }
      
      /* 確保 SVG 根號線不會被裁剪 */
      .print-container .katex .sqrt .svg-align,
      .katex .sqrt .svg-align {
        overflow: visible !important;
      }
      
      /* 隱藏可能產生垂直線的 vlist-t2 邊框 */
      .print-container .katex .sqrt .vlist-t2,
      .katex .sqrt .vlist-t2 {
        border-left: none !important;
      }
      
      /* 修復分數線位置：使分數線在分子和分母中間 */
      .print-container .katex .mfrac > .frac-line,
      .print-container .katex .frac-line,
      .katex .mfrac > .frac-line,
      .katex .frac-line {
        border-bottom-width: 0.04em !important;
        min-height: 0.04em !important;
        margin-top: 0.188em !important;
        margin-bottom: 0.092em !important;
      }
      
      /* 分數容器 */
      .print-container .katex .mfrac,
      .katex .mfrac {
        padding-top: 0.158em !important;
        padding-bottom: 0.082em !important;
      }
    }
  `
  iframeDoc.head.appendChild(styleEl)
  
  // 複製編輯器內容到 iframe
  const container = iframeDoc.createElement('div')
  container.className = 'print-container'
  container.style.background = 'white'
  
  // 檢查原始 DOM 中答案和詳解的顯示狀態
  const originalAnswerSections = editorContainer.querySelectorAll('.answer-section')
  const originalSolutionSections = editorContainer.querySelectorAll('.solution-section')
  const originalVisibleAnswers = Array.from(originalAnswerSections).filter(el => {
    const style = window.getComputedStyle(el)
    return style.display !== 'none' && style.visibility !== 'hidden'
  })
  const originalVisibleSolutions = Array.from(originalSolutionSections).filter(el => {
    const style = window.getComputedStyle(el)
    return style.display !== 'none' && style.visibility !== 'hidden'
  })
  
  // #region agent log
  fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResourceEditor.vue:generatePrintPreview:beforeClone',message:'Before cloning editor content',data:{printMode:printModeSelection.value,originalAnswerSectionsCount:originalAnswerSections.length,originalSolutionSectionsCount:originalSolutionSections.length,originalVisibleAnswersCount:originalVisibleAnswers.length,originalVisibleSolutionsCount:originalVisibleSolutions.length},timestamp:Date.now(),sessionId:'debug-session',runId:'print-css-debug-2',hypothesisId:'A,B,C'})}).catch(()=>{});
  // #endregion
  
  // 複製編輯器內容
  const clone = editorContainer.cloneNode(true)
  
  // 檢查克隆後的 DOM 中答案和詳解的狀態
  const clonedAnswerSections = clone.querySelectorAll('.answer-section')
  const clonedSolutionSections = clone.querySelectorAll('.solution-section')
  const clonedVisibleAnswers = Array.from(clonedAnswerSections).filter(el => {
    const style = window.getComputedStyle(el)
    return style.display !== 'none' && style.visibility !== 'hidden'
  })
  const clonedVisibleSolutions = Array.from(clonedSolutionSections).filter(el => {
    const style = window.getComputedStyle(el)
    return style.display !== 'none' && style.visibility !== 'hidden'
  })
  
  // #region agent log
  fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResourceEditor.vue:generatePrintPreview:afterClone',message:'After cloning editor content',data:{clonedAnswerSectionsCount:clonedAnswerSections.length,clonedSolutionSectionsCount:clonedSolutionSections.length,clonedVisibleAnswersCount:clonedVisibleAnswers.length,clonedVisibleSolutionsCount:clonedVisibleSolutions.length,cloneChildrenCount:clone.children.length,cloneTextLength:clone.textContent.length,hasQuestionBlocks:clone.querySelectorAll('.question-display').length,hasSectionBlocks:clone.querySelectorAll('.section-block').length},timestamp:Date.now(),sessionId:'debug-session',runId:'print-css-debug-2',hypothesisId:'C,D,E'})}).catch(()=>{});
  // #endregion
  
  // 移除編輯器特定的類別和屬性
  clone.classList.remove('continuous-editor')
  clone.removeAttribute('contenteditable')
  
  // 移除所有編輯相關的元素（如工具列、選單等）
  const editableElements = clone.querySelectorAll('[contenteditable]')
  editableElements.forEach(el => el.removeAttribute('contenteditable'))
  
  // 移除懸停工具列
  const toolbars = clone.querySelectorAll('.question-toolbar, .section-toolbar')
  toolbars.forEach(toolbar => toolbar.remove())
  
  // 直接移除答案和詳解區域的 scoped 樣式屬性（data-v-xxx），並添加內聯樣式覆蓋
  const answerSections = clone.querySelectorAll('.answer-section')
  const solutionSections = clone.querySelectorAll('.solution-section')
  
  answerSections.forEach(section => {
    // 移除所有 scoped 屬性
    Array.from(section.attributes).forEach(attr => {
      if (attr.name.startsWith('data-v-')) {
        section.removeAttribute(attr.name)
      }
    })
    // 添加內聯樣式確保列印時正確顯示
    section.style.cssText = 'break-inside: avoid !important; page-break-inside: avoid !important; background: white !important; border: none !important; border-left: none !important; padding: 0.75rem 0 !important; margin-top: 0.75rem !important; margin-bottom: 0.5rem !important;'
  })
  
  solutionSections.forEach(section => {
    // 移除所有 scoped 屬性
    Array.from(section.attributes).forEach(attr => {
      if (attr.name.startsWith('data-v-')) {
        section.removeAttribute(attr.name)
      }
    })
    // 添加內聯樣式確保列印時正確顯示
    section.style.cssText = 'break-inside: avoid !important; page-break-inside: avoid !important; background: white !important; border: none !important; border-left: none !important; padding: 0.75rem 0 !important; margin-top: 0.75rem !important; margin-bottom: 0.5rem !important;'
  })
  
  // 同樣處理標籤和內容
  const answerLabels = clone.querySelectorAll('.answer-label')
  const solutionLabels = clone.querySelectorAll('.solution-label')
  const answerContents = clone.querySelectorAll('.answer-content')
  const solutionContents = clone.querySelectorAll('.solution-content')
  
  answerLabels.forEach(label => {
    Array.from(label.attributes).forEach(attr => {
      if (attr.name.startsWith('data-v-')) {
        label.removeAttribute(attr.name)
      }
    })
    label.style.cssText = 'font-size: 0.875rem !important; font-weight: 700 !important; color: black !important; margin-bottom: 0.5rem !important; display: block !important;'
  })
  
  solutionLabels.forEach(label => {
    Array.from(label.attributes).forEach(attr => {
      if (attr.name.startsWith('data-v-')) {
        label.removeAttribute(attr.name)
      }
    })
    label.style.cssText = 'font-size: 0.875rem !important; font-weight: 700 !important; color: black !important; margin-bottom: 0.5rem !important; display: block !important;'
  })
  
  answerContents.forEach(content => {
    Array.from(content.attributes).forEach(attr => {
      if (attr.name.startsWith('data-v-')) {
        content.removeAttribute(attr.name)
      }
    })
    content.style.cssText = 'font-size: 0.875rem !important; color: black !important; line-height: 1.6 !important; margin-top: 0.25rem !important;'
  })
  
  solutionContents.forEach(content => {
    Array.from(content.attributes).forEach(attr => {
      if (attr.name.startsWith('data-v-')) {
        content.removeAttribute(attr.name)
      }
    })
    content.style.cssText = 'font-size: 0.875rem !important; color: black !important; line-height: 1.6 !important; margin-top: 0.25rem !important;'
  })
  
  // #region agent log
  fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResourceEditor.vue:generatePrintPreview:cleaned',message:'Content cleaned for print',data:{questionDisplays:clone.querySelectorAll('.question-display').length,answerSections:clone.querySelectorAll('.answer-section').length,solutionSections:clone.querySelectorAll('.solution-section').length,answerSectionsWithContent:Array.from(clone.querySelectorAll('.answer-section')).filter(el=>el.textContent.trim().length>0).length,solutionSectionsWithContent:Array.from(clone.querySelectorAll('.solution-section')).filter(el=>el.textContent.trim().length>0).length,answerSectionsWithInlineStyles:Array.from(clone.querySelectorAll('.answer-section')).filter(el=>el.style.cssText.includes('background: white')).length,solutionSectionsWithInlineStyles:Array.from(clone.querySelectorAll('.solution-section')).filter(el=>el.style.cssText.includes('background: white')).length},timestamp:Date.now(),sessionId:'debug-session',runId:'print-css-debug-3',hypothesisId:'H'})}).catch(()=>{});
  // #endregion
  
  container.appendChild(clone)
  
  // 在 iframe 中再次強制應用內聯樣式，確保覆蓋所有樣式表規則
  // 這需要在 clone 添加到 iframe 之後執行，因為樣式表可能會覆蓋之前的內聯樣式
  await nextTick()
  
  // 在 iframe 中查找所有答案和詳解區域，強制應用內聯樣式
  const iframeAnswerSectionsAfterAppend = iframeDoc.querySelectorAll('.answer-section')
  const iframeSolutionSectionsAfterAppend = iframeDoc.querySelectorAll('.solution-section')
  
  iframeAnswerSectionsAfterAppend.forEach(section => {
    // 移除所有 scoped 屬性
    Array.from(section.attributes).forEach(attr => {
      if (attr.name.startsWith('data-v-')) {
        section.removeAttribute(attr.name)
      }
    })
    // 強制應用內聯樣式，使用 setProperty 確保 !important 生效
    section.style.setProperty('background', 'white', 'important')
    section.style.setProperty('border', 'none', 'important')
    section.style.setProperty('border-left', 'none', 'important')
    section.style.setProperty('padding', '0.75rem 0', 'important')
    section.style.setProperty('margin-top', '0.75rem', 'important')
    section.style.setProperty('margin-bottom', '0.5rem', 'important')
    section.style.setProperty('break-inside', 'avoid', 'important')
    section.style.setProperty('page-break-inside', 'avoid', 'important')
  })
  
  iframeSolutionSectionsAfterAppend.forEach(section => {
    // 移除所有 scoped 屬性
    Array.from(section.attributes).forEach(attr => {
      if (attr.name.startsWith('data-v-')) {
        section.removeAttribute(attr.name)
      }
    })
    // 強制應用內聯樣式，使用 setProperty 確保 !important 生效
    section.style.setProperty('background', 'white', 'important')
    section.style.setProperty('border', 'none', 'important')
    section.style.setProperty('border-left', 'none', 'important')
    section.style.setProperty('padding', '0.75rem 0', 'important')
    section.style.setProperty('margin-top', '0.75rem', 'important')
    section.style.setProperty('margin-bottom', '0.5rem', 'important')
    section.style.setProperty('break-inside', 'avoid', 'important')
    section.style.setProperty('page-break-inside', 'avoid', 'important')
  })
  
  // 同樣處理標籤和內容
  const iframeAnswerLabels = iframeDoc.querySelectorAll('.answer-label')
  const iframeSolutionLabels = iframeDoc.querySelectorAll('.solution-label')
  const iframeAnswerContents = iframeDoc.querySelectorAll('.answer-content')
  const iframeSolutionContents = iframeDoc.querySelectorAll('.solution-content')
  
  iframeAnswerLabels.forEach(label => {
    Array.from(label.attributes).forEach(attr => {
      if (attr.name.startsWith('data-v-')) {
        label.removeAttribute(attr.name)
      }
    })
    label.style.setProperty('font-size', '0.875rem', 'important')
    label.style.setProperty('font-weight', '700', 'important')
    label.style.setProperty('color', 'black', 'important')
    label.style.setProperty('margin-bottom', '0.5rem', 'important')
    label.style.setProperty('display', 'block', 'important')
  })
  
  iframeSolutionLabels.forEach(label => {
    Array.from(label.attributes).forEach(attr => {
      if (attr.name.startsWith('data-v-')) {
        label.removeAttribute(attr.name)
      }
    })
    label.style.setProperty('font-size', '0.875rem', 'important')
    label.style.setProperty('font-weight', '700', 'important')
    label.style.setProperty('color', 'black', 'important')
    label.style.setProperty('margin-bottom', '0.5rem', 'important')
    label.style.setProperty('display', 'block', 'important')
  })
  
  iframeAnswerContents.forEach(content => {
    Array.from(content.attributes).forEach(attr => {
      if (attr.name.startsWith('data-v-')) {
        content.removeAttribute(attr.name)
      }
    })
    content.style.setProperty('font-size', '0.875rem', 'important')
    content.style.setProperty('color', 'black', 'important')
    content.style.setProperty('line-height', '1.6', 'important')
    content.style.setProperty('margin-top', '0.25rem', 'important')
  })
  
  iframeSolutionContents.forEach(content => {
    Array.from(content.attributes).forEach(attr => {
      if (attr.name.startsWith('data-v-')) {
        content.removeAttribute(attr.name)
      }
    })
    content.style.setProperty('font-size', '0.875rem', 'important')
    content.style.setProperty('color', 'black', 'important')
    content.style.setProperty('line-height', '1.6', 'important')
    content.style.setProperty('margin-top', '0.25rem', 'important')
  })
  
  // #region agent log
  fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResourceEditor.vue:generatePrintPreview:afterForceStyles',message:'After forcing inline styles in iframe',data:{iframeAnswerSectionsCount:iframeAnswerSectionsAfterAppend.length,iframeSolutionSectionsCount:iframeSolutionSectionsAfterAppend.length,firstAnswerSectionStyle:iframeAnswerSectionsAfterAppend[0]?iframeAnswerSectionsAfterAppend[0].style.cssText:'',firstSolutionSectionStyle:iframeSolutionSectionsAfterAppend[0]?iframeSolutionSectionsAfterAppend[0].style.cssText:''},timestamp:Date.now(),sessionId:'debug-session',runId:'print-css-debug-3',hypothesisId:'H'})}).catch(()=>{});
  // #endregion
  
  // 等待 DOM 更新後檢查 iframe 中的樣式
  setTimeout(() => {
    const iframeAnswerSections = iframeDoc.querySelectorAll('.answer-section')
    const iframeSolutionSections = iframeDoc.querySelectorAll('.solution-section')
    const iframeAnswerStyles = Array.from(iframeAnswerSections).slice(0, 1).map(el => {
      const style = iframeWindow.getComputedStyle(el)
      return {
        display: style.display,
        visibility: style.visibility,
        padding: style.padding,
        margin: style.margin,
        backgroundColor: style.backgroundColor,
        borderLeft: style.borderLeft,
        color: style.color,
        fontSize: style.fontSize,
        lineHeight: style.lineHeight,
        fontFamily: style.fontFamily,
        textAlign: style.textAlign,
        position: style.position,
        top: style.top,
        left: style.left,
        transform: style.transform
      }
    })
    const iframeSolutionStyles = Array.from(iframeSolutionSections).slice(0, 1).map(el => {
      const style = iframeWindow.getComputedStyle(el)
      return {
        display: style.display,
        visibility: style.visibility,
        padding: style.padding,
        margin: style.margin,
        backgroundColor: style.backgroundColor,
        borderLeft: style.borderLeft,
        color: style.color,
        fontSize: style.fontSize,
        lineHeight: style.lineHeight,
        fontFamily: style.fontFamily,
        textAlign: style.textAlign,
        position: style.position,
        top: style.top,
        left: style.left,
        transform: style.transform
      }
    })
    
    // 檢查文字內容的樣式
    const iframeTextElements = iframeDoc.querySelectorAll('.answer-content, .solution-content, .question-text, .question-content, p')
    const iframeTextStyles = Array.from(iframeTextElements).slice(0, 3).map(el => {
      const style = iframeWindow.getComputedStyle(el)
      return {
        fontSize: style.fontSize,
        lineHeight: style.lineHeight,
        color: style.color,
        fontFamily: style.fontFamily,
        textAlign: style.textAlign,
        position: style.position,
        top: style.top,
        left: style.left,
        transform: style.transform,
        margin: style.margin,
        padding: style.padding,
        width: style.width,
        maxWidth: style.maxWidth,
        wordWrap: style.wordWrap,
        overflow: style.overflow,
        textContent: el.textContent.substring(0, 50)
      }
    })
    
    const katexElements = iframeDoc.querySelectorAll('.katex')
    const katexStyles = Array.from(katexElements).slice(0, 1).map(el => {
      const style = iframeWindow.getComputedStyle(el)
      return {
        color: style.color,
        fontSize: style.fontSize,
        lineHeight: style.lineHeight,
        position: style.position,
        transform: style.transform
      }
    })
    
    // 檢查樣式表中是否有 @media print
    const styleSheets = Array.from(iframeDoc.styleSheets)
    const hasPrintMedia = styleSheets.some(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || [])
        return rules.some(rule => rule.type === CSSRule.MEDIA_RULE && rule.media.mediaText.includes('print'))
      } catch (e) {
        return false
      }
    })
    
    // #region agent log
    fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResourceEditor.vue:generatePrintPreview:iframeStyles',message:'Styles in iframe after append',data:{iframeAnswerSectionsCount:iframeAnswerSections.length,iframeSolutionSectionsCount:iframeSolutionSections.length,iframeAnswerStyles:iframeAnswerStyles,iframeSolutionStyles:iframeSolutionStyles,iframeTextStyles:iframeTextStyles,iframeTextElementsCount:iframeTextElements.length,katexElementsCount:katexElements.length,katexStyles:katexStyles,hasPrintMedia:hasPrintMedia,styleSheetsCount:styleSheets.length},timestamp:Date.now(),sessionId:'debug-session',runId:'print-css-debug-4',hypothesisId:'J'})}).catch(()=>{});
    // #endregion
  }, 200)
  
  // 添加浮水印（如果啟用）
  if (watermarkEnabled.value && watermarkImage.value) {
    const watermark = iframeDoc.createElement('div')
    watermark.className = 'watermark'
    watermark.style.opacity = (watermarkOpacity.value / 100).toString()
    
    const img = iframeDoc.createElement('img')
    img.src = watermarkImage.value
    img.alt = '浮水印'
    
    watermark.appendChild(img)
    iframeDoc.body.appendChild(watermark)
  }
  
  iframeDoc.body.appendChild(container)
  
  
  // 等待 KaTeX CSS 載入完成(增加等待時間以確保樣式完全套用)
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // 根據參數決定是否觸發列印
  if (triggerPrint) {
    // 觸發列印
    iframeWindow.focus()
    iframeWindow.print()
  }
  
  return container
}

// 追蹤現有的 iframe（用於檢測殘留）
let existingPrintFrames = []

// 簡化後的 print() 函數
const print = async () => {
  // 如果正在準備，直接返回
  if (isPreparingPrint.value) {
    return
  }
  
  // 設置準備狀態
  isPreparingPrint.value = true
  printPreparationMessage.value = '正在等待組件更新...'
  
  try {
    // #region agent log
    fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResourceEditor.vue:print:start',message:'Print function called',data:{printModeSelection:printModeSelection.value,resourceMode:resource.mode,printModeType:typeof printModeSelection.value,printModeHistory:printModeHistory.value},timestamp:Date.now(),sessionId:'debug-session',runId:'print-css-debug-3',hypothesisId:'G'})}).catch(()=>{});
    // #endregion
    
    // 等待 Vue 響應式更新完成（模式切換後需要時間讓子組件重新渲染）
    await nextTick()
    printPreparationMessage.value = '正在更新組件狀態...'
    
    // 等待所有 QuestionBlock 組件完成更新
    // 檢查 DOM 中是否有答案和詳解區域，並確認它們的顯示狀態符合當前模式
    let retryCount = 0
    const maxRetries = 20 // 最多等待 2 秒 (20 * 100ms)
    let isReady = false
    
    while (retryCount < maxRetries && !isReady) {
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const editorContainer = document.querySelector('.continuous-editor') || 
                              document.querySelector('.block-editor-container') ||
                              document.querySelector('.ProseMirror')
      
      if (editorContainer) {
        const answerSections = editorContainer.querySelectorAll('.answer-section')
        const solutionSections = editorContainer.querySelectorAll('.solution-section')
        
        // 根據當前模式檢查顯示狀態
        const expectedAnswers = printModeSelection.value === 'with-answer' || printModeSelection.value === 'with-all'
        const expectedSolutions = printModeSelection.value === 'with-solution' || printModeSelection.value === 'with-all'
        
        const visibleAnswers = Array.from(answerSections).filter(el => {
          const style = window.getComputedStyle(el)
          return style.display !== 'none' && style.visibility !== 'hidden'
        })
        const visibleSolutions = Array.from(solutionSections).filter(el => {
          const style = window.getComputedStyle(el)
          return style.display !== 'none' && style.visibility !== 'hidden'
        })
        
        // 檢查是否符合預期（允許一些誤差，因為可能有些題目沒有答案或詳解）
        const answerMatch = expectedAnswers ? visibleAnswers.length > 0 || answerSections.length === 0 : visibleAnswers.length === 0
        const solutionMatch = expectedSolutions ? visibleSolutions.length > 0 || solutionSections.length === 0 : visibleSolutions.length === 0
        
        if (answerMatch && solutionMatch) {
          isReady = true
          // #region agent log
          fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResourceEditor.vue:print:componentsReady',message:'Components ready for print',data:{printModeSelection:printModeSelection.value,retryCount:retryCount,answerSectionsCount:answerSections.length,visibleAnswersCount:visibleAnswers.length,solutionSectionsCount:solutionSections.length,visibleSolutionsCount:visibleSolutions.length,expectedAnswers:expectedAnswers,expectedSolutions:expectedSolutions},timestamp:Date.now(),sessionId:'debug-session',runId:'print-css-debug-3',hypothesisId:'G'})}).catch(()=>{});
          // #endregion
          break
        }
      }
      
      retryCount++
      printPreparationMessage.value = `正在檢查組件狀態... (${retryCount}/${maxRetries})`
    }
    
    if (!isReady) {
      console.warn('組件可能未完全更新，但繼續列印流程')
      // #region agent log
      fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResourceEditor.vue:print:componentsNotReady',message:'Components may not be ready, but continuing',data:{printModeSelection:printModeSelection.value,retryCount:retryCount},timestamp:Date.now(),sessionId:'debug-session',runId:'print-css-debug-3',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
    }
    
    // 清理殘留的 iframe
    const existingFrames = Array.from(document.querySelectorAll('iframe')).filter(iframe => {
      const rect = iframe.getBoundingClientRect()
      return rect.width === 0 && rect.height === 0 && iframe.style.position === 'fixed'
    })
    
    existingFrames.forEach(frame => {
      try {
        if (frame.parentNode) {
          frame.parentNode.removeChild(frame)
        }
      } catch (e) {
        console.warn('Failed to remove existing frame:', e)
      }
    })
    
    printPreparationMessage.value = '正在創建列印預覽...'
    
    // 創建臨時 iframe 用於列印
    const printFrame = document.createElement('iframe')
    printFrame.style.position = 'fixed'
    printFrame.style.right = '0'
    printFrame.style.bottom = '0'
    printFrame.style.width = '0'
    printFrame.style.height = '0'
    printFrame.style.border = '0'
    document.body.appendChild(printFrame)
    
    // #region agent log
    fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResourceEditor.vue:print:iframeCreated',message:'Print iframe created',data:{printModeSelection:printModeSelection.value},timestamp:Date.now(),sessionId:'debug-session',runId:'print-css-debug-3',hypothesisId:'G'})}).catch(()=>{});
    // #endregion
    
    // 等待 iframe 載入
    await new Promise(resolve => {
      printFrame.onload = resolve
      printFrame.src = 'about:blank'
    })
    
    const iframeDoc = printFrame.contentDocument || printFrame.contentWindow.document
    const iframeWindow = printFrame.contentWindow
    
    // #region agent log
    fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResourceEditor.vue:print:beforeGenerate',message:'Before generatePrintPreview',data:{iframeDocReady:!!iframeDoc,iframeWindowReady:!!iframeWindow,printModeSelection:printModeSelection.value,iframeBodyEmpty:!iframeDoc.body || iframeDoc.body.innerHTML.trim().length === 0},timestamp:Date.now(),sessionId:'debug-session',runId:'print-css-debug-3',hypothesisId:'G'})}).catch(()=>{});
    // #endregion
    
    // 確保 iframe 內容已清空（防止殘留）
    if (iframeDoc.body) {
      iframeDoc.body.innerHTML = ''
    }
    if (iframeDoc.head) {
      iframeDoc.head.innerHTML = ''
    }
    
    printPreparationMessage.value = '正在生成列印內容...'
    
    // 生成預覽並觸發列印
    await generatePrintPreview(iframeDoc, iframeWindow, true)
    
    printPreparationMessage.value = '列印預覽已準備完成'
    
    // 列印完成後清理
    setTimeout(() => {
      try {
        if (printFrame.parentNode) {
          printFrame.parentNode.removeChild(printFrame)
        }
      } catch (e) {
        console.warn('Failed to remove print frame:', e)
      }
    }, 1000)
  } catch (error) {
    console.error('Print error:', error)
    alert('列印預覽時發生錯誤：' + (error.message || '未知錯誤'))
    // #region agent log
    fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResourceEditor.vue:print:error',message:'Print error occurred',data:{error:error.message,stack:error.stack,printModeSelection:printModeSelection.value},timestamp:Date.now(),sessionId:'debug-session',runId:'print-css-debug-3',hypothesisId:'G'})}).catch(()=>{});
    // #endregion
  } finally {
    // 清除準備狀態
    isPreparingPrint.value = false
    printPreparationMessage.value = '正在準備列印內容...'
  }
}

// 預覽函數
const renderPreview = async () => {
  if (!previewIframe.value) return
  
  const iframe = previewIframe.value
  
  // 確保 iframe 已載入
  if (!iframe.contentDocument || !iframe.contentDocument.body) {
    iframe.src = 'about:blank'
    await new Promise(resolve => {
      iframe.onload = resolve
    })
  }
  
  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
  const iframeWindow = iframe.contentWindow
  
  // 清空 iframe 內容
  iframeDoc.body.innerHTML = ''
  iframeDoc.head.innerHTML = ''
  
  await generatePrintPreview(iframeDoc, iframeWindow, false)
}


// 頁面計算已由 BlockEditor 的自動換頁功能處理
let resizeObserver = null

// 鍵盤快捷鍵處理
const handleKeyboardShortcuts = (event) => {
  // 檢查是否按下了 Ctrl (Windows/Linux) 或 Cmd (Mac)
  const isModifierPressed = event.ctrlKey || event.metaKey
  
  if (!isModifierPressed) return
  
  const key = event.key.toLowerCase()
  
  // Ctrl+A: 全選
  if (key === 'a') {
    event.preventDefault()
    const selection = window.getSelection()
    const range = document.createRange()
    
    // 選擇整個畫布容器內的內容
    if (canvasContainer.value) {
      range.selectNodeContents(canvasContainer.value)
      selection.removeAllRanges()
      selection.addRange(range)
    }
    return
  }
  
  // Ctrl+X: 剪下
  if (key === 'x') {
    // 如果當前焦點在可編輯元素中，讓瀏覽器默認處理
    const activeElement = document.activeElement
    const isEditable = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.isContentEditable ||
      activeElement.closest('.cm-editor') // CodeMirror 編輯器
    )
    
    if (isEditable) {
      // 讓瀏覽器默認處理（剪下選中的文字）
      return
    }
    
    // 如果沒有選中文字，嘗試剪下選中的區塊
    const selection = window.getSelection()
    if (selection.toString().trim()) {
      // 有選中文字，讓瀏覽器默認處理
      return
    }
    
    // 可以擴展：剪下選中的區塊（如果實現了區塊選擇功能）
    event.preventDefault()
    return
  }
  
  // Ctrl+C: 複製
  if (key === 'c') {
    // 如果當前焦點在可編輯元素中，讓瀏覽器默認處理
    const activeElement = document.activeElement
    const isEditable = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.isContentEditable ||
      activeElement.closest('.cm-editor') // CodeMirror 編輯器
    )
    
    if (isEditable) {
      // 讓瀏覽器默認處理（複製選中的文字）
      return
    }
    
    // 如果沒有選中文字，嘗試複製選中的區塊
    const selection = window.getSelection()
    if (selection.toString().trim()) {
      // 有選中文字，讓瀏覽器默認處理
      return
    }
    
    // 可以擴展：複製選中的區塊（如果實現了區塊選擇功能）
    event.preventDefault()
    return
  }
  
  // Ctrl+V: 貼上
  if (key === 'v') {
    // 如果當前焦點在可編輯元素中，讓瀏覽器默認處理
    const activeElement = document.activeElement
    const isEditable = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.isContentEditable ||
      activeElement.closest('.cm-editor') // CodeMirror 編輯器
    )
    
    if (isEditable) {
      // 讓瀏覽器默認處理（貼上剪貼板內容）
      return
    }
    
    // 如果焦點不在可編輯元素中，嘗試在當前焦點位置貼上
    // 這裡可以擴展：在畫布上貼上區塊
    event.preventDefault()
    
    // 嘗試從剪貼板獲取文字並插入到當前位置
    navigator.clipboard.readText().then(text => {
      if (text && canvasContainer.value) {
        // 可以擴展：在畫布上插入文字區塊
        addBlock('text', text)
      }
    }).catch(err => {
      console.warn('無法讀取剪貼板:', err)
    })
    return
  }
}

// 打開圖片資料夾上傳
const openImageFolderUpload = () => {
  imageFolderInput.value?.click()
}

// 浮水印上傳
const openWatermarkUpload = () => {
  watermarkInput.value?.click()
}

const handleWatermarkUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  
  // 檢查檔案類型
  if (!file.type.startsWith('image/')) {
    alert('請上傳圖片檔案')
    event.target.value = ''
    return
  }
  
  // 讀取圖片為 Base64
  const reader = new FileReader()
  reader.onload = (e) => {
    watermarkImage.value = e.target.result
  }
  reader.readAsDataURL(file)
  
  // 清空 input
  event.target.value = ''
}

const removeWatermark = () => {
  watermarkImage.value = null
  watermarkEnabled.value = false
}

// 處理圖片資料夾上傳
const handleImageFolderUpload = async (event) => {
  const files = Array.from(event.target.files || [])
  
  // 過濾出圖片檔案
  const imageFiles = files.filter(file => 
    file.type.startsWith('image/')
  )
  
  if (imageFiles.length === 0) {
    alert('未找到圖片檔案')
    event.target.value = ''
    return
  }
  
  uploadingImages.value = true
  
  try {
    // 批次上傳 - 暫時使用單張上傳 API，後續需要後端支援批次上傳
    const uploadPromises = imageFiles.map(file => 
      uploadImageAPI.upload(file).then(response => ({
        originalName: file.name,
        url: response.data.url || response.data.image_url || response.data.url
      })).catch(error => {
        console.error(`上傳 ${file.name} 失敗:`, error)
        return null
      })
    )
    
    const results = await Promise.all(uploadPromises)
    
    // 建立映射表 - 檢查檔名衝突
    const conflictWarnings = []
    const successfulUploads = results.filter(r => r !== null)
    
    successfulUploads.forEach(result => {
      // 檢查是否會覆蓋現有映射
      if (imageMappings.value.has(result.originalName)) {
        if (!conflictWarnings.includes(result.originalName)) {
          conflictWarnings.push(result.originalName)
        }
      }
      // 使用原始檔名作為 key（這樣可以匹配 Markdown）
      // 注意：如果檔名重複，後面的會覆蓋前面的
      imageMappings.value.set(result.originalName, result.url)
    })
    
    // 持久化到 localStorage（使用資源專屬的 key）
    saveImageMappings()
    
    let message = `成功上傳 ${successfulUploads.length} 張圖片`
    if (conflictWarnings.length > 0) {
      message += `\n\n注意：有 ${conflictWarnings.length} 個檔名重複（${conflictWarnings.join(', ')}），已覆蓋舊的映射。`
    }
    alert(message)
    
  } catch (error) {
    console.error('圖片上傳失敗:', error)
    alert('圖片上傳失敗: ' + (error.message || '未知錯誤'))
  } finally {
    uploadingImages.value = false
    // 清空選擇
    event.target.value = ''
  }
}

// 替換所有圖片
const replaceAllImages = async () => {
  replacingImages.value = true
  
  try {
    let totalReplacedCount = 0
    
    // 判斷是分頁模式還是單一編輯器模式
    if (resource.mode === 'HANDOUT') {
      // 分頁模式：遍歷所有頁面編輯器
      for (let pageIndex = 0; pageIndex < pageEditorRefs.value.length; pageIndex++) {
        const editorRef = pageEditorRefs.value[pageIndex]
        if (!editorRef || !editorRef.editor) {
          continue
        }
        
        const replacedCount = await replaceImagesInEditor(editorRef.editor, pageIndex)
        totalReplacedCount += replacedCount
      }
    } else {
      // 單一編輯器模式
      if (!blockEditorRef.value || !blockEditorRef.value.editor) {
        replacingImages.value = false
        alert('編輯器未就緒，請稍後再試')
        return
      }
      
      totalReplacedCount = await replaceImagesInEditor(blockEditorRef.value.editor, null)
    }
    
    if (totalReplacedCount > 0) {
      alert(`成功替換 ${totalReplacedCount} 張圖片`)
    } else {
      alert('沒有找到需要替換的圖片')
    }
    
  } catch (error) {
    console.error('替換圖片失敗:', error)
    alert('替換圖片失敗: ' + (error.message || '未知錯誤'))
  } finally {
    replacingImages.value = false
  }
}

// 在單個編輯器中替換圖片的輔助函數
const replaceImagesInEditor = async (editor, pageIndex = null) => {
  const { state } = editor
  let replacedCount = 0
  const positions = []
  
  // 遍歷文檔找到所有需要替換的節點及其位置
  state.doc.descendants((node, pos) => {
    // 處理 image 節點
    if (node.type.name === 'image') {
      const title = node.attrs?.title || ''
      const alt = node.attrs?.alt || ''
      const src = node.attrs?.src || ''
      
      // 優先從 title 提取檔名（貼上時設置的）
      let filename = null
      if (title) {
        filename = title.split('/').pop().split('\\').pop()
      } else if (alt && !alt.startsWith('http') && !alt.includes('://')) {
        filename = alt.split('/').pop().split('\\').pop()
      } else if (src && !src.startsWith('http')) {
        filename = src.split('/').pop().split('\\').pop()
      } else if (src) {
        const urlParts = src.split('/')
        const lastPart = urlParts[urlParts.length - 1]
        if (lastPart.includes('.')) {
          filename = lastPart.split('?')[0].split('#')[0]
        }
      }
      
      if (filename) {
        let newUrl = null
        if (imageMappings.value.has(filename)) {
          newUrl = imageMappings.value.get(filename)
        } else {
          // 嘗試不區分大小寫匹配
          for (const [key, url] of imageMappings.value.entries()) {
            if (key.toLowerCase() === filename.toLowerCase()) {
              newUrl = url
              filename = key // 使用正確的檔名
              break
            }
          }
        }
        
        if (newUrl) {
          positions.push({
            type: 'image',
            pos: pos,
            newUrl: newUrl,
            filename: filename,
            alt: node.attrs?.alt || filename
          })
        }
      }
    }
    
    // 處理 imagePlaceholder 節點
    if (node.type.name === 'imagePlaceholder') {
      const filename = node.attrs?.filename || ''
      
      if (filename && imageMappings.value.has(filename)) {
        const newUrl = imageMappings.value.get(filename)
        positions.push({
          type: 'placeholder',
          pos: pos,
          newUrl: newUrl,
          filename: filename,
          alt: node.attrs?.alt || filename
        })
      }
    }
  })
    
  // 從後往前替換（避免位置偏移）
  positions.sort((a, b) => b.pos - a.pos)
  
  // 使用單一 transaction 來批量替換，確保所有操作原子性
  const tr = editor.state.tr
  
  for (const item of positions) {
    if (item.type === 'placeholder') {
      // 對於 imagePlaceholder 節點，需要獲取節點大小並使用 replaceWith
      const node = editor.state.doc.nodeAt(item.pos)
      if (node && node.type.name === 'imagePlaceholder') {
        const nodeSize = node.nodeSize
        const imageNode = editor.schema.nodes.image.create({
          src: item.newUrl,
          alt: item.alt,
          title: item.filename
        })
        tr.replaceWith(item.pos, item.pos + nodeSize, imageNode)
        replacedCount++
      }
    } else {
      // 對於已存在的 image 節點，只需要更新屬性
      const node = editor.state.doc.nodeAt(item.pos)
      if (node && node.type.name === 'image') {
        tr.setNodeMarkup(item.pos, null, {
          ...node.attrs,
          src: item.newUrl,
          alt: item.alt,
          title: item.filename
        })
        replacedCount++
      }
    }
  }
  
  // 一次性執行所有替換
  if (replacedCount > 0) {
    editor.view.dispatch(tr)
  }
  
  return replacedCount
}

// 監聽圖片映射表更新事件，自動保存
const handleImageMappingUpdated = () => {
  saveImageMappings()
}

onMounted(() => {
  fetchInitialData()
  
  // 添加全局鍵盤事件監聽器
  window.addEventListener('keydown', handleKeyboardShortcuts)
  
  // 監聽圖片映射表更新事件，自動保存
  window.addEventListener('imageMappingUpdated', handleImageMappingUpdated)
})

// 清理事件監聽器
onUnmounted(() => {
  // 移除鍵盤事件監聽器
  window.removeEventListener('keydown', handleKeyboardShortcuts)
  
  // 移除圖片映射表更新事件監聽器
  window.removeEventListener('imageMappingUpdated', handleImageMappingUpdated)
  
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})
</script>

<style scoped>
/* 拖動時的視覺效果 */
[draggable="true"] {
  user-select: none;
}

[draggable="true"]:active {
  cursor: grabbing;
}

/* 磁吸對齊線動畫 */
@keyframes snapPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* 拖動指示器 */
.drag-indicator {
  height: 2px;
  background: linear-gradient(90deg, transparent, #6366f1, transparent);
  animation: snapPulse 1s ease-in-out infinite;
}

@media print {
  @page {
    size: A4;
    margin: 0;
  }
  
  /* 隱藏側邊欄 */
  aside {
    display: none !important;
    visibility: hidden !important;
  }
  
  /* 隱藏頂部工具列 */
  header {
    display: none !important;
    visibility: hidden !important;
  }
  
  /* 隱藏所有按鈕 */
  button {
    display: none !important;
    visibility: hidden !important;
  }
  
  /* 隱藏拖動手柄和操作按鈕 */
  .absolute.-left-6,
  .absolute.-right-8,
  .group-hover\:opacity-100,
  .print\:hidden {
    display: none !important;
    visibility: hidden !important;
  }
  
  /* 頁面標題隱藏 */
  .absolute.-top-8 {
    display: none !important;
  }
  
  /* 空白狀態提示隱藏 */
  .h-40.flex {
    display: none !important;
  }
  
  /* 新增區塊按鈕隱藏 */
  .h-8.flex.items-center {
    display: none !important;
  }
  
  /* 重置根容器和主容器，確保列印時正確顯示 */
  .flex.h-screen {
    display: block !important;
    height: auto !important;
    background: white !important;
    overflow: visible !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  
  /* 確保主容器正確顯示 */
  main.flex-1 {
    display: block !important;
    background: white !important;
    overflow: visible !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  
  /* 確保畫布容器正確顯示 */
  .flex-1.overflow-auto {
    display: block !important;
    padding: 0 !important;
    overflow: visible !important;
    background: white !important;
    position: static !important;
    margin: 0 !important;
  }
  
  /* 顯示並格式化頁面容器 - 保持 A4 尺寸 */
  .print-paper {
    box-shadow: none !important;
    width: 210mm !important;
    max-width: 210mm !important;
    min-width: 210mm !important;
    padding: 20mm !important;
    margin: 0 auto !important;
    page-break-after: auto;
    position: relative;
    left: 0;
    top: 0;
    background: white !important;
    display: block !important;
    box-sizing: border-box !important;
  }
  
  /* 確保 .print-paper 內的所有內容正確顯示 - 只設置必要的屬性 */
  .print-paper img,
  .print-paper table {
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
  
  /* 確保題目內容正確顯示 - 不要過度覆蓋 prose 樣式 */
  .question-content {
    visibility: visible !important;
    color: black !important;
  }
  
  /* 確保 prose 樣式正常顯示，只設置必要的顏色 */
  .prose {
    visibility: visible !important;
    color: black !important;
  }
  
  .prose p,
  .prose h1,
  .prose h2,
  .prose h3,
  .prose h4,
  .prose h5,
  .prose h6,
  .prose ul,
  .prose ol,
  .prose li,
  .prose strong,
  .prose em {
    color: black !important;
    visibility: visible !important;
  }
  
  /* 確保 prose 內的 KaTeX 不受 prose 的 line-height 影響 */
  .prose .katex,
  .prose .katex * {
    line-height: normal !important;
  }
  
  /* 確保整個頁面背景是白色 */
  body,
  html {
    background: white !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: visible !important;
  }
  
  /* 移除編輯器外層的灰色背景和間距 */
  .bg-slate-100 {
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  
  /* 移除紙張容器的陰影和間距 */
  .print-paper {
    box-shadow: none !important;
    margin: 0 !important;
    padding: 20mm !important;
    max-width: 100% !important;
    width: 100% !important;
  }
  
  /* 確保編輯器容器正確顯示 */
  .block-editor-container {
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  
  
  .break-after-page {
    page-break-after: always;
    break-after: page;
  }
  
  .break-inside-avoid {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  
  /* 確保區塊不會被分頁切斷 */
  .group {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  
  /* 確保 Markdown 編輯器在列印時顯示內容 */
  :deep(.cm-editor) {
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
  }
  
  :deep(.cm-scroller) {
    overflow: visible !important;
  }
  
  :deep(.cm-content) {
    padding: 0 !important;
    background: transparent !important;
  }
  
  /* 隱藏 CodeMirror 的行號和編輯器 UI */
  :deep(.cm-lineNumbers),
  :deep(.cm-gutters),
  :deep(.cm-activeLineGutter) {
    display: none !important;
  }
  
  /* 確保文字可選和可讀 */
  :deep(.cm-line) {
    color: black !important;
  }
}

/* 連續編輯器樣式 */
.continuous-editor {
  position: relative;
  box-sizing: border-box;
}


</style>

<!-- 非 scoped 的列印樣式，確保能應用到所有元素 -->
<style>
@media print {
  @page {
    size: A4;
    margin: 20mm;
  }
  
  /* 確保內容可見 */
  * {
    overflow: visible !important;
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
  }
  
  *::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
    background: transparent !important;
  }
  
  /* 移除背景色 */
  body {
    background: white !important;
  }
  
  /* 強制隱藏側邊欄及其所有子元素 - 使用多種選擇器確保匹配 */
  aside,
  aside *,
  body > div > aside,
  body > div > aside *,
  .flex.h-screen > aside,
  .flex.h-screen > aside * {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    position: absolute !important;
    left: -9999px !important;
  }
  
  /* 強制隱藏頂部工具列及其所有子元素 - 使用多種選擇器確保匹配 */
  header,
  header *,
  main > header,
  main > header *,
  main.flex-1 > header,
  main.flex-1 > header * {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    position: absolute !important;
    left: -9999px !important;
  }
  
  /* 隱藏所有按鈕 */
  button {
    display: none !important;
    visibility: hidden !important;
  }
  
  /* 確保 KaTeX 數學公式正確顯示 - 防止 prose 樣式影響 */
  .katex {
    color: black !important;
    visibility: visible !important;
    font-family: KaTeX_Main, KaTeX_Math, KaTeX_Size1, KaTeX_Size2, KaTeX_Size3, KaTeX_Size4, "Times New Roman", serif !important;
    /* 重置可能被 prose 影響的屬性 */
    line-height: normal !important; /* 讓 KaTeX 自己控制 line-height */
    font-size: 1em !important;
  }
  
  /* 確保 KaTeX 在 prose 內時不受影響 */
  .prose .katex {
    line-height: normal !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  
  /* 針對上標中的分數，增加分子分母之間的間距 */
  .katex .msupsub .mfrac {
    padding-top: 0.15em !important;
    padding-bottom: 0.15em !important;
  }
  
  /* 增加分數線的厚度和上下間距，讓分數更清晰 */
  .katex .msupsub .mfrac .frac-line {
    border-bottom-width: 0.06em !important;
    min-height: 0.06em !important;
    margin-top: 0.1em !important;
    margin-bottom: 0.1em !important;
  }
  
  /* 確保分數的分子和分母容器有足夠的空間 */
  .katex .msupsub .mfrac .vlist-t2 {
    padding-top: 0.05em !important;
    padding-bottom: 0.05em !important;
  }
  
  /* 調整上標位置，讓它更往右上方 */
  .katex .msupsub {
    vertical-align: 0.3em !important; /* 增加上標的垂直偏移 */
    margin-left: 0.1em !important; /* 增加上標的水平偏移 */
  }
  
  /* 針對上標中的 vlist，確保有足夠的垂直空間 */
  .katex .msupsub .vlist-t {
    margin-top: 0.05em !important;
    margin-bottom: 0.05em !important;
  }
  
  /* 根號修復 - 防止根號線異常延長 */
  .katex .sqrt > .vlist-t {
    border-left-width: 0.04em !important;
  }
  .katex .sqrt .vlist-t .vlist-r .vlist .pstrut,
  .katex .sqrt .vlist-t .vlist-s {
    min-width: 0 !important;
  }
  .katex .sqrt .sqrt-sign {
    position: relative !important;
  }
  /* 確保根號內容不會影響根號線高度 */
  .katex .sqrt .vlist-t {
    display: inline-table !important;
    table-layout: auto !important;
  }
  /* 修復根號線過長問題 */
  .katex .sqrt > .root {
    margin-left: 0.27777778em !important;
    margin-right: -0.55555556em !important;
  }

  /* 確保 MathML 隱藏（使用 HTML 渲染） */
  .katex-mathml {
    display: none !important;
    visibility: hidden !important;
  }
  
  /* 只確保 KaTeX 內的元素可見且顏色正確，不干預布局 */
  .katex * {
    color: black !important;
    visibility: visible !important;
    /* 重置可能被 prose 影響的 line-height */
    line-height: inherit !important;
  }
  
  /* 確保畫布容器在列印時正確顯示 */
  .flex-1.overflow-auto,
  div[class*="overflow-auto"],
  main .flex-1.overflow-auto {
    overflow: visible !important;
    padding: 0 !important;
    margin: 0 !important;
    background: white !important;
  }
  
  /* 確保整個頁面背景是白色 */
  body,
  html {
    background: white !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: visible !important;
    height: auto !important;
  }
  
  /* 確保根容器正確顯示 */
  .flex.h-screen {
    overflow: visible !important;
    background: white !important;
  }
}
</style>
