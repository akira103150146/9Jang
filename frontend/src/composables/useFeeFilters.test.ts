import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useFeeFilters } from './useFeeFilters'

// Mock vue-router
const mockRouter = {
  replace: vi.fn().mockResolvedValue(undefined),
  push: vi.fn().mockResolvedValue(undefined),
  go: vi.fn(),
  back: vi.fn(),
  forward: vi.fn()
}

const mockRoute = {
  query: {},
  params: {},
  path: '/fees',
  name: 'fees',
  meta: {}
}

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => mockRoute
}))

describe('useFeeFilters', () => {
  let onFiltersChange: (queryString: string) => Promise<void>

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    onFiltersChange = vi.fn().mockResolvedValue(undefined)
    // 重置 route.query
    mockRoute.query = {}
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize with empty filters', () => {
    const { filters, hasActiveFilters } = useFeeFilters(onFiltersChange)

    expect(filters.value.studentId).toBe('')
    expect(filters.value.studentName).toBe('')
    expect(filters.value.tag).toBe('')
    expect(filters.value.item).toBe('')
    expect(filters.value.paymentStatus).toBe('')
    expect(filters.value.dateRange).toBe('')
    expect(filters.value.startDate).toBe('')
    expect(filters.value.endDate).toBe('')
    expect(filters.value.q).toBe('')
    expect(hasActiveFilters.value).toBe(false)
  })

  it('should build query params correctly', () => {
    const { filters, buildQueryParams } = useFeeFilters(onFiltersChange)

    filters.value.studentId = '123'
    filters.value.studentName = '測試學生'
    filters.value.tag = '1'
    filters.value.item = 'Tuition'
    filters.value.paymentStatus = 'Paid'

    const params = buildQueryParams()
    expect(params.student).toBe('123')
    expect(params.student_name).toBe('測試學生')
    expect(params.tag).toBe('1')
    expect(params.item).toBe('Tuition')
    expect(params.payment_status).toBe('Paid')
  })

  it('should include custom date range in query params', () => {
    const { filters, buildQueryParams } = useFeeFilters(onFiltersChange)

    filters.value.dateRange = 'custom'
    filters.value.startDate = '2024-01-01'
    filters.value.endDate = '2024-01-31'

    const params = buildQueryParams()
    expect(params.date_range).toBe('custom')
    expect(params.start_date).toBe('2024-01-01')
    expect(params.end_date).toBe('2024-01-31')
  })

  it('should not include custom dates when dateRange is not custom', () => {
    const { filters, buildQueryParams } = useFeeFilters(onFiltersChange)

    filters.value.dateRange = 'this_month'
    filters.value.startDate = '2024-01-01'
    filters.value.endDate = '2024-01-31'

    const params = buildQueryParams()
    expect(params.date_range).toBe('this_month')
    expect(params.start_date).toBeUndefined()
    expect(params.end_date).toBeUndefined()
  })

  it('should detect active filters', () => {
    const { filters, hasActiveFilters } = useFeeFilters(onFiltersChange)

    expect(hasActiveFilters.value).toBe(false)

    filters.value.studentName = '測試'
    expect(hasActiveFilters.value).toBe(true)

    filters.value.studentName = ''
    expect(hasActiveFilters.value).toBe(false)
  })

  it('should clear all filters', async () => {
    const { filters, clearFilters, hasActiveFilters } = useFeeFilters(onFiltersChange)

    filters.value.studentName = '測試'
    filters.value.tag = '1'
    expect(hasActiveFilters.value).toBe(true)

    await clearFilters()

    expect(filters.value.studentName).toBe('')
    expect(filters.value.tag).toBe('')
    expect(hasActiveFilters.value).toBe(false)
    expect(mockRouter.replace).toHaveBeenCalledWith({ path: '/fees', query: {} })
    expect(onFiltersChange).toHaveBeenCalledWith('')
  })

  it('should clear date range', async () => {
    const { filters, clearDateRange } = useFeeFilters(onFiltersChange)

    filters.value.dateRange = 'custom'
    filters.value.startDate = '2024-01-01'
    filters.value.endDate = '2024-01-31'

    clearDateRange()

    expect(filters.value.dateRange).toBe('')
    expect(filters.value.startDate).toBe('')
    expect(filters.value.endDate).toBe('')
  })

  it('should handle date range change', async () => {
    const { filters, onDateRangeChange } = useFeeFilters(onFiltersChange)

    filters.value.dateRange = 'this_month'
    filters.value.startDate = '2024-01-01'
    filters.value.endDate = '2024-01-31'

    onDateRangeChange()

    // 當選擇快捷選項時，應該清除自訂日期
    expect(filters.value.startDate).toBe('')
    expect(filters.value.endDate).toBe('')
  })

  it('should not clear custom dates when dateRange is custom', async () => {
    const { filters, onDateRangeChange } = useFeeFilters(onFiltersChange)

    filters.value.dateRange = 'custom'
    filters.value.startDate = '2024-01-01'
    filters.value.endDate = '2024-01-31'

    onDateRangeChange()

    // 當選擇 custom 時，不應該清除日期
    expect(filters.value.startDate).toBe('2024-01-01')
    expect(filters.value.endDate).toBe('2024-01-31')
  })

  it('should remove single filter', async () => {
    const { filters, removeFilter } = useFeeFilters(onFiltersChange)

    filters.value.studentName = '測試'
    filters.value.tag = '1'

    removeFilter('studentName')

    expect(filters.value.studentName).toBe('')
    expect(filters.value.tag).toBe('1')
  })

  it('should get date range label correctly', () => {
    const { filters, getDateRangeLabel } = useFeeFilters(onFiltersChange)

    filters.value.dateRange = 'today'
    expect(getDateRangeLabel()).toBe('當日繳費')

    filters.value.dateRange = 'this_week'
    expect(getDateRangeLabel()).toBe('當週繳費')

    filters.value.dateRange = 'this_month'
    expect(getDateRangeLabel()).toBe('當月繳費')

    filters.value.dateRange = 'last_month'
    expect(getDateRangeLabel()).toBe('上個月繳費')
  })

  it('should get custom date range label', () => {
    const { filters, getDateRangeLabel } = useFeeFilters(onFiltersChange)

    filters.value.dateRange = 'custom'
    filters.value.startDate = '2024-01-01'
    filters.value.endDate = '2024-01-31'

    expect(getDateRangeLabel()).toBe('2024-01-01 至 2024-01-31')
  })

  it('should get custom date range label without dates', () => {
    const { filters, getDateRangeLabel } = useFeeFilters(onFiltersChange)

    filters.value.dateRange = 'custom'
    filters.value.startDate = ''
    filters.value.endDate = ''

    expect(getDateRangeLabel()).toBe('自訂時間區間')
  })

  it('should get active filters with labels', () => {
    const { filters, getActiveFilters } = useFeeFilters(onFiltersChange)

    filters.value.studentName = '測試學生'
    filters.value.tag = '1'
    filters.value.item = 'Tuition'
    filters.value.paymentStatus = 'Paid'
    filters.value.dateRange = 'this_month'
    filters.value.q = '備註內容'

    const availableTags = [
      { group_id: 1, name: 'VIP' }
    ]

    const getItemDisplay = (item: string) => {
      const map: Record<string, string> = {
        'Tuition': '學費',
        'Meal': '餐費'
      }
      return map[item] || item
    }

    const getStatusDisplay = (status: string) => {
      const map: Record<string, string> = {
        'Paid': '已繳費',
        'Unpaid': '未繳費'
      }
      return map[status] || status
    }

    const activeFilters = getActiveFilters(availableTags, getItemDisplay, getStatusDisplay)

    expect(activeFilters.studentName?.label).toBe('學生：測試學生')
    expect(activeFilters.tag?.label).toBe('標籤：VIP')
    expect(activeFilters.item?.label).toBe('名目：學費')
    expect(activeFilters.paymentStatus?.label).toBe('狀態：已繳費')
    expect(activeFilters.dateRange?.label).toBe('時間：當月繳費')
    expect(activeFilters.q?.label).toBe('備註：備註內容')
  })

  it('should sync filters from route query', () => {
    mockRoute.query = {
      student: '123',
      student_name: '測試學生',
      tag: '1',
      item: 'Tuition',
      payment_status: 'Paid',
      date_range: 'this_month',
      start_date: '2024-01-01',
      end_date: '2024-01-31',
      q: '備註'
    }

    const { filters, syncFromRouteQuery } = useFeeFilters(onFiltersChange)

    syncFromRouteQuery()

    expect(filters.value.studentId).toBe('123')
    expect(filters.value.studentName).toBe('測試學生')
    expect(filters.value.tag).toBe('1')
    expect(filters.value.item).toBe('Tuition')
    expect(filters.value.paymentStatus).toBe('Paid')
    expect(filters.value.dateRange).toBe('this_month')
    expect(filters.value.startDate).toBe('2024-01-01')
    expect(filters.value.endDate).toBe('2024-01-31')
    expect(filters.value.q).toBe('備註')
  })

  it('should apply filters and update URL', async () => {
    const { filters, applyFilters } = useFeeFilters(onFiltersChange)

    filters.value.studentName = '測試學生'
    filters.value.tag = '1'

    await applyFilters()

    expect(mockRouter.replace).toHaveBeenCalledWith({
      path: '/fees',
      query: {
        student_name: '測試學生',
        tag: '1'
      }
    })
    expect(onFiltersChange).toHaveBeenCalled()
  })

  it('should prevent duplicate filter requests', async () => {
    const { filters, applyFilters, isFiltering } = useFeeFilters(onFiltersChange)

    filters.value.studentName = '測試'

    // 第一次調用
    const promise1 = applyFilters()
    expect(isFiltering.value).toBe(true)

    // 在第一次完成前再次調用
    const promise2 = applyFilters()

    await Promise.all([promise1, promise2])

    // 應該只調用一次
    expect(mockRouter.replace).toHaveBeenCalledTimes(1)
  })
})
