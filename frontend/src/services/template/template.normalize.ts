/**
 * Template 資料正規化
 */

import { z } from 'zod'
import type { ContentTemplate } from '@9jang/shared'
import { ContentTemplateSchema } from '@9jang/shared'
import { normalizeDateTime } from '../api/utils'
import { logger } from '../../utils/logger'

/**
 * 正規化 ContentTemplate 響應數據
 */
export function normalizeContentTemplateResponse(item: unknown): ContentTemplate {
  const rawItem = item as {
    created_at?: string | null
    updated_at?: string | null
    [key: string]: unknown
  }

  // 處理 datetime 字段：將 null 轉換為 undefined，確保格式正確
  const processedItem = {
    ...item,
    created_at: normalizeDateTime(rawItem.created_at),
    updated_at: normalizeDateTime(rawItem.updated_at)
  }

  try {
    return ContentTemplateSchema.parse(processedItem)
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.errorWithContext(
        'template.normalizeContentTemplateResponse',
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
