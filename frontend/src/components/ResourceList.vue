<template>
  <div>
    <!-- 篩選與操作 -->
    <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div class="flex items-center gap-2">
        <select v-model="filters.resource_type" class="rounded-lg border-slate-300 text-sm focus:ring-indigo-500">
          <option value="">所有類型</option>
          <option value="QUIZ">小考</option>
          <option value="EXAM">段考卷</option>
          <option value="HANDOUT">講義</option>
          <option value="DOCUMENT">一般文件</option>
        </select>
        <button @click="fetchResources" class="text-slate-500 hover:text-indigo-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div class="flex gap-2">
        <button
          @click="createQuestion"
          class="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-indigo-600 hover:to-purple-600"
        >
          + 新增題目
        </button>
        <button
          @click="importQuestions"
          class="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-green-600 hover:to-emerald-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          匯入外部題本
        </button>
        <button
          @click="createResource"
          class="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          + 新增文件
        </button>
      </div>
    </div>

    <!-- 列表 -->
    <div v-if="loading" class="text-center py-12 text-slate-500">載入中...</div>
    <div v-else-if="resources.length === 0" class="text-center py-12 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
      尚無文件，點擊右上角新增
    </div>
    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="resource in resources"
        :key="resource.resource_id"
        @click="showResourcePreview(resource)"
        class="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
      >
        <div class="flex items-start justify-between mb-2">
          <span
            class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset"
            :class="getModeColor(resource.mode)"
          >
            {{ getModeName(resource.mode) }}
          </span>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click.stop="editResource(resource.resource_id)" class="p-1 text-slate-400 hover:text-indigo-600" title="編輯">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button @click.stop="deleteResource(resource.resource_id)" class="p-1 text-slate-400 hover:text-rose-600" title="刪除">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        <h3 class="text-base font-bold text-slate-900 mb-1 line-clamp-1">
          {{ resource.title }}
        </h3>
        
        <div class="text-xs text-slate-500 mb-4 flex items-center gap-2">
          <span>{{ resource.course_name || '無課程' }}</span>
          <span>•</span>
          <span>{{ formatDate(resource.updated_at) }}</span>
        </div>
        
        <div class="mt-auto flex flex-wrap gap-1">
          <span v-for="tag in (resource.tags || []).slice(0, 3)" :key="tag" class="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
            #{{ tag }}
          </span>
        </div>
      </div>
    </div>

    <!-- 資源預覽 Modal -->
    <div
      v-if="previewResource"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      @click.self="closePreview"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-slate-200">
          <div class="flex items-center gap-3">
            <span
              class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset"
              :class="getModeColor(previewResource.mode)"
            >
              {{ getModeName(previewResource.mode) }}
            </span>
            <h2 class="text-xl font-bold text-slate-900">{{ previewResource.title }}</h2>
          </div>
          <button
            @click="closePreview"
            class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div v-if="loadingPreview" class="text-center py-12 text-slate-500">
            載入中...
          </div>
          <div v-else-if="previewError" class="text-center py-12 text-rose-500">
            載入失敗，請稍後再試
          </div>
          <div v-else-if="previewResource.tiptap_structure && previewResource.tiptap_structure.type === 'doc'">
            <!-- 使用 BlockEditor 唯讀模式顯示預覽 -->
            <div class="bg-white shadow-lg rounded-lg p-8 mx-auto max-w-4xl">
              <BlockEditor
                :model-value="previewResource.tiptap_structure"
                :templates="[]"
                :questions="[]"
                :auto-page-break="false"
                :readonly="true"
                :show-page-numbers="true"
              />
            </div>
          </div>
          <div v-else class="text-center py-12 text-slate-400">
            此文件尚無內容
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
          <button
            @click="closePreview"
            class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            關閉
          </button>
          <button
            @click="editResource(previewResource.resource_id)"
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            編輯文件
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { learningResourceAPI } from '../services/api'
import BlockEditor from './BlockEditor/BlockEditor.vue'
import { useEditorEventsProvider } from '../composables/useEditorEvents'
import type { LearningResource, TiptapDocument } from '@9jang/shared'

