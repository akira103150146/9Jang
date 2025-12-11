<template>
  <aside
    id="sidebar"
    :class="[
      'fixed inset-y-0 left-0 z-40 w-72 flex-shrink-0 bg-white/95 backdrop-blur border-r border-blue-100 h-full flex flex-col p-5 transition-transform duration-300 ease-in-out',
      isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:relative md:flex'
    ]"
  >
    <div class="flex flex-col h-full">
      <div class="flex items-center gap-3 rounded-2xl border border-blue-100 bg-sky-50/60 px-4 py-3">
        <img :src="logoUrl" alt="九章 Logo" class="h-10 w-auto object-cover" />
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest text-sky-600">九章補教</p>
          <p class="text-lg font-bold text-slate-900">管理後台</p>
        </div>
      </div>

      <!-- 用戶信息（移到最上方） -->
      <div v-if="currentUser" class="mt-4 mb-4">
        <div class="flex items-center gap-3 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 py-3">
          <!-- 用戶頭像 -->
          <div class="flex-shrink-0">
            <div class="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
              {{ getUserInitials(currentUser) }}
            </div>
          </div>
          <!-- 用戶信息 -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-slate-900 truncate">{{ currentUser.username }}</p>
            <p class="text-xs text-slate-500 truncate">
              {{ effectiveRoleDisplay }}
              <span v-if="tempRole" class="text-amber-600">（模擬中）</span>
            </p>
          </div>
        </div>
        
        <!-- 角色切換（僅管理員可見） -->
        <div v-if="currentUser.role === 'ADMIN'" class="mt-3">
          <label class="block text-xs font-semibold text-slate-700 mb-1 px-1">切換角色視角</label>
          <select
            v-model="selectedRole"
            @change="switchRole"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">原始角色</option>
            <option value="TEACHER">老師</option>
            <option value="STUDENT">學生</option>
            <option value="ACCOUNTANT">會計</option>
          </select>
          <button
            v-if="tempRole"
            @click="resetRole"
            class="mt-2 w-full rounded-lg px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
          >
            重置角色
          </button>
        </div>
      </div>

      <nav class="mt-2 space-y-2 flex-1 overflow-y-auto">
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

      <!-- 登出按鈕（保持在底部） -->
      <div class="mt-auto pt-4 border-t border-slate-200">
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authAPI, roleSwitchAPI } from '../services/api'
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
const tempRole = ref(null)
const selectedRole = ref('')

const roleDisplayMap = {
  'ADMIN': '系統管理員',
  'TEACHER': '老師',
  'STUDENT': '學生',
  'ACCOUNTANT': '會計'
}

const effectiveRoleDisplay = computed(() => {
  if (tempRole.value) {
    return roleDisplayMap[tempRole.value] || tempRole.value
  }
  return currentUser.value?.role_display || roleDisplayMap[currentUser.value?.role] || currentUser.value?.role || ''
})

// 獲取用戶頭像初始字母
const getUserInitials = (user) => {
  if (!user) return '?'
  
  // 優先使用 first_name 和 last_name
  if (user.first_name || user.last_name) {
    const first = user.first_name?.charAt(0) || ''
    const last = user.last_name?.charAt(0) || ''
    return (first + last).toUpperCase() || user.username?.charAt(0).toUpperCase() || '?'
  }
  
  // 如果沒有姓名，使用 username 的第一個字符
  if (user.username) {
    return user.username.charAt(0).toUpperCase()
  }
  
  return '?'
}

