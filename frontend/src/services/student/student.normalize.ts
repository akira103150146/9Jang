/**
 * Student 資料正規化邏輯
 */

import type { Student } from '@9jang/shared'
import { StudentSchema } from '@9jang/shared'

/**
 * 數據預處理函數：處理後端返回格式與前端 schema 不一致的問題
 */
export function normalizeStudentResponse(item: unknown): Student {
  const rawItem = item as {
    user?: number | null  // DRF 序列化 ForeignKey 為數字或 null
    user_id?: number | null
    enrollments?: unknown[]  // 報名課程列表（後端返回但不在 StudentSchema 中）
    student_groups?: unknown[]  // 標籤列表（後端返回但不在 StudentSchema 中）
    has_tuition_needed?: boolean  // 是否需要生成學費（後端返回但不在 StudentSchema 中）
    total_fees?: number  // 總費用（後端返回但不在 StudentSchema 中）
    unpaid_fees?: number  // 待繳費用（後端返回但不在 StudentSchema 中）
    enrollments_count?: number  // 報名課程數量（後端返回但不在 StudentSchema 中）
    [key: string]: unknown
  }
  
  // 保存不在 StudentSchema 中的字段（會被 parse 移除）
  const enrollments = rawItem.enrollments
  const student_groups = rawItem.student_groups
  const has_tuition_needed = rawItem.has_tuition_needed
  const total_fees = rawItem.total_fees
  const unpaid_fees = rawItem.unpaid_fees
  const enrollments_count = rawItem.enrollments_count
  
  const processedItem = {
    ...item,
    // 處理 user_id：後端返回 user（數字 ID），前端期望 user_id
    user_id: rawItem.user_id ?? (typeof rawItem.user === 'number' ? rawItem.user : null)
  }
  // 移除原始的 user 字段（如果存在且不是 user_id）
  if ('user' in processedItem && typeof rawItem.user === 'number' && !rawItem.user_id) {
    delete (processedItem as { user?: unknown }).user
  }
  
  // 解析基本學生數據（會移除所有不在 StudentSchema 中的字段）
  const parsed = StudentSchema.parse(processedItem)
  
  // 將所有額外字段添加回去（這些字段會被 normalizeStudent 使用）
  return {
    ...parsed,
    enrollments: enrollments || [],
    student_groups: student_groups || [],
    has_tuition_needed,
    total_fees,
    unpaid_fees,
    enrollments_count
  } as Student & { 
    enrollments: unknown[]
    student_groups: unknown[]
    has_tuition_needed?: boolean
    total_fees?: number
    unpaid_fees?: number
    enrollments_count?: number
  }
}
