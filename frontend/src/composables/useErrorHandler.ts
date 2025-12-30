import type { AxiosError } from 'axios'
import { logger } from '../utils/logger'

/**
 * 錯誤處理選項
 */
export interface ErrorHandlerOptions {
  userMessage?: string
  onError?: (error: unknown) => void | Promise<void>
  additionalData?: Record<string, unknown>
}

/**
 * 錯誤信息返回類型
 */
export interface ErrorInfo {
  error: unknown
  userMessage: string
  timestamp: string
}

/**
 * 錯誤處理結果類型
 */
export interface ErrorHandlingResult<T> {
  success: boolean
  data?: T
  error?: ErrorInfo
}

/**
 * 統一的錯誤處理 Composable
 * 提供標準化的錯誤處理邏輯
 */
export function useErrorHandler(context = 'Unknown') {
  const contextLogger = logger.errorWithContext.bind(null, context)

  /**
   * 處理錯誤並顯示用戶友好的訊息
   */
  const handleError = async (error: unknown, options: ErrorHandlerOptions = {}): Promise<ErrorInfo> => {
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
   */
  const withErrorHandling = async <T>(
    fn: () => Promise<T> | T,
    options: ErrorHandlerOptions = {}
  ): Promise<ErrorHandlingResult<T>> => {
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
   */
  const getErrorMessage = (error: unknown): string => {
    if (!error) return '未知錯誤'

    // 檢查是否為 axios 錯誤
    const axiosError = error as AxiosError<{ message?: string }>
    if (axiosError.response) {
      const status = axiosError.response.status
      const data = axiosError.response.data

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
    if (
      (axiosError as { code?: string }).code === 'NETWORK_ERROR' ||
      (error instanceof Error && error.message?.includes('Network'))
    ) {
      return '網路連接失敗，請檢查網路連線'
    }

    // 超時錯誤
    if (
      (axiosError as { code?: string }).code === 'ECONNABORTED' ||
      (error instanceof Error && error.message?.includes('timeout'))
    ) {
      return '請求超時，請稍後再試'
    }

    // 其他錯誤
    return error instanceof Error ? error.message : '操作失敗，請稍後再試'
  }

  return {
    handleError,
    withErrorHandling,
    getErrorMessage
  }
}
