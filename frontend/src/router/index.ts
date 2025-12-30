import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
  type Router,
  type RouteLocationNormalized
} from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import StudentList from '../views/StudentList.vue'
import StudentForm from '../views/StudentForm.vue'
import TeacherList from '../views/TeacherList.vue'
import TeacherForm from '../views/TeacherForm.vue'
import CourseList from '../views/CourseList.vue'
import CourseForm from '../views/CourseForm.vue'
import EnrollmentForm from '../views/EnrollmentForm.vue'
import AttendanceTracker from '../views/AttendanceTracker.vue'
import LeaveForm from '../views/LeaveForm.vue'
import QuestionBank from '../views/QuestionBank.vue'
import LunchOrderSystem from '../views/LunchOrderSystem.vue'
import GroupOrderDetail from '../views/GroupOrderDetail.vue'
import JoinGroupOrder from '../views/JoinGroupOrder.vue'
import StudentErrorLog from '../views/StudentErrorLog.vue'
import TuitionGenerator from '../views/TuitionGenerator.vue'
import StudentFeeTracker from '../views/StudentFeeTracker.vue'
import FeeTracker from '../views/FeeTracker.vue'
import FeeForm from '../views/FeeForm.vue'
import RoleManagement from '../views/RoleManagement.vue'
import AuditLog from '../views/AuditLog.vue'
import Login from '../views/Login.vue'
import StudentHome from '../views/StudentHome.vue'
import StudentMistakeBook from '../views/StudentMistakeBook.vue'
import StudentMyCourses from '../views/StudentMyCourses.vue'
import ResourceEditor from '../views/ResourceEditor.vue'
import TemplateEditor from '../views/TemplateEditor.vue'
import QuestionForm from '../views/QuestionForm.vue'
import QuestionImport from '../views/QuestionImport.vue'
import BlockEditorTest from '../views/BlockEditorTest.vue'
import type { User } from '@9jang/shared'

/**
 * 路由元信息類型
 */
export interface RouteMeta {
  title?: string
  requiresAuth?: boolean
  requiresAdmin?: boolean
  requiresPagePermission?: boolean
  allowedRoles?: string[]
  [key: string]: unknown
}

/**
 * 擴展路由記錄類型
 */
declare module 'vue-router' {
  interface RouteMeta extends RouteMeta {}
}

