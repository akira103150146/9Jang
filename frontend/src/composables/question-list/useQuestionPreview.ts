/**
 * useQuestionPreview
 * 處理題目預覽相關的邏輯
 */

import { ref, type Ref } from 'vue'
import { questionBankAPI } from '../../services/api'
import type { QuestionWithExtras } from '../useQuestionList'

export function useQuestionPreview() {
  const previewQuestion: Ref<QuestionWithExtras | null> = ref(null)

  /**
   * 顯示題目預覽
   */
  const showQuestionPreview = async (question: QuestionWithExtras): Promise<void> => {
    // 如果只有基本信息，需要獲取完整題目詳情
    if (!question.content || !question.correct_answer) {
      try {
        const response = await questionBankAPI.getById(question.question_id)
        previewQuestion.value = response.data as QuestionWithExtras
      } catch (error) {
        console.error('獲取題目詳情失敗：', error)
        previewQuestion.value = question
      }
    } else {
      previewQuestion.value = question
    }
  }

  /**
   * 關閉預覽
   */
  const closePreview = (): void => {
    previewQuestion.value = null
  }

  return {
    previewQuestion,
    showQuestionPreview,
    closePreview,
  }
}
