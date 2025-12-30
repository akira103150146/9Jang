/**
 * 學生相關格式化工具函數
 */

export const dayMap: Record<string, string> = {
  'Mon': '週一',
  'Tue': '週二',
  'Wed': '週三',
  'Thu': '週四',
  'Fri': '週五',
  'Sat': '週六',
  'Sun': '週日',
}

/**
 * 將星期幾的英文縮寫轉換為中文顯示
 */
export const getDayDisplay = (day: string): string => {
  return dayMap[day] || day
}

/**
 * 格式化時間為 HH:MM 格式
 */
export const formatTime = (time: string | null | undefined): string => {
  if (!time) return ''
  return typeof time === 'string' ? time.substring(0, 5) : String(time)
}

/**
 * 格式化日期為 YYYY/MM/DD 格式
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return ''
  if (typeof date === 'string') {
    return date.replace(/-/g, '/')
  }
  return String(date)
}

/**
 * 格式化金額，添加千分位分隔符
 */
export const formatAmount = (amount: number | string | null | undefined): string => {
  const intAmount = Math.round(parseFloat(String(amount || 0)))
  return intAmount.toLocaleString('zh-TW', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  })
}

