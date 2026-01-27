/**
 * Course 資料正規化邏輯
 */

import type { Course } from '@9jang/shared'
import { CourseSchema } from '@9jang/shared'

/**
 * 數據預處理函數：處理後端返回格式與前端 schema 不一致的問題
 */
export function normalizeCourseResponse(item: unknown): Course {
  const rawItem = item as {
    fee_per_session?: string | number
    teacher?: number | { teacher_id?: number; id?: number }  // DRF 序列化 ForeignKey 為數字或對象
    teacher_id?: number
    [key: string]: unknown
  }
  
  // 處理 fee_per_session：如果是字符串，轉換為數字
  let feePerSession = 0
  if (typeof rawItem.fee_per_session === 'string') {
    feePerSession = parseFloat(rawItem.fee_per_session) || 0
  } else if (typeof rawItem.fee_per_session === 'number') {
    feePerSession = rawItem.fee_per_session
  }
  
  // 處理 teacher_id：DRF 可能返回 teacher（數字 ID）或 teacher 對象
  let teacherId = rawItem.teacher_id
  if (!teacherId) {
    if (typeof rawItem.teacher === 'number') {
      teacherId = rawItem.teacher
    } else if (rawItem.teacher && typeof rawItem.teacher === 'object') {
      teacherId = (rawItem.teacher as { teacher_id?: number; id?: number }).teacher_id 
        ?? (rawItem.teacher as { teacher_id?: number; id?: number }).id
    }
  }
  // 如果都沒有，使用默認值 1（符合 schema 的 positive() 要求）
  teacherId = teacherId || 1
  
  const processedItem = {
    ...item,
    fee_per_session: feePerSession,
    teacher_id: teacherId
  }
  // 如果原始數據有 teacher 字段，移除它，因為我們已經轉換為 teacher_id
  if ('teacher' in processedItem && !('teacher_id' in rawItem)) {
    delete (processedItem as { teacher?: unknown }).teacher
  }
  
  return CourseSchema.parse(processedItem)
}
