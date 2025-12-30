import { logger } from '../utils/logger'

/**
 * 統一的錯誤處理 Composable
 * 提供標準化的錯誤處理邏輯
 */
export function useErrorHandler(context = 'Unknown') {
  const contextLogger = logger.errorWithContext.bind(null, context)

  /**
   * 處理錯誤並顯示用戶友好的訊息
   * @param {Error|any} error - 錯誤物件
   * @param {object} options - 選項
   * @param {string} options.userMessage - 顯示給用戶的訊息
   * @param {function} options.onError - 錯誤回調
   * @param {object} options.additionalData - 額外的上下文資料
   */
  const handleError = async (error, options = {}) => {
    const {
      userMessage = '操作失敗，請稍後再試',
      onError = null,
      additionalData = {}
    } = options

    // 記錄錯誤
    contextLogger(error, additionalData)

    // 執行自定義錯誤處理
    if (onError) {
      try {
        await onError(error)
      } catch (err) {
        logger.error('[useErrorHandler] onError callback failed', err)
      }
    }

    // 返回錯誤資訊（可用於組件顯示）
    return {
      error,
      userMessage,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * 執行帶錯誤處理的異步函數
   * @param {function} fn - 要執行的函數
   * @param {object} options - 錯誤處理選項
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  const withErrorHandling = async (fn, options = {}) => {
    try {
      const data = await fn()
      return { success: true, data }
    } catch (error) {
      const errorInfo = await handleError(error, options)
      return { success: false, error: errorInfo }
    }
  }

  /**
   * 處理 API 錯誤（常見的 HTTP 錯誤碼）
   * @param {Error|any} error - 錯誤物件
   * @returns {string} 用戶友好的錯誤訊息
   */
  const getErrorMessage = (error) => {
    if (!error) return '未知錯誤'

    // 檢查是否為 axios 錯誤
    if (error.response) {
      const status = error.response.status
      const data = error.response.data

      switch (status) {
        case 400:
          return data?.message || '請求參數錯誤'
        case 401:
          return '未授權，請重新登入'
        case 403:
          return '沒有權限執行此操作'
        case 404:
          return '資源不存在'
        case 422:
          return data?.message || '資料驗證失敗'
        case 500:
          return '伺服器錯誤，請稍後再試'
        case 503:
          return '服務暫時無法使用'
        default:
          return data?.message || `錯誤 (${status})`
      }
    }

    // 網路錯誤
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network')) {
      return '網路連接失敗，請檢查網路連線'
    }

    // 超時錯誤
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return '請求超時，請稍後再試'
    }

    // 其他錯誤
    return error.message || '操作失敗，請稍後再試'
  }

  return {
    handleError,
    withErrorHandling,
    getErrorMessage
  }
}
