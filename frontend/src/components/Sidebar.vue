<template>
  <aside
    id="sidebar"
    :class="[
      'fixed inset-y-0 left-0 z-40 w-72 flex-shrink-0 bg-white/95 backdrop-blur border-r border-blue-100 h-full flex flex-col p-5 transition-transform duration-300 ease-in-out',
      isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:relative md:flex'
    ]"
  >
    <div>
      <div class="flex items-center gap-3 rounded-2xl border border-blue-100 bg-sky-50/60 px-4 py-3">
        <img :src="logoUrl" alt="九章 Logo" class="h-10 w-auto object-cover" />
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest text-sky-600">九章補教</p>
          <p class="text-lg font-bold text-slate-900">管理後台</p>
        </div>
      </div>

      <nav class="mt-8 space-y-2 flex-1">
        <router-link
          v-for="item in navItems"
          :key="item.name"
          :to="item.path"
          class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition"
          :class="isActive(item.name)
            ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md'
            : 'text-slate-600 hover:bg-slate-50'"
          @click="$emit('close')"
        >
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- 用戶信息和登出按鈕 -->
      <div class="mt-auto pt-4 border-t border-slate-200">
        <div v-if="currentUser" class="mb-3 px-4 py-2 rounded-xl bg-slate-50">
          <p class="text-xs text-slate-500 mb-1">登入為</p>
          <p class="text-sm font-semibold text-slate-900">{{ currentUser.username }}</p>
          <p class="text-xs text-slate-500">{{ currentUser.role_display || currentUser.role }}</p>
        </div>
        <button
          @click="handleLogout"
          class="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 transition"
        >
          登出
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authAPI } from '../services/api'
import logoUrl from '../assets/logo_jiuzhang.png'

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['close'])

const route = useRoute()
const router = useRouter()
const currentUser = ref(null)
const userPermissions = ref([])

const allNavItems = [
  { name: 'dashboard', label: '儀表板', path: '/', requiresAdmin: false },
  { name: 'student-list', label: '學生管理', path: '/students', requiresAdmin: false },
  { name: 'teachers', label: '老師管理', path: '/teachers', requiresAdmin: false },
  { name: 'courses', label: '課程管理', path: '/courses', requiresAdmin: false },
  { name: 'attendance', label: '出缺勤', path: '/attendance', requiresAdmin: false },
  { name: 'questions', label: '題庫系統', path: '/questions', requiresAdmin: false },
  { name: 'lunch-orders', label: '訂便當系統', path: '/lunch-orders', requiresAdmin: false },
  { name: 'roles', label: '角色管理', path: '/roles', requiresAdmin: true },
  { name: 'audit-logs', label: '操作記錄', path: '/audit-logs', requiresAdmin: true },
]

// 根據權限過濾菜單項
const navItems = computed(() => {
  if (!currentUser.value) {
    return []
  }

  // 管理員可以看到所有頁面
  if (currentUser.value.role === 'ADMIN') {
    return allNavItems
  }

  // 其他用戶根據權限過濾
  return allNavItems.filter(item => {
    // 管理員專用頁面
    if (item.requiresAdmin) {
      return false
    }

    // 檢查頁面權限
    if (userPermissions.value.length > 0) {
      return userPermissions.value.some(
        p => p.permission_type === 'page' && p.resource === item.path
      )
    }

    // 如果沒有權限配置，默認不顯示
    return false
  })
})

const childMatchMap = {
  'student-list': ['student-list', 'student-add', 'student-edit', 'student-fees'],
  'lunch-orders': ['lunch-orders', 'group-order-detail', 'join-group-order'],
}

const isActive = (name) => {
  const current = route.name
  if (childMatchMap[name]) {
    return childMatchMap[name].includes(current)
  }
  return current === name
}

// 獲取當前用戶和權限
const fetchUserInfo = async () => {
  try {
    // 檢查是否在登入頁面
    if (route.name === 'login') {
      return
    }

    // 檢查是否有 access token，如果沒有則不發起請求
    const accessToken = localStorage.getItem('access_token')
    if (!accessToken) {
      return
    }

    // 從 localStorage 獲取用戶信息
    const userStr = localStorage.getItem('user')
    if (userStr) {
      currentUser.value = JSON.parse(userStr)
      
      // 如果用戶有自訂角色，獲取權限
      if (currentUser.value.custom_role) {
        const { roleAPI } = await import('../services/api')
        const response = await roleAPI.getById(currentUser.value.custom_role)
        const role = response.data
        userPermissions.value = role.permissions || []
      }
    } else {
      // 嘗試從 API 獲取
      const { authAPI } = await import('../services/api')
      const response = await authAPI.getCurrentUser()
      currentUser.value = response.data
      localStorage.setItem('user', JSON.stringify(response.data))
      
      if (response.data.custom_role) {
        const { roleAPI } = await import('../services/api')
        const roleResponse = await roleAPI.getById(response.data.custom_role)
        userPermissions.value = roleResponse.data.permissions || []
      }
    }
  } catch (error) {
    // 如果是 401 錯誤，可能是 token 過期或無效，靜默處理
    if (error.response?.status === 401) {
      // 清除可能無效的 token 和用戶信息
      const { clearTokens } = await import('../services/api')
      clearTokens()
      currentUser.value = null
      userPermissions.value = []
    } else {
      console.error('獲取用戶信息失敗:', error)
    }
  }
}

const handleLogout = async () => {
  try {
    const { authAPI, clearTokens } = await import('../services/api')
    await authAPI.logout()
    // authAPI.logout 已經處理了清除 token 和用戶信息
    router.push('/login')
  } catch (error) {
    console.error('登出失敗:', error)
    // 即使 API 失敗，也清除本地存儲並跳轉
    const { clearTokens } = await import('../services/api')
    clearTokens()
    router.push('/login')
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>

