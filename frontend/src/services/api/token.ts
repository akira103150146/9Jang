/**
 * Token 管理工具函數
 */

/**
 * 獲取 access token
 */
export const getToken = (): string | null => {
  return localStorage.getItem('access_token')
}

/**
 * 獲取 refresh token
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refresh_token')
}

/**
 * 設置 tokens
 */
export const setTokens = (access: string, refresh?: string): void => {
  localStorage.setItem('access_token', access)
  if (refresh) {
    localStorage.setItem('refresh_token', refresh)
  }
}

/**
 * 清除 tokens
 */
export const clearTokens = (): void => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
}
