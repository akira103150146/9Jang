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

          <!-- 模式特定設定（動態載入） -->
          <component
            :is="modeEditorComponent"
            v-if="modeEditorComponent"
            :settings="resource.settings"
            :structure="structure"
            @update:settings="updateSettings"
          />

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

          <!-- 學生群組 -->
          <div class="space-y-3">
            <label class="block text-sm font-medium text-slate-700">可見學生群組</label>
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
                <span class="text-xs font-semibold text-slate-600 block mb-1">Tiptap Format:</span>
                <pre class="bg-slate-50 p-2 rounded text-[10px] overflow-auto max-h-40 border border-slate-200">{{ JSON.stringify(tiptapStructure, null, 2) }}</pre>
              </div>
              <div>
                <span class="text-xs font-semibold text-slate-600 block mb-1">Legacy Format:</span>
                <pre class="bg-slate-50 p-2 rounded text-[10px] overflow-auto max-h-40 border border-slate-200">{{ JSON.stringify(structure, null, 2) }}</pre>
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
          <!-- 預覽模式切換按鈕 -->
          <button 
            @click="togglePreviewMode" 
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            :class="isPreviewMode 
              ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
              : 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-50'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {{ isPreviewMode ? '編輯模式' : '預覽模式' }}
          </button>
          <button @click="print" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            列印 / 預覽 PDF
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
        <!-- 預覽模式 -->
        <div v-if="isPreviewMode" class="preview-container">
          <iframe 
            ref="previewIframe"
            class="preview-iframe"
            sandbox="allow-same-origin"
          ></iframe>
        </div>
        
        <!-- 編輯模式 -->
        <template v-else>
          <!-- 講義模式：多個獨立紙張容器 -->
          <div v-if="resource.mode === 'HANDOUT'" class="p-8" ref="handoutContainerRef">
          <div 
            v-for="(pageContent, pageIndex) in handoutPages" 
            :key="`page-${pageIndex}`"
            class="paper-container mx-auto bg-white shadow-md mb-8 relative"
            :class="[
              (resource.settings?.handout?.paperSize === 'A4' || resource.settings?.paperSize === 'A4') ? 'w-[210mm]' : 'w-[250mm]'
            ]"
            :style="{
              height: (resource.settings?.handout?.paperSize === 'A4' || resource.settings?.paperSize === 'A4') ? '297mm' : '353mm',
              padding: '20mm',
              overflow: 'hidden'
            }"
          >
            <!-- 頁碼顯示 -->
            <div class="page-number-display absolute top-4 right-4 bg-white/90 px-3 py-1 rounded text-sm font-semibold text-gray-600 shadow-sm border border-gray-200">
              第 {{ pageIndex + 1 }} 頁
            </div>
            
            <!-- 該頁的 BlockEditor（可編輯） -->
            <BlockEditor
              :ref="el => { if (el) pageEditorRefs[pageIndex] = el }"
              :model-value="{ type: 'doc', content: pageContent }"
              @update:model-value="(newContent) => handlePageEditorUpdate(pageIndex, newContent.content || [])"
              :templates="templates"
              :questions="questions"
              :auto-page-break="false"
              :paper-size="resource.settings?.handout?.paperSize || resource.settings?.paperSize || 'A4'"
              :image-mappings="imageMappings"
              :readonly="false"
              :show-page-numbers="false"
              :ignore-external-updates="isUpdatingFromPageEditor"
              @request-upload="openImageFolderUpload"
            />
          </div>
        </div>
        
        <!-- 其他模式：單一編輯器 -->
        <div v-else class="relative print:shadow-none print-paper mx-auto bg-white shadow-sm my-8"
          :class="[
            resource.settings?.handout?.paperSize === 'A4' || resource.settings?.paperSize === 'A4' ? 'w-[210mm]' : 'w-[250mm]'
          ]"
          :style="{
            padding: '20mm',
            minHeight: (resource.settings?.handout?.paperSize === 'A4' || resource.settings?.paperSize === 'A4') ? '297mm' : '353mm'
          }"
        >
          <BlockEditor
            ref="blockEditorRef"
            :model-value="tiptapStructure"
            @update:model-value="handleBlockEditorUpdate"
            :templates="templates"
            :questions="questions"
            :auto-page-break="resource.mode === 'HANDOUT'"
            :paper-size="resource.settings?.handout?.paperSize || resource.settings?.paperSize || 'A4'"
            :image-mappings="imageMappings"
            @request-upload="openImageFolderUpload"
          />
        </div>
        </template>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, computed, nextTick, shallowRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { learningResourceAPI, courseAPI, studentGroupAPI, hashtagAPI, contentTemplateAPI, uploadImageAPI, questionBankAPI } from '../services/api'
