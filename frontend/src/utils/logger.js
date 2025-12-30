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
}

/**
 * 日誌工具
 */
export const logger = {
  /**
   * Debug 日誌（僅在開發環境顯示）
   */
  debug: (...args) => {
    if (isDev) {
      console.log('[DEBUG]', ...args)
    }
  },

  /**
   * Info 日誌
   */
  info: (...args) => {
    if (isDev) {
      console.info('[INFO]', ...args)
    }
  },

  /**
   * Warning 日誌
   */
  warn: (...args) => {
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
  error: (...args) => {
    console.error('[ERROR]', ...args)
    
    // 生產環境發送到錯誤追蹤服務
    if (isProd) {
      // TODO: 發送到錯誤追蹤服務（如 Sentry）
      // trackError(...args)
    }
  },

  /**
   * 帶上下文的錯誤日誌
   * @param {string} context - 上下文描述（如組件名稱、函數名稱）
   * @param {Error|any} error - 錯誤物件
   * @param {object} additionalData - 額外的上下文資料
   */
  errorWithContext: (context, error, additionalData = {}) => {
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
 * @param {string} context - 上下文前綴
 * @returns {object} 帶上下文的 logger
 */
export function createLogger(context) {
  return {
    debug: (...args) => logger.debug(`[${context}]`, ...args),
    info: (...args) => logger.info(`[${context}]`, ...args),
    warn: (...args) => logger.warn(`[${context}]`, ...args),
    error: (...args) => logger.error(`[${context}]`, ...args),
    errorWithContext: (subContext, error, additionalData) => 
      logger.errorWithContext(`${context}.${subContext}`, error, additionalData)
  }
}

export default logger
