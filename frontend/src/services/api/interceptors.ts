/**
 * Axios 攔截器配置
 */

import { AxiosInstance, AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios'
import type {
  RefreshTokenRequestDto,
  RefreshTokenResponse
} from '@9jang/shared'
import {
  RefreshTokenResponseSchema
} from '@9jang/shared'
import { setTokens, clearTokens, getToken, getRefreshToken } from './token'

/**
 * 配置請求攔截器：添加 JWT token 和臨時角色 header
 */
export function setupRequestInterceptor(api: AxiosInstance): void {
  api.interceptors.request.use(
    (config) => {
      const token = getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      // 添加臨時角色 header（如果存在）
      const tempRole = localStorage.getItem('temp_role')
      if (tempRole) {
        config.headers['X-Temp-Role'] = tempRole
      }

      // 添加原始管理員 ID header（如果存在，表示當前處於模擬狀態）
      const originalUser = localStorage.getItem('original_user')
      if (originalUser) {
        try {
          const adminUser = JSON.parse(originalUser) as { id?: number }
          if (adminUser.id) {
            config.headers['X-Impersonated-By'] = adminUser.id.toString()
          }
        } catch (e) {
          // 如果解析失敗，忽略
        }
      }

      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )
}

/**
 * 刷新 access token
 */
async function refreshAccessToken(api: AxiosInstance): Promise<string> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new Error('No refresh token')
  }

  try {
    const response = await api.post<RefreshTokenResponse>('/account/token/refresh/', {
      refresh: refreshToken
    } as RefreshTokenRequestDto)
    
    // 使用 Zod 驗證響應
    const validated = RefreshTokenResponseSchema.parse(response.data)
    const { access } = validated
    localStorage.setItem('access_token', access)
    return access
  } catch (error) {
    clearTokens()
    throw error
  }
}

/**
 * 配置響應攔截器：處理認證錯誤和 token 刷新
 */
export function setupResponseInterceptor(api: AxiosInstance): void {
  let isRefreshing = false
  interface QueuedRequest {
    resolve: (token: string) => void
    reject: (error: unknown) => void
  }
  const failedQueue: QueuedRequest[] = []

  const processQueue = (error: unknown | null, token: string | null = null): void => {
    failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error)
      } else {
        prom.resolve(token!)
      }
    })
    failedQueue.length = 0
  }

  api.interceptors.response.use(
    (response: AxiosResponse) => {
      return response
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

      // 如果是 401 錯誤且不是登入請求，嘗試刷新 token
      if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/api/account/login/') {
        // 如果當前在登入頁面，不嘗試刷新 token
        if (window.location.pathname === '/login') {
          return Promise.reject(error)
        }

        // 檢查是否有 refresh token，如果沒有則不嘗試刷新
        const refreshToken = getRefreshToken()
        if (!refreshToken) {
          clearTokens()
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          return Promise.reject(error)
        }

        if (isRefreshing) {
          // 如果正在刷新，將請求加入隊列
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
            .then(token => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`
                // 重新設置臨時角色 header（如果存在）
                const tempRole = localStorage.getItem('temp_role')
                if (tempRole) {
                  originalRequest.headers['X-Temp-Role'] = tempRole
                }
                // 重新設置原始管理員 header（如果存在）
                const originalUser = localStorage.getItem('original_user')
                if (originalUser) {
                  try {
                    const adminUser = JSON.parse(originalUser) as { id?: number }
                    if (adminUser.id) {
                      originalRequest.headers['X-Impersonated-By'] = adminUser.id.toString()
                    }
                  } catch (e) {
                    // 如果解析失敗，忽略
                  }
                }
              }
              return api(originalRequest)
            })
            .catch(err => {
              return Promise.reject(err)
            })
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          const newToken = await refreshAccessToken(api)
          processQueue(null, newToken)
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            // 重新設置臨時角色 header（如果存在）
            const tempRole = localStorage.getItem('temp_role')
            if (tempRole) {
              originalRequest.headers['X-Temp-Role'] = tempRole
            }
            // 重新設置原始管理員 header（如果存在）
            const originalUser = localStorage.getItem('original_user')
            if (originalUser) {
              try {
                const adminUser = JSON.parse(originalUser) as { id?: number }
                if (adminUser.id) {
                  originalRequest.headers['X-Impersonated-By'] = adminUser.id.toString()
                }
              } catch (e) {
                // 如果解析失敗，忽略
              }
            }
          }
          return api(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError, null)
          clearTokens()
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }

      return Promise.reject(error)
    }
  )
}
