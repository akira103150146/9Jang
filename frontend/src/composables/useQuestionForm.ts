/**
 * useQuestionForm Composable
 * 處理題目表單的狀態和驗證邏輯
 */

import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import type { CreateQuestionDto, UpdateQuestionDto, Question } from '@9jang/shared'

export function useQuestionForm() {
  const route = useRoute()
  const saving = ref(false)
  const isQuestionLoaded = ref(false)
  const isAutoUpdating = ref(false)

  const isEdit = computed(() => !!route.params.id)

  const formData = ref({
    subject: '',
    level: '',
    chapter: '',
    question_type: 'SINGLE_CHOICE' as 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'FILL_IN_BLANK' | 'PROGRAMMING' | 'LISTENING',
    options: ['', ''],
    content: { type: 'doc', content: [] },
    correct_answer: { type: 'doc', content: [] },
    solution_content: { type: 'doc', content: [] },
    difficulty: 1,
    tag_ids: [] as number[],
    source: '九章自命題',
    metadata: {} as Record<string, unknown>,
  })

  /**
   * 驗證表單
   */
  const validateForm = (): string | null => {
    if (!formData.value.subject) {
      return '請選擇科目'
    }
    if (!formData.value.level) {
      return '請選擇適用年級'
    }
    if (!formData.value.chapter?.trim()) {
      return '請輸入章節/單元'
    }

    // 驗證 Tiptap JSON 格式的內容
    const contentText = extractTextFromTiptapJSON(formData.value.content)
    if (!contentText || !contentText.trim()) {
      return '請輸入題目內容'
    }

    const answerText = extractTextFromTiptapJSON(formData.value.correct_answer)
    if (!answerText || !answerText.trim()) {
      return '請輸入正確答案'
    }

    // 驗證選項（如果是選擇題）
    if (formData.value.question_type === 'SINGLE_CHOICE' || formData.value.question_type === 'MULTIPLE_CHOICE') {
      const validOptions = formData.value.options.filter(opt => opt?.trim())
      if (validOptions.length < 2) {
        return '至少需要 2 個選項'
      }
    }

    return null
  }

  /**
   * 從 Tiptap JSON 提取純文字
   */
  const extractTextFromTiptapJSON = (node: unknown): string => {
    if (!node || typeof node !== 'object') return ''

    let text = ''
    const obj = node as { type?: string; text?: string; content?: unknown[] }

    if (obj.type === 'text' && obj.text) {
      text = obj.text
    }

    if (obj.content && Array.isArray(obj.content)) {
      for (const child of obj.content) {
        text += extractTextFromTiptapJSON(child)
      }
    }

    return text
  }

  /**
   * 準備提交數據
   */
  const prepareSubmitData = (): CreateQuestionDto | UpdateQuestionDto => {
    const options = (formData.value.question_type === 'SINGLE_CHOICE' || formData.value.question_type === 'MULTIPLE_CHOICE')
      ? formData.value.options.filter(opt => opt?.trim())
      : []

    const data: CreateQuestionDto | UpdateQuestionDto = {
      ...formData.value,
      options: options,
      tag_ids_input: formData.value.tag_ids,
    } as any

    delete (data as any).tag_ids

    return data
  }

  return {
    formData,
    saving,
    isEdit,
    isQuestionLoaded,
    isAutoUpdating,
    validateForm,
    extractTextFromTiptapJSON,
    prepareSubmitData,
  }
}
