/**
 * useQuestionList
 * 處理題目列表的邏輯（載入、篩選、搜尋、分頁）
 */

import { ref, reactive, computed, watch, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { questionBankAPI, subjectAPI, hashtagAPI } from '../services/api'
import type { Question, Subject, Tag } from '@9jang/shared'
import { nextTick } from 'vue'

export interface QuestionWithExtras extends Question {
  question_id: number
  subject_name?: string
  level: 'JHS' | 'SHS' | 'VCS'
  chapter?: string
  difficulty: number
  question_type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'FILL_IN_BLANK' | 'PROGRAMMING' | 'LISTENING'
  content: unknown
  correct_answer: unknown
  solution_content?: unknown
  options?: unknown[]
  tags?: string[]
  source?: string
  source_display?: string
  error_log_images?: Array<{ image_id: number; image_url: string; caption?: string }>
  [key: string]: unknown
}

export interface Pagination {
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
}

export interface Filters {
  subject_id: string
  level: string
  chapter: string
  difficulty: string
  question_type: string
  tag_id: string
  source: string
}

export function useQuestionList() {
  const router = useRouter()

  const questions: Ref<QuestionWithExtras[]> = ref([])
  const subjects: Ref<Subject[]> = ref([])
  const tags: Ref<Tag[]> = ref([])
  const sourceOptions: Ref<string[]> = ref([])
  const loading: Ref<boolean> = ref(false)
  const isFiltering: Ref<boolean> = ref(false)
  let savedScrollPosition = 0
  let filterTimeout: ReturnType<typeof setTimeout> | null = null

  const pagination = reactive<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  })

  const filters = reactive<Filters>({
    subject_id: '',
    level: '',
    chapter: '',
    difficulty: '',
    question_type: '',
    tag_id: '',
    source: ''
  })

  // 檢查是否有活躍的篩選
  const hasActiveFilters = computed<boolean>(() => {
    return Object.values(filters).some((value) => value !== '')
  })

  // 獲取活躍篩選的顯示標籤
  const activeFilters = computed<Record<string, { label: string }>>(() => {
    const result: Record<string, { label: string }> = {}

    if (filters.subject_id) {
      const subject = subjects.value.find((s) => String(s.subject_id) === filters.subject_id)
      result.subject_id = { label: `科目：${subject?.name || filters.subject_id}` }
    }

    if (filters.level) {
      const levelMap: Record<string, string> = {
        JHS: '國中',
        SHS: '高中',
        VCS: '高職'
      }
      result.level = { label: `年級：${levelMap[filters.level] || filters.level}` }
    }

    if (filters.chapter) {
      result.chapter = { label: `章節：${filters.chapter}` }
    }

    if (filters.difficulty) {
      result.difficulty = { label: `難度：${filters.difficulty} 星` }
    }

    if (filters.question_type) {
      const typeMap: Record<string, string> = {
        SINGLE_CHOICE: '單選題',
        MULTIPLE_CHOICE: '多選題',
        FILL_IN_BLANK: '填充題',
        PROGRAMMING: '程式題',
        LISTENING: '聽力題'
      }
      result.question_type = { label: `類型：${typeMap[filters.question_type] || filters.question_type}` }
    }

    if (filters.tag_id) {
      const tag = tags.value.find((t) => String(t.tag_id) === filters.tag_id)
      result.tag_id = { label: `標籤：#${tag?.tag_name || filters.tag_id}` }
    }

    if (filters.source) {
      result.source = { label: `來源：${filters.source}` }
    }

    return result
  })

  // 載入題目列表
  const fetchQuestions = async (): Promise<void> => {
    // 保存當前滾動位置
    const mainElement = document.querySelector('main')
    const mainScroll = mainElement ? mainElement.scrollTop : 0
    const windowScroll = window.pageYOffset || document.documentElement.scrollTop
    savedScrollPosition = mainScroll || windowScroll
    
    // 在設置 loading 之前，先保存滾動位置到 main 元素的 data 屬性
    if (mainElement) {
      mainElement.dataset.savedScrollTop = savedScrollPosition.toString()
    }
    
    loading.value = true
    isFiltering.value = true
    try {
      const params: Record<string, string | number | number[]> = {}
      if (filters.subject_id) params.subject = filters.subject_id
      if (filters.level) params.level = filters.level
      if (filters.chapter) params.chapter = filters.chapter
      if (filters.difficulty) params.difficulty = filters.difficulty
      if (filters.question_type) params.question_type = filters.question_type
      if (filters.tag_id) params.tags = [parseInt(filters.tag_id, 10)]
      if (filters.source) params.source = filters.source

      // 添加分頁參數
      params.page = pagination.currentPage

      const response = await questionBankAPI.getAll({ params })
      const questionsData = Array.isArray(response.data)
        ? response.data
        : (response.data as { results?: QuestionWithExtras[] }).results || []

      // 更新分頁資訊
      const data = response.data as { count?: number }
      if (data.count !== undefined) {
        pagination.totalCount = data.count
        pagination.totalPages = Math.ceil(data.count / pagination.pageSize)
      } else {
        // 如果沒有分頁資訊，假設只有一頁
        pagination.totalCount = questionsData.length
        pagination.totalPages = 1
      }

      // 確保每個題目都有必要的欄位
      questions.value = questionsData.map((q) => ({
        ...q,
        question_type: (q.question_type as QuestionWithExtras['question_type']) || 'SINGLE_CHOICE',
        options: q.options || [],
        tags: q.tags || []
      })) as QuestionWithExtras[]
    } catch (error) {
      console.error('獲取題目失敗：', error)
      questions.value = []
    } finally {
      // 先更新 loading 狀態，但保持內容可見以避免高度變化
      loading.value = false
      isFiltering.value = false
      
      // 恢復滾動位置
      await nextTick()
      
      const mainElement = document.querySelector('main')
      const mainScroll = mainElement ? mainElement.scrollTop : 0
      
      // 只有在滾動位置被意外改變時才恢復（差異超過 10px）
      if (mainElement && savedScrollPosition > 0 && Math.abs(mainScroll - savedScrollPosition) > 10) {
        requestAnimationFrame(() => {
          const targetScroll = mainElement.dataset.savedScrollTop ? parseFloat(mainElement.dataset.savedScrollTop) : savedScrollPosition
          mainElement.scrollTop = targetScroll
          delete mainElement.dataset.savedScrollTop
        })
      } else if (mainElement && mainElement.dataset.savedScrollTop) {
        // 清除保存的滾動位置
        delete mainElement.dataset.savedScrollTop
      }
    }
  }

  // 載入科目列表
  const fetchSubjects = async (): Promise<void> => {
    try {
      const response = await subjectAPI.getAll()
      subjects.value = Array.isArray(response.data)
        ? response.data
        : (response.data as { results?: Subject[] }).results || []
    } catch (error) {
      console.warn('獲取科目失敗：', error)
      subjects.value = []
    }
  }

  // 載入標籤列表
  const fetchTags = async (): Promise<void> => {
    try {
      const response = await hashtagAPI.getAll()
      tags.value = Array.isArray(response.data)
        ? response.data
        : (response.data as { results?: Tag[] }).results || []
    } catch (error) {
      console.warn('獲取標籤失敗：', error)
      tags.value = []
    }
  }

  // 載入來源選項
  const fetchSourceOptions = async (): Promise<void> => {
    try {
      const response = await questionBankAPI.getSourceOptions()
      sourceOptions.value = (response.data as { options?: string[] }).options || []
    } catch (error) {
      console.warn('獲取來源選項失敗：', error)
      // 如果 API 失敗，使用預設選項
      sourceOptions.value = ['九章自命題', '學生錯題', '學測', '會考', '統測', '模擬考', '基測']
    }
  }

  // 重置篩選條件
  const resetFilters = (): void => {
    filters.subject_id = ''
    filters.level = ''
    filters.chapter = ''
    filters.difficulty = ''
    filters.question_type = ''
    filters.tag_id = ''
    filters.source = ''
    pagination.currentPage = 1
    fetchQuestions()
  }

  // 移除單個篩選條件
  const removeFilter = (key: keyof Filters): void => {
    filters[key] = '' as never
    pagination.currentPage = 1
    fetchQuestions()
  }

  // 防抖函數
  const debouncedFetchQuestions = (): void => {
    if (filterTimeout) {
      clearTimeout(filterTimeout)
    }
    filterTimeout = setTimeout(() => {
      pagination.currentPage = 1
      fetchQuestions()
    }, 500)
  }

  // 監聽章節篩選（文字輸入，使用防抖）
  watch(
    () => filters.chapter,
    () => {
      debouncedFetchQuestions()
    }
  )

  // 監聽其他篩選條件（下拉選單，立即執行）
  watch(
    () => [filters.subject_id, filters.level, filters.difficulty, filters.question_type, filters.tag_id, filters.source],
    () => {
      pagination.currentPage = 1
      fetchQuestions()
    }
  )

  // 跳轉到指定頁面
  const goToPage = async (page: number): Promise<void> => {
    if (page >= 1 && page <= pagination.totalPages) {
      pagination.currentPage = page
      await fetchQuestions()
    }
  }

  // 初始化載入
  const initialize = async (): Promise<void> => {
    await Promise.all([
      fetchSubjects(),
      fetchTags(),
      fetchSourceOptions()
    ])
    await fetchQuestions()
  }

  return {
    // 狀態
    questions,
    subjects,
    tags,
    sourceOptions,
    loading,
    isFiltering,
    pagination,
    filters,
    hasActiveFilters,
    activeFilters,
    // 方法
    fetchQuestions,
    fetchSubjects,
    fetchTags,
    fetchSourceOptions,
    resetFilters,
    removeFilter,
    goToPage,
    initialize,
  }
}
