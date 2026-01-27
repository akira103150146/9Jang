/**
 * 權限守衛
 */

import type { User } from '@9jang/shared'

/**
 * 根據角色過濾路由的函數類型
 */
export type RouteFilter = (path: string) => boolean

/**
 * 根據角色過濾路由的函數
 */
export function getRoleBasedRouteFilter(role: string): RouteFilter | null {
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
 * 檢查頁面權限
 */
export async function checkPagePermission(user: User, pagePath: string): Promise<boolean> {
  if (user.role === 'ADMIN') {
    return true
  }

  // 檢查自訂角色的頁面權限
  if (user.custom_role) {
    try {
      const { roleAPI } = await import('../../services/api')
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
