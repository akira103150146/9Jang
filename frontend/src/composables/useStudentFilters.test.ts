import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { useStudentFilters } from './useStudentFilters'

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
  path: '/students',
  name: 'students',
  meta: {}
}

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => mockRoute
}))

describe('useStudentFilters', () => {
  let canSeeAccountingFeatures: ReturnType<typeof ref<boolean>>
  let onFiltersChange: (queryString: string) => Promise<void>

  beforeEach(() => {
    canSeeAccountingFeatures = ref(false)
    onFiltersChange = vi.fn().mockResolvedValue(undefined)
  })

  it('should initialize with empty filters', () => {
    const { filters, hasActiveFilters } = useStudentFilters(
      canSeeAccountingFeatures,
      onFiltersChange
    )

    expect(filters.value.name).toBe('')
    expect(filters.value.phone).toBe('')
    expect(filters.value.school).toBe('')
    expect(filters.value.tag).toBe('')
    expect(filters.value.course).toBe('')
    expect(filters.value.hasUnpaidFees).toBe('')
    expect(filters.value.hasLeave).toBe('')
    expect(hasActiveFilters.value).toBe(false)
  })

  it('should build query params correctly', () => {
    const { filters, buildQueryParams } = useStudentFilters(
      canSeeAccountingFeatures,
      onFiltersChange
    )

    filters.value.name = '測試學生'
    filters.value.phone = '0912345678'
    filters.value.tag = '1'
    filters.value.course = '2'

    const params = buildQueryParams()
    expect(params.name).toBe('測試學生')
    expect(params.phone).toBe('0912345678')
    expect(params.tag).toBe('1')
    expect(params.course).toBe('2')
  })

  it('should not include hasUnpaidFees when canSeeAccountingFeatures is false', () => {
    canSeeAccountingFeatures.value = false
    const { filters, buildQueryParams } = useStudentFilters(
      canSeeAccountingFeatures,
      onFiltersChange
    )

    filters.value.hasUnpaidFees = 'yes'
    const params = buildQueryParams()
    expect(params.has_unpaid_fees).toBeUndefined()
  })

  it('should include hasUnpaidFees when canSeeAccountingFeatures is true', () => {
    canSeeAccountingFeatures.value = true
    const { filters, buildQueryParams } = useStudentFilters(
      canSeeAccountingFeatures,
      onFiltersChange
    )

    filters.value.hasUnpaidFees = 'yes'
    const params = buildQueryParams()
    expect(params.has_unpaid_fees).toBe('yes')
  })

  it('should detect active filters', () => {
    const { filters, hasActiveFilters } = useStudentFilters(
      canSeeAccountingFeatures,
      onFiltersChange
    )

    expect(hasActiveFilters.value).toBe(false)

    filters.value.name = '測試'
    expect(hasActiveFilters.value).toBe(true)

    filters.value.name = ''
    expect(hasActiveFilters.value).toBe(false)
  })

  it('should clear all filters', async () => {
    const { filters, clearFilters, hasActiveFilters } = useStudentFilters(
      canSeeAccountingFeatures,
      onFiltersChange
    )

    filters.value.name = '測試'
    filters.value.phone = '0912345678'
    expect(hasActiveFilters.value).toBe(true)

    clearFilters()

    expect(filters.value.name).toBe('')
    expect(filters.value.phone).toBe('')
    expect(hasActiveFilters.value).toBe(false)
    expect(onFiltersChange).toHaveBeenCalled()
  })

  it('should remove single filter', async () => {
    const { filters, removeFilter } = useStudentFilters(
      canSeeAccountingFeatures,
      onFiltersChange
    )

    filters.value.name = '測試'
    filters.value.phone = '0912345678'

    removeFilter('name')

    expect(filters.value.name).toBe('')
    expect(filters.value.phone).toBe('0912345678')
  })

  it('should get active filters with labels', () => {
    const { filters, getActiveFilters } = useStudentFilters(
      canSeeAccountingFeatures,
      onFiltersChange
    )

    filters.value.name = '測試學生'
    filters.value.phone = '0912345678'
    filters.value.tag = '1'
    filters.value.course = '2'

    const availableTags = [
      { group_id: 1, name: 'VIP' }
    ]
    const courses = [
      { course_id: 2, course_name: '數學課程' }
    ]

    const activeFilters = getActiveFilters(availableTags, courses)

    expect(activeFilters.name?.label).toBe('姓名：測試學生')
    expect(activeFilters.phone?.label).toBe('電話：0912345678')
    expect(activeFilters.tag?.label).toBe('標籤：VIP')
    expect(activeFilters.course?.label).toBe('課程：數學課程')
  })

  it('should handle hasUnpaidFees label correctly', () => {
    canSeeAccountingFeatures.value = true
    const { filters, getActiveFilters } = useStudentFilters(
      canSeeAccountingFeatures,
      onFiltersChange
    )

    filters.value.hasUnpaidFees = 'yes'
    const activeFilters = getActiveFilters([], [])

    expect(activeFilters.hasUnpaidFees?.label).toBe('有待繳學費')

    filters.value.hasUnpaidFees = 'no'
    const activeFilters2 = getActiveFilters([], [])
    expect(activeFilters2.hasUnpaidFees?.label).toBe('無待繳學費')
  })

  it('should handle hasLeave label correctly', () => {
    const { filters, getActiveFilters } = useStudentFilters(
      canSeeAccountingFeatures,
      onFiltersChange
    )

    filters.value.hasLeave = 'yes'
    const activeFilters = getActiveFilters([], [])

    expect(activeFilters.hasLeave?.label).toBe('有請假記錄')

    filters.value.hasLeave = 'no'
    const activeFilters2 = getActiveFilters([], [])
    expect(activeFilters2.hasLeave?.label).toBe('無請假記錄')
  })
})
