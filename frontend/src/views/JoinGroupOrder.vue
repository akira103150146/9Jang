<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
    <div class="max-w-4xl mx-auto space-y-6">
      <header class="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">{{ groupOrder?.title || '載入中...' }}</h2>
        <p class="mt-1 text-sm text-slate-500">{{ groupOrder?.restaurant_name }}</p>
        <p v-if="groupOrder" class="mt-2 text-sm text-amber-600">
          截止時間：{{ formatDateTime(groupOrder.deadline) }}
        </p>
      </header>

      <div v-if="loading" class="text-center py-12 text-slate-500">載入中...</div>
      
      <!-- 團購已關閉或過期提示 -->
      <div v-else-if="groupOrder && isOrderClosed" class="rounded-3xl border border-red-100 bg-white p-8 shadow-sm">
        <div class="text-center space-y-4">
          <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-slate-900">團購已關閉</h3>
          <div class="space-y-2 text-slate-600">
            <p class="text-lg">{{ groupOrder.title }}</p>
            <p class="text-sm">{{ groupOrder.restaurant_name }}</p>
            <p v-if="isExpired" class="text-sm text-red-600 mt-4">
              截止時間：<strong>{{ formatDateTime(groupOrder.deadline) }}</strong> 已過期
            </p>
            <p v-else-if="groupOrder.status === 'Closed'" class="text-sm text-red-600 mt-4">
              此團購已由管理員關閉
            </p>
            <p v-else-if="groupOrder.status === 'Completed'" class="text-sm text-red-600 mt-4">
              此團購已完成
            </p>
          </div>
          <div class="pt-4">
            <p class="text-sm text-slate-500">如有疑問，請聯繫管理員</p>
          </div>
        </div>
      </div>
      
      <div v-else-if="groupOrder && restaurant" class="grid gap-6 md:grid-cols-2">
        <!-- 菜單圖片 -->
        <div class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">菜單</h3>
          <div v-if="restaurant.menu_image_path">
            <img
              :src="getImageUrl(restaurant.menu_image_path)"
              alt="菜單"
              class="w-full rounded-lg border border-slate-200"
            />
          </div>
          <div v-else class="text-center py-12 text-slate-400">
            <p>暫無菜單圖片</p>
          </div>
        </div>

        <!-- 點餐表單 -->
        <div class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">點餐</h3>
          
          <form @submit.prevent="submitOrder" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">學生 *</label>
              <select
                v-model="orderForm.student"
                required
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
              >
                <option value="">請選擇學生</option>
                <option
                  v-for="student in students"
                  :key="student.student_id"
                  :value="student.student_id"
                >
                  {{ student.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">訂單項目</label>
              <div class="space-y-3">
                <div
                  v-for="(item, index) in orderForm.items"
                  :key="index"
                  class="bg-slate-50 rounded-lg p-3 space-y-2"
                >
                  <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">項目名稱 *</label>
                    <input
                      v-model="item.item_name"
                      type="text"
                      placeholder="例如：雞腿便當"
                      required
                      class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                    />
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="block text-xs font-semibold text-slate-600 mb-1">數量 *</label>
                      <input
                        v-model.number="item.quantity"
                        type="number"
                        min="1"
                        placeholder="1"
                        required
                        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-600 mb-1">單價 (元) *</label>
                      <input
                        v-model.number="item.unit_price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        required
                        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                      />
                    </div>
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-slate-600">小計：</span>
                    <span class="font-semibold text-slate-900">
                      ${{ (item.quantity * item.unit_price).toFixed(2) }}
                    </span>
                  </div>
                  <button
                    type="button"
                    @click="removeItem(index)"
                    class="w-full text-red-500 hover:text-red-700 text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    移除此項目
                  </button>
                </div>
                <button
                  type="button"
                  @click="addItem"
                  class="w-full rounded-lg border-2 border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-green-500 hover:text-green-600"
                >
                  + 新增項目
                </button>
              </div>
              <div class="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-slate-700">總金額：</span>
                  <span class="text-lg font-bold text-green-600">${{ totalAmount.toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">備註</label>
              <textarea
                v-model="orderForm.notes"
                rows="3"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                placeholder="特殊要求或備註..."
              ></textarea>
            </div>

            <button
              type="submit"
              :disabled="saving || !orderForm.student || orderForm.items.length === 0"
              class="w-full rounded-full bg-green-500 px-5 py-3 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ saving ? '送出中...' : '送出訂單' }}
            </button>
          </form>

          <div v-if="orderSubmitted" class="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <p class="text-sm font-semibold text-green-800">訂單已送出！</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { groupOrderAPI, orderAPI, orderItemAPI, restaurantAPI, studentAPI, getBackendBaseURL } from '../services/api'

// 獲取後端基礎 URL（用於圖片顯示）
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || getBackendBaseURL()

const route = useRoute()
const orderLink = route.params.link

const groupOrder = ref(null)
const restaurant = ref(null)
const students = ref([])
const loading = ref(false)
const saving = ref(false)
const orderSubmitted = ref(false)

const orderForm = ref({
  student: '',
  items: [
    { item_name: '', quantity: 1, unit_price: 0 }
  ],
  notes: ''
})

const totalAmount = computed(() => {
  return orderForm.value.items.reduce((sum, item) => {
    return sum + (item.quantity * item.unit_price)
  }, 0)
})

// 檢查團購是否已過期
const isExpired = computed(() => {
  if (!groupOrder.value || !groupOrder.value.deadline) return false
  const deadline = new Date(groupOrder.value.deadline)
  const now = new Date()
  return deadline < now
})

// 檢查團購是否已關閉（包括狀態為 Closed 或 Completed，或已過期）
const isOrderClosed = computed(() => {
  if (!groupOrder.value) return false
  const status = groupOrder.value.status
  return status === 'Closed' || status === 'Completed' || isExpired.value
})

const fetchGroupOrder = async () => {
  try {
    // 根據連結查找團購
    const response = await groupOrderAPI.getAll()
    const data = response.data.results || response.data
    const found = Array.isArray(data) 
      ? data.find(g => g.order_link === orderLink)
      : null
    
    if (!found) {
      alert('找不到這個團購')
      return
    }
    
    groupOrder.value = found
    
    // 獲取店家資訊
    if (found.restaurant) {
      const restaurantResponse = await restaurantAPI.getById(found.restaurant)
      restaurant.value = restaurantResponse.data
    }
  } catch (error) {
    console.error('獲取團購失敗：', error)
    alert('獲取團購資訊失敗')
  }
}

const fetchStudents = async () => {
  try {
    const response = await studentAPI.getAll()
    const data = response.data.results || response.data
    students.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('獲取學生失敗：', error)
    students.value = []
  }
}

const addItem = () => {
  orderForm.value.items.push({ item_name: '', quantity: 1, unit_price: 0 })
}

const removeItem = (index) => {
  if (orderForm.value.items.length > 1) {
    orderForm.value.items.splice(index, 1)
  }
}

const submitOrder = async () => {
  saving.value = true
  try {
    // 創建訂單
    const orderResponse = await orderAPI.create({
      group_order: groupOrder.value.group_order_id,
      student: orderForm.value.student,
      status: 'Pending',
      total_amount: totalAmount.value,
      notes: orderForm.value.notes || null
    })
    
    const orderId = orderResponse.data.order_id
    
    // 創建訂單項目
    for (const item of orderForm.value.items) {
      await orderItemAPI.create({
        order: orderId,
        item_name: item.item_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.quantity * item.unit_price
      })
    }
    
    orderSubmitted.value = true
    
    // 重置表單
    orderForm.value = {
      student: '',
      items: [{ item_name: '', quantity: 1, unit_price: 0 }],
      notes: ''
    }
    
    setTimeout(() => {
      orderSubmitted.value = false
    }, 3000)
  } catch (error) {
    console.error('送出訂單失敗：', error)
    alert('送出訂單失敗，請稍後再試')
  } finally {
    saving.value = false
  }
}

const getImageUrl = (path) => {
  if (!path) return ''
  return `${BACKEND_BASE_URL}/media/${path}`
}

const formatDateTime = (datetime) => {
  if (!datetime) return ''
  const date = new Date(datetime)
  return date.toLocaleString('zh-TW')
}

onMounted(() => {
  loading.value = true
  Promise.all([fetchGroupOrder(), fetchStudents()]).finally(() => {
    loading.value = false
  })
})
</script>

