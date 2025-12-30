<template>
  <div class="flex h-screen bg-slate-50 overflow-hidden">
    <!-- 左側邊欄：設定與資源庫 -->
    <ResourceEditorSidebar
      :sidebar-open="sidebarOpen"
      @close="sidebarOpen = false"
      @replace-all-images="replaceAllImages"
      @clear-image-mappings="clearImageMappings"
      @image-folder-upload="handleImageFolderUpload"
      @watermark-upload="handleWatermarkUpload"
      @remove-watermark="removeWatermark"
      @add-tag="addTag"
      @remove-tag="removeTag"
      @update:watermark-enabled="watermarkEnabled = $event"
      @update:watermark-opacity="watermarkOpacity = $event"
    />

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
            <option :value="PRINT_CONFIG.MODES.QUESTION_ONLY">純題目</option>
            <option :value="PRINT_CONFIG.MODES.WITH_ANSWER">題目+答案</option>
            <option :value="PRINT_CONFIG.MODES.WITH_SOLUTION">題目+詳解</option>
            <option :value="PRINT_CONFIG.MODES.WITH_ALL">題目+答案+詳解</option>
          </select>
          
          <button 
            @click="handlePrint(printModeSelection)" 
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
            padding: EDITOR_CONFIG.PADDING,
            minHeight: EDITOR_CONFIG.MIN_HEIGHT
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
            :is-handout-mode="resource.mode === 'HANDOUT'"
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
import { ref, computed, onMounted, onUnmounted, provide, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BlockEditor from '../components/BlockEditor/BlockEditor.vue'
import ResourceEditorSidebar from '../components/ResourceEditorSidebar.vue'
import { usePrintPreview } from '../composables/usePrintPreview'
import { useImageManagement } from '../composables/useImageManagement'
import { useQuestionPagination } from '../composables/useQuestionPagination'
import { useResourceEditor } from '../composables/useResourceEditor'
import { useResourceMetadata } from '../composables/useResourceMetadata'
import { useTagManagement } from '../composables/useTagManagement'
import { useWatermark } from '../composables/useWatermark'
import { useKeyboardShortcuts } from '../composables/useKeyboardShortcuts'
import { useEditorEventsProvider } from '../composables/useEditorEvents'
import { provideResourceEditorContext } from '../composables/useResourceEditorContext'
import { AUTO_SAVE_CONFIG, EDITOR_CONFIG, PRINT_CONFIG } from '../constants/editorConfig'
import { debounce } from '../utils/debounce'
import { formatTime } from '../utils/dateFormat'

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

const route = useRoute()
const router = useRouter()

// 返回上一頁
const goBack = () => {
  const returnTab = route.query.returnTab || 'questions'
  router.push({ path: '/questions', query: { tab: returnTab } })
}

// State
const sidebarOpen = ref(true)

// 使用資源元數據 composable
const {
  courses,
  studentGroups,
  availableTags,
  templates,
  fetchMetadata
} = useResourceMetadata()

// 使用題目分頁 composable
const {
  questions,
  questionsPagination,
  fetchInitialQuestions,
  loadMoreQuestions
} = useQuestionPagination()

// 圖片管理
const blockEditorRef = ref(null)

// 使用資源編輯 composable
const {
  resource,
  tiptapStructure,
  tiptapStructureRef,
  isSaving,
  lastSaved,
  isInitializing,
  handleBlockEditorUpdate,
  saveResource: saveResourceBase,
  initializeResource,
  setupAutoSave
} = useResourceEditor({
  viewMode: props.viewMode
})

// 使用圖片管理 composable
const {
  imageMappings,
  uploadingImages,
  replacingImages,
  loadImageMappings,
  saveImageMappings,
  clearImageMappings,
  migrateTempMappings,
  handleImageFolderUpload,
  openImageFolderUpload,
  replaceAllImages
} = useImageManagement({
  resourceId: computed(() => route.params.id),
  resourceTitle: computed(() => resource.title),
  blockEditorRef
})

// 包裝 saveResource 以傳遞 migrateTempMappings
const saveResource = (manual = false) => {
  return saveResourceBase(manual, { migrateTempMappings })
}

// 列印模式選擇
const printModeSelection = ref(PRINT_CONFIG.MODES.QUESTION_ONLY)

// 使用浮水印管理 composable
const {
  watermarkEnabled,
  watermarkImage,
  watermarkOpacity,
  handleWatermarkUpload,
  removeWatermark
} = useWatermark()

// 使用列印預覽 composable
const {
  isPreparingPrint,
  printPreparationMessage,
  print: handlePrint,
  preRenderPrintContent
} = usePrintPreview({
  watermarkEnabled,
  watermarkImage,
  watermarkOpacity
})

// 監聽列印模式變化，預先渲染（使用防抖避免頻繁調用）
const debouncedPreRender = debounce(() => {
  preRenderPrintContent(printModeSelection)
}, 800)

watch(printModeSelection, async (newMode) => {
  // 延遲執行，確保模式切換完成
  await nextTick()
  debouncedPreRender()
}, { immediate: false })

// 提供給子組件使用
provide('printMode', printModeSelection)

// 使用標籤管理 composable（必須在使用 getTagName 之前）
const {
  getTagName,
  addTag,
  removeTag
} = useTagManagement(resource, availableTags)

// 提供 Resource Editor 上下文給子組件（特別是 ResourceEditorSidebar）
provideResourceEditorContext({
  // 資源相關
  resource,
  viewMode: props.viewMode,
  
  // 元數據
  courses,
  studentGroups,
  availableTags,
  
  // 圖片管理
  imageMappings,
  uploadingImages,
  replacingImages,
  
  // 浮水印
  watermarkEnabled,
  watermarkImage,
  watermarkOpacity,
  
  // 其他
  tiptapStructureRef,
  getTagName
})

// 使用鍵盤快捷鍵 composable
useKeyboardShortcuts()

// 初始化編輯器事件提供者
const editorEvents = useEditorEventsProvider()

// formatTime 已從 utils/dateFormat.js 導入

// Data Fetching
const fetchInitialData = async () => {
  try {
    // 獲取元數據（使用 composable）
    await fetchMetadata()
    
    // 載入題目（使用 composable）
    await fetchInitialQuestions()

    // 初始化資源（使用 composable）
    await initializeResource({ loadImageMappings })
  } catch (error) {
    console.error('Failed to load data', error)
  }
}

// Auto-save (only in edit mode, not in view mode)
const debouncedSave = debounce(() => saveResource(false), AUTO_SAVE_CONFIG.DEBOUNCE_DELAY)

// 設置自動保存
setupAutoSave(debouncedSave)

// 監聽圖片映射表更新事件，自動保存
const handleImageMappingUpdated = () => {
  saveImageMappings()
}

// 註冊事件監聽器
const unregisterImageMapping = editorEvents.onImageMappingUpdated(handleImageMappingUpdated)

onMounted(() => {
  fetchInitialData()
  
  // 初始化時預渲染當前模式（使用防抖避免與 watch 衝突）
  debouncedPreRender()
})

onUnmounted(() => {
  unregisterImageMapping()
})
</script>

<style scoped>
/* 連續編輯器樣式 */
.continuous-editor {
  position: relative;
  box-sizing: border-box;
}
</style>
