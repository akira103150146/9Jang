<template>
  <div>
    <!-- 操作 -->
    <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div class="flex items-center gap-2">
        <input 
          v-model="search" 
          type="text" 
          placeholder="搜尋模板..." 
          class="rounded-lg border-slate-300 text-sm focus:ring-indigo-500 px-3 py-2"
        >
      </div>
      
      <button
        @click="createTemplate"
        class="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:from-indigo-600 hover:to-purple-600"
      >
        + 新增模板
      </button>
    </div>

    <!-- 列表 -->
    <div v-if="loading" class="text-center py-12 text-slate-500">載入中...</div>
    <div v-else-if="templates.length === 0" class="text-center py-12 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
      尚無模板
    </div>
    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="template in templates"
        :key="template.template_id"
        class="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all"
      >
        <div class="flex items-start justify-between mb-2">
          <span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20">
            模板
          </span>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="editTemplate(template.template_id)" class="p-1 text-slate-400 hover:text-indigo-600" title="編輯">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button @click="deleteTemplate(template.template_id)" class="p-1 text-slate-400 hover:text-rose-600" title="刪除">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        <h3 class="text-base font-bold text-slate-900 mb-1">
          {{ template.title }}
        </h3>
        
        <div class="text-xs text-slate-500 mb-4 flex items-center gap-2">
          <span>{{ template.created_by_name || '未知' }}</span>
          <span>•</span>
          <span>{{ formatDate(template.updated_at) }}</span>
        </div>
        
        <button
          @click="useTemplate(template)"
          class="mt-auto w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          使用此模板
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { contentTemplateAPI } from '../services/api'
import type { ContentTemplate } from '@9jang/shared'

const router = useRouter()
const templates: Ref<ContentTemplate[]> = ref([])
const loading: Ref<boolean> = ref(false)
const search: Ref<string> = ref('')

const formatDate = (dateString: string | unknown): string => {
  if (!dateString) return ''
  return new Date(dateString as string).toLocaleDateString()
}

const fetchTemplates = async (): Promise<void> => {
  loading.value = true
  try {
    // 暫時沒有後端搜尋 API，先前端過濾 (如果有的話)
    const response = await contentTemplateAPI.getAll()
    const allTemplates = ((response.data as { results?: ContentTemplate[] }) | ContentTemplate[]).results || (response.data as ContentTemplate[])

    if (search.value) {
      templates.value = allTemplates.filter((t) => t.title.toLowerCase().includes(search.value.toLowerCase()))
    } else {
      templates.value = allTemplates
    }
  } catch (error) {
    console.error('Fetch templates failed', error)
  } finally {
    loading.value = false
  }
}

const deleteTemplate = async (id: number): Promise<void> => {
  if (!confirm('確定要刪除此模板嗎？')) return
  try {
    await contentTemplateAPI.delete(id)
    fetchTemplates()
  } catch (error) {
    console.error('Delete failed', error)
    alert('刪除失敗')
  }
}

const createTemplate = (): void => {
  router.push({ path: '/templates/new', query: { returnTab: 'templates' } })
}

const editTemplate = (id: number): void => {
  router.push({ path: `/templates/edit/${id}`, query: { returnTab: 'templates' } })
}

const useTemplate = (template: ContentTemplate): void => {
  // 跳轉到新建資源頁面，並傳遞 template_id 作為 query param
  router.push({
    path: '/resources/new',
    query: { template_id: String(template.template_id) }
  })
}

watch(search, () => {
  fetchTemplates()
})

onMounted(() => {
  fetchTemplates()
})
</script>
