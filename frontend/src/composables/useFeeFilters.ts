import { ref, computed, watch, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Router } from 'vue-router'

/**
 * 費用篩選條件類型
 */
export interface FeeFilters {
  studentId: string
  studentName: string
  tag: string
  item: string
  paymentStatus: string
  dateRange: string
  startDate: string
  endDate: string
  q: string
}

/**
 * 費用篩選管理 Composable
 */
export function useFeeFilters(
  onFiltersChange: (queryString: string) => Promise<void>
) {
  const route = useRoute()
  const router = useRouter()
  const showFilters = ref(true)
  const isFiltering = ref(false)

  const filters = ref<FeeFilters>({
    studentId: '',
    studentName: '',
    tag: '',
    item: '',
    paymentStatus: '',
    dateRange: '',
    startDate: '',
    endDate: '',
    q: ''
  })

  // 防抖計時器
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  /**
   * 防抖函數
   */
  const debounce = <T extends (...args: unknown[]) => void>(fn: T, delay: number) => {
    return (...args: Parameters<T>) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
      debounceTimer = setTimeout(() => {
        fn(...args)
      }, delay)
    }
  }

  /**
   * 構建查詢參數
   */
  const buildQueryParams = (): Record<string, string> => {
    const params: Record<string, string> = {}
    if (filters.value.studentId) params.student = filters.value.studentId
    if (filters.value.studentName) params.student_name = filters.value.studentName
    if (filters.value.tag) params.tag = filters.value.tag
    if (filters.value.item) params.item = filters.value.item
    if (filters.value.paymentStatus) params.payment_status = filters.value.paymentStatus
    if (filters.value.dateRange) params.date_range = filters.value.dateRange
    if (filters.value.dateRange === 'custom') {
      if (filters.value.startDate) params.start_date = filters.value.startDate
      if (filters.value.endDate) params.end_date = filters.value.endDate
    }
    if (filters.value.q) params.q = filters.value.q
    return params
  }

  /**
   * 應用篩選（更新 URL 並獲取數據）
   */
  const applyFilters = async (): Promise<void> => {
    if (isFiltering.value) return // 防止重複請求
    
    isFiltering.value = true
    try {
      const query = buildQueryParams()
      // 使用 replace 避免產生過多歷史記錄
      await router.replace({ path: '/fees', query })
      
      // 構建查詢字符串
      const queryString = new URLSearchParams(query).toString()
      await onFiltersChange(queryString)
    } finally {
      isFiltering.value = false
    }
  }

  /**
   * 防抖版本的 applyFilters（用於文字輸入）
   */
  const debouncedApplyFilters = debounce(applyFilters, 400)

  /**
   * 從路由查詢參數同步篩選條件
   */
  const syncFromRouteQuery = (): void => {
    filters.value.studentId = route.query.student ? String(route.query.student) : ''
    filters.value.studentName = route.query.student_name ? String(route.query.student_name) : ''
    filters.value.tag = route.query.tag ? String(route.query.tag) : ''
    filters.value.item = route.query.item ? String(route.query.item) : ''
    filters.value.paymentStatus = route.query.payment_status ? String(route.query.payment_status) : ''
    filters.value.dateRange = route.query.date_range ? String(route.query.date_range) : ''
    filters.value.startDate = route.query.start_date ? String(route.query.start_date) : ''
    filters.value.endDate = route.query.end_date ? String(route.query.end_date) : ''
    filters.value.q = route.query.q ? String(route.query.q) : ''
    // 如果有篩選條件，自動展開篩選面板
    if (hasActiveFilters.value) {
      showFilters.value = true
    }
  }

  /**
   * 清除所有篩選
   */
  const clearFilters = async (): Promise<void> => {
    filters.value = {
      studentId: '',
      studentName: '',
      tag: '',
      item: '',
      paymentStatus: '',
      dateRange: '',
      startDate: '',
      endDate: '',
      q: ''
    }
    await router.replace({ path: '/fees', query: {} })
    await onFiltersChange('')
  }

  /**
   * 清除日期範圍
   */
  const clearDateRange = (): void => {
    filters.value.dateRange = ''
    filters.value.startDate = ''
    filters.value.endDate = ''
    applyFilters()
  }

  /**
   * 日期範圍變更處理
   */
  const onDateRangeChange = (): void => {
    // 如果選擇了快捷選項，清除自訂日期
    if (filters.value.dateRange !== 'custom') {
      filters.value.startDate = ''
      filters.value.endDate = ''
    }
    applyFilters()
  }

  /**
   * 移除單個篩選
   */
  const removeFilter = (key: keyof FeeFilters): void => {
    filters.value[key] = ''
    applyFilters()
  }

  /**
   * 檢查是否有活躍的篩選
   */
  const hasActiveFilters = computed(() => {
    return Object.values(filters.value).some(value => value !== '')
  })

  /**
   * 獲取日期範圍顯示文字
   */
  const getDateRangeLabel = (): string => {
    if (!filters.value.dateRange) return ''
    
    const labels: Record<string, string> = {
      'today': '當日繳費',
      'this_week': '當週繳費',
      'this_month': '當月繳費',
      'last_month': '上個月繳費',
      'custom': filters.value.startDate && filters.value.endDate 
        ? `${filters.value.startDate} 至 ${filters.value.endDate}`
        : '自訂時間區間'
    }
    return labels[filters.value.dateRange] || filters.value.dateRange
  }

  /**
   * 獲取活躍篩選的顯示標籤
   */
  const getActiveFilters = (
    availableTags: Array<{ group_id: number; name: string; [key: string]: unknown }>,
    getItemDisplay: (item: string) => string,
    getStatusDisplay: (status: string) => string
  ) => {
    const result: Record<string, { label: string }> = {}
    if (filters.value.studentName) {
      result.studentName = { label: `學生：${filters.value.studentName}` }
    }
    if (filters.value.tag) {
      const tag = availableTags.find(t => t.group_id === parseInt(filters.value.tag))
      result.tag = { label: `標籤：${tag?.name || filters.value.tag}` }
    }
    if (filters.value.item) {
      result.item = { label: `名目：${getItemDisplay(filters.value.item)}` }
    }
    if (filters.value.paymentStatus) {
      result.paymentStatus = { label: `狀態：${getStatusDisplay(filters.value.paymentStatus)}` }
    }
    if (filters.value.dateRange) {
      result.dateRange = { label: `時間：${getDateRangeLabel()}` }
    }
    if (filters.value.q) {
      result.q = { label: `備註：${filters.value.q}` }
    }
    return result
  }

  // 監聽需要防抖的篩選條件（文字輸入）
  watch(
    () => [filters.value.studentName, filters.value.q],
    () => {
      debouncedApplyFilters()
    }
  )

  // 監聽下拉選單（立即更新）
  watch(
    () => [filters.value.tag, filters.value.item, filters.value.paymentStatus, filters.value.dateRange],
    () => {
      applyFilters() // 立即執行
    }
  )

  // 監聽自訂日期範圍（立即更新）
  watch(
    () => [filters.value.startDate, filters.value.endDate],
    () => {
      if (filters.value.dateRange === 'custom') {
        applyFilters() // 立即執行
      }
    }
  )

  return {
    // 狀態
    filters,
    showFilters,
    isFiltering,
    hasActiveFilters,
    
    // 方法
    applyFilters,
    debouncedApplyFilters,
    syncFromRouteQuery,
    clearFilters,
    clearDateRange,
    onDateRangeChange,
    removeFilter,
    getDateRangeLabel,
    getActiveFilters,
    buildQueryParams
  }
}

