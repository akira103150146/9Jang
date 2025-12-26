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

    <div class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-slate-900">篩選條件</h3>
        <button 
          @click="showFilters = !showFilters" 
          class="text-sm text-sky-600 hover:text-sky-800 font-semibold"
        >
          {{ showFilters ? '收起' : '展開' }}篩選
        </button>
      </div>
      
      <!-- 載入指示器 -->
      <div v-if="isFiltering" class="mb-2 text-xs text-slate-500 flex items-center gap-2">
        <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        搜尋中...
      </div>
      
      <!-- 篩選面板 -->
      <div v-show="showFilters" class="space-y-4">
        <div class="grid gap-3 md:grid-cols-5">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">學生姓名（模糊）</label>
            <input
              v-model="filters.studentName"
              type="text"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="例如：王小明"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">標籤</label>
            <select
              v-model="filters.tag"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            >
              <option value="">全部標籤</option>
              <option v-for="tag in availableTags" :key="tag.group_id" :value="tag.group_id">
                {{ tag.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">名目</label>
            <select
              v-model="filters.item"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            >
              <option value="">全部</option>
              <option value="Tuition">學費</option>
              <option value="Meal">餐費</option>
              <option value="Transport">交通費</option>
              <option value="Book">書籍費</option>
              <option value="Other">其他</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">繳費狀態</label>
            <select
              v-model="filters.paymentStatus"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            >
              <option value="">全部</option>
              <option value="Paid">已繳費</option>
              <option value="Unpaid">未繳費</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">備註（模糊）</label>
            <input
              v-model="filters.q"
              type="text"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="例如：發起老師"
            />
          </div>
        </div>
        
        <!-- 時間篩選 -->
        <div class="grid gap-3 md:grid-cols-4">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">時間快捷選項</label>
            <select
              v-model="filters.dateRange"
              @change="onDateRangeChange"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            >
              <option value="">不限時間</option>
              <option value="today">當日繳費</option>
              <option value="this_week">當週繳費</option>
              <option value="this_month">當月繳費</option>
              <option value="last_month">上個月繳費</option>
              <option value="custom">自訂時間區間</option>
            </select>
          </div>
          <div v-if="filters.dateRange === 'custom'">
            <label class="block text-xs font-semibold text-slate-600 mb-1">開始日期</label>
            <input
              v-model="filters.startDate"
              type="date"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>
          <div v-if="filters.dateRange === 'custom'">
            <label class="block text-xs font-semibold text-slate-600 mb-1">結束日期</label>
            <input
              v-model="filters.endDate"
              type="date"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>
          <div v-if="filters.dateRange === 'custom'" class="flex items-end">
            <button
              @click="clearDateRange"
              class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              清除日期
            </button>
          </div>
        </div>
        
        <!-- 操作按鈕 -->
        <div class="flex gap-2 pt-2 border-t border-slate-200">
          <button 
            @click="clearFilters" 
            class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            清除所有篩選
          </button>
        </div>
        
        <!-- 已套用的篩選標籤 -->
        <div v-if="hasActiveFilters" class="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
          <span class="text-xs text-slate-500">已套用：</span>
          <span
            v-for="(filter, key) in activeFilters"
            :key="key"
            class="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700"
          >
            {{ filter.label }}
            <button @click="removeFilter(key)" class="text-sky-600 hover:text-sky-800">×</button>
          </span>
        </div>
      </div>

      <div v-if="selectedStudent" class="mt-4 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-xs font-semibold text-slate-500">已套用學生篩選</p>
            <p class="text-sm font-semibold text-slate-900">
              {{ selectedStudent.name }}（{{ selectedStudent.school }} / {{ selectedStudent.grade }}）
            </p>
          </div>
          <button
            @click="removeStudentFilter"
            class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 border border-slate-200"
          >
            移除學生篩選
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <p class="text-slate-500">載入中...</p>
    </div>

    <div v-else class="space-y-4">
      <!-- 批次操作按鈕 -->
      <div v-if="selectedFees.length > 0" class="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold text-slate-700">已選擇 {{ selectedFees.length }} 筆費用記錄</span>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="batchUpdateStatus('Paid')"
            :disabled="batchUpdating"
            class="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ batchUpdating ? '處理中...' : '標記為已繳費' }}
          </button>
          <button
            @click="batchUpdateStatus('Unpaid')"
            :disabled="batchUpdating"
            class="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ batchUpdating ? '處理中...' : '標記為未繳費' }}
          </button>
          <button
            @click="clearSelection"
            class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            取消選擇
          </button>
        </div>
      </div>

      <div class="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-100">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    :checked="isAllSelected"
                    @change="toggleSelectAll"
                    class="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">學生</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">項目</th>
                <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">金額</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">繳費日期</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">狀態</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">備註</th>
                <th class="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="fee in fees"
                :key="fee.fee_id"
                class="transition hover:bg-slate-50/70"
                :class="{ 'bg-sky-50/50': isSelected(fee.fee_id) }"
              >
                <td class="whitespace-nowrap px-4 py-4 text-center">
                  <input
                    type="checkbox"
                    :checked="isSelected(fee.fee_id)"
                    @change="toggleSelect(fee.fee_id)"
                    class="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                </td>
                <td class="whitespace-nowrap px-4 py-4">
                  <p class="font-semibold text-slate-900">{{ fee.student_name }}</p>
                  <p class="text-xs text-slate-500">Fee #{{ fee.fee_id ?? '—' }}</p>
                </td>
                <td class="whitespace-nowrap px-4 py-4 text-slate-700">{{ getItemDisplay(fee.item) }}</td>
                <td class="whitespace-nowrap px-4 py-4 font-semibold text-slate-900 font-mono text-right">${{ formatAmount(fee.amount) }}</td>
                <td class="whitespace-nowrap px-4 py-4 text-slate-700">{{ getPaymentDate(fee) }}</td>
                <td class="whitespace-nowrap px-4 py-4">
                  <span
                    class="rounded-full px-3 py-1 text-xs font-semibold"
                    :class="getStatusClass(fee.payment_status)"
                  >
                    {{ getStatusDisplay(fee.payment_status) }}
                  </span>
                </td>
                <td class="px-4 py-4 text-sm text-slate-700">
                  <p class="max-w-md truncate">{{ fee.notes || '—' }}</p>
                </td>
                <td class="whitespace-nowrap px-4 py-4 text-center">
                  <div class="flex justify-center gap-2">
                    <router-link
                      :to="`/fees/edit/${fee.fee_id || fee.id}`"
                      class="rounded-full bg-sky-500 px-3 py-1 text-xs font-semibold text-white hover:bg-sky-600"
                    >
                      編輯
                    </router-link>
                  </div>
                </td>
              </tr>
              <tr v-if="fees.length === 0">
                <td colspan="8" class="py-4 px-4 text-center text-slate-500">目前沒有費用記錄。</td>
              </tr>
              <!-- 金額加總行 -->
              <tr v-if="fees.length > 0" class="bg-slate-50 font-semibold">
                <td colspan="3" class="px-4 py-4 text-right text-slate-700">總計：</td>
                <td class="px-4 py-4 font-mono text-right text-slate-900">${{ formatAmount(totalAmount) }}</td>
                <td colspan="4" class="px-4 py-4"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api, { feeAPI, studentAPI, studentGroupAPI } from '../services/api'

const route = useRoute()
const router = useRouter()

const fees = ref([])
const loading = ref(false)
const selectedStudent = ref(null)
const selectedFees = ref([])
const batchUpdating = ref(false)
const showFilters = ref(true)  // 預設展開篩選
const isFiltering = ref(false)  // 是否正在篩選

const filters = ref({
  studentId: '',
  studentName: '',
  tag: '',  // 標籤篩選
  item: '',
  paymentStatus: '',  // 繳費狀態篩選
  dateRange: '',  // 時間快捷選項
  startDate: '',  // 開始日期
  endDate: '',  // 結束日期
  q: '',
})

const availableTags = ref([])  // 標籤列表

const itemMap = {
  'Tuition': '學費',
  'Transport': '交通費',
  'Meal': '餐費',
  'Book': '書籍費',
  'Other': '其他',
}

const statusMap = {
  'Paid': '已繳費',
  'Unpaid': '未繳費',
  'Partial': '部分繳費',
}

const normalizeFee = (fee) => ({
  fee_id: fee.fee_id || fee.id,
  student: fee.student,
  student_name: fee.student_name || fee.student?.name || '',
  item: fee.item,
  amount: fee.amount,
  fee_date: fee.fee_date,
  paid_at: fee.paid_at,  // 繳費時間
  payment_status: fee.payment_status || 'Unpaid',
  notes: fee.notes || '',
})

const getItemDisplay = (item) => {
  return itemMap[item] || item
}

const getStatusDisplay = (status) => {
  return statusMap[status] || status
}

const getStatusClass = (status) => {
  const statusClassMap = {
    'Paid': 'bg-emerald-50 text-emerald-600',
    'Partial': 'bg-amber-50 text-amber-600',
    'Unpaid': 'bg-rose-50 text-rose-600',
  }
  return statusClassMap[status] || 'bg-slate-100 text-slate-600'
}

const formatDate = (date) => {
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
  return date
}

const formatAmount = (amount) => {
  // 格式化為整數，並加上千分位分隔符
  const intAmount = Math.round(parseFloat(amount || 0))
  return intAmount.toLocaleString('zh-TW', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

const getPaymentDate = (fee) => {
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

const fetchSelectedStudent = async () => {
  if (!filters.value.studentId) {
    selectedStudent.value = null
    return
  }
  try {
    const res = await studentAPI.getById(filters.value.studentId)
    selectedStudent.value = res.data
  } catch (e) {
    selectedStudent.value = null
  }
}

const fetchFees = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (filters.value.studentId) params.append('student', filters.value.studentId)
    if (filters.value.studentName) params.append('student_name', filters.value.studentName)
    if (filters.value.tag) params.append('tag', filters.value.tag)
    if (filters.value.item) params.append('item', filters.value.item)
    if (filters.value.paymentStatus) params.append('payment_status', filters.value.paymentStatus)
    if (filters.value.dateRange) params.append('date_range', filters.value.dateRange)
    if (filters.value.dateRange === 'custom') {
      if (filters.value.startDate) params.append('start_date', filters.value.startDate)
      if (filters.value.endDate) params.append('end_date', filters.value.endDate)
    }
    if (filters.value.q) params.append('q', filters.value.q)

    const url = params.toString() ? `/cramschool/fees/?${params.toString()}` : '/cramschool/fees/'
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

// 獲取標籤列表（只獲取類型為 'tag' 的）
const fetchTags = async () => {
  try {
    const response = await studentGroupAPI.getAll()
    const data = response.data.results || response.data || []
    // 只顯示類型為 'tag' 的群組
    availableTags.value = data.filter(tag => tag.group_type === 'tag')
  } catch (error) {
    console.error('獲取標籤失敗:', error)
    availableTags.value = []
  }
}

// 防抖函數
let debounceTimer = null
const debounce = (fn, delay) => {
  return (...args) => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

// 構建查詢參數
const buildQueryParams = () => {
  const params = {}
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

// 應用篩選（更新 URL 並獲取數據）
const applyFilters = async () => {
  if (isFiltering.value) return // 防止重複請求
  
  isFiltering.value = true
  try {
    const query = buildQueryParams()
    // 使用 replace 避免產生過多歷史記錄
    await router.replace({ path: '/fees', query })
    
    // 獲取費用列表
    await fetchSelectedStudent()
    await fetchFees()
  } finally {
    isFiltering.value = false
  }
}

// 防抖版本的 applyFilters（用於文字輸入）
const debouncedApplyFilters = debounce(applyFilters, 400)

const syncFromRouteQuery = () => {
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

const clearFilters = async () => {
  filters.value = { studentId: '', studentName: '', tag: '', item: '', paymentStatus: '', dateRange: '', startDate: '', endDate: '', q: '' }
  await router.replace({ path: '/fees', query: {} })
  selectedStudent.value = null
  await fetchFees()
}

// 清除日期範圍
const clearDateRange = () => {
  filters.value.dateRange = ''
  filters.value.startDate = ''
  filters.value.endDate = ''
  applyFilters()
}

// 日期範圍變更處理
const onDateRangeChange = () => {
  // 如果選擇了快捷選項，清除自訂日期
  if (filters.value.dateRange !== 'custom') {
    filters.value.startDate = ''
    filters.value.endDate = ''
  }
  applyFilters()
}

// 移除單個篩選
const removeFilter = (key) => {
  filters.value[key] = ''
  applyFilters()
}

// 檢查是否有活躍的篩選
const hasActiveFilters = computed(() => {
  return Object.values(filters.value).some(value => value !== '')
})

// 獲取日期範圍顯示文字
const getDateRangeLabel = () => {
  if (!filters.value.dateRange) return ''
  
  const labels = {
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

// 獲取活躍篩選的顯示標籤
const activeFilters = computed(() => {
  const result = {}
  if (filters.value.studentName) result.studentName = { label: `學生：${filters.value.studentName}` }
  if (filters.value.tag) {
    const tag = availableTags.value.find(t => t.group_id == filters.value.tag)
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
  if (filters.value.q) result.q = { label: `備註：${filters.value.q}` }
  return result
})

// 計算總金額
const totalAmount = computed(() => {
  return fees.value.reduce((sum, fee) => sum + parseFloat(fee.amount || 0), 0)
})

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

const removeStudentFilter = async () => {
  filters.value.studentId = ''
  selectedStudent.value = null
  await applyFilters()
}

// 批次選擇相關功能
const isSelected = (feeId) => {
  return selectedFees.value.includes(feeId)
}

const toggleSelect = (feeId) => {
  const index = selectedFees.value.indexOf(feeId)
  if (index > -1) {
    selectedFees.value.splice(index, 1)
  } else {
    selectedFees.value.push(feeId)
  }
}

const isAllSelected = computed(() => {
  return fees.value.length > 0 && selectedFees.value.length === fees.value.length
})

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedFees.value = []
  } else {
    selectedFees.value = fees.value.map(fee => fee.fee_id)
  }
}

const clearSelection = () => {
  selectedFees.value = []
}

const batchUpdateStatus = async (paymentStatus) => {
  if (selectedFees.value.length === 0) {
    alert('請至少選擇一筆費用記錄')
    return
  }

  const statusText = paymentStatus === 'Paid' ? '已繳費' : '未繳費'
  if (!confirm(`確定要將選中的 ${selectedFees.value.length} 筆費用記錄標記為「${statusText}」嗎？`)) {
    return
  }

  batchUpdating.value = true
  try {
    await feeAPI.batchUpdate(selectedFees.value, paymentStatus)
    alert(`成功更新 ${selectedFees.value.length} 筆費用記錄為「${statusText}」`)
    clearSelection()
    await fetchFees()
  } catch (error) {
    console.error('批次更新失敗:', error)
    if (error.response?.data) {
      const errorMsg = error.response.data.detail || JSON.stringify(error.response.data)
      alert(`批次更新失敗：${errorMsg}`)
    } else {
      alert('批次更新失敗，請稍後再試')
    }
  } finally {
    batchUpdating.value = false
  }
}

onMounted(() => {
  syncFromRouteQuery()
  fetchTags() // 獲取標籤列表
  const queryString = new URLSearchParams(route.query).toString()
  if (queryString) {
    fetchSelectedStudent().finally(() => fetchFees())
  } else {
    fetchFees()
  }
})
</script>

