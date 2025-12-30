<template>
  <aside class="w-80 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col shadow-lg z-10 transition-all duration-300" :class="{ '-ml-80': !sidebarOpen }">
    <div class="p-4 border-b border-slate-100 flex items-center justify-between">
      <h2 class="font-bold text-slate-800">資源編輯器</h2>
      <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 lg:hidden">
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
            @click="imageFolderInput?.click()" 
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
              @click="$emit('replace-all-images')" 
              class="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              :disabled="viewMode || replacingImages"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ replacingImages ? '替換中...' : '替換' }}
            </button>
            <button 
              @click="$emit('clear-image-mappings')" 
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
            @change="$emit('image-folder-upload', $event)"
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
                :checked="watermarkEnabled"
                @change="$emit('update:watermarkEnabled', $event.target.checked)"
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
                @click="watermarkInput?.click()" 
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
                @change="$emit('watermark-upload', $event)"
                style="display: none"
              />
              
              <!-- 浮水印預覽 -->
              <div v-if="watermarkImage" class="mt-2 p-2 bg-slate-50 rounded border border-slate-200">
                <img :src="watermarkImage" alt="浮水印預覽" class="max-h-20 mx-auto opacity-30">
                <button 
                  @click="$emit('remove-watermark')" 
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
                  :value="watermarkOpacity"
                  @input="$emit('update:watermarkOpacity', Number($event.target.value))"
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
              <button v-if="!viewMode" @click="$emit('remove-tag', tagId)" class="ml-1 text-indigo-600 hover:text-indigo-900">×</button>
            </span>
          </div>
          <select v-if="!viewMode" @change="$emit('add-tag', $event.target.value)" class="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
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
</template>

<script setup>
import { ref } from 'vue'
import { useResourceEditorContext } from '../composables/useResourceEditorContext'

// 使用 context 注入，減少 props
const {
  resource,
  viewMode,
  courses,
  studentGroups,
  availableTags,
  imageMappings,
  uploadingImages,
  replacingImages,
  watermarkEnabled,
  watermarkImage,
  watermarkOpacity,
  tiptapStructureRef,
  getTagName
} = useResourceEditorContext()

defineProps({
  sidebarOpen: {
    type: Boolean,
    default: true
  }
})

defineEmits([
  'close',
  'replace-all-images',
  'clear-image-mappings',
  'image-folder-upload',
  'watermark-upload',
  'remove-watermark',
  'add-tag',
  'remove-tag',
  'update:watermarkEnabled',
  'update:watermarkOpacity'
])

const showJson = ref(false)
const imageFolderInput = ref(null)
const watermarkInput = ref(null)
</script>
