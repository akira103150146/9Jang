/**
 * 日期格式化工具函數
 */

/**
 * 格式化時間為本地時間字符串
 * @param date - 日期對象、日期字符串或時間戳
 * @returns 格式化後的時間字符串
 */
export function formatTime(date: Date | string | number | null | undefined): string {
  if (!date) return ''
  return new Date(date).toLocaleTimeString()
}

/**
 * 格式化日期為本地日期字符串
 * @param date - 日期對象、日期字符串或時間戳
 * @returns 格式化後的日期字符串
 */
export function formatDate(date: Date | string | number | null | undefined): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

/**
 * 格式化日期時間為本地日期時間字符串
 * @param date - 日期對象、日期字符串或時間戳
 * @returns 格式化後的日期時間字符串
 */
export function formatDateTime(date: Date | string | number | null | undefined): string {
  if (!date) return ''
  return new Date(date).toLocaleString()
}
