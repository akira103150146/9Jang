<template>
  <div class="space-y-6">
    <header class="rounded-3xl border border-blue-100 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 p-6 shadow-sm">
      <h2 class="text-2xl font-bold text-slate-900">歡迎回來，{{ studentName }}</h2>
      <p class="mt-1 text-slate-600">這是您的個人學習首頁</p>
    </header>

    <!-- 統計與通知 -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <!-- 待繳費用 -->
      <div class="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h3 class="font-bold text-lg text-slate-900 mb-2">待繳費用</h3>
          <div class="text-3xl font-bold text-rose-600">${{ unpaidAmount.toLocaleString() }}</div>
          <p class="text-sm text-slate-500 mt-1">共有 {{ unpaidCount }} 筆未繳項目</p>
        </div>
        <router-link 
          v-if="studentId" 
          :to="`/students/${studentId}/fees`" 
          class="text-sm font-semibold text-rose-500 mt-4 flex items-center hover:text-rose-600"
        >
          查看詳情 <span class="ml-1 text-lg">&rarr;</span>
        </router-link>
      </div>

      <!-- 進行中團購 -->
      <div class="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm flex flex-col">
        <h3 class="font-bold text-lg text-slate-900 mb-3">進行中團購</h3>
        <div v-if="loadingOrders" class="text-slate-500 text-sm">載入中...</div>
        <div v-else-if="activeGroupOrders.length === 0" class="text-slate-500 text-sm flex-1 flex items-center">
          目前沒有進行中的團購
        </div>
        <ul v-else class="space-y-3 flex-1 overflow-y-auto max-h-40">
          <li v-for="order in activeGroupOrders" :key="order.group_order_id" class="border-b border-slate-100 pb-2 last:border-0 last:pb-0">
            <div class="flex justify-between items-start">
              <div>
                <div class="font-semibold text-slate-900 text-sm">{{ order.title }}</div>
                <div class="text-xs text-slate-500 mt-0.5">截止: {{ formatDateTime(order.deadline) }}</div>
              </div>
              <router-link 
                :to="`/lunch-orders/join/${order.order_link}`" 
                class="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full font-semibold hover:bg-emerald-100"
              >
                訂購
              </router-link>
            </div>
          </li>
        </ul>
        <router-link to="/lunch-orders" class="text-sm font-semibold text-emerald-500 mt-4 flex items-center hover:text-emerald-600">
          查看所有團購 <span class="ml-1 text-lg">&rarr;</span>
        </router-link>
      </div>

      <!-- 老師留言 -->
      <div class="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h3 class="font-bold text-lg text-slate-900 mb-2">我的學習</h3>
          <p class="text-sm text-slate-500">前往我的課程與錯題本</p>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-3">
          <router-link
            to="/my-courses"
            class="rounded-xl bg-indigo-50 text-indigo-700 px-4 py-3 text-sm font-semibold hover:bg-indigo-100 transition text-center"
          >
            我的課程
          </router-link>
          <router-link
            to="/student-mistake-book"
            class="rounded-xl bg-sky-50 text-sky-700 px-4 py-3 text-sm font-semibold hover:bg-sky-100 transition text-center"
          >
            錯題本
          </router-link>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { studentAPI, feeAPI, groupOrderAPI, authAPI } from '../services/api'

const studentId = ref(null)
const studentName = ref('')
const unpaidAmount = ref(0)
const unpaidCount = ref(0)
const activeGroupOrders = ref([])
const loadingOrders = ref(false)

const formatDateTime = (datetime) => {
  if (!datetime) return ''
  const date = new Date(datetime)
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const initData = async () => {
  try {
    // 1. 獲取當前用戶信息
    const user = await authAPI.getCurrentUser()
    const userData = user.data
    
    if (userData.role !== 'STUDENT' && !userData.student_id) {
       // 如果不是學生，可能需要處理（但路由守衛應該已經過濾了）
       return
    }

    studentId.value = userData.student_id
    
    if (!studentId.value) {
        console.warn('無法獲取學生 ID')
        return
    }

    // 2. 獲取學生詳細資料 (含留言/備註)
    const studentRes = await studentAPI.getById(studentId.value)
    studentName.value = studentRes.data.name

    // 3. 獲取費用信息 (使用已有的計算邏輯或 API)
    // studentAPI.getById 返回的數據中包含了 unpaid_fees
    unpaidAmount.value = studentRes.data.unpaid_fees || 0
    // 如果需要筆數，可能需要調用 feeAPI
    const feesRes = await feeAPI.getByStudent(studentId.value)
    const fees = feesRes.data.results || feesRes.data
    unpaidCount.value = fees.filter(f => f.payment_status !== 'Paid').length

    // 4. 獲取進行中的團購
    loadingOrders.value = true
    const ordersRes = await groupOrderAPI.getAll()
    const allOrders = ordersRes.data.results || ordersRes.data
    activeGroupOrders.value = allOrders.filter(o => o.status === 'Open').slice(0, 5)
    loadingOrders.value = false

  } catch (error) {
    console.error('初始化學生首頁失敗:', error)
  }
}

onMounted(() => {
  initData()
})
</script>