/**
 * 路由配置
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/student-home',
    name: 'student-home',
    component: StudentHome,
    meta: { title: '學生首頁' }
  },
  {
    path: '/student-mistake-book',
    name: 'student-mistake-book',
    component: StudentMistakeBook,
    meta: { title: '我的錯題本', allowedRoles: ['STUDENT'] }
  },
  {
    path: '/my-courses',
    name: 'my-courses',
    component: StudentMyCourses,
    meta: { title: '我的課程', allowedRoles: ['STUDENT'] }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { title: '登入', requiresAuth: false }
  },
  {
    path: '/',
    name: 'dashboard',
    component: Dashboard,
    meta: { title: '營運儀表板' }
  },
  {
    path: '/students',
    name: 'student-list',
    component: StudentList,
    meta: { title: '學生資訊' }
  },
  {
    path: '/students/add',
    name: 'student-add',
    component: StudentForm,
    meta: { title: '新增學生' }
  },
  {
    path: '/students/edit/:id',
    name: 'student-edit',
    component: StudentForm,
    props: true,
    meta: { title: '編輯學生' }
  },
  {
    path: '/students/:id/errors',
    name: 'student-errors',
    component: StudentErrorLog,
    props: true,
    meta: { title: '學生錯題本' }
  },
  {
    path: '/students/:studentId/tuition',
    name: 'tuition-generator',
    component: TuitionGenerator,
    props: true,
    meta: { title: '生成學費' }
  },
  {
    path: '/students/:studentId/fees',
    name: 'student-fees',
    component: StudentFeeTracker,
    props: true,
    meta: { title: '學生費用核銷' }
  },
  {
    path: '/fees',
    name: 'fees',
    component: FeeTracker,
    meta: { title: '所有費用', allowedRoles: ['ACCOUNTANT'] }
  },
  {
    path: '/fees/add',
    name: 'fee-add',
    component: FeeForm,
    meta: { title: '新增費用記錄', allowedRoles: ['ACCOUNTANT'] }
  },
  {
    path: '/fees/edit/:id',
    name: 'fee-edit',
    component: FeeForm,
    props: true,
    meta: { title: '編輯費用記錄', allowedRoles: ['ACCOUNTANT'] }
  },
  {
    path: '/teachers',
    name: 'teachers',
    component: TeacherList,
    meta: { title: '老師管理' }
  },
  {
    path: '/teachers/add',
    name: 'teacher-add',
    component: TeacherForm,
    meta: { title: '新增老師' }
  },
  {
    path: '/teachers/edit/:id',
    name: 'teacher-edit',
    component: TeacherForm,
    props: true,
    meta: { title: '編輯老師' }
  },
  {
    path: '/courses',
    name: 'courses',
    component: CourseList,
    meta: { title: '課程管理' }
  },
  {
    path: '/courses/add',
    name: 'course-add',
    component: CourseForm,
    meta: { title: '新增課程' }
  },
  {
    path: '/courses/edit/:id',
    name: 'course-edit',
    component: CourseForm,
    props: true,
    meta: { title: '編輯課程' }
  },
  {
    path: '/attendance',
    name: 'attendance',
    component: AttendanceTracker,
    meta: { title: '請假管理' }
  },
  {
    path: '/attendance/leaves/add',
    name: 'leave-add',
    component: LeaveForm,
    meta: { title: '新增請假記錄' }
  },
  {
    path: '/attendance/leaves/edit/:id',
    name: 'leave-edit',
    component: LeaveForm,
    props: true,
    meta: { title: '編輯請假記錄' }
  },
  {
    path: '/questions',
    name: 'questions',
    component: QuestionBank,
    meta: { title: '題庫與資源管理', allowedRoles: ['TEACHER'] }
  },
  {
    path: '/questions/new',
    name: 'question-new',
    component: QuestionForm,
    meta: { title: '新增題目', allowedRoles: ['TEACHER'] }
  },
  {
    path: '/questions/edit/:id',
    name: 'question-edit',
    component: QuestionForm,
    props: true,
    meta: { title: '編輯題目', allowedRoles: ['TEACHER'] }
  },
  {
    path: '/questions/import',
    name: 'question-import',
    component: QuestionImport,
    meta: { title: '匯入題目', allowedRoles: ['TEACHER'] }
  },
  {
    path: '/block-editor-test',
    name: 'block-editor-test',
    component: BlockEditorTest,
    meta: { title: 'Block Editor 測試', allowedRoles: ['TEACHER'] }
  },
  {
    path: '/resources/new',
    name: 'resource-new',
    component: ResourceEditor,
    meta: { title: '新增教學資源', allowedRoles: ['TEACHER'] }
  },
  {
    path: '/resources/view/:id',
    name: 'resource-view',
    component: ResourceEditor,
    props: (route) => ({ id: route.params.id, viewMode: true }),
    meta: { title: '查看教學資源', allowedRoles: ['ADMIN', 'TEACHER', 'STUDENT'] }
  },
  {
    path: '/resources/edit/:id',
    name: 'resource-edit',
    component: ResourceEditor,
    props: true,
    meta: { title: '編輯教學資源', allowedRoles: ['TEACHER'] }
  },
  {
    path: '/templates/new',
    name: 'template-new',
    component: TemplateEditor,
    meta: { title: '新增模板', allowedRoles: ['TEACHER'] }
  },
  {
    path: '/templates/edit/:id',
    name: 'template-edit',
    component: TemplateEditor,
    props: true,
    meta: { title: '編輯模板', allowedRoles: ['TEACHER'] }
  },
  {
    path: '/lunch-orders',
    name: 'lunch-orders',
    component: LunchOrderSystem,
    meta: { title: '訂便當系統' }
  },
  {
    path: '/lunch-orders/:id',
    name: 'group-order-detail',
    component: GroupOrderDetail,
    props: true,
    meta: { title: '團購詳情' }
  },
  {
    path: '/lunch-orders/join/:link',
    name: 'join-group-order',
    component: JoinGroupOrder,
    props: true,
    meta: { title: '點餐' }
  },
  {
    path: '/roles',
    name: 'roles',
    component: RoleManagement,
    meta: { title: '角色管理', requiresAdmin: true }
  },
  {
    path: '/audit-logs',
    name: 'audit-logs',
    component: AuditLog,
    meta: { title: '操作記錄', requiresAdmin: true }
  }
]

const router: Router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * 根據角色過濾路由的函數類型
 */
type RouteFilter = (path: string) => boolean

/**
 * 根據角色過濾路由的函數
 */
