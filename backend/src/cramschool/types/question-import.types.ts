/**
 * Question Import Types
 * 題目匯入相關的類型定義
 */

export interface ImportResult {
  success: boolean
  count: number
  questions: Array<ImportedQuestionSummary>
  errors?: string[]
}

export interface ImportedQuestionSummary {
  question_id: number
  content: unknown
}

export interface PreviewResult {
  success: boolean
  count: number
  questions: unknown[]
  errors: string[]
}
