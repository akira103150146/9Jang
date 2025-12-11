<template>
  <div class="space-y-6">
    <header class="rounded-3xl border border-blue-100 bg-gradient-to-r from-white to-sky-50 p-6 shadow-sm">
      <div>
        <p class="text-sm font-semibold text-slate-500">系統管理</p>
        <h2 class="text-2xl font-bold text-slate-900">操作記錄</h2>
        <p class="mt-2 text-sm text-slate-500">查看所有使用者的操作記錄</p>
      </div>
    </header>

    <!-- 過濾器 -->
    <div class="rounded-2xl border border-slate-200 bg-white p-4">
      <div class="grid gap-4 md:grid-cols-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">操作類型</label>
          <select
            v-model="filters.action_type"
            @change="fetchLogs"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
          >
            <option value="">全部</option>
            <option value="create">新增</option>
            <option value="update">更新</option>
            <option value="delete">刪除</option>
            <option value="view">查看</option>
            <option value="login">登入</option>
            <option value="logout">登出</option>
            <option value="other">其他</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">資源類型</label>
          <input
            v-model="filters.resource_type"
            @input="fetchLogs"
            type="text"
            placeholder="例如：Student"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">使用者</label>
          <input
            v-model="filters.user"
            @input="fetchLogs"
            type="text"
            placeholder="使用者 ID"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">角色</label>
          <input
            v-model="filters.role"
            @input="fetchLogs"
            type="text"
            placeholder="角色 ID"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
          />
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <p class="text-slate-500">載入中...</p>
    </div>

    <div v-else class="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">時間</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">使用者</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">角色</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">操作</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">資源</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">IP 地址</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">狀態</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="log in logs"
              :key="log.id"
              class="transition hover:bg-slate-50/70"
            >
              <td class="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                {{ formatDate(log.created_at) }}
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                <div>
                  <div>{{ log.user_username || '未知' }}</div>
                  <div v-if="log.impersonated_by_username" class="text-xs text-amber-600 font-semibold mt-1">
                    🔐 管理員代理操作（{{ log.impersonated_by_username }}）
                  </div>
                </div>
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                <span
                  v-if="log.role_name"
                  class="rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600"
                >
                  {{ log.role_name }}
                </span>
                <span v-else class="text-slate-400">—</span>
              </td>
              <td class="whitespace-nowrap px-4 py-4">
                <span
                  class="rounded-full px-3 py-1 text-xs font-semibold"
                  :class="getActionTypeColor(log.action_type)"
                >
                  {{ log.action_type_display }}
                </span>
              </td>
              <td class="px-4 py-4 text-sm text-slate-700">
                <div>
                  <p class="font-semibold">{{ log.resource_type }}</p>
                  <p v-if="log.resource_name" class="text-xs text-slate-500">{{ log.resource_name }}</p>
                  <p v-if="log.resource_id" class="text-xs text-slate-400">ID: {{ log.resource_id }}</p>
                </div>
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-slate-500">
                {{ log.ip_address || '—' }}
              </td>
              <td class="whitespace-nowrap px-4 py-4">
                <span
                  class="rounded-full px-2 py-1 text-xs font-semibold"
                  :class="getStatusColor(log.response_status)"
                >
                  {{ log.response_status || '—' }}
                </span>
              </td>
            </tr>
            <tr v-if="logs.length === 0">
              <td colspan="7" class="py-4 px-4 text-center text-slate-500">目前沒有操作記錄。</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 分頁 -->
    <div v-if="totalPages > 1" class="flex justify-center gap-2">
      <button
        @click="changePage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        上一頁
      </button>
      <span class="flex items-center px-4 text-sm text-slate-700">
        第 {{ currentPage }} / {{ totalPages }} 頁
      </span>
      <button
        @click="changePage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        下一頁
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { auditLogAPI } from '../services/api'

const logs = ref([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)

const filters = ref({
  action_type: '',
  resource_type: '',
  user: '',
  role: ''
})

const formatDate = (dateString) => {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const getActionTypeColor = (actionType) => {
  const colors = {
    create: 'bg-green-50 text-green-600',
    update: 'bg-blue-50 text-blue-600',
    delete: 'bg-rose-50 text-rose-600',
    view: 'bg-slate-50 text-slate-600',
    login: 'bg-indigo-50 text-indigo-600',
    logout: 'bg-purple-50 text-purple-600',
    other: 'bg-amber-50 text-amber-600'
  }
  return colors[actionType] || colors.other
}

const getStatusColor = (status) => {
  if (!status) return 'bg-slate-100 text-slate-600'
  if (status >= 200 && status < 300) return 'bg-green-50 text-green-600'
  if (status >= 400 && status < 500) return 'bg-rose-50 text-rose-600'
  if (status >= 500) return 'bg-red-50 text-red-600'
  return 'bg-slate-100 text-slate-600'
}

const fetchLogs = async () => {
  loading.value = true
  try {
    const filterParams = {}
    if (filters.value.action_type) filterParams.action_type = filters.value.action_type
    if (filters.value.resource_type) filterParams.resource_type = filters.value.resource_type
    if (filters.value.user) filterParams.user = filters.value.user
    if (filters.value.role) filterParams.role = filters.value.role

    const response = await auditLogAPI.getAll(filterParams)
    const data = response.data.results || response.data
    logs.value = Array.isArray(data) ? data : []
    
    // 處理分頁（如果 API 支援）
    if (response.data.count) {
      totalPages.value = Math.ceil(response.data.count / (response.data.page_size || 20))
    } else {
      totalPages.value = 1
    }
  } catch (error) {
    console.error('獲取操作記錄失敗:', error)
    if (error.response?.status === 403) {
      alert('您沒有權限查看操作記錄')
    } else {
      alert('獲取操作記錄失敗，請稍後再試')
    }
    logs.value = []
  } finally {
    loading.value = false
  }
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchLogs()
  }
}

onMounted(() => {
  fetchLogs()
})
</script>

