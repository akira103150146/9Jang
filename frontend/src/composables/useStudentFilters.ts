import { ref, computed, watch, type Ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { debounce } from '../utils/debounce'

export interface StudentFilters {
  name: string
  phone: string
  school: string
  tag: string
  course: string
  hasUnpaidFees: string
  hasLeave: string
}

/**
 * 學生篩選管理 Composable
 */
export function useStudentFilters(
  canSeeAccountingFeatures: Ref<boolean>,
  onFiltersChange: (queryString: string) => Promise<void>
) {
  const router = useRouter()
  const route = useRoute()
  
  const showFilters = ref(false)
  const isFiltering = ref(false)
  
  const filters = ref<StudentFilters>({
    name: '',
    phone: '',
    school: '',
    tag: '',
    course: '',
    hasUnpaidFees: '',
    hasLeave: ''
  })

  /**
   * 構建查詢參數
   */
  const buildQueryParams = (): Record<string, string> => {
    const params: Record<string, string> = {}
    if (filters.value.name) params.name = filters.value.name
    if (filters.value.phone) params.phone = filters.value.phone
    if (filters.value.school) params.school = filters.value.school
    if (filters.value.tag) params.tag = filters.value.tag
    if (filters.value.course) params.course = filters.value.course
    if (canSeeAccountingFeatures.value && filters.value.hasUnpaidFees) {
      params.has_unpaid_fees = filters.value.hasUnpaidFees
    }
    if (filters.value.hasLeave) params.has_leave = filters.value.hasLeave
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
      await router.replace({ path: '/students', query })
      
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
   * 清除所有篩選
   */
  const clearFilters = (): void => {
    filters.value = {
      name: '',
      phone: '',
      school: '',
      tag: '',
      course: '',
      hasUnpaidFees: '',
      hasLeave: ''
    }
    router.replace({ path: '/students', query: {} })
    const queryString = new URLSearchParams({}).toString()
    onFiltersChange(queryString)
  }

  /**
   * 移除單個篩選
   */
  const removeFilter = (key: keyof StudentFilters): void => {
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
   * 從 URL 同步篩選條件（頁面載入或返回時）
   */
  const syncFiltersFromRoute = (): void => {
    filters.value = {
      name: (route.query.name as string) || '',
      phone: (route.query.phone as string) || (route.query.parent_phone as string) || '',
      school: (route.query.school as string) || '',
      tag: (route.query.tag as string) || '',
      course: (route.query.course as string) || '',
      hasUnpaidFees: canSeeAccountingFeatures.value ? ((route.query.has_unpaid_fees as string) || '') : '',
      hasLeave: (route.query.has_leave as string) || ''
    }
    // 如果有篩選條件，自動展開篩選面板
    if (hasActiveFilters.value) {
      showFilters.value = true
    }
  }

  /**
   * 監聽需要防抖的篩選條件（文字輸入）
   */
  watch(
    () => [filters.value.name, filters.value.phone, filters.value.school],
    () => {
      debouncedApplyFilters()
    }
  )

  /**
   * 監聽下拉選單（立即更新）
   */
  watch(
    () => {
      const watched = [filters.value.tag, filters.value.course, filters.value.hasLeave]
      if (canSeeAccountingFeatures.value) {
        return [...watched, filters.value.hasUnpaidFees]
      }
      return watched
    },
    () => {
      applyFilters()
    }
  )

  /**
   * 獲取活躍篩選的顯示標籤
   */
  const getActiveFilters = (availableTags: Array<{ group_id: number; name: string }>, courses: Array<{ course_id: number; course_name: string }>) => {
    const result: Record<string, { label: string }> = {}
    if (filters.value.name) result.name = { label: `姓名：${filters.value.name}` }
    if (filters.value.phone) result.phone = { label: `電話：${filters.value.phone}` }
    if (filters.value.school) result.school = { label: `學校：${filters.value.school}` }
    if (filters.value.tag) {
      const tag = availableTags.find(t => t.group_id == Number(filters.value.tag))
      result.tag = { label: `標籤：${tag?.name || filters.value.tag}` }
    }
    if (filters.value.course) {
      const course = courses.find(c => c.course_id == Number(filters.value.course))
      result.course = { label: `課程：${course?.course_name || filters.value.course}` }
    }
    if (canSeeAccountingFeatures.value && filters.value.hasUnpaidFees) {
      result.hasUnpaidFees = { label: filters.value.hasUnpaidFees === 'yes' ? '有待繳學費' : '無待繳學費' }
    }
    if (filters.value.hasLeave) {
      result.hasLeave = { label: filters.value.hasLeave === 'yes' ? '有請假記錄' : '無請假記錄' }
    }
    return result
  }

  return {
    filters,
    showFilters,
    isFiltering,
    hasActiveFilters,
    buildQueryParams,
    applyFilters,
    clearFilters,
    removeFilter,
    syncFiltersFromRoute,
    getActiveFilters,
  }
}

