/**
 * useQuestionOptions
 * 處理題目選項的管理邏輯
 */

import { ref, watch } from 'vue'
import type { Ref } from 'vue'

export function useQuestionOptions(
  formData: Ref<any>,
  isAutoUpdating: Ref<boolean>,
  isQuestionLoaded: Ref<boolean>
) {
  // 從題目內容中提取選項
  const extractOptionsFromContent = (content: any): string[] => {
    if (!content || typeof content !== 'object') return []
    
    const text = extractTextFromTiptapJSON(content)
    const options: string[] = []
    
    // 匹配 A. B. C. D. 或 (A) (B) (C) (D) 格式
    const patterns = [
      /[A-Z]\.\s*([^\n]+)/g,
      /\([A-Z]\)\s*([^\n]+)/g,
      /[A-Z]、\s*([^\n]+)/g,
    ]
    
    for (const pattern of patterns) {
      const matches = text.matchAll(pattern)
      for (const match of matches) {
        if (match[1]) {
          options.push(match[1].trim())
        }
      }
      if (options.length >= 2) break
    }
    
    return options
  }

  // 提取 Tiptap JSON 中的純文字
  const extractTextFromTiptapJSON = (json: any): string => {
    if (!json || typeof json !== 'object') return ''
    if (json.type === 'text') return json.text || ''
    if (json.content && Array.isArray(json.content)) {
      return json.content.map(extractTextFromTiptapJSON).join('')
    }
    return ''
  }

  // 從答案中檢測題型（單選/多選）
  const detectAnswerType = (answer: any): string => {
    const answerText = extractTextFromTiptapJSON(answer)
    
    // 檢測是否包含多個選項（如 "AB", "A,B", "A、B" 等）
    const multiplePatterns = [
      /[A-Z]{2,}/,  // AB, ABC 等
      /[A-Z]\s*[,、]\s*[A-Z]/,  // A,B 或 A、B
    ]
    
    for (const pattern of multiplePatterns) {
      if (pattern.test(answerText)) {
        return 'MULTIPLE_CHOICE'
      }
    }
    
    return 'SINGLE_CHOICE'
  }

  // 添加選項
  const addOption = () => {
    if (formData.value.options.length < 10) {
      formData.value.options.push('')
    }
  }

  // 刪除選項
  const removeOption = (index: number) => {
    if (formData.value.options.length > 2) {
      formData.value.options.splice(index, 1)
    }
  }

  // 監聽題目內容變化，自動提取選項
  watch(() => formData.value.content, (newContent) => {
    if (isAutoUpdating.value || !isQuestionLoaded.value) return
    
    // 只在選擇題類型時自動提取
    if (formData.value.question_type !== 'SINGLE_CHOICE' && formData.value.question_type !== 'MULTIPLE_CHOICE') {
      return
    }
    
    // 只在新增模式或選項為空時自動提取
    const shouldExtract = formData.value.options.length === 0 || 
      formData.value.options.every((opt: string) => !opt?.trim())
    
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
  }, { deep: true })

  // 監聽正確答案變化，自動判斷單選/多選
  watch(() => formData.value.correct_answer, (newAnswer) => {
    if (isAutoUpdating.value || !isQuestionLoaded.value) return
    
    // 只在選擇題類型時自動判斷
    if (formData.value.question_type !== 'SINGLE_CHOICE' && formData.value.question_type !== 'MULTIPLE_CHOICE') {
      return
    }
    
    const detectedType = detectAnswerType(newAnswer)
    if (detectedType !== formData.value.question_type) {
      isAutoUpdating.value = true
      formData.value.question_type = detectedType
      
      // 如果是多選題但選項不足，確保有足夠的選項
      if (detectedType === 'MULTIPLE_CHOICE' && formData.value.options.length < 2) {
        while (formData.value.options.length < 2) {
          formData.value.options.push('')
        }
      }
      
      isAutoUpdating.value = false
    }
  }, { deep: true })

  return {
    extractOptionsFromContent,
    detectAnswerType,
    addOption,
    removeOption,
  }
}
