/**
 * 統一的日誌管理工具
 * 提供統一的日誌介面，方便日後擴展（如錯誤追蹤服務）
 */

const isDev = import.meta.env.DEV
const isProd = import.meta.env.PROD

/**
 * 日誌級別
 */
export const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
} as const

export type LogLevelType = typeof LogLevel[keyof typeof LogLevel]

/**
 * 上下文 Logger 介面
 */
export interface ContextLogger {
  debug: (...args: unknown[]) => void
  info: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
  errorWithContext: (subContext: string, error: unknown, additionalData?: Record<string, unknown>) => void
}

/**
 * 日誌工具
 */
export const logger = {
  /**
   * Debug 日誌（僅在開發環境顯示）
   */
  debug: (...args: unknown[]): void => {
    if (isDev) {
      console.log('[DEBUG]', ...args)
    }
  },

  /**
   * Info 日誌
   */
  info: (...args: unknown[]): void => {
    if (isDev) {
      console.info('[INFO]', ...args)
    }
  },

  /**
   * Warning 日誌
   */
  warn: (...args: unknown[]): void => {
    console.warn('[WARN]', ...args)

    // 生產環境可以發送到錯誤追蹤服務
    if (isProd) {
      // TODO: 發送到錯誤追蹤服務（如 Sentry）
      // trackWarning(...args)
    }
  },

  /**
   * Error 日誌
   */
  error: (...args: unknown[]): void => {
    console.error('[ERROR]', ...args)

    // 生產環境發送到錯誤追蹤服務
    if (isProd) {
      // TODO: 發送到錯誤追蹤服務（如 Sentry）
      // trackError(...args)
    }
  },

  /**
   * 帶上下文的錯誤日誌
   * @param context - 上下文描述（如組件名稱、函數名稱）
   * @param error - 錯誤物件
   * @param additionalData - 額外的上下文資料
   */
  errorWithContext: (context: string, error: unknown, additionalData: Record<string, unknown> = {}): void => {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined

    logger.error(`[${context}]`, errorMessage, {
      ...additionalData,
      stack: errorStack
    })
  }
}

/**
 * 創建帶上下文的 logger（用於特定組件或模組）
 * @param context - 上下文前綴
 * @returns 帶上下文的 logger
 */
export function createLogger(context: string): ContextLogger {
  return {
    debug: (...args: unknown[]) => logger.debug(`[${context}]`, ...args),
    info: (...args: unknown[]) => logger.info(`[${context}]`, ...args),
    warn: (...args: unknown[]) => logger.warn(`[${context}]`, ...args),
    error: (...args: unknown[]) => logger.error(`[${context}]`, ...args),
    errorWithContext: (subContext: string, error: unknown, additionalData?: Record<string, unknown>) =>
      logger.errorWithContext(`${context}.${subContext}`, error, additionalData)
  }
}

export default logger
