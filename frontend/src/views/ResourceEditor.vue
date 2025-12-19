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

      <!-- Tab 切換 -->
      <div v-if="!viewMode" class="flex border-b border-slate-100">
        <button
          v-for="tab in ['settings', 'questions', 'templates']"
          :key="tab"
          @click="currentTab = tab"
          class="flex-1 py-3 text-sm font-medium transition-colors border-b-2"
          :class="currentTab === tab ? 'text-indigo-600 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'"
        >
          {{ tab === 'settings' ? '文件設定' : tab === 'questions' ? '題目庫' : '模板庫' }}
        </button>
      </div>
      <div v-else class="border-b border-slate-100 py-3 text-center">
        <span class="text-sm font-medium text-slate-600">唯讀模式</span>
      </div>

      <div class="flex-1 overflow-y-auto p-4">
        <!-- 設定面板 -->
        <div v-show="currentTab === 'settings'" class="space-y-6">
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

        <!-- 模板庫面板 -->
        <div v-show="currentTab === 'templates'" class="space-y-4">
          <div class="relative">
            <input
              v-model="templateSearch"
              type="text"
              placeholder="搜尋模板..."
              class="w-full rounded-md border-slate-300 pl-10 pr-4 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 border"
            >
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>

          <!-- 可拖曳模板列表 -->
          <div class="space-y-3 mt-4">
            <div
              v-for="template in filteredTemplates"
              :key="template.template_id"
              draggable="true"
              @dragstart="handleTemplateDragStart($event, template)"
              class="bg-white p-3 rounded border border-slate-200 shadow-sm cursor-move hover:border-indigo-300 hover:shadow-md transition-all group"
            >
              <div class="flex justify-between items-start mb-1">
                <span class="text-xs font-bold text-purple-600">模板</span>
                <span class="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">T{{ template.template_id }}</span>
              </div>
              <h4 class="text-sm font-semibold text-slate-800 mb-2">{{ template.title }}</h4>
              <div class="flex justify-between items-center">
                <div class="flex gap-1">
                  <span v-for="tag in (template.tags || []).slice(0, 2)" :key="tag" class="text-[10px] bg-purple-50 text-purple-600 px-1 rounded">#{{ tag }}</span>
                </div>
                <button @click="addTemplateBlock(template)" class="text-xs text-indigo-600 hover:text-indigo-800 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  + 加入
                </button>
              </div>
            </div>
            <div v-if="filteredTemplates.length === 0" class="text-center text-sm text-slate-400 py-4">
              {{ templateSearch ? '沒有找到符合的模板' : '尚無模板，請先創建模板' }}
            </div>
          </div>
        </div>

        <!-- 題目庫面板 -->
        <div v-show="currentTab === 'questions'" class="space-y-4">
          <div class="relative">
            <input
              v-model="questionSearch"
              type="text"
              placeholder="搜尋題目..."
              class="w-full rounded-md border-slate-300 pl-10 pr-4 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 border"
            >
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>

          <!-- 篩選器 -->
          <div class="space-y-2">
            <div class="grid grid-cols-2 gap-2">
              <select v-model="questionFilters.subject" class="rounded border-slate-300 text-xs py-1.5 px-2">
                <option value="">所有科目</option>
                <option v-for="s in subjects" :key="s.subject_id" :value="s.subject_id">{{ s.name }}</option>
              </select>
              <select v-model="questionFilters.level" class="rounded border-slate-300 text-xs py-1.5 px-2">
                <option value="">所有年級</option>
                <option value="JHS">國中</option>
                <option value="SHS">高中</option>
                <option value="VCS">高職</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <input
                v-model="questionFilters.chapter"
                type="text"
                placeholder="章節關鍵字"
                class="rounded border-slate-300 text-xs py-1.5 px-2"
              >
              <select v-model="questionFilters.difficulty" class="rounded border-slate-300 text-xs py-1.5 px-2">
                <option value="">所有難度</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>
            <div>
              <select v-model="questionFilters.tags" multiple class="w-full rounded border-slate-300 text-xs py-1.5 px-2 min-h-[60px]">
                <option value="">所有標籤</option>
                <option v-for="tag in availableTags" :key="tag.tag_id" :value="tag.tag_id">#{{ tag.tag_name }}</option>
              </select>
            </div>
            <button
              @click="resetQuestionFilters"
              class="w-full text-xs text-slate-600 hover:text-slate-800 font-semibold py-1"
            >
              清除篩選
            </button>
          </div>

          <!-- 可拖曳題目列表 -->
          <div class="space-y-3 mt-4">
            <div
              v-for="q in filteredQuestions"
              :key="q.question_id"
              draggable="true"
              @dragstart="handleDragStart($event, q)"
              class="bg-white p-3 rounded border border-slate-200 shadow-sm cursor-move hover:border-indigo-300 hover:shadow-md transition-all group"
            >
              <div class="flex justify-between items-start mb-1">
                <span class="text-xs font-bold text-slate-500">{{ q.subject_name }} / {{ q.chapter }}</span>
                <span class="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">Q{{ q.question_id }}</span>
              </div>
              <div class="text-sm text-slate-800 line-clamp-3 mb-2" v-html="renderMarkdownPreview(q.content)"></div>
              <div class="flex justify-between items-center">
                <div class="flex gap-1">
                  <span v-for="tag in (q.tags || []).slice(0, 2)" :key="tag" class="text-[10px] bg-indigo-50 text-indigo-600 px-1 rounded">#{{ tag }}</span>
                </div>
                <button @click="addQuestionBlock(q)" class="text-xs text-indigo-600 hover:text-indigo-800 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  + 加入
                </button>
              </div>
            </div>
            <div v-if="filteredQuestions.length === 0" class="text-center text-sm text-slate-400 py-4">
              沒有找到符合的題目
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
        class="flex-1 overflow-auto p-8 relative"
        @dragover.prevent="handleDragOver"
        @drop="handleDrop"
      >
        <!-- BlockEditor 編輯器 -->
        <div class="bg-white shadow-xl relative print:shadow-none print-paper mx-auto"
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
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, computed, nextTick, shallowRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { learningResourceAPI, courseAPI, studentGroupAPI, hashtagAPI, questionBankAPI, subjectAPI, contentTemplateAPI, uploadImageAPI } from '../services/api'
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
  // 如果有上一頁歷史，則返回；否則跳轉到題庫頁面
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/questions')
  }
}

