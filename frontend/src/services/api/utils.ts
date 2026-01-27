/**
 * API 工具函數
 */

import { AxiosResponse } from 'axios'
import { z } from 'zod'
import { logger } from '../../utils/logger'

/**
 * 類型安全的 API 響應驗證工具
 * 使用 Zod schema 驗證響應數據
 */
export function validateResponse<T>(
  response: AxiosResponse<unknown>,
  schema: z.ZodSchema<T>
): T {
  try {
    return schema.parse(response.data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.errorWithContext(
        'api.validateResponse',
        new Error('API 響應驗證失敗'),
        { errors: error.errors, data: response.data }
      )
    }
    throw error
  }
}

/**
 * 將後端返回的日期時間字符串轉換為符合 Zod datetime() 驗證的格式
 * Django REST Framework 可能返回的格式：
 * - ISO 8601 格式（符合要求）
 * - 沒有時區信息的格式（需要轉換）
 * - null（轉換為 undefined）
 * 
 * Zod 的 datetime() 驗證要求 RFC 3339 格式（ISO 8601 的子集）
 * 格式：YYYY-MM-DDTHH:mm:ss[.sss]Z 或 YYYY-MM-DDTHH:mm:ss[.sss][+-]HH:mm
 */
export function normalizeDateTime(value: string | null | undefined): string | undefined {
  if (!value || value === null) {
    return undefined
  }
  
  const str = String(value).trim()
  if (!str || str === 'null' || str === 'undefined') {
    return undefined
  }
  
  // 嘗試解析日期
  try {
    const date = new Date(str)
    // 檢查是否為有效日期
    if (isNaN(date.getTime())) {
      logger.warn(`Invalid date string: ${str}`)
      return undefined
    }
    
    // 轉換為 ISO 8601 格式（RFC 3339）
    // toISOString() 返回格式：YYYY-MM-DDTHH:mm:ss.sssZ
    const isoString = date.toISOString()
    
    // 驗證是否符合 RFC 3339 格式（Zod datetime() 的要求）
    // RFC 3339 格式：YYYY-MM-DDTHH:mm:ss[.sss]Z 或 YYYY-MM-DDTHH:mm:ss[.sss][+-]HH:mm
    const rfc3339Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})$/
    if (rfc3339Regex.test(isoString)) {
      return isoString
    }
    
    // 如果不符合，嘗試手動格式化
    logger.warn(`Date string does not match RFC 3339 format: ${str}, converted to: ${isoString}`)
    return isoString
  } catch (error) {
    logger.warn(`Failed to parse date string: ${str}`, error)
    return undefined
  }
}
