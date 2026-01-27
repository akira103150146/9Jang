/**
 * Resource 資料正規化
 */

import { z } from 'zod'
import type { LearningResource } from '@9jang/shared'
import { LearningResourceSchema } from '@9jang/shared'
import { normalizeDateTime } from '../api/utils'
import { logger } from '../../utils/logger'

/**
 * 正規化 LearningResource 響應數據
 */
export function normalizeLearningResourceResponse(item: unknown): LearningResource {
  const rawItem = item as {
    created_at?: string | null
    updated_at?: string | null
    available_from?: string | null
    available_until?: string | null
    [key: string]: unknown
  }

  // 處理 datetime 字段：將 null 轉換為 undefined，確保格式正確
  const processedItem = {
    ...item,
    created_at: normalizeDateTime(rawItem.created_at),
    updated_at: normalizeDateTime(rawItem.updated_at),
    available_from: normalizeDateTime(rawItem.available_from),
    available_until: normalizeDateTime(rawItem.available_until)
  }

  try {
    return LearningResourceSchema.parse(processedItem)
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.errorWithContext(
        'resource.normalizeLearningResourceResponse',
        error,
        {
          rawItem,
          processedItem,
          errors: error.errors
        }
      )
    }
    throw error
  }
}
