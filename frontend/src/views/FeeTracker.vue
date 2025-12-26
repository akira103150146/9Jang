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
      <div class="grid gap-3 md:grid-cols-4">
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
          <label class="block text-xs font-semibold text-slate-600 mb-1">備註（模糊）</label>
          <input
            v-model="filters.q"
            type="text"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            placeholder="例如：發起老師"
          />
        </div>
        <div class="flex items-end gap-2">
          <button
            @click="applyFilters"
            class="flex-1 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600"
          >
            搜尋
          </button>
          <button
            @click="clearFilters"
            class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            清除
          </button>
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api, { feeAPI, studentAPI } from '../services/api'

const route = useRoute()
const router = useRouter()

const fees = ref([])
const loading = ref(false)
const selectedStudent = ref(null)
const selectedFees = ref([])
const batchUpdating = ref(false)

const filters = ref({
  studentId: '',
  studentName: '',
  item: '',
  q: '',
})

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
  // 如果狀態是已繳費且有繳費時間，顯示繳費時間；否則顯示費用日期
  if (fee.payment_status === 'Paid' && fee.paid_at) {
    return formatDate(fee.paid_at)
  }
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
    if (filters.value.item) params.append('item', filters.value.item)
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

const syncFromRouteQuery = () => {
  filters.value.studentId = route.query.student ? String(route.query.student) : ''
  filters.value.studentName = route.query.student_name ? String(route.query.student_name) : ''
  filters.value.item = route.query.item ? String(route.query.item) : ''
  filters.value.q = route.query.q ? String(route.query.q) : ''
}

const applyFilters = async () => {
  const query = {}
  if (filters.value.studentId) query.student = filters.value.studentId
  if (filters.value.studentName) query.student_name = filters.value.studentName
  if (filters.value.item) query.item = filters.value.item
  if (filters.value.q) query.q = filters.value.q
  await router.replace({ path: '/fees', query })
  await fetchSelectedStudent()
  await fetchFees()
}

const clearFilters = async () => {
  filters.value = { studentId: '', studentName: '', item: '', q: '' }
  await router.replace({ path: '/fees', query: {} })
  selectedStudent.value = null
  await fetchFees()
}

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
  fetchSelectedStudent().finally(() => fetchFees())
})
</script>

