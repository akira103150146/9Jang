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
              <span v-if="isImpersonating" class="text-amber-600">（模擬中）</span>
            </p>
          </div>
        </div>
        
        <!-- 角色切換（僅管理員可見） -->
        <div v-if="currentUser.role === 'ADMIN'" class="mt-3">
          <label class="block text-xs font-semibold text-slate-700 mb-1 px-1">切換身分模擬</label>
          <select
            v-model="selectedRole"
            @change="handleRoleSelect"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">選擇身分...</option>
            <option value="TEACHER">老師</option>
            <option value="STUDENT">學生</option>
            <option value="ACCOUNTANT">會計</option>
          </select>
        </div>

        <!-- 停止模擬按鈕（當處於模擬狀態時顯示） -->
        <div v-if="isImpersonating" class="mt-3">
          <button
            @click="stopImpersonation"
            class="w-full flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clip-rule="evenodd" />
            </svg>
            停止模擬（返回管理員）
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

    <!-- 用戶選擇 Modal -->
    <UserSelectModal 
      :is-open="showUserSelectModal"
      :role="targetRole"
      @close="closeUserSelectModal"
      @select="handleUserSelect"
    />
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authAPI, setTokens, clearTokens } from '../services/api'
import logoUrl from '../assets/logo_jiuzhang.png'
import UserSelectModal from './UserSelectModal.vue'

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
// const tempRole = ref(null) // Deprecated: Old role simulation
const selectedRole = ref('')
const showUserSelectModal = ref(false)
const targetRole = ref('')
const isImpersonating = ref(false)

const roleDisplayMap = {
  'ADMIN': '系統管理員',
  'TEACHER': '老師',
  'STUDENT': '學生',
  'ACCOUNTANT': '會計'
}

