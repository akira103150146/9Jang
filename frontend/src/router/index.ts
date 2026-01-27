/**
 * 路由配置主檔案
 */

import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
  type Router,
} from 'vue-router'
import { studentRoutes } from './routes/student.routes'
import { teacherRoutes } from './routes/teacher.routes'
import { courseRoutes } from './routes/course.routes'
import { questionRoutes } from './routes/question.routes'
import { resourceRoutes } from './routes/resource.routes'
import { feeRoutes } from './routes/fee.routes'
import { commonRoutes } from './routes/common.routes'
import { getCurrentUser } from './guards/auth.guard'
import { getRoleBasedRouteFilter, checkPagePermission } from './guards/permission.guard'

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
  ...commonRoutes,
  ...studentRoutes,
  ...teacherRoutes,
  ...courseRoutes,
  ...questionRoutes,
  ...resourceRoutes,
  ...feeRoutes,
]

const router: Router = createRouter({
  history: createWebHistory(),
  routes
})

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