function getRoleBasedRouteFilter(role: string): RouteFilter | null {
  // 依需求：老闆（ADMIN）不是「全能」，有明確允許/禁止的模組
  // 注意：管理員在非模擬狀態下不能訪問老師專用頁面（題庫與資源編輯）
  // 例外：管理員可以以唯讀模式查看資源
  if (role === 'ADMIN') {
    return (path: string): boolean => {
      // 允許：儀表板、學生、老師、課程、請假、角色管理、操作記錄
      const allowedPrefixes = ['/', '/students', '/teachers', '/courses', '/attendance', '/roles', '/audit-logs']

      // 特殊處理：允許管理員查看資源（唯讀）
      if (path.startsWith('/resources/view/')) {
        return true
      }

      // 禁止：訂便當、學生首頁、題庫、資源編輯、模板
      const excludedPrefixes = ['/lunch-orders', '/student-home', '/questions', '/resources', '/templates']
      if (excludedPrefixes.some((excluded) => path.startsWith(excluded))) {
        return false
      }

      return allowedPrefixes.some(
        (allowed) => path === allowed || path.startsWith(`${allowed}/`) || path.startsWith(allowed)
      )
    }
  }

  if (role === 'TEACHER') {
    return (path: string): boolean => {
      // 老師可以訪問：課程、題庫/資源/模板、學生群組、訂便當、學生列表/錯題本、首頁
      // 注意：老師不能訪問 /attendance 頁面（已在學生管理中處理）
      const allowedPrefixes = ['/', '/courses', '/questions', '/resources', '/templates', '/lunch-orders', '/students']

      // 禁止訪問出缺勤頁面
      if (path.startsWith('/attendance')) {
        return false
      }

      // 學生路由：老師只允許列表與錯題本
      if (path.startsWith('/students')) {
        if (path === '/students') return true
        // /students/:id/errors
        return /^\/students\/[^/]+\/errors$/.test(path)
      }

      return allowedPrefixes.some((allowed) => path.startsWith(allowed))
    }
  }

  if (role === 'STUDENT') {
    return (path: string): boolean => {
      // 學生只能訪問：自己報名的課程、相關考卷(資源)、訂便當、學生首頁、自己的錯題本
      // 注意：學生可能需要訪問 /resources 來查看考卷，但具體權限在 API 層控制
      // 這裡允許訪問 /courses 和 /resources (如果有的話)
      const allowedPaths = [
        '/',
        '/courses',
        '/resources',
        '/lunch-orders',
        '/student-home',
        '/students',
        '/student-mistake-book',
        '/my-courses'
      ]
      return allowedPaths.some((allowed) => path.startsWith(allowed))
    }
  }

  if (role === 'ACCOUNTANT') {
    return (path: string): boolean => {
      // 會計可以訪問：帳務、訂便當、學生基本資料（僅查看）、課程管理（僅查看）
      const allowedPaths = ['/', '/students', '/lunch-orders', '/attendance', '/fees', '/courses']
      // 排除教學相關模組與老師管理
      const excludedPaths = [
        '/questions',
        '/resources',
        '/generator',
        '/teachers',
        '/templates',
        '/roles',
        '/audit-logs',
        '/student-home'
      ]
      if (excludedPaths.some((excluded) => path.startsWith(excluded))) {
        return false
      }
      return allowedPaths.some((allowed) => path.startsWith(allowed))
    }
  }

  return null
}

/**
 * 獲取當前用戶信息
 */
async function getCurrentUser(): Promise<User | null> {
  try {
    // 檢查是否有 access token
    const accessToken = localStorage.getItem('access_token')
    if (!accessToken) {
      return null
    }

    // 先從 localStorage 獲取用戶信息
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr) as User
      // 驗證用戶數據是否有效
      if (user && user.id) {
        // 驗證 token 是否仍然有效（可選，因為 API 攔截器會自動處理）
        try {
          const { authAPI } = await import('../services/api')
          const response = await authAPI.getCurrentUser()
          // 更新用戶信息
          if (response.data) {
            localStorage.setItem('user', JSON.stringify(response.data))
            return response.data
          }
          return user
        } catch (error) {
          // Token 無效，清除本地存儲
          const { clearTokens } = await import('../services/api')
          clearTokens()
          return null
        }
      }
    }

    // 如果沒有本地存儲，嘗試從 API 獲取
    try {
      const { authAPI } = await import('../services/api')
      const response = await authAPI.getCurrentUser()
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data))
        return response.data
      }
    } catch (apiError) {
      // API 可能不存在或需要認證，忽略錯誤
      console.warn('無法從 API 獲取用戶信息:', apiError)
    }

    return null
  } catch (error) {
    console.error('獲取用戶信息失敗:', error)
    return null
  }
}

