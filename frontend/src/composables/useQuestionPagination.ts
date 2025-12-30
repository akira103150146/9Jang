import { ref, type Ref } from 'vue'
import { questionBankAPI } from '../services/api'
import type { Question } from '@9jang/shared'

/**
 * 分頁狀態介面
 */
export interface PaginationState {
  currentPage: number
  pageSize: number
  totalCount: number
  hasNext: boolean
  isLoading: boolean
}

/**
 * 題目分頁功能 Composable
 * 處理題目的分頁載入和無限滾動
 */
export function useQuestionPagination() {
  const questions: Ref<Question[]> = ref([])

  // 題目分頁狀態
  const questionsPagination: Ref<PaginationState> = ref({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    hasNext: false,
    isLoading: false
  })

  /**
   * 初始化題目列表（載入第一頁）
   */
  const fetchInitialQuestions = async (): Promise<void> => {
    try {
      const qRes = await questionBankAPI.getAll({
        params: {
          page: 1,
          page_size: 10
        }
      })

      questions.value = (Array.isArray(qRes.data) ? qRes.data : qRes.data.results) as Question[]

      // 更新分頁資訊
      questionsPagination.value = {
        currentPage: 1,
        pageSize: 10,
        totalCount: (qRes.data as { count?: number }).count || questions.value.length,
        hasNext: !!(qRes.data as { next?: string | null }).next,
        isLoading: false
      }
    } catch (error) {
      console.error('載入題目失敗：', error)
      questionsPagination.value.isLoading = false
    }
  }

  /**
   * 載入更多題目（無限滾動）
   */
  const loadMoreQuestions = async (): Promise<void> => {
    if (questionsPagination.value.isLoading || !questionsPagination.value.hasNext) {
      return
    }

    questionsPagination.value.isLoading = true

    try {
      const nextPage = questionsPagination.value.currentPage + 1

      const qRes = await questionBankAPI.getAll({
        params: {
          page: nextPage,
          page_size: 10
        }
      })

      // 將新題目追加到現有列表
      const newQuestions = (Array.isArray(qRes.data) ? qRes.data : qRes.data.results) as Question[]
      questions.value = [...questions.value, ...newQuestions]

      // 更新分頁資訊
      questionsPagination.value = {
        currentPage: nextPage,
        pageSize: 10,
        totalCount: (qRes.data as { count?: number }).count || questionsPagination.value.totalCount,
        hasNext: !!(qRes.data as { next?: string | null }).next,
        isLoading: false
      }
    } catch (error) {
      console.error('載入更多題目失敗：', error)
      questionsPagination.value.isLoading = false
    }
  }

  return {
    questions,
    questionsPagination,
    fetchInitialQuestions,
    loadMoreQuestions
  }
}
