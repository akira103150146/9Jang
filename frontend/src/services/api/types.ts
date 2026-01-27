/**
 * API 共用類型定義
 */

/**
 * API 響應包裝類型
 */
export interface ApiResponse<T> {
  data: T
  status: number
  statusText: string
}

/**
 * 分頁響應類型
 */
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
