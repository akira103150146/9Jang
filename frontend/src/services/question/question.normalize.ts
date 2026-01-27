/**
 * Question 資料正規化邏輯
 */

import type { Question } from '@9jang/shared'
import { QuestionSchema } from '@9jang/shared'
import { z } from 'zod'
import { logger } from '../../utils/logger'
import { normalizeDateTime } from '../api/utils'

/**
 * 將選項轉換為 Tiptap 文檔格式
 * 如果選項已經是完整的 Tiptap 文檔（type: 'doc'），則直接返回
 * 否則，將選項包裝在段落中，然後包裝在文檔中
 */
function normalizeOptionToTiptapDoc(option: unknown): { type: 'doc'; content: unknown[] } {
  if (!option) {
    return { type: 'doc', content: [] }
  }
  
  // 如果已經是完整的 Tiptap 文檔格式
  if (typeof option === 'object' && option !== null && 'type' in option) {
    const opt = option as { type: string; [key: string]: unknown }
    if (opt.type === 'doc') {
      return opt as { type: 'doc'; content: unknown[] }
    }
    // 如果是一個節點（如 paragraph），包裝在 doc 中
    if (opt.type && opt.type !== 'doc') {
      return { type: 'doc', content: [option] }
    }
  }
  
  // 如果是字符串，轉換為段落
  if (typeof option === 'string') {
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: option ? [{ type: 'text', text: option }] : []
        }
      ]
    }
  }
  
  // 其他情況，返回空文檔
  return { type: 'doc', content: [] }
}

/**
 * 數據預處理函數：處理後端返回格式與前端 schema 不一致的問題
 */
export function normalizeQuestionResponse(item: unknown): Question {
  const rawItem = item as {
    subject?: number | { subject_id?: number; id?: number } | null  // DRF 序列化 ForeignKey 為數字或對象
    subject_id?: number | null
    options?: unknown[] | null
    created_at?: string | null
    updated_at?: string | null
    [key: string]: unknown
  }
  
  // 處理 subject_id：DRF 可能返回 subject（數字 ID）或 subject 對象
  let subjectId = rawItem.subject_id
  if (!subjectId && subjectId !== 0) {
    if (typeof rawItem.subject === 'number') {
      subjectId = rawItem.subject
    } else if (rawItem.subject && typeof rawItem.subject === 'object') {
      subjectId = (rawItem.subject as { subject_id?: number; id?: number }).subject_id 
        ?? (rawItem.subject as { subject_id?: number; id?: number }).id
        ?? undefined
    }
  }
  
  // 如果仍然沒有 subject_id，記錄錯誤（這不應該發生，後端應該總是返回 subject）
  if (!subjectId && subjectId !== 0) {
    logger.errorWithContext(
      'api.normalizeQuestionResponse',
      new Error('Question missing subject_id'),
      { item: rawItem }
    )
    // 不設置默認值，讓 Zod 驗證失敗，這樣我們可以知道問題所在
  }
  
  // 處理 options 字段：將每個選項轉換為 Tiptap 文檔格式
  let normalizedOptions: unknown[] | undefined = undefined
  if (rawItem.options) {
    if (Array.isArray(rawItem.options)) {
      normalizedOptions = rawItem.options.map(opt => normalizeOptionToTiptapDoc(opt))
    }
  }
  
  // 處理 datetime 字段：將 null 轉換為 undefined，確保格式正確
  const processedItem = {
    ...item,
    subject_id: subjectId,
    options: normalizedOptions,
    created_at: normalizeDateTime(rawItem.created_at),
    updated_at: normalizeDateTime(rawItem.updated_at)
  }
  // 如果原始數據有 subject 字段，移除它，因為我們已經轉換為 subject_id
  if ('subject' in processedItem && !('subject_id' in rawItem)) {
    delete (processedItem as { subject?: unknown }).subject
  }
  
  try {
    return QuestionSchema.parse(processedItem)
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.errorWithContext(
        'api.normalizeQuestionResponse',
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