const allNavItems = [
  { name: 'dashboard', label: '儀表板', path: '/', requiresAdmin: false, allowedRoles: ['ADMIN', 'TEACHER', 'STUDENT', 'ACCOUNTANT'] },
  { name: 'student-list', label: '學生管理', path: '/students', requiresAdmin: false, allowedRoles: ['ADMIN', 'ACCOUNTANT'] },
  { name: 'teachers', label: '老師管理', path: '/teachers', requiresAdmin: false, allowedRoles: ['ADMIN'] },
  { name: 'courses', label: '課程管理', path: '/courses', requiresAdmin: false, allowedRoles: ['ADMIN', 'TEACHER', 'STUDENT'] },
  { name: 'attendance', label: '出缺勤', path: '/attendance', requiresAdmin: false, allowedRoles: ['ADMIN', 'TEACHER'] },
  { name: 'questions', label: '題庫系統', path: '/questions', requiresAdmin: false, allowedRoles: ['ADMIN', 'TEACHER'] },
  { name: 'quizzes', label: 'Quiz 管理', path: '/quizzes', requiresAdmin: false, allowedRoles: ['ADMIN', 'TEACHER'] },
  { name: 'exams', label: '考卷管理', path: '/exams', requiresAdmin: false, allowedRoles: ['ADMIN', 'TEACHER'] },
  { name: 'materials', label: '講義管理', path: '/materials', requiresAdmin: false, allowedRoles: ['ADMIN', 'TEACHER'] },
  { name: 'student-groups', label: '學生群組', path: '/student-groups', requiresAdmin: false, allowedRoles: ['ADMIN', 'TEACHER'] },
  { name: 'generator', label: '生成器', path: '/generator', requiresAdmin: false, allowedRoles: ['ADMIN', 'TEACHER'] },
  { name: 'lunch-orders', label: '訂便當系統', path: '/lunch-orders', requiresAdmin: false, allowedRoles: ['ADMIN', 'STUDENT', 'ACCOUNTANT'] },
  { name: 'roles', label: '角色管理', path: '/roles', requiresAdmin: true, allowedRoles: ['ADMIN'] },
  { name: 'audit-logs', label: '操作記錄', path: '/audit-logs', requiresAdmin: true, allowedRoles: ['ADMIN'] },
]

// 根據權限過濾菜單項
const navItems = computed(() => {
  if (!currentUser.value) {
    return []
  }

  // 獲取有效角色（考慮角色切換）
  const effectiveRole = tempRole.value || currentUser.value.role

  // 管理員可以看到所有頁面
  if (effectiveRole === 'ADMIN') {
    return allNavItems
  }

  // 根據角色過濾
  return allNavItems.filter(item => {
    // 管理員專用頁面
    if (item.requiresAdmin) {
      return false
    }

    // 檢查 allowedRoles
    if (item.allowedRoles && item.allowedRoles.length > 0) {
      return item.allowedRoles.includes(effectiveRole)
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
    tempRole.value = null
    selectedRole.value = ''
    router.push('/login')
  } catch (error) {
    console.error('登出失敗:', error)
    // 即使 API 失敗，也清除本地存儲並跳轉
    const { clearTokens } = await import('../services/api')
    clearTokens()
    tempRole.value = null
    selectedRole.value = ''
    router.push('/login')
  }
}

const switchRole = async (event) => {
  const role = event.target.value
  
  if (!role) {
    await resetRole()
    return
  }
  
  try {
    // 先將臨時角色存儲到 localStorage（在調用 API 之前，這樣攔截器才能讀取到）
    localStorage.setItem('temp_role', role)
    tempRole.value = role
    selectedRole.value = role
    
    const response = await roleSwitchAPI.switchRole(role)
    
    // 重新獲取用戶信息以更新顯示
    await fetchUserInfo()
    
    // 重新載入頁面以應用新的角色視角
    window.location.reload()
  } catch (error) {
    console.error('切換角色失敗：', error)
    alert('切換角色失敗，請稍後再試')
  }
}

const resetRole = async () => {
  try {
    await roleSwitchAPI.resetRole()
    // 清除 localStorage 中的臨時角色
    localStorage.removeItem('temp_role')
    tempRole.value = null
    selectedRole.value = ''
    // 重新獲取用戶信息
    await fetchUserInfo()
    // 重新載入頁面
    window.location.reload()
  } catch (error) {
    console.error('重置角色失敗：', error)
    alert('重置角色失敗，請稍後再試')
  }
}

const fetchCurrentRole = async () => {
  try {
    // 先從 localStorage 讀取臨時角色
    const storedTempRole = localStorage.getItem('temp_role')
    if (storedTempRole) {
      tempRole.value = storedTempRole
      selectedRole.value = storedTempRole
    }
    
    const response = await roleSwitchAPI.getCurrentRole()
    
    // 如果後端返回了臨時角色，更新前端狀態
    if (response.data.temp_role) {
      tempRole.value = response.data.temp_role
      selectedRole.value = response.data.temp_role
      localStorage.setItem('temp_role', response.data.temp_role)
    } else if (!storedTempRole) {
      // 如果後端沒有臨時角色，且本地也沒有，則清除
      tempRole.value = null
      selectedRole.value = ''
      localStorage.removeItem('temp_role')
    }
  } catch (error) {
    // 忽略錯誤，可能用戶不是管理員
  }
}

onMounted(() => {
  fetchUserInfo()
  fetchCurrentRole()
})
</script>

