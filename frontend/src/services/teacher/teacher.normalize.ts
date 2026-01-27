/**
 * Teacher 資料正規化邏輯
 */

import type { Teacher } from '@9jang/shared'
import { TeacherSchema } from '@9jang/shared'

/**
 * 數據預處理函數：處理後端返回格式與前端 schema 不一致的問題
 */
export function normalizeTeacherResponse(item: unknown): Teacher {
  const rawItem = item as {
    user?: number | null  // DRF 序列化 ForeignKey 為數字或 null
    user_id?: number | null
    [key: string]: unknown
  }
  
  const processedItem = {
    ...item,
    // 處理 user_id：後端返回 user（數字 ID），前端期望 user_id
    user_id: rawItem.user_id ?? (typeof rawItem.user === 'number' ? rawItem.user : null)
  }
  // 移除原始的 user 字段（如果存在且不是 user_id）
  if ('user' in processedItem && typeof rawItem.user === 'number' && !rawItem.user_id) {
    delete (processedItem as { user?: unknown }).user
  }
  
  return TeacherSchema.parse(processedItem)
}
