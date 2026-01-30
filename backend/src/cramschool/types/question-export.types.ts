/**
 * Question Export Types
 * 題目匯出相關的類型定義
 */

export interface ExportResult {
  latex?: string
  markdown?: string
  filename: string
}

export interface QuestionOption {
  text?: string
  label?: string
  value?: string
}
