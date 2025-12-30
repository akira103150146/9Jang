import { ref } from 'vue'
import { questionBankAPI } from '../services/api'

/**
 * 題目分頁功能 Composable
 * 處理題目的分頁載入和無限滾動
 */
export function useQuestionPagination() {
  const questions = ref([])
  
  // 題目分頁狀態
  const questionsPagination = ref({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    hasNext: false,
    isLoading: false
  })

  /**
   * 初始化題目列表（載入第一頁）
   */
  const fetchInitialQuestions = async () => {
    try {
      const qRes = await questionBankAPI.getAll({ 
        params: { 
          page: 1, 
          page_size: 10 
        } 
      })

      questions.value = qRes.data.results || qRes.data
      
      // 更新分頁資訊
      questionsPagination.value = {
        currentPage: 1,
        pageSize: 10,
        totalCount: qRes.data.count || questions.value.length,
        hasNext: !!qRes.data.next,
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
  const loadMoreQuestions = async () => {
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
      const newQuestions = qRes.data.results || []
      questions.value = [...questions.value, ...newQuestions]
      
      // 更新分頁資訊
      questionsPagination.value = {
        currentPage: nextPage,
        pageSize: 10,
        totalCount: qRes.data.count || questionsPagination.value.totalCount,
        hasNext: !!qRes.data.next,
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
