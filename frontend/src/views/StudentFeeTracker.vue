<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
    <div class="max-w-6xl mx-auto space-y-6">
      <header class="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-slate-900">{{ student?.name || '載入中...' }}</h2>
            <p class="text-sm text-slate-500 mt-1">{{ student?.school }} / {{ student?.grade }}</p>
          </div>
          <router-link
            to="/students"
            class="px-4 py-2 bg-slate-500 text-white rounded-lg text-sm font-semibold hover:bg-slate-600"
          >
            返回學生列表
          </router-link>
        </div>
      </header>

      <!-- 費用統計卡片 -->
      <section class="grid gap-4 md:grid-cols-4">
        <div class="rounded-3xl border border-green-100 bg-white p-5 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">總費用</p>
          <p class="mt-2 text-3xl font-bold text-slate-900">${{ (student?.total_fees || 0).toLocaleString() }}</p>
        </div>
        <div class="rounded-3xl border border-amber-100 bg-white p-5 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">待繳費用</p>
          <p class="mt-2 text-3xl font-bold text-amber-600">${{ (student?.unpaid_fees || 0).toLocaleString() }}</p>
        </div>
        <div class="rounded-3xl border border-green-100 bg-white p-5 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">已繳費用</p>
          <p class="mt-2 text-3xl font-bold text-green-600">
            ${{ ((student?.total_fees || 0) - (student?.unpaid_fees || 0)).toLocaleString() }}
          </p>
        </div>
        <div class="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">費用記錄數</p>
          <p class="mt-2 text-3xl font-bold text-blue-600">{{ fees.length }}</p>
        </div>
      </section>

      <!-- 費用列表 -->
      <div class="rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div class="p-6 border-b border-slate-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-slate-900">費用記錄</h3>
          <button
            @click="openAddFeeModal"
            class="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600"
          >
            + 新增費用記錄
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-100">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">日期</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">收費名目</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">金額</th>
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
              >
                <td class="px-4 py-4 text-sm text-slate-700">
                  {{ formatDate(fee.fee_date) }}
                </td>
                <td class="px-4 py-4 text-sm text-slate-700">
                  <span class="px-2 py-1 rounded-full text-xs font-semibold"
                    :class="{
                      'bg-blue-100 text-blue-800': fee.item === 'Tuition',
                      'bg-green-100 text-green-800': fee.item === 'Meal',
                      'bg-purple-100 text-purple-800': fee.item === 'Transport',
                      'bg-amber-100 text-amber-800': fee.item === 'Book',
                      'bg-slate-100 text-slate-800': fee.item === 'Other',
                    }"
                  >
                    {{ getItemDisplayName(fee.item) }}
                  </span>
                </td>
                <td class="px-4 py-4 text-sm font-semibold text-slate-900">
                  ${{ parseFloat(fee.amount).toLocaleString() }}
                </td>
                <td class="px-4 py-4 text-sm">
                  <select
                    :value="fee.payment_status"
                    @change="updatePaymentStatus(fee.fee_id, $event.target.value)"
                    class="rounded-lg border border-slate-300 px-3 py-1 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                    :class="{
                      'bg-green-50 text-green-800': fee.payment_status === 'Paid',
                      'bg-amber-50 text-amber-800': fee.payment_status === 'Unpaid',
                      'bg-blue-50 text-blue-800': fee.payment_status === 'Partial',
                    }"
                  >
                    <option value="Unpaid">未繳</option>
                    <option value="Partial">部分繳</option>
                    <option value="Paid">已繳</option>
                  </select>
                </td>
                <td class="px-4 py-4 text-sm text-slate-700">
                  <p class="max-w-xs truncate">{{ fee.notes || '—' }}</p>
                </td>
                <td class="px-4 py-4 text-center">
                  <div class="flex justify-center gap-2">
                    <button
                      @click="editFee(fee)"
                      class="rounded-full bg-sky-500 px-3 py-1 text-xs font-semibold text-white hover:bg-sky-600"
                    >
                      編輯
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="fees.length === 0">
                <td colspan="6" class="py-8 px-4 text-center text-slate-500">目前沒有費用記錄</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 新增/編輯費用記錄模態框 -->
    <div
      v-if="showFeeModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click.self="closeFeeModal"
    >
      <div class="bg-white rounded-3xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-slate-200">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-slate-900">
              {{ editingFee ? '編輯費用記錄' : '新增費用記錄' }}
            </h3>
            <button
              @click="closeFeeModal"
              class="text-slate-400 hover:text-slate-600"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div class="p-6">
          <form @submit.prevent="saveFee" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">收費名目 *</label>
              <select
                v-model="feeForm.item"
                required
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
              >
                <option value="">請選擇收費名目</option>
                <option value="Tuition">學費</option>
                <option value="Transport">交通費</option>
                <option value="Meal">餐費</option>
                <option value="Book">書籍費</option>
                <option value="Other">其他</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">收費金額 *</label>
              <input
                v-model.number="feeForm.amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                required
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">費用日期 *</label>
              <input
                v-model="feeForm.fee_date"
                type="date"
                required
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">繳費狀態 *</label>
              <select
                v-model="feeForm.payment_status"
                required
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
              >
                <option value="Unpaid">未繳</option>
                <option value="Partial">部分繳</option>
                <option value="Paid">已繳</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">備註</label>
              <textarea
                v-model="feeForm.notes"
                rows="3"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                placeholder="備註資訊..."
              ></textarea>
            </div>

            <div class="flex gap-2 pt-4">
              <button
                type="button"
                @click="closeFeeModal"
                class="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="submit"
                :disabled="savingFee"
                class="flex-1 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ savingFee ? '儲存中...' : '儲存' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { studentAPI, feeAPI } from '../services/api'