import BlockEditor from '../components/BlockEditor/BlockEditor.vue'
import { useMarkdownRenderer } from '../composables/useMarkdownRenderer'
import { getModeConfig } from '../config/resourceModes'
import { legacyToTiptapStructure, tiptapToLegacyStructure } from '../components/BlockEditor/utils/structureConverter'

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

// Resource Data
const resource = reactive({
  title: '未命名文件',
  mode: 'HANDOUT',
  course_ids: [],
  student_group_ids: [],
  tag_ids: [],
  settings: {
    handout: {
      paperSize: 'A4',
      orientation: 'portrait'
    }
  }
})

const structure = ref([])
const showJson = ref(false) // 預設隱藏 JSON

// 講義模式下直接使用 Tiptap JSON（避免轉換丟失）
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

// 預覽模式狀態
const isPreviewMode = ref(false)
const previewIframe = ref(null)

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
// 在講義模式下，直接使用 tiptapStructureRef，避免轉換丟失
const tiptapStructure = computed({
  get() {
    // 講義模式：直接使用 Tiptap JSON
    if (resource.mode === 'HANDOUT') {
      return tiptapStructureRef.value
    }
    // 其他模式：從舊格式轉換
    if (Array.isArray(structure.value) && structure.value.length > 0) {
      return legacyToTiptapStructure(structure.value)
    }
    return {
      type: 'doc',
      content: [{ type: 'paragraph', content: [] }]
    }
  },
  set(value) {
    // 講義模式：直接更新 Tiptap JSON
    if (resource.mode === 'HANDOUT') {
      tiptapStructureRef.value = value
      // 同時更新 structure.value 以便保存（轉換為舊格式）
      if (value && value.type === 'doc') {
        structure.value = tiptapToLegacyStructure(value)
      }
      return
    }
    // 其他模式：轉換回舊格式
    if (value && value.type === 'doc') {
      structure.value = tiptapToLegacyStructure(value)
    }
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

// 存儲每個頁面的編輯器實例引用（用於跨頁編輯同步）
const pageEditorRefs = ref([])
// 防止循環更新的標誌
const isUpdatingFromPageEditor = ref(false)
// 講義容器引用（用於檢查滾動）
const handoutContainerRef = ref(null)
// 畫布容器引用
const canvasContainerRef = ref(null)

// 計算講義模式的頁面分割
const handoutPages = computed(() => {
  if (resource.mode !== 'HANDOUT') return []
  
  const paperSize = resource.settings?.handout?.paperSize || resource.settings?.paperSize || 'A4'
  const pageHeightPx = paperSize === 'A4' ? 971 : 1183 // A4: 257mm * 3.7795, B4: 313mm * 3.7795
  const pages = []
  let currentPage = []
  let currentHeight = 0
  
  // 取得 Tiptap 結構的內容
  const content = tiptapStructure.value?.content || []
  
  // 遍歷所有頂層節點
  content.forEach((node) => {
    // 如果是分頁符號，強制開始新頁
    if (node.type === 'pageBreak') {
      if (currentPage.length > 0) {
        pages.push([...currentPage])
        currentPage = []
        currentHeight = 0
      }
      return // 分頁符號本身不加入任何頁面
    }
    
    // 估算節點高度
    const estimatedHeight = estimateNodeHeight(node)
    
    // 如果加入此節點會超過頁面高度，且當前頁已有內容
    if (currentHeight + estimatedHeight > pageHeightPx && currentPage.length > 0) {
      // 完整節點移到下一頁（不分割）
      pages.push([...currentPage])
      currentPage = [node]
      currentHeight = estimatedHeight
    } else {
      // 節點可以放在當前頁
      currentPage.push(node)
      currentHeight += estimatedHeight
    }
  })
  
  // 加入最後一頁
  if (currentPage.length > 0) {
    pages.push(currentPage)
  }
  
  // 如果沒有任何內容，至少返回一頁空頁
  if (pages.length === 0) {
    pages.push([])
  }
  
  
  return pages
})

// 檢查頁面內容是否超過頁面高度，如果超過則自動分割
const checkAndSplitPage = async (pageIndex, pageContent) => {
  const paperSize = resource.settings?.handout?.paperSize || resource.settings?.paperSize || 'A4'
  const pageHeightPx = paperSize === 'A4' ? 971 : 1183
  
  // 等待 DOM 更新
  await nextTick()
  
  // 嘗試獲取實際 DOM 高度
  const editorRef = pageEditorRefs.value[pageIndex]
  let actualHeight = 0
  
  if (editorRef && editorRef.editor && editorRef.editor.view) {
    const editorDOM = editorRef.editor.view.dom
    if (editorDOM) {
      // 獲取游標提示方塊的高度
      const cursorIndicator = document.querySelector('.cursor-indicator')
      let cursorIndicatorHeight = 0
      if (cursorIndicator) {
        cursorIndicatorHeight = cursorIndicator.offsetHeight
        const marginBottom = parseFloat(window.getComputedStyle(cursorIndicator).marginBottom) || 0
        cursorIndicatorHeight += marginBottom
      }
      
      // 實際內容高度 = scrollHeight - cursorIndicatorHeight
      actualHeight = editorDOM.scrollHeight - cursorIndicatorHeight
    }
  }
  
  // 如果無法獲取實際高度，使用估算高度
  if (actualHeight === 0) {
    pageContent.forEach((node) => {
      actualHeight += estimateNodeHeight(node)
    })
  }
  
  // 如果內容超過頁面高度，需要分割
  if (actualHeight > pageHeightPx && pageContent.length > 0) {
    const currentPage = []
    const nextPage = []
    let currentHeight = 0
    
    // 將節點分配到當前頁和下一頁
    pageContent.forEach((node) => {
      const nodeHeight = estimateNodeHeight(node)
      
      // 如果加入此節點會超過頁面，且當前頁已有內容
      if (currentHeight + nodeHeight > pageHeightPx && currentPage.length > 0) {
        // 完整節點移到下一頁（不分割）
        nextPage.push(node)
      } else {
        currentPage.push(node)
        currentHeight += nodeHeight
      }
    })
    
    return { currentPage, nextPage, needsNewPage: nextPage.length > 0 }
  }
  
  return { currentPage: pageContent, nextPage: [], needsNewPage: false }
}

// 處理單頁編輯器更新（跨頁編輯同步）
const handlePageEditorUpdate = async (pageIndex, pageContent) => {
  
  // 防止循環更新
  if (isUpdatingFromPageEditor.value) {
    return
  }
  
  isUpdatingFromPageEditor.value = true
  
  try {
    // 從所有頁面的編輯器實例獲取內容並合併成連續流（不插入任何 pageBreak）
    const newContent = []
    
    
    // 只從編輯器實例獲取內容，不使用 currentPages（避免使用舊的分頁結果）
    for (let idx = 0; idx < pageEditorRefs.value.length; idx++) {
      const editorRef = pageEditorRefs.value[idx]
      
      if (idx === pageIndex) {
        // 使用更新後的頁面內容
        if (pageContent && pageContent.length > 0) {
          newContent.push(...pageContent)
        }
      } else if (editorRef && editorRef.editor) {
        // 從其他頁面的編輯器實例獲取當前內容
        const pageJson = editorRef.editor.getJSON()
        if (pageJson?.content && pageJson.content.length > 0) {
          newContent.push(...pageJson.content)
        }
      }
      // 如果編輯器實例不存在，跳過（不添加任何內容）
      // 這樣可以避免使用舊的 currentPages 導致內容重複
      // 注意：完全不插入 pageBreak，讓 handoutPages computed 自動根據內容高度計算分頁
    }
    
    
    // 過濾無效節點（空的 paragraph 節點會被 Tiptap 過濾掉，所以我們先過濾掉）
    const validContent = newContent.filter(n => {
      if (!n || !n.type) return false
      // 空的 paragraph 節點會被 Tiptap 過濾，但我們保留它們，因為它們可能是有意義的空白
      // 實際上，Tiptap 會自動處理這些，所以我們不需要過濾
      return true
    })
    
    
    // 更新主 tiptapStructure（講義模式下直接更新 tiptapStructureRef，避免轉換丟失）
    if (resource.mode === 'HANDOUT') {
      tiptapStructureRef.value = {
        type: 'doc',
        content: validContent
      }
      // 同時更新 structure.value 以便保存（轉換為舊格式）
      structure.value = tiptapToLegacyStructure(tiptapStructureRef.value)
      
      // 等待響應式更新完成，確保 handoutPages 能正確重新計算
      await nextTick()
      // 再次等待，確保所有 computed 屬性都重新計算完成
      await nextTick()
      
    } else {
      tiptapStructure.value = {
        type: 'doc',
        content: validContent
      }
    }
  } finally {
    // 延遲重置標誌，確保所有響應式更新完成
    setTimeout(() => {
      isUpdatingFromPageEditor.value = false
    }, 150)
  }
}

// 模式編輯器組件（動態載入）
const modeEditorComponent = shallowRef(null)

// 載入模式編輯器
const loadModeEditor = async () => {
  // 在 viewMode 下不載入編輯器組件，避免響應式循環
  if (props.viewMode) {
    modeEditorComponent.value = null
    return
  }
  
  const modeConfig = getModeConfig(resource.mode)
  if (modeConfig && modeConfig.editor) {
    try {
      const editorModule = await modeConfig.editor()
      modeEditorComponent.value = editorModule.default || editorModule
    } catch (error) {
      console.error('載入模式編輯器失敗：', error)
      modeEditorComponent.value = null
    }
  } else {
    modeEditorComponent.value = null
  }
}

// 更新設定（避免在初始化期間觸發不必要的更新）
const updateSettings = (newSettings) => {
  if (isInitializing.value) return
  resource.settings = { ...resource.settings, ...newSettings }
}

// 監聽模式變化，重新載入編輯器
// 監聽 handoutPages 長度變化，重置 pageEditorRefs
watch(() => handoutPages.value.length, (newLength) => {
  if (pageEditorRefs.value.length !== newLength) {
    pageEditorRefs.value = new Array(newLength).fill(null)
  }
}, { immediate: true })

watch(() => resource.mode, () => {
  loadModeEditor()
  // 根據模式初始化設定（在 viewMode 或初始化期間不修改 settings）
  if (!props.viewMode && !isInitializing.value) {
    const modeConfig = getModeConfig(resource.mode)
    if (modeConfig && modeConfig.defaultSettings) {
      resource.settings = {
        ...resource.settings,
        ...modeConfig.defaultSettings
      }
    }
  }
}, { immediate: true })

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

// Block Operations
const addBlock = async (type, content = '') => {
  const newBlock = {
    id: Date.now() + Math.random(),
    type,
    content: type === 'text' ? content : null,
    question_id: null
  }
  structure.value.push(newBlock)
  return newBlock
}

// 移除拖拽相關函數：addQuestionBlock、addTemplateBlock、handleTemplateDragStart

const removeBlock = (index) => {
  structure.value.splice(index, 1)
}

const moveBlock = (index, direction) => {
  if (index + direction < 0 || index + direction >= structure.value.length) return
  const temp = structure.value[index]
  structure.value[index] = structure.value[index + direction]
  structure.value[index + direction] = temp
}

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
  
  // 移動區塊到新位置
  const originalIndex = draggingBlock.value.originalIndex
  const targetIndex = dragOverIndex.value !== null ? dragOverIndex.value : structure.value.length
  
  if (originalIndex !== targetIndex && originalIndex !== targetIndex - 1) {
    // 移除原位置
    const block = structure.value.splice(originalIndex, 1)[0]
    
    // 插入新位置
    const insertIndex = originalIndex < targetIndex ? targetIndex - 1 : targetIndex
    structure.value.splice(insertIndex, 0, block)
  }
  
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
      questionBankAPI.getAll(),
      contentTemplateAPI.getAll()
    ])

    courses.value = cRes.data.results || cRes.data
    studentGroups.value = gRes.data.results || gRes.data
    availableTags.value = tRes.data.results || tRes.data
    questions.value = qRes.data.results || qRes.data
    templates.value = templateRes.data.results || templateRes.data

    // If edit mode
    if (route.params.id) {
      const res = await learningResourceAPI.getById(route.params.id)
      const data = res.data
      resource.title = data.title
      resource.mode = data.mode || 'HANDOUT'
      resource.course_ids = data.courses?.map(c => c.course_id) || []
      // 載入對應的模式編輯器
      await loadModeEditor()
      resource.student_group_ids = data.student_group_ids || []
      resource.tag_ids = data.tag_ids || []
      // 確保 settings 有完整的默認值
      const defaultSettings = {
        handout: {
          paperSize: 'A4',
          orientation: 'portrait',
          outputFormats: ['question_only'],
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
          fontSize: 12,
          lineHeight: 1.5
        }
      }
      resource.settings = data.settings ? {
        ...defaultSettings,
        ...data.settings,
        handout: {
          ...defaultSettings.handout,
          ...(data.settings.handout || {})
        }
      } : defaultSettings
      structure.value = data.structure || []
      
      // 講義模式：初始化 tiptapStructureRef
      if (resource.mode === 'HANDOUT') {
        // 優先使用 Tiptap JSON (如果存在於 data 中)
        if (data.tiptap_structure && data.tiptap_structure.type === 'doc') {
          tiptapStructureRef.value = data.tiptap_structure
        } else if (Array.isArray(structure.value) && structure.value.length > 0) {
          // 降級處理：從舊格式轉換（但會丟失格式）
          tiptapStructureRef.value = legacyToTiptapStructure(structure.value)
        } else {
          tiptapStructureRef.value = {
            type: 'doc',
            content: [{ type: 'paragraph', content: [] }]
          }
        }
      }
      
      // 載入該資源的圖片映射表
      loadImageMappings()
    } else if (route.query.template_id) {
      // 如果從 template 創建，載入 template 內容
      try {
        const templateRes = await contentTemplateAPI.getById(route.query.template_id)
        const template = templateRes.data
        if (template.structure && template.structure.length > 0) {
          // 將 template 的 structure 插入到文件開頭
          structure.value = [...template.structure]
          
          // 講義模式：初始化 tiptapStructureRef
          if (resource.mode === 'HANDOUT') {
            tiptapStructureRef.value = legacyToTiptapStructure(structure.value)
          }
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

// Saving
const saveResource = async (manual = false) => {
  if (!resource.title) return
  
  isSaving.value = true
  
  const payload = {
    ...resource,
    structure: structure.value,
    tag_ids_input: resource.tag_ids,
    student_group_ids: resource.student_group_ids
  }
  
  // 對於 HANDOUT 模式，同時保存 Tiptap JSON 格式
  if (resource.mode === 'HANDOUT' && tiptapStructureRef.value) {
    payload.tiptap_structure = tiptapStructureRef.value
  }
  
  try {
    let response
    if (route.params.id) {
      response = await learningResourceAPI.update(route.params.id, payload)
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
      structure
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

// 監聽內容變化,在預覽模式下自動更新預覽
const debouncedPreviewUpdate = debounce(() => {
  if (isPreviewMode.value) {
    renderPreview()
  }
}, 500)

watch(
  () => tiptapStructure.value,
  () => {
    if (isPreviewMode.value) {
      debouncedPreviewUpdate()
    }
  },
  { deep: true }
)

// 生成預覽內容的通用函數
const generatePrintPreview = async (iframeDoc, iframeWindow, triggerPrint = false) => {
  // 使用 iframe 隔離列印內容，確保樣式不受影響
  await nextTick() // 確保 DOM 已更新
  
  // 獲取紙張大小設定
  const paperSize = resource.settings?.handout?.paperSize || resource.settings?.paperSize || 'A4'
  const paperWidth = paperSize === 'A4' ? '210mm' : '250mm'
  const paperHeight = paperSize === 'A4' ? '297mm' : '353mm'
  
  // 獲取所有有內容的頁面 - 支持 .print-paper 和 .paper-container
  const printPaperElements = document.querySelectorAll('.print-paper')
  const paperContainerElements = document.querySelectorAll('.paper-container')
  const allPaperElements = [...printPaperElements, ...paperContainerElements]
  
  
  const pagesWithContent = Array.from(allPaperElements).filter(page => {
    // 檢查頁面是否有實際內容（排除空白頁）
    const hasBlocks = page.querySelector('[data-block-id]')
    const hasText = page.textContent.trim().length > 0
    const hasProseMirror = page.querySelector('.ProseMirror')
    
    
    return hasBlocks || hasText || hasProseMirror
  })
  
  
  if (pagesWithContent.length === 0) {
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
    @page {
      size: ${paperSize};
      margin: 0;
    }
    body {
      margin: 0;
      padding: 0;
      background: white;
    }
    .print-paper, .paper-container {
      width: ${paperWidth};
      min-height: ${paperHeight};
      padding: 20mm;
      margin: 0 auto;
      background: white;
      box-sizing: border-box;
      page-break-after: always;
      break-after: page;
    }
    .print-paper:last-child, .paper-container:last-child {
      page-break-after: auto;
      break-after: auto;
    }
    /* 修復根號線拉長問題：限制根號內部元素的最大高度 */
    .katex .sqrt .vlist-t {
      max-height: 1.2em !important;
      overflow: hidden !important;
    }
    /* 確保 SVG 根號線不會被裁剪 */
    .katex .sqrt .svg-align {
      overflow: visible !important;
    }
    /* 隱藏可能產生垂直線的 vlist-t2 邊框 */
    .katex .sqrt .vlist-t2 {
      border-left: none !important;
    }
  `
  iframeDoc.head.appendChild(styleEl)
  
  // 複製頁面內容到 iframe
  const container = iframeDoc.createElement('div')
  container.style.background = 'white'
  
  pagesWithContent.forEach((page, index) => {
    const clone = page.cloneNode(true)
    
    // 確保所有樣式都被複製
    const computedStyle = window.getComputedStyle(page)
    clone.style.cssText = computedStyle.cssText
    clone.style.margin = '0'
    clone.style.marginBottom = index < pagesWithContent.length - 1 ? '20mm' : '0'
    container.appendChild(clone)
  })
  
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

// 簡化後的 print() 函數
const print = async () => {
  
  // 創建臨時 iframe 用於列印
  const printFrame = document.createElement('iframe')
  printFrame.style.position = 'fixed'
  printFrame.style.right = '0'
  printFrame.style.bottom = '0'
  printFrame.style.width = '0'
  printFrame.style.height = '0'
  printFrame.style.border = '0'
  document.body.appendChild(printFrame)
  
  // 等待 iframe 載入
  await new Promise(resolve => {
    printFrame.onload = resolve
    printFrame.src = 'about:blank'
  })
  
  const iframeDoc = printFrame.contentDocument || printFrame.contentWindow.document
  const iframeWindow = printFrame.contentWindow
  
  // 生成預覽並觸發列印
  await generatePrintPreview(iframeDoc, iframeWindow, true)
  
  // 列印完成後清理
  setTimeout(() => {
    document.body.removeChild(printFrame)
  }, 1000)
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

// 切換預覽模式
const togglePreviewMode = async () => {
  isPreviewMode.value = !isPreviewMode.value
  
  if (isPreviewMode.value) {
    await nextTick()
    renderPreview()
  }
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

onMounted(() => {
  fetchInitialData()
  
  // 添加全局鍵盤事件監聽器
  window.addEventListener('keydown', handleKeyboardShortcuts)
})

// 清理事件監聽器
onUnmounted(() => {
  // 移除鍵盤事件監聽器
  window.removeEventListener('keydown', handleKeyboardShortcuts)
  
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
  
  /* 多紙張容器列印樣式 */
  .paper-container {
    page-break-after: always;
    break-after: page;
    margin-bottom: 0 !important;
    box-shadow: none !important;
  }
  
  .paper-container:last-child {
    page-break-after: auto;
    break-after: auto;
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

/* 講義模式：多紙張容器樣式 */
.paper-container {
  position: relative;
  box-sizing: border-box;
}

.page-number-display {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.95);
  padding: 0.375rem 0.875rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  z-index: 10;
  pointer-events: none;
}

/* 列印時的頁碼樣式 */
@media print {
  .page-number-display {
    background: transparent;
    box-shadow: none;
    border: none;
    color: #9ca3af;
    font-size: 10pt;
  }
}

/* 預覽容器 */
.preview-container {
  width: 100%;
  height: 100%;
  background: #525659;
  padding: 20px;
  overflow: auto;
}

/* 預覽 iframe */
.preview-iframe {
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  display: block;
  background: white;
  border: none;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
              0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* 預覽模式下的縮放控制 */
.zoom-controls {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: white;
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 8px;
  z-index: 100;
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
