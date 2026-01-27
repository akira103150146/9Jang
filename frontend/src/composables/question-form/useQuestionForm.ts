/**
 * useQuestionForm
 * 處理題目表單的核心邏輯
 */

import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { questionBankAPI } from '@/services/api'

export interface QuestionFormData {
  subject: number | string
  level: string
  chapter: string
  content: any
  question_type: string
  options: string[]
  correct_answer: any
  solution_content: any
  difficulty: number
  question_number: string
  origin: string
  origin_detail: string
  source: string
  tag_ids: number[]
}

export function useQuestionForm() {
  const router = useRouter()
  const route = useRoute()

  const formData = ref<QuestionFormData>({
    subject: '',
    level: '',
    chapter: '',
    content: { type: 'doc', content: [] },
    question_type: 'SINGLE_CHOICE',
    options: ['', ''],
    correct_answer: { type: 'doc', content: [] },
    solution_content: { type: 'doc', content: [] },
    difficulty: 3,
    question_number: '',
    origin: '',
    origin_detail: '',
    source: '九章自命題',
    tag_ids: [],
  })

  const saving = ref(false)
  const isEdit = computed(() => !!route.params.id)
  const isAutoUpdating = ref(false)
  const isQuestionLoaded = ref(false)

  // 提取 Tiptap JSON 中的純文字
  const extractTextFromTiptapJSON = (json: any): string => {
    if (!json || typeof json !== 'object') return ''
    if (json.type === 'text') return json.text || ''
    if (json.content && Array.isArray(json.content)) {
      return json.content.map(extractTextFromTiptapJSON).join('')
    }
    return ''
  }

  // 驗證表單
  const validateForm = (): boolean => {
    if (!formData.value.subject) {
      alert('請選擇科目')
      return false
    }
    if (!formData.value.level) {
      alert('請選擇年級')
      return false
    }
    if (!formData.value.chapter || !formData.value.chapter.trim()) {
      alert('請輸入章節')
      return false
    }

    const contentText = extractTextFromTiptapJSON(formData.value.content)
    if (!contentText || !contentText.trim()) {
      alert('請輸入題目內容')
      return false
    }

    const answerText = extractTextFromTiptapJSON(formData.value.correct_answer)
    if (!answerText || !answerText.trim()) {
      alert('請輸入正確答案')
      return false
    }

    return true
  }

  // 儲存題目
  const saveQuestion = async () => {
    if (!validateForm()) {
      return
    }

    saving.value = true
    try {
      // 處理選項：如果不是選擇題，設為空陣列
      const options = (formData.value.question_type === 'SINGLE_CHOICE' || formData.value.question_type === 'MULTIPLE_CHOICE')
        ? formData.value.options.filter(opt => opt?.trim())
        : []

      const data = {
        ...formData.value,
        options: options,
        tag_ids_input: formData.value.tag_ids,
        tag_ids: undefined
      }
      delete data.tag_ids

      if (isEdit.value) {
        await questionBankAPI.update(route.params.id as string, data)
      } else {
        await questionBankAPI.create(data)
      }
      
      alert('儲存成功！')
      goBack()
    } catch (error: any) {
      console.error('儲存題目失敗：', error)
      if (error.response?.data) {
        const errorMsg = typeof error.response.data === 'string' 
          ? error.response.data 
          : JSON.stringify(error.response.data)
        alert(`儲存失敗：${errorMsg}`)
      } else {
        alert('儲存失敗，請稍後再試')
      }
    } finally {
      saving.value = false
    }
  }

  // 返回上一頁
  const goBack = () => {
    router.push('/questions')
  }

  // 載入題目資料
  const fetchQuestion = async () => {
    if (!isEdit.value) {
      isQuestionLoaded.value = true
      return
    }

    try {
      const response = await questionBankAPI.getById(route.params.id as string)
      const question = response.data

      formData.value = {
        subject: question.subject_id,
        level: question.level || '',
        chapter: question.chapter || '',
        content: question.content || { type: 'doc', content: [] },
        question_type: question.question_type || 'SINGLE_CHOICE',
        options: question.options || ['', ''],
        correct_answer: question.correct_answer || { type: 'doc', content: [] },
        solution_content: question.solution_content || { type: 'doc', content: [] },
        difficulty: question.difficulty || 3,
        question_number: question.question_number || '',
        origin: question.origin || '',
        origin_detail: question.origin_detail || '',
        source: question.source || '九章自命題',
        tag_ids: question.tag_ids || [],
      }

      // 確保選項至少有2個
      while (formData.value.options.length < 2) {
        formData.value.options.push('')
      }
    } catch (error) {
      console.error('載入題目失敗：', error)
      alert('載入題目失敗')
      goBack()
    }
  }

  return {
    formData,
    saving,
    isEdit,
    isAutoUpdating,
    isQuestionLoaded,
    extractTextFromTiptapJSON,
    validateForm,
    saveQuestion,
    goBack,
    fetchQuestion,
  }
}
