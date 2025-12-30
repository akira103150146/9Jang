/**
 * Debounce 工具函數
 * 延遲執行函數，直到停止調用後等待指定時間
 */

/**
 * 防抖函數類型
 */
export type DebouncedFunction<T extends (...args: unknown[]) => unknown> = (
  ...args: Parameters<T>
) => void

/**
 * Debounce 工具函數
 * @param func - 要延遲執行的函數
 * @param wait - 等待時間（毫秒）
 * @returns 防抖後的函數
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): DebouncedFunction<T> {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function executedFunction(...args: Parameters<T>): void {
    const later = (): void => {
      timeout = null
      func(...args)
    }

    if (timeout !== null) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}