// 初始化編輯器事件提供者（BlockEditor 需要）
useEditorEventsProvider()

type ResourceMode = 'HANDOUT' | 'ONLINE_QUIZ' | 'LEETCODE' | 'LISTENING_TEST' | 'FLASHCARD'

interface Resource extends Partial<LearningResource> {
  resource_id: number
  title: string
  mode: ResourceMode
  course_name?: string
  updated_at?: string
  tags?: string[]
  tiptap_structure?: TiptapDocument
  [key: string]: unknown
}

interface Filters {
  resource_type: string
}

const router = useRouter()

const resources: Ref<Resource[]> = ref([])
const loading: Ref<boolean> = ref(false)
const previewResource: Ref<Resource | null> = ref(null)
const loadingPreview: Ref<boolean> = ref(false)
const previewError: Ref<boolean> = ref(false)
const filters = reactive<Filters>({
  resource_type: ''
})

const getModeColor = (mode: string): string => {
  const map: Record<string, string> = {
    HANDOUT: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    ONLINE_QUIZ: 'bg-green-50 text-green-700 ring-green-600/20',
    LEETCODE: 'bg-purple-50 text-purple-700 ring-purple-600/20',
    LISTENING_TEST: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
    FLASHCARD: 'bg-pink-50 text-pink-700 ring-pink-600/20'
  }
  return map[mode] || map['HANDOUT']
}

const getModeName = (mode: string): string => {
  const map: Record<string, string> = {
    HANDOUT: '講義模式',
    ONLINE_QUIZ: '線上測驗模式',
    LEETCODE: '程式題模式',
    LISTENING_TEST: '聽力測驗模式',
    FLASHCARD: '單字卡模式'
  }
  return map[mode] || mode
}

const formatDate = (dateString: string | unknown): string => {
  if (!dateString) return ''
  return new Date(dateString as string).toLocaleDateString()
}

const fetchResources = async (): Promise<void> => {
  loading.value = true
  try {
    const params: { resource_type?: string } = {}
    if (filters.resource_type) params.resource_type = filters.resource_type

    const response = await learningResourceAPI.getAll(params)
    resources.value = Array.isArray(response.data)
      ? response.data
      : (response.data as { results?: Resource[] }).results || []
  } catch (error) {
    console.error('Fetch resources failed', error)
  } finally {
    loading.value = false
  }
}

const createResource = (): void => {
  router.push({ path: '/resources/new', query: { returnTab: 'resources' } })
}

const createQuestion = (): void => {
  router.push('/questions/new')
}

const importQuestions = (): void => {
  router.push('/questions/import')
}

const editResource = (id: number): void => {
  router.push({ path: `/resources/edit/${id}`, query: { returnTab: 'resources' } })
}

const deleteResource = async (id: number): Promise<void> => {
  if (!confirm('確定要刪除此文件嗎？此操作無法復原。')) return
  try {
    await learningResourceAPI.delete(id)
    fetchResources()
  } catch (error) {
    console.error('Delete failed', error)
    alert('刪除失敗')
  }
}

const showResourcePreview = async (resource: Resource): Promise<void> => {
  // 如果只有基本信息，需要獲取完整的資源詳情（包含 tiptap_structure）
  if (!resource.tiptap_structure) {
    loadingPreview.value = true
    previewError.value = false
    try {
      const response = await learningResourceAPI.getById(resource.resource_id)
      previewResource.value = response.data as Resource
    } catch (error) {
      console.error('獲取資源詳情失敗：', error)
      previewError.value = true
      previewResource.value = resource
    } finally {
      loadingPreview.value = false
    }
  } else {
    previewResource.value = resource
  }
}

const closePreview = (): void => {
  previewResource.value = null
  loadingPreview.value = false
  previewError.value = false
}

watch(() => filters.resource_type, () => {
  fetchResources()
})

onMounted(() => {
  fetchResources()
})
</script>
