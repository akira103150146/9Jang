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
            </p>
          </div>
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

<script setup lang="ts">
import { ref, computed, onMounted, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authAPI, clearTokens } from '../services/api'
import logoUrl from '../assets/logo_jiuzhang.png'

/**
 * 用戶類型
 */
interface User {
  id: number
  username: string
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'ACCOUNTANT'
  role_display?: string
  first_name?: string
  last_name?: string
  must_change_password?: boolean
  custom_role?: number
  [key: string]: unknown
}

/**
 * 權限類型
 */
interface Permission {
  permission_type: string
  resource: string
  [key: string]: unknown
}

/**
 * 導航項類型
 */
interface NavItem {
  name: string
  label: string
  path: string
  requiresAdmin: boolean
  allowedRoles: string[]
}

interface Props {
  isOpen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false
})

interface Emits {
  (e: 'close'): void
}

const emit = defineEmits<Emits>()

const route = useRoute()
const router = useRouter()
const currentUser: Ref<User | null> = ref(null)
const userPermissions: Ref<Permission[]> = ref([])

const roleDisplayMap: Record<string, string> = {
  ADMIN: '系統管理員',
  TEACHER: '老師',
  STUDENT: '學生',
  ACCOUNTANT: '會計'
}

const effectiveRoleDisplay = computed<string>(() => {
  if (!currentUser.value) return ''
  return (
    currentUser.value.role_display ||
    roleDisplayMap[currentUser.value.role] ||
    currentUser.value.role ||
    ''
  )
})

// 獲取用戶頭像初始字母
const getUserInitials = (user: User | null): string => {
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

const allNavItems: NavItem[] = [
  { name: 'student-home', label: '首頁', path: '/student-home', requiresAdmin: false, allowedRoles: ['STUDENT'] },
  { name: 'my-courses', label: '我的課程', path: '/my-courses', requiresAdmin: false, allowedRoles: ['STUDENT'] },
  { name: 'student-mistake-book', label: '錯題本', path: '/student-mistake-book', requiresAdmin: false, allowedRoles: ['STUDENT'] },
  { name: 'dashboard', label: '營運儀表板', path: '/', requiresAdmin: false, allowedRoles: ['ADMIN', 'ACCOUNTANT'] },
  // 老師需要學生列表/錯題本；不提供新增/編輯/費用等入口
  { name: 'student-list', label: '學生管理', path: '/students', requiresAdmin: false, allowedRoles: ['ADMIN', 'ACCOUNTANT', 'TEACHER'] },
  { name: 'teachers', label: '老師管理', path: '/teachers', requiresAdmin: false, allowedRoles: ['ADMIN'] },
  // 學生不顯示課程管理側邊欄入口，改由首頁入口進入
  { name: 'courses', label: '課程管理', path: '/courses', requiresAdmin: false, allowedRoles: ['ADMIN', 'TEACHER', 'ACCOUNTANT'] },
  { name: 'attendance', label: '出缺勤', path: '/attendance', requiresAdmin: false, allowedRoles: ['ADMIN', 'ACCOUNTANT'] },
  { name: 'fees', label: '所有費用', path: '/fees', requiresAdmin: false, allowedRoles: ['ACCOUNTANT'] },
  { name: 'questions', label: '題庫與資源', path: '/questions', requiresAdmin: false, allowedRoles: ['TEACHER'] },
  // 學生不顯示訂便當系統側邊欄入口，改由首頁入口進入
  // 管理員也不應該顯示訂便當系統
  { name: 'lunch-orders', label: '訂便當系統', path: '/lunch-orders', requiresAdmin: false, allowedRoles: ['ACCOUNTANT', 'TEACHER'] },
  { name: 'roles', label: '角色管理', path: '/roles', requiresAdmin: true, allowedRoles: ['ADMIN'] },
  { name: 'audit-logs', label: '操作記錄', path: '/audit-logs', requiresAdmin: true, allowedRoles: ['ADMIN'] },
]

// 根據權限過濾菜單項
const navItems = computed<NavItem[]>(() => {
  if (!currentUser.value) {
    return []
  }

  const role = currentUser.value.role

  // 根據角色過濾（包括管理員）
  return allNavItems.filter((item) => {
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
        (p) => p.permission_type === 'page' && p.resource === item.path
      )
    }

    // 如果沒有權限配置，默認不顯示
    return false
  })
})

const childMatchMap: Record<string, string[]> = {
  'student-list': ['student-list', 'student-add', 'student-edit', 'student-fees'],
  fees: ['fees', 'fee-add', 'fee-edit'],
  'lunch-orders': ['lunch-orders', 'group-order-detail', 'join-group-order'],
  questions: [
    'questions',
    'resource-new',
    'resource-edit',
    'template-new',
    'template-edit',
    'question-new',
    'question-edit',
    'question-import'
  ], // Keep sidebar active for editor, template editor, and import page
  'my-courses': ['my-courses'],
  'student-mistake-book': ['student-mistake-book']
}

const isActive = (name: string): boolean => {
  const current = route.name as string
  if (childMatchMap[name]) {
    return childMatchMap[name].includes(current)
  }
  return current === name
}

// 獲取當前用戶和權限
const fetchUserInfo = async (): Promise<void> => {
  try {
    // 檢查是否在登入頁面
    if (route.name === 'login') {
      return
    }

    const accessToken = localStorage.getItem('access_token')
    if (!accessToken) {
      return
    }

    // 從 localStorage 獲取用戶信息
    const userStr = localStorage.getItem('user')
    if (userStr) {
      currentUser.value = JSON.parse(userStr) as User

      // 從用戶資料中讀取權限（已在登入時包含）
      userPermissions.value = (currentUser.value.permissions as Permission[]) || []
    } else {
      // 嘗試從 API 獲取
      const { authAPI } = await import('../services/api')
      const response = await authAPI.getCurrentUser()
      currentUser.value = response.data as User
      localStorage.setItem('user', JSON.stringify(currentUser.value))

      // 從用戶資料中讀取權限（已在 API 回應中包含）
      userPermissions.value = (currentUser.value.permissions as Permission[]) || []
    }
  } catch (error) {
    const axiosError = error as { response?: { status?: number } }
    if (axiosError.response?.status === 401) {
      clearTokens()
      currentUser.value = null
      userPermissions.value = []
    } else {
      console.error('獲取用戶信息失敗:', error)
    }
  }
}

const handleLogout = async (): Promise<void> => {
  try {
    await authAPI.logout()
  } catch (error) {
    console.error('登出失敗:', error)
  } finally {
    clearTokens()
    router.push('/login')
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>
