<template>
  <div class="space-y-6">
    <header class="rounded-3xl border border-blue-100 bg-gradient-to-r from-white to-sky-50 p-6 shadow-sm">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-semibold text-slate-500">會計模組</p>
          <h2 class="text-2xl font-bold text-slate-900">額外收費與款項追蹤</h2>
          <p class="mt-2 text-sm text-slate-500">掌握各項費用與收款狀態，避免遺漏</p>
        </div>
        <router-link
          to="/fees/add"
          class="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:from-sky-600 hover:to-indigo-600"
        >
          新增費用記錄
        </router-link>
      </div>
      <p v-if="usingMock" class="mt-3 text-sm text-amber-600">
        目前顯示示意資料（mock data），待後端欄位完善後即可串接。
      </p>
    </header>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <p class="text-slate-500">載入中...</p>
    </div>

    <div v-else class="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">學生</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">項目</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">金額</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">日期</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">狀態</th>
              <th class="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="fee in fees"
              :key="fee.fee_id"
              class="transition hover:bg-slate-50/70"
            >
              <td class="whitespace-nowrap px-4 py-4">
                <p class="font-semibold text-slate-900">{{ fee.student_name }}</p>
                <p class="text-xs text-slate-500">Fee #{{ fee.fee_id ?? '—' }}</p>
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-slate-700">{{ getItemDisplay(fee.item) }}</td>
              <td class="whitespace-nowrap px-4 py-4 font-semibold text-slate-900">${{ fee.amount }}</td>
              <td class="whitespace-nowrap px-4 py-4 text-slate-700">{{ formatDate(fee.fee_date) }}</td>
              <td class="whitespace-nowrap px-4 py-4">
                <span
                  class="rounded-full px-3 py-1 text-xs font-semibold"
                  :class="getStatusClass(fee.payment_status)"
                >
                  {{ getStatusDisplay(fee.payment_status) }}
                </span>
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-center">
                <div class="flex justify-center gap-2">
                  <router-link
                    :to="`/fees/edit/${fee.fee_id || fee.id}`"
                    class="rounded-full bg-sky-500 px-3 py-1 text-xs font-semibold text-white hover:bg-sky-600"
                  >
                    編輯
                  </router-link>
                  <button
                    @click="deleteFee(fee.fee_id || fee.id, fee.student_name, fee.item)"
                    class="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600"
                  >
                    刪除
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="fees.length === 0">
              <td colspan="6" class="py-4 px-4 text-center text-slate-500">目前沒有費用記錄。</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { feeAPI } from '../services/api'
import { mockExtraFees } from '../data/mockData'

const fees = ref([])
const loading = ref(false)
const usingMock = ref(false)

const itemMap = {
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
  return typeof date === 'string' ? date.replace(/-/g, '/') : date
}

const fetchFees = async () => {
  loading.value = true
  try {
    const response = await feeAPI.getAll()
    const data = response.data.results || response.data
    fees.value = data.map((item) => normalizeFee(item))
    usingMock.value = false
  } catch (error) {
    console.warn('獲取費用記錄失敗，使用 mock 資料：', error)
    fees.value = mockExtraFees.map((item) => normalizeFee(item))
    usingMock.value = true
  } finally {
    loading.value = false
  }
}

const deleteFee = async (id, studentName, item) => {
  if (!id) {
    alert('示意資料無法刪除，請於 API 可用後再操作。')
    return
  }

  if (!confirm(`確定要刪除「${studentName}」的「${getItemDisplay(item)}」費用記錄嗎？`)) {
    return
  }

  try {
    await feeAPI.delete(id)
    alert('刪除成功')
    fetchFees()
  } catch (error) {
    console.error('刪除失敗:', error)
    alert('刪除失敗，請稍後再試')
  }
}

onMounted(() => {
  fetchFees()
})
</script>