// State
const sidebarOpen = ref(true)
const currentTab = ref('settings')
const isSaving = ref(false)
const lastSaved = ref(null)
const isInitializing = ref(true) // 標記是否正在初始化，避免觸發自動保存
const courses = ref([])
const studentGroups = ref([])
const availableTags = ref([])
const subjects = ref([])
const questions = ref([])
const loadingQuestions = ref(false)
const templates = ref([])
const templateSearch = ref('')

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

// 圖片映射表: Map<原檔名, 後端URL>
// 每個資源文件有獨立的映射表，使用資源 ID 作為 key
const imageMappings = ref(new Map())
const imageFolderInput = ref(null)
const uploadingImages = ref(false)
const replacingImages = ref(false)
const blockEditorRef = ref(null)

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
const tiptapStructure = computed({
  get() {
    if (Array.isArray(structure.value) && structure.value.length > 0) {
      return legacyToTiptapStructure(structure.value)
    }
    return {
      type: 'doc',
      content: [{ type: 'paragraph', content: [] }]
    }
  },
  set(value) {
    // 當 BlockEditor 更新時，轉換回舊格式
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

// Filters
const questionSearch = ref('')
const questionFilters = reactive({
  subject: '',
  level: '',
  chapter: '',
  difficulty: '',
  tags: [],
  source: ''
})

const resetQuestionFilters = () => {
  questionFilters.subject = ''
  questionFilters.level = ''
  questionFilters.chapter = ''
  questionFilters.difficulty = ''
  questionFilters.tags = []
  questionFilters.source = ''
  questionSearch.value = ''
}

// Computed
const filteredQuestions = computed(() => {
  return questions.value.filter(q => {
    const matchSearch = !questionSearch.value || 
      q.content.toLowerCase().includes(questionSearch.value.toLowerCase()) || 
      q.chapter.toLowerCase().includes(questionSearch.value.toLowerCase())
    
    const matchSubject = !questionFilters.subject || q.subject === questionFilters.subject || q.subject_id === questionFilters.subject
    const matchLevel = !questionFilters.level || q.level === questionFilters.level
    const matchChapter = !questionFilters.chapter || q.chapter.toLowerCase().includes(questionFilters.chapter.toLowerCase())
    const matchDifficulty = !questionFilters.difficulty || q.difficulty === parseInt(questionFilters.difficulty)
    const matchTags = !questionFilters.tags || questionFilters.tags.length === 0 || 
      (q.tags && questionFilters.tags.some(tagId => 
        q.tags.some(tag => typeof tag === 'object' ? tag.tag_id === parseInt(tagId) : tag === tagId)
      ))
    
    return matchSearch && matchSubject && matchLevel && matchChapter && matchDifficulty && matchTags
  }).slice(0, 50) // Limit display
})

const filteredTemplates = computed(() => {
  return templates.value.filter(t => {
    const matchSearch = !templateSearch.value || 
      t.title.toLowerCase().includes(templateSearch.value.toLowerCase())
    return matchSearch
  })
})

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

const addQuestionBlock = (question) => {
  const newBlock = {
    id: Date.now() + Math.random(),
    type: 'question',
    question_id: question.question_id
  }
  structure.value.push(newBlock)
  
  // 自動新增頁面如果需要的話
  setTimeout(() => {
    ensurePages()
  }, 100)
  return newBlock
}

const addTemplateBlock = (template) => {
  const newBlock = {
    id: Date.now() + Math.random(),
    type: 'template',
    template_id: template.template_id
  }
  structure.value.push(newBlock)
  return newBlock
}

const handleTemplateDragStart = (event, template) => {
  event.dataTransfer.setData('application/json', JSON.stringify({ type: 'template', template }))
  event.dataTransfer.effectAllowed = 'copy'
}

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
const handleDragStart = (event, question) => {
  event.dataTransfer.setData('application/json', JSON.stringify(question))
  event.dataTransfer.effectAllowed = 'copy'
}

const handleDragOver = (event) => {
  event.preventDefault()
}

const handleDrop = (event) => {
  try {
    const data = event.dataTransfer.getData('application/json')
    if (data) {
      const item = JSON.parse(data)
      if (item.type === 'template') {
        addTemplateBlock(item.template)
      } else {
        // 預設為 question
        addQuestionBlock(item)
      }
    }
  } catch (e) {
    console.error('Drop error', e)
  }
}

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
  
  if (!draggingBlock.value) {
    // 可能是從側邊欄拖動的題目
    handleDrop(event)
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
    const [cRes, gRes, tRes, sRes, qRes, templateRes] = await Promise.all([
      courseAPI.getAll(),
      studentGroupAPI.getAll(),
      hashtagAPI.getAll(),
      subjectAPI.getAll(),
      questionBankAPI.getAll(), // Fetch all for sidebar, optimize later with pagination/search API
      contentTemplateAPI.getAll()
    ])

    courses.value = cRes.data.results || cRes.data
    studentGroups.value = gRes.data.results || gRes.data
    availableTags.value = tRes.data.results || tRes.data
    subjects.value = sRes.data.results || sRes.data
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

const print = async () => {
  // 使用 iframe 隔離列印內容，確保樣式不受影響
  await nextTick() // 確保 DOM 已更新
  
  // 獲取所有有內容的頁面
  const paperElements = document.querySelectorAll('.print-paper')
  const pagesWithContent = Array.from(paperElements).filter(page => {
    // 檢查頁面是否有實際內容（排除空白頁）
    const hasBlocks = page.querySelector('[data-block-id]')
    const hasText = page.textContent.trim().length > 0
    return hasBlocks || hasText
  })
  
  if (pagesWithContent.length === 0) {
    alert('沒有可列印的內容')
    return
  }
  
  // 創建 iframe 用於列印
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
  
  // 複製必要的樣式表
  const stylesheets = Array.from(document.styleSheets)
  let styleContent = ''
  
  for (const sheet of stylesheets) {
    try {
      if (sheet.href) {
        // 外部樣式表
        const link = iframeDoc.createElement('link')
        link.rel = 'stylesheet'
        link.href = sheet.href
        iframeDoc.head.appendChild(link)
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
      size: ${resource.settings.paperSize === 'A4' ? 'A4' : 'B4'};
      margin: 0;
    }
    body {
      margin: 0;
      padding: 0;
      background: white;
    }
    .print-paper {
      width: ${resource.settings.paperSize === 'A4' ? '210mm' : '250mm'};
      min-height: ${resource.settings.paperSize === 'A4' ? '297mm' : '353mm'};
      padding: 20mm;
      margin: 0 auto;
      background: white;
      box-sizing: border-box;
    }
    /* KaTeX 分數樣式已從 markdown-preview.css 中自動包含 */
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
  
  // 等待內容渲染
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // 觸發列印
  printFrame.contentWindow.focus()
  printFrame.contentWindow.print()
  
  // 列印完成後清理
  setTimeout(() => {
    document.body.removeChild(printFrame)
  }, 1000)
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
  if (!blockEditorRef.value || !blockEditorRef.value.editor) {
    return
  }
  
  replacingImages.value = true
  
  try {
    const editor = blockEditorRef.value.editor
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
    
    for (const item of positions) {
      editor.chain()
        .focus()
        .setTextSelection(item.pos)
        .deleteSelection()
        .insertContent({
          type: 'image',
          attrs: {
            src: item.newUrl,
            alt: item.alt,
            title: item.filename
          }
        })
        .run()
      replacedCount++
    }
    
    if (replacedCount > 0) {
      alert(`成功替換 ${replacedCount} 張圖片`)
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
</style>

<!-- 非 scoped 的列印樣式，確保能應用到所有元素 -->
<style>
@media print {
  @page {
    size: A4;
    margin: 0;
  }
  
  /* 強制隱藏所有捲軸 */
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
  
  /* 確保分數正確顯示，防止重疊 */
  .katex .mfrac {
    /* 不設置任何樣式，讓 KaTeX 使用默認值 */
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
  
  /* 確保分數線正確顯示 */
  .katex .frac-line {
    /* 不設置任何樣式，讓 KaTeX 使用默認值 */
  }
  
  /* 調整上標位置，讓它更往右上方 */
  .katex .msupsub {
    vertical-align: 0.3em !important; /* 增加上標的垂直偏移 */
    margin-left: 0.1em !important; /* 增加上標的水平偏移 */
  }
  
  /* 確保上標/下標容器正確顯示 */
  .katex .vlist-t,
  .katex .vlist-r,
  .katex .vlist-s,
  .katex .vlist {
    /* 不設置任何樣式，讓 KaTeX 使用默認值 */
  }
  
  /* 針對上標中的 vlist，確保有足夠的垂直空間 */
  .katex .msupsub .vlist-t {
    margin-top: 0.05em !important;
    margin-bottom: 0.05em !important;
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