const effectiveRoleDisplay = computed(() => {
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
  { name: 'student-home', label: '首頁', path: '/student-home', requiresAdmin: false, allowedRoles: ['STUDENT'] },
  { name: 'dashboard', label: '營運儀表板', path: '/', requiresAdmin: false, allowedRoles: ['ADMIN', 'ACCOUNTANT'] },
  // 老師需要學生列表/錯題本；不提供新增/編輯/費用等入口
  { name: 'student-list', label: '學生管理', path: '/students', requiresAdmin: false, allowedRoles: ['ADMIN', 'ACCOUNTANT', 'TEACHER'] },
  { name: 'teachers', label: '老師管理', path: '/teachers', requiresAdmin: false, allowedRoles: ['ADMIN'] },
  // 學生不顯示課程管理側邊欄入口，改由首頁入口進入
  { name: 'courses', label: '課程管理', path: '/courses', requiresAdmin: false, allowedRoles: ['ADMIN', 'TEACHER'] },
  { name: 'attendance', label: '出缺勤', path: '/attendance', requiresAdmin: false, allowedRoles: ['ADMIN', 'TEACHER', 'ACCOUNTANT'] },
  { name: 'questions', label: '題庫與資源', path: '/questions', requiresAdmin: false, allowedRoles: ['ADMIN', 'TEACHER'] },
  // 老闆（ADMIN）不需要看到學生群組，必要時可用模擬登入老師視角
  { name: 'student-groups', label: '學生群組', path: '/student-groups', requiresAdmin: false, allowedRoles: ['TEACHER'] },
  // 學生不顯示訂便當系統側邊欄入口，改由首頁入口進入
  // 管理員也不應該顯示訂便當系統
  { name: 'lunch-orders', label: '訂便當系統', path: '/lunch-orders', requiresAdmin: false, allowedRoles: ['ACCOUNTANT', 'TEACHER'] },
  { name: 'roles', label: '角色管理', path: '/roles', requiresAdmin: true, allowedRoles: ['ADMIN'] },
  { name: 'audit-logs', label: '操作記錄', path: '/audit-logs', requiresAdmin: true, allowedRoles: ['ADMIN'] },
]

// 根據權限過濾菜單項
const navItems = computed(() => {
  if (!currentUser.value) {
    return []
  }

  const role = currentUser.value.role

  // 根據角色過濾（包括管理員）
  return allNavItems.filter(item => {
    // 管理員專用頁面：只有管理員可以看到
    if (item.requiresAdmin) {
      return role === 'ADMIN'
    }

    // 檢查 allowedRoles
    if (item.allowedRoles && item.allowedRoles.length > 0) {
      return item.allowedRoles.includes(role)
    }

    // 檢查頁面權限（用於自定義角色）
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
  'questions': ['questions', 'resource-new', 'resource-edit', 'template-new', 'template-edit', 'question-new', 'question-edit', 'question-import'], // Keep sidebar active for editor, template editor, and import page
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

    const accessToken = localStorage.getItem('access_token')
    if (!accessToken) {
      return
    }

    // 檢查是否在模擬中
    if (localStorage.getItem('original_access_token')) {
      isImpersonating.value = true
    }

    // 從 localStorage 獲取用戶信息
    const userStr = localStorage.getItem('user')
    if (userStr) {
      currentUser.value = JSON.parse(userStr)
      // Force disable password change prompt during impersonation
      if (isImpersonating.value && currentUser.value.must_change_password) {
        currentUser.value.must_change_password = false
        // Update local storage to prevent prompt on refresh
        localStorage.setItem('user', JSON.stringify(currentUser.value))
      }
      
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
      // Force disable password change prompt during impersonation
      if (isImpersonating.value && currentUser.value.must_change_password) {
        currentUser.value.must_change_password = false
      }
      localStorage.setItem('user', JSON.stringify(currentUser.value))
      
      if (response.data.custom_role) {
        const { roleAPI } = await import('../services/api')
        const roleResponse = await roleAPI.getById(response.data.custom_role)
        userPermissions.value = roleResponse.data.permissions || []
      }
    }
  } catch (error) {
    if (error.response?.status === 401) {
      clearTokens()
      currentUser.value = null
      userPermissions.value = []
      // Also clear impersonation data if session invalid
      localStorage.removeItem('original_access_token')
      localStorage.removeItem('original_refresh_token')
      localStorage.removeItem('original_user')
    } else {
      console.error('獲取用戶信息失敗:', error)
    }
  }
}

const handleLogout = async () => {
  try {
    // 如果是模擬中，直接登出會清除所有 token (包括原始管理員的)
    // 這裡我們直接調用 API 並清除所有本地存儲
    await authAPI.logout()
  } catch (error) {
    console.error('登出失敗:', error)
  } finally {
    clearTokens()
    // 清除模擬數據
    localStorage.removeItem('original_access_token')
    localStorage.removeItem('original_refresh_token')
    localStorage.removeItem('original_user')
    localStorage.removeItem('temp_role')
    
    isImpersonating.value = false
    selectedRole.value = ''
    router.push('/login')
  }
}

const handleRoleSelect = (event) => {
  const role = event.target.value
  if (!role) return
  
  targetRole.value = role
  showUserSelectModal.value = true
  // Reset select to avoid state issues if modal cancelled
  selectedRole.value = '' 
}

const closeUserSelectModal = () => {
  showUserSelectModal.value = false
  targetRole.value = ''
}

const handleUserSelect = async (user) => {
  try {
    // 1. 獲取管理員 Token（如果處於模擬狀態，從 original_access_token 獲取）
    let adminAccess = localStorage.getItem('original_access_token')
    let adminRefresh = localStorage.getItem('original_refresh_token')
    let adminUser = localStorage.getItem('original_user')
    
    // 如果沒有原始 token（第一次模擬），從當前 token 獲取
    if (!adminAccess || !adminRefresh) {
      adminAccess = localStorage.getItem('access_token')
      adminRefresh = localStorage.getItem('refresh_token')
      adminUser = localStorage.getItem('user')
      
      if (!adminAccess || !adminRefresh) {
        alert('無法獲取當前管理員憑證')
        return
      }
      
      // 保存原始管理員 Token（第一次模擬時）
      localStorage.setItem('original_access_token', adminAccess)
      localStorage.setItem('original_refresh_token', adminRefresh)
      localStorage.setItem('original_user', adminUser)
    }
    
    // 2. 如果處於模擬狀態，先恢復管理員 Token 以便調用 API
    const wasImpersonating = isImpersonating.value
    if (wasImpersonating) {
      setTokens(adminAccess, adminRefresh)
    }
    
    // 3. 調用模擬 API（使用管理員 Token）
    const response = await authAPI.impersonateUser(user.id)
    
    // 4. 設置新 Token
    setTokens(response.data.access, response.data.refresh)
    const impersonatedUser = response.data.user
    impersonatedUser.must_change_password = false // Force disable password change for impersonation
    localStorage.setItem('user', JSON.stringify(impersonatedUser))
    
    // 5. 更新模擬狀態和用戶信息
    isImpersonating.value = true
    currentUser.value = impersonatedUser
    
    // 6. 關閉 Modal
    closeUserSelectModal()
    
    // 7. 根據角色決定跳轉
    if (impersonatedUser.role === 'STUDENT') {
      window.location.href = '/student-home'
    } else if (impersonatedUser.role === 'TEACHER') {
      // 老師預設進題庫系統
      router.push('/questions')
    } else if (impersonatedUser.role === 'ACCOUNTANT') {
      // 會計預設進學生管理
      router.push('/students')
    } else {
      // 其他角色重新載入頁面
      window.location.reload()
    }
    
  } catch (error) {
    console.error('模擬用戶失敗:', error)
    alert('模擬用戶失敗，請稍後再試')
    closeUserSelectModal()
  }
}

const stopImpersonation = () => {
  const originalAccess = localStorage.getItem('original_access_token')
  const originalRefresh = localStorage.getItem('original_refresh_token')
  const originalUser = localStorage.getItem('original_user')
  
  if (originalAccess && originalRefresh) {
    // 恢復原始 Token
    setTokens(originalAccess, originalRefresh)
    if (originalUser) {
      localStorage.setItem('user', originalUser)
    }
    
    // 清除模擬數據
    localStorage.removeItem('original_access_token')
    localStorage.removeItem('original_refresh_token')
    localStorage.removeItem('original_user')
    localStorage.removeItem('temp_role')
    
    // 回到老闆（ADMIN）預設頁：儀表板
    window.location.href = '/'
  } else {
    // 如果找不到原始 Token，只能登出
    handleLogout()
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>
