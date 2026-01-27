/**
 * useQuestionOptions Composable
 * 處理題目選項管理邏輯
 */

import { ref, watch } from 'vue'

export function useQuestionOptions(
  formData: { value: { question_type: string; options: string[] } },
  isAutoUpdating: { value: boolean },
  isQuestionLoaded: { value: boolean },
  isEdit: { value: boolean },
  extractOptionsFromContent: (content: unknown) => string[]
) {
  /**
   * 新增選項
   */
  const addOption = () => {
    if (formData.value.options.length < 10) {
      formData.value.options.push('')
    }
  }

  /**
   * 移除選項
   */
  const removeOption = (index: number) => {
    if (formData.value.options.length > 2) {
      formData.value.options.splice(index, 1)
    }
  }

  /**
   * 監聽題目內容變化，自動提取選項
   */
  const setupAutoExtractOptions = (contentRef: { value: unknown }) => {
    watch(
      () => contentRef.value,
      (newContent) => {
        if (isAutoUpdating.value || !isQuestionLoaded.value) return

        // 只在選擇題類型時自動提取
        if (formData.value.question_type !== 'SINGLE_CHOICE' && formData.value.question_type !== 'MULTIPLE_CHOICE') {
          return
        }

        // 只在新增模式或選項為空時自動提取
        const shouldExtract = !isEdit.value ||
          (formData.value.options.length === 0 || formData.value.options.every(opt => !opt?.trim()))

        if (shouldExtract) {
          const extractedOptions = extractOptionsFromContent(newContent)
          if (extractedOptions.length >= 2) {
            isAutoUpdating.value = true
            formData.value.options = [...extractedOptions]
            // 確保至少有2個選項，最多10個
            while (formData.value.options.length < 2) {
              formData.value.options.push('')
            }
            while (formData.value.options.length > 10) {
              formData.value.options.pop()
            }
            isAutoUpdating.value = false
          }
        }
      },
      { deep: true }
    )
  }

  return {
    addOption,
    removeOption,
    setupAutoExtractOptions,
  }
}