const route = useRoute()
const router = useRouter()

const studentId = route.params.studentId

const student = ref(null)
const fees = ref([])
const loading = ref(false)
const showFeeModal = ref(false)
const editingFee = ref(null)
const savingFee = ref(false)

const feeForm = ref({
  item: '',
  amount: '',
  fee_date: new Date().toISOString().split('T')[0],
  payment_status: 'Unpaid',
  notes: '',
})

const fetchStudent = async () => {
  try {
    const response = await studentAPI.getById(studentId)
    student.value = response.data
  } catch (error) {
    console.error('獲取學生資料失敗：', error)
    alert('獲取學生資料失敗')
  }
}

const fetchFees = async () => {
  loading.value = true
  try {
    const response = await feeAPI.getByStudent(studentId)
    const data = response.data.results || response.data
    fees.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('獲取費用記錄失敗：', error)
    fees.value = []
  } finally {
    loading.value = false
  }
}

const updatePaymentStatus = async (feeId, newStatus) => {
  try {
    const fee = fees.value.find(f => f.fee_id === feeId)
    if (!fee) return

    await feeAPI.update(feeId, {
      ...fee,
      payment_status: newStatus,
    })

    fee.payment_status = newStatus
    alert('繳費狀態已更新')

    // 重新獲取學生資料以更新統計
    await fetchStudent()
  } catch (error) {
    console.error('更新繳費狀態失敗：', error)
    alert('更新繳費狀態失敗，請稍後再試')
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

const getItemDisplayName = (item) => {
  const names = {
    'Tuition': '學費',
    'Meal': '餐費',
    'Transport': '交通費',
    'Book': '書籍費',
    'Other': '其他',
  }
  return names[item] || item
}

const openAddFeeModal = () => {
  editingFee.value = null
  feeForm.value = {
    item: '',
    amount: '',
    fee_date: new Date().toISOString().split('T')[0],
    payment_status: 'Unpaid',
    notes: '',
  }
  showFeeModal.value = true
}

const editFee = (fee) => {
  editingFee.value = fee
  feeForm.value = {
    item: fee.item,
    amount: parseFloat(fee.amount),
    fee_date: fee.fee_date ? new Date(fee.fee_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    payment_status: fee.payment_status,
    notes: fee.notes || '',
  }
  showFeeModal.value = true
}

const closeFeeModal = () => {
  showFeeModal.value = false
  editingFee.value = null
  feeForm.value = {
    item: '',
    amount: '',
    fee_date: new Date().toISOString().split('T')[0],
    payment_status: 'Unpaid',
    notes: '',
  }
}

const saveFee = async () => {
  savingFee.value = true
  try {
    const submitData = {
      student: parseInt(studentId),
      item: feeForm.value.item,
      amount: parseFloat(feeForm.value.amount),
      fee_date: feeForm.value.fee_date,
      payment_status: feeForm.value.payment_status,
      notes: feeForm.value.notes || null,
    }

    if (editingFee.value) {
      // 編輯
      await feeAPI.update(editingFee.value.fee_id, submitData)
      alert('費用記錄已更新')
    } else {
      // 新增
      await feeAPI.create(submitData)
      alert('費用記錄已新增')
    }

    closeFeeModal()
    await fetchStudent()
    await fetchFees()
  } catch (error) {
    console.error('儲存費用記錄失敗：', error)
    alert('儲存費用記錄失敗，請稍後再試')
  } finally {
    savingFee.value = false
  }
}

onMounted(() => {
  fetchStudent()
  fetchFees()
})
</script>

