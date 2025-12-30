<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-900/50 backdrop-blur-sm p-4 md:inset-0 md:h-full">
    <div class="relative w-full max-w-2xl h-full md:h-auto">
      <!-- Modal content -->
      <div class="relative rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/5">
        <!-- Modal header -->
        <div class="flex items-start justify-between rounded-t p-5 border-b border-slate-100">
          <h3 class="text-xl font-semibold text-slate-900 lg:text-2xl">
            選擇要模擬的{{ roleDisplay }}
          </h3>
          <button @click="$emit('close')" type="button" class="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-slate-400 hover:bg-slate-100 hover:text-slate-900">
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
          </button>
        </div>
        
        <!-- Modal body -->
        <div class="p-6 space-y-6">
          <!-- Search -->
          <div class="relative">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg aria-hidden="true" class="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input 
              v-model="searchQuery" 
              type="text" 
              class="block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 pl-10 text-sm text-slate-900 focus:border-indigo-500 focus:ring-indigo-500" 
              placeholder="搜尋姓名、Email 或帳號..." 
            />
          </div>

          <!-- Loading -->
          <div v-if="loading" class="flex justify-center py-8">
            <div class="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
          </div>

          <!-- User List -->
          <div v-else class="max-h-[400px] overflow-y-auto rounded-lg border border-slate-200">
            <div v-if="filteredUsers.length === 0" class="px-6 py-8 text-center text-slate-500">
              找不到符合條件的用戶
            </div>
            <div
              v-for="user in filteredUsers"
              :key="user.id"
              @click="selectUser(user)"
              class="flex items-center gap-3 px-4 py-3 border-b border-slate-100 last:border-b-0 hover:bg-indigo-50 cursor-pointer transition-colors"
            >
              <div class="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                {{ getUserInitials(user) }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold text-slate-900 truncate">
                  {{ user.first_name || user.last_name ? `${user.last_name}${user.first_name}` : user.username }}
                </div>
                <div class="text-xs text-slate-500 truncate">
                  {{ user.username }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Modal footer -->
        <div class="flex items-center space-x-2 rounded-b border-t border-slate-100 p-6">
          <button @click="$emit('close')" type="button" class="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-center text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-200">
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, type Ref } from 'vue'
import { userAPI } from '../services/api'

/**
 * 用戶類型
 */
interface User {
  id: number
  username: string
  email?: string
  first_name?: string
  last_name?: string
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'ACCOUNTANT'
  [key: string]: unknown
}

interface Props {
  isOpen?: boolean
  role?: string
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  role: ''
})

interface Emits {
  (e: 'close'): void
  (e: 'select', user: User): void
}

const emit = defineEmits<Emits>()

const users: Ref<User[]> = ref([])
const loading: Ref<boolean> = ref(false)
const searchQuery: Ref<string> = ref('')

const roleDisplayMap: Record<string, string> = {
  ADMIN: '系統管理員',
  TEACHER: '老師',
  STUDENT: '學生',
  ACCOUNTANT: '會計'
}

const roleDisplay = computed<string>(() => {
  return roleDisplayMap[props.role] || props.role
})

const fetchUsers = async (): Promise<void> => {
  if (!props.isOpen) return

  loading.value = true
  try {
    const response = await userAPI.getAll()

    // Handle both array (no pagination) and paginated response
    if (Array.isArray(response.data)) {
      users.value = response.data as User[]
    } else if (response.data && Array.isArray((response.data as { results?: User[] }).results)) {
      users.value = (response.data as { results: User[] }).results
    } else {
      users.value = []
      console.warn('Unexpected user API response format:', response.data)
    }
  } catch (error) {
    console.error('獲取用戶列表失敗:', error)
  } finally {
    loading.value = false
  }
}

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      fetchUsers()
      searchQuery.value = ''
    }
  }
)

const filteredUsers = computed<User[]>(() => {
  let result = users.value

  // Filter by role
  if (props.role) {
    result = result.filter((user) => user.role === props.role)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (user) =>
        user.username.toLowerCase().includes(query) ||
        (user.email && user.email.toLowerCase().includes(query)) ||
        (user.first_name && user.first_name.toLowerCase().includes(query)) ||
        (user.last_name && user.last_name.toLowerCase().includes(query))
    )
  }

  return result
})

const getUserInitials = (user: User | null): string => {
  if (!user) return '?'
  if (user.first_name || user.last_name) {
    const first = user.first_name?.charAt(0) || ''
    const last = user.last_name?.charAt(0) || ''
    return (first + last).toUpperCase() || user.username?.charAt(0).toUpperCase() || '?'
  }
  return user.username?.charAt(0).toUpperCase() || '?'
}

const selectUser = (user: User): void => {
  emit('select', user)
}
</script>