/**
 * 檢查頁面權限
 */
async function checkPagePermission(user: User, pagePath: string): Promise<boolean> {
  if (user.role === 'ADMIN') {
    return true
  }

  // 檢查自訂角色的頁面權限
  if (user.custom_role) {
    try {
      const { roleAPI } = await import('../services/api')
      const response = await roleAPI.getById(user.custom_role)
      const role = response.data

      // 類型守衛：檢查 role 是否有 permissions
      if (role && typeof role === 'object' && 'permissions' in role) {
        const permissions = (role as { permissions?: Array<{ permission_type: string; resource: string }> }).permissions
        return (
          permissions?.some((p) => p.permission_type === 'page' && p.resource === pagePath) || false
        )
      }
    } catch (error) {
      console.error('檢查頁面權限失敗:', error)
      return false
    }
  }

  return false
}

// 路由守衛：檢查權限
router.beforeEach(async (to, from, next) => {
  // 登入頁面不需要認證
  if (to.name === 'login') {
    // 如果已經登入，跳轉到首頁
    const user = await getCurrentUser()
    if (user) {
      next('/')
      return
    }
    next()
    return
  }

  // 檢查是否已登入
  const user = await getCurrentUser()

  if (!user) {
    // 未登入，跳轉到登入頁
    next('/login')
    return
  }

  // 獲取有效角色（考慮角色切換）
  let effectiveRole = user.role
  try {
    const { roleSwitchAPI } = await import('../services/api')
    const roleResponse = await roleSwitchAPI.getCurrentRole()
    if (roleResponse.data && typeof roleResponse.data === 'object' && 'temp_role' in roleResponse.data) {
      const tempRole = (roleResponse.data as { temp_role?: string }).temp_role
      if (tempRole) {
        effectiveRole = tempRole
      }
    }
  } catch (error) {
    // 忽略錯誤，使用原始角色
  }

  // 檢查是否需要管理員權限
  if (to.meta.requiresAdmin) {
    if (effectiveRole !== 'ADMIN') {
      alert('您沒有權限訪問此頁面')
      next('/')
      return
    }
  }

  // 檢查允許的角色
  if (to.meta.allowedRoles && to.meta.allowedRoles.length > 0) {
    if (!to.meta.allowedRoles.includes(effectiveRole)) {
      alert('您沒有權限訪問此頁面')
      next('/')
      return
    }
  }

  // 檢查管理員是否在模擬狀態下訪問老師專用頁面
  if (user.role === 'ADMIN' && effectiveRole === 'ADMIN') {
    // 管理員在非模擬狀態下，不允許訪問老師專用頁面
    // 例外：允許管理員以唯讀模式查看資源
    const teacherOnlyPaths = ['/questions', '/templates']
    const teacherOnlyResourcePaths = ['/resources/new', '/resources/edit']

    if (teacherOnlyPaths.some((path) => to.path.startsWith(path))) {
      alert('管理員需要先切換到老師身分才能訪問此功能')
      next('/')
      return
    }

    // 檢查資源相關路徑（允許查看，但不允許新增和編輯）
    if (teacherOnlyResourcePaths.some((path) => to.path.startsWith(path))) {
      alert('管理員需要先切換到老師身分才能編輯資源')
      next('/')
      return
    }
  }

  // 根據角色過濾路由
  const roleBasedFilter = getRoleBasedRouteFilter(effectiveRole)
  if (roleBasedFilter && !roleBasedFilter(to.path)) {
    // 特殊處理：如果是學生訪問首頁，自動重定向到學生首頁
    if (effectiveRole === 'STUDENT' && to.path === '/') {
      next('/student-home')
      return
    }

    alert('您沒有權限訪問此頁面')
    next('/')
    return
  }

  // 學生登入後訪問根路徑，重定向到學生首頁
  if (effectiveRole === 'STUDENT' && to.path === '/') {
    next('/student-home')
    return
  }

  // 檢查頁面權限（如果不是管理員）
  if (to.meta.requiresPagePermission) {
    if (effectiveRole !== 'ADMIN') {
      const hasPermission = await checkPagePermission(user, to.path)
      if (!hasPermission) {
        alert('您沒有權限訪問此頁面 (Page Permission)')
        next('/')
        return
      }
    }
  }

  next()
})

export default router
