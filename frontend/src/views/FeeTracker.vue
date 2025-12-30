<template>
  <div class="space-y-6">
    <header class="rounded-3xl border border-blue-100 bg-gradient-to-r from-white to-sky-50 p-6 shadow-sm">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-semibold text-slate-500">會計模組</p>
          <h2 class="text-2xl font-bold text-slate-900">所有費用</h2>
          <p class="mt-2 text-sm text-slate-500">可依學生姓名、名目、備註模糊搜尋</p>
        </div>
        <router-link
          to="/fees/add"
          class="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:from-sky-600 hover:to-indigo-600"
        >
          新增費用記錄
        </router-link>
      </div>
    </header>

    <!-- 篩選面板 -->
    <FeeFilters
      v-model:filters="filters"
      :show-filters="showFilters"
      :is-filtering="isFiltering"
      :has-active-filters="hasActiveFilters"
      :active-filters="activeFilters"
      :available-tags="availableTags"
      :selected-student="selectedStudent"
      @toggle-filters="showFilters = !showFilters"
      @clear-filters="clearFilters"
      @clear-date-range="clearDateRange"
      @date-range-change="onDateRangeChange"
      @remove-filter="removeFilter"
      @remove-student-filter="removeStudentFilter"
    />

    <div v-if="loading" class="flex justify-center items-center py-12">
      <p class="text-slate-500">載入中...</p>
    </div>

    <div v-else class="space-y-4">
      <!-- 批次操作按鈕 -->
      <FeeBatchActions
        :selected-count="selectedFees.length"
        :batch-updating="batchUpdating"
        @batch-update="batchUpdateStatus"
        @clear-selection="clearSelection"
      />

      <!-- 費用表格 -->
      <FeeTable
        :fees="fees"
        :is-all-selected="isAllSelected"
        :is-selected="isSelected"
        :total-amount="totalAmount"
        :get-item-display="getItemDisplay"
        :get-status-display="getStatusDisplay"
        :get-status-class="getStatusClass"
        :format-amount="formatAmount"
        :get-payment-date="getPaymentDate"
        @toggle-select-all="toggleSelectAll"
        @toggle-select="toggleSelect"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import api, { studentAPI, studentGroupAPI } from '../services/api'
import { useFeeFilters, type FeeFilters as FeeFiltersType } from '../composables/useFeeFilters'
import { useFeeSelection, type Fee } from '../composables/useFeeSelection'

// Components
import FeeFilters from '../components/fee-tracker/FeeFilters.vue'
import FeeTable from '../components/fee-tracker/FeeTable.vue'
import FeeBatchActions from '../components/fee-tracker/FeeBatchActions.vue'

const route = useRoute()

const fees = ref<Fee[]>([])
const loading = ref(false)
const selectedStudent = ref<{ name: string; school: string; grade: string; [key: string]: unknown } | null>(null)
const availableTags = ref<Array<{ group_id: number; name: string; group_type?: string; [key: string]: unknown }>>([])

const itemMap: Record<string, string> = {
  'Tuition': '學費',
  'Transport': '交通費',
  'Meal': '餐費',
  'Book': '書籍費',
  'Other': '其他',
}

const statusMap: Record<string, string> = {
  'Paid': '已繳費',
  'Unpaid': '未繳費',
  'Partial': '部分繳費',
}

/**
 * 標準化費用數據
 */
const normalizeFee = (fee: unknown): Fee => {
  const f = fee as {
    fee_id?: number
    id?: number
    student?: number
    student_name?: string
    student?: { name?: string }
    item: string
    amount: number
    fee_date: string
    paid_at?: string
    payment_status?: string
    notes?: string
    [key: string]: unknown
  }
  return {
    fee_id: f.fee_id || f.id || 0,
    student: f.student || 0,
    student_name: f.student_name || f.student?.name || '',
    item: f.item,
    amount: f.amount,
    fee_date: f.fee_date,
    paid_at: f.paid_at,
    payment_status: (f.payment_status || 'Unpaid') as 'Paid' | 'Unpaid' | 'Partial',
    notes: f.notes || '',
  }
}

/**
 * 獲取費用列表
 */
const fetchFees = async (queryString = ''): Promise<void> => {
  loading.value = true
  try {
    const url = queryString ? `/cramschool/fees/?${queryString}` : '/cramschool/fees/'
    const realResponse = await api.get(url)
    const data = realResponse.data.results || realResponse.data
    fees.value = (Array.isArray(data) ? data : []).map((item) => normalizeFee(item))
    // 清空選擇（因為列表已更新）
    clearSelection()
  } catch (error) {
    console.error('獲取費用記錄失敗：', error)
    fees.value = []
  } finally {
    loading.value = false
  }
}

