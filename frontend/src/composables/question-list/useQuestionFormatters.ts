/**
 * useQuestionFormatters
 * 處理題目相關的格式化函數
 */

export function useQuestionFormatters() {
  /**
   * 獲取題目類型顏色
   */
  const getTypeColor = (type: string): string => {
    const map: Record<string, string> = {
      SINGLE_CHOICE: 'bg-blue-50 text-blue-700 ring-blue-600/20',
      MULTIPLE_CHOICE: 'bg-purple-50 text-purple-700 ring-purple-600/20',
      FILL_IN_BLANK: 'bg-green-50 text-green-700 ring-green-600/20',
      PROGRAMMING: 'bg-orange-50 text-orange-700 ring-orange-600/20',
      LISTENING: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20'
    }
    return map[type] || 'bg-slate-50 text-slate-700 ring-slate-600/20'
  }

  /**
   * 獲取題目類型名稱
   */
  const getTypeName = (type: string): string => {
    const map: Record<string, string> = {
      SINGLE_CHOICE: '單選題',
      MULTIPLE_CHOICE: '多選題',
      FILL_IN_BLANK: '填充題',
      PROGRAMMING: '程式題',
      LISTENING: '聽力題'
    }
    return map[type] || type
  }

  /**
   * 獲取年級名稱
   */
  const getLevelName = (level: string): string => {
    const map: Record<string, string> = {
      JHS: '國中',
      SHS: '高中',
      VCS: '高職'
    }
    return map[level] || level
  }

  return {
    getTypeColor,
    getTypeName,
    getLevelName,
  }
}
