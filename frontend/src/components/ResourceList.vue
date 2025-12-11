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
      
      <button
        @click="createResource"
        class="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
      >
        + 新增文件
      </button>
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
        class="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all"
      >
        <div class="flex items-start justify-between mb-2">
          <span
            class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset"
            :class="getTypeColor(resource.resource_type)"
          >
            {{ getTypeName(resource.resource_type) }}
          </span>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="editResource(resource.resource_id)" class="p-1 text-slate-400 hover:text-indigo-600" title="編輯">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button @click="deleteResource(resource.resource_id)" class="p-1 text-slate-400 hover:text-rose-600" title="刪除">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        <h3 class="text-base font-bold text-slate-900 mb-1 line-clamp-1">
          <router-link :to="`/resources/edit/${resource.resource_id}`" class="hover:text-indigo-600 hover:underline">
            {{ resource.title }}
          </router-link>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { learningResourceAPI } from '../services/api'

const router = useRouter()
const resources = ref([])
const loading = ref(false)
const filters = reactive({
  resource_type: ''
})

const getTypeColor = (type) => {
  const map = {
    'QUIZ': 'bg-green-50 text-green-700 ring-green-600/20',
    'EXAM': 'bg-red-50 text-red-700 ring-red-600/20',
    'HANDOUT': 'bg-blue-50 text-blue-700 ring-blue-600/20',
    'DOCUMENT': 'bg-slate-50 text-slate-700 ring-slate-600/20',
  }
  return map[type] || map['DOCUMENT']
}

const getTypeName = (type) => {
  const map = {
    'QUIZ': '小考',
    'EXAM': '段考卷',
    'HANDOUT': '講義',
    'DOCUMENT': '一般文件',
  }
  return map[type] || type
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

const fetchResources = async () => {
  loading.value = true
  try {
    const params = {}
    if (filters.resource_type) params.resource_type = filters.resource_type
    
    const response = await learningResourceAPI.getAll(params)
    resources.value = response.data.results || response.data
  } catch (error) {
    console.error('Fetch resources failed', error)
  } finally {
    loading.value = false
  }
}

const createResource = () => {
  router.push('/resources/new')
}

const editResource = (id) => {
  router.push(`/resources/edit/${id}`)
}

const deleteResource = async (id) => {
  if (!confirm('確定要刪除此文件嗎？此操作無法復原。')) return
  try {
    await learningResourceAPI.delete(id)
    fetchResources()
  } catch (error) {
    console.error('Delete failed', error)
    alert('刪除失敗')
  }
}

watch(() => filters.resource_type, () => {
  fetchResources()
})

onMounted(() => {
  fetchResources()
})
</script>