/**
 * 獲取選中的學生資訊
 */
const fetchSelectedStudent = async (): Promise<void> => {
  if (!filters.value.studentId) {
    selectedStudent.value = null
    return
  }
  try {
    const res = await studentAPI.getById(parseInt(filters.value.studentId))
    selectedStudent.value = res.data as typeof selectedStudent.value
  } catch (e) {
    selectedStudent.value = null
  }
}

/**
 * 獲取標籤列表
 */
const fetchTags = async (): Promise<void> => {
  try {
    const response = await studentGroupAPI.getAll()
    const data = response.data.results || response.data || []
    // 只顯示類型為 'tag' 的群組
    availableTags.value = data.filter((tag: { group_type?: string }) => tag.group_type === 'tag')
  } catch (error) {
    console.error('獲取標籤失敗:', error)
    availableTags.value = []
  }
}

// 使用 composables
const filtersComposable = useFeeFilters(async (queryString: string) => {
  await fetchSelectedStudent()
  await fetchFees(queryString)
})

const selectionComposable = useFeeSelection(fees, async () => {
  const queryString = filtersComposable.buildQueryParams()
  const params = new URLSearchParams(queryString).toString()
  await fetchFees(params)
})

// 從 composables 提取狀態和方法
const {
  filters,
  showFilters,
  isFiltering,
  hasActiveFilters,
  applyFilters,
  syncFromRouteQuery,
  clearFilters,
  clearDateRange,
  onDateRangeChange,
  removeFilter,
  getActiveFilters
} = filtersComposable

const {
  selectedFees,
  batchUpdating,
  isAllSelected,
  isSelected,
  toggleSelect,
  toggleSelectAll,
  clearSelection,
  batchUpdateStatus
} = selectionComposable

// 獲取活躍篩選的顯示標籤
const activeFilters = computed(() => {
  return getActiveFilters(
    availableTags.value,
    getItemDisplay,
    getStatusDisplay
  )
})

// 計算總金額
const totalAmount = computed(() => {
  return fees.value.reduce((sum, fee) => sum + parseFloat(String(fee.amount || 0)), 0)
})

// 工具函數
const getItemDisplay = (item: string): string => {
  return itemMap[item] || item
}

const getStatusDisplay = (status: string): string => {
  return statusMap[status] || status
}

const getStatusClass = (status: string): string => {
  const statusClassMap: Record<string, string> = {
    'Paid': 'bg-emerald-50 text-emerald-600',
    'Partial': 'bg-amber-50 text-amber-600',
    'Unpaid': 'bg-rose-50 text-rose-600',
  }
  return statusClassMap[status] || 'bg-slate-100 text-slate-600'
}

const formatDate = (date: string | null | undefined): string => {
  if (!date) return ''
  if (typeof date === 'string') {
    const dateObj = new Date(date)
    // 如果是 DateTime 格式（有時間），顯示日期和時間
    if (date.includes('T') || date.includes(' ')) {
      return dateObj.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    }
    return date.replace(/-/g, '/')
  }
  return String(date)
}

const formatAmount = (amount: number): string => {
  // 格式化為整數，並加上千分位分隔符
  const intAmount = Math.round(parseFloat(String(amount || 0)))
  return intAmount.toLocaleString('zh-TW', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

const getPaymentDate = (fee: Fee): string => {
  // 只有已繳費的費用才顯示繳費日期
  // 如果狀態是已繳費且有繳費時間，顯示繳費時間
  if (fee.payment_status === 'Paid' && fee.paid_at) {
    return formatDate(fee.paid_at)
  }
  // 未繳費的費用不顯示繳費日期
  if (fee.payment_status === 'Unpaid') {
    return '—'
  }
  // 其他狀態（如部分繳費）顯示費用日期
  return formatDate(fee.fee_date)
}

/**
 * 移除學生篩選
 */
const removeStudentFilter = async (): Promise<void> => {
  filters.value.studentId = ''
  selectedStudent.value = null
  await applyFilters()
}

onMounted(() => {
  syncFromRouteQuery()
  fetchTags() // 獲取標籤列表
  const queryString = new URLSearchParams(route.query as Record<string, string>).toString()
  if (queryString) {
    fetchSelectedStudent().finally(() => fetchFees(queryString))
  } else {
    fetchFees()
  }
})
</script>
