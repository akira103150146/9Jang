/**
 * 認證守衛
 */

import type { User } from '@9jang/shared'

/**
 * 獲取當前用戶信息
 */
export async function getCurrentUser(): Promise<User | null> {
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
          const { authAPI } = await import('../../services/api')
          const response = await authAPI.getCurrentUser()
          // 更新用戶信息
          if (response.data) {
            localStorage.setItem('user', JSON.stringify(response.data))
            return response.data
          }
          return user
        } catch (error) {
          // Token 無效，清除本地存儲
          const { clearTokens } = await import('../../services/api')
          clearTokens()
          return null
        }
      }
    }

    // 如果沒有本地存儲，嘗試從 API 獲取
    try {
      const { authAPI } = await import('../../services/api')
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
