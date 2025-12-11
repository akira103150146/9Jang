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
              <div v-if="students.length > 0">
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
              <div v-else class="py-2 px-3 bg-slate-50 rounded-lg text-slate-700 font-medium">
                 {{ orderForm.student ? '當前學生（已自動選定）' : '載入中...' }}
              </div>
            </div>

            <!-- 推薦與隨機選餐區塊 -->
            <div class="bg-amber-50 rounded-xl p-4 border border-amber-100 space-y-3">
                <div class="flex items-center justify-between">
                    <h4 class="font-bold text-amber-800 text-sm flex items-center gap-2">
                        <span class="text-lg">🍱</span> 
                        我有選擇困難
                    </h4>
                    <button 
                        type="button"
                        @click="randomChoose"
                        class="text-xs bg-white text-amber-600 px-3 py-1.5 rounded-full border border-amber-200 font-semibold hover:bg-amber-100 transition shadow-sm flex items-center gap-1"
                    >
                        <span>🎲</span>
                        幫我抽一個
                    </button>
                </div>
                <div class="space-y-1">
                    <label class="text-xs font-semibold text-amber-800">請輸入可選品項（以逗號或空白分隔）</label>
                    <textarea
                        v-model="customChoiceInput"
                        rows="2"
                        class="w-full rounded-lg border border-amber-200 bg-white/70 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
                        placeholder="例如：雞腿便當, 排骨飯, 三色豆, 滷肉飯"
                    ></textarea>
                    <p class="text-[11px] text-amber-700">未輸入時將改用常點推薦（若有資料）</p>
                </div>
                <div v-if="showRecommendation && frequentItems.length" class="flex flex-wrap gap-2">
                    <span class="text-[11px] text-amber-700 font-semibold mr-1">常點推薦：</span>
                    <button 
                        v-for="item in frequentItems" 
                        :key="item"
                        type="button"
                        @click="() => {
                            if(orderForm.items.length > 0) orderForm.items[0].item_name = item
                            else orderForm.items.push({item_name: item, quantity: 1, unit_price: 0})
                        }"
                        class="text-xs bg-white text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-amber-400 hover:text-amber-700 transition"
                    >
                        {{ item }}
                    </button>
                </div>
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

          <!-- 目前訂單列表（即時更新） -->
          <div class="mt-6 pt-4 border-t border-slate-100">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-sm font-semibold text-slate-900">目前訂單</h4>
              <span class="text-xs text-slate-500">每 10 秒自動更新</span>
            </div>
            <div v-if="orders.length === 0" class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              還沒有任何訂單
            </div>
            <div v-else class="space-y-3 max-h-64 overflow-y-auto">
              <article
                v-for="order in orders"
                :key="order.order_id"
                class="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm"
              >
                <div class="flex items-start justify-between">
                  <div>
                    <p class="text-sm font-semibold text-slate-900">{{ order.student_name }}</p>
                    <p class="text-xs text-slate-500 mt-0.5">訂單時間：{{ formatDateTime(order.created_at) }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-semibold text-slate-900">${{ order.total_amount }}</p>
                    <span
                      :class="[
                        'mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold',
                        order.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' :
                        order.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                        'bg-slate-50 text-slate-600'
                      ]"
                    >
                      {{ getOrderStatusDisplay(order.status) }}
                    </span>
                  </div>
                </div>
                <div v-if="order.items && order.items.length" class="mt-2 space-y-1">
                  <div
                    v-for="item in order.items"
                    :key="item.order_item_id"
                    class="flex items-center justify-between text-xs bg-slate-50 rounded-lg px-3 py-1.5"
                  >
                    <span class="font-semibold text-slate-800">{{ item.item_name }}</span>
                    <div class="flex items-center gap-2 text-slate-600">
                      <span>數量：{{ item.quantity }}</span>
                      <span>小計：${{ item.subtotal }}</span>
                    </div>
                  </div>
                </div>
                <div v-else class="mt-2 text-xs text-slate-500">
                  無項目資料
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { groupOrderAPI, orderAPI, orderItemAPI, restaurantAPI, studentAPI, getBackendBaseURL, authAPI } from '../services/api'

// 獲取後端基礎 URL（用於圖片顯示）
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || getBackendBaseURL()

const route = useRoute()
const router = useRouter()
const orderLink = route.params.link

const groupOrder = ref(null)
const restaurant = ref(null)
const students = ref([])
const loading = ref(false)
const saving = ref(false)
const orderSubmitted = ref(false)
const customChoiceInput = ref('')
const orders = ref([])
const isStudent = ref(false)
let ordersTimer = null

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

const currentGroupOrderId = computed(() => groupOrder.value?.group_order_id || null)

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
    
    // 獲取當前用戶信息以判斷是否需要自動代入學生
    const userResponse = await authAPI.getCurrentUser()
    const currentUser = userResponse.data
    isStudent.value = currentUser.role === 'STUDENT'
    
    // 如果是學生，自動鎖定選擇
    if (isStudent.value && currentUser.student_id) {
      orderForm.value.student = currentUser.student_id
      // 如果是學生，不顯示下拉選單，而是顯示固定文字
    } else {
      // 只有管理員、會計或老師可以選擇學生
      if (['ADMIN', 'ACCOUNTANT', 'TEACHER'].includes(currentUser.role)) {
        await fetchStudents()
      }
    }
    
    // 如果已確定學生，加載其訂購歷史
    if (orderForm.value.student) {
      // await fetchStudentHistory(orderForm.value.student)
      // 暫時 Mock 一些數據用於展示功能，待後端 API 支援訂單項目查詢後再接上
      frequentItems.value = ['雞腿便當', '排骨飯', '魚排便當', '招牌飯']
      showRecommendation.value = true
    }
    
    // 初次載入訂單
    await fetchOrders()
    
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
    // 只有管理員等角色有權限獲取學生列表，如果是學生角色調用失敗是預期的
    // console.error('獲取學生失敗：', error)
    students.value = []
  }
}

// 學生最常訂購品項
const frequentItems = ref([])
const showRecommendation = ref(false)

const fetchStudentHistory = async (studentId) => {
  try {
    // 獲取該學生的歷史訂單
    const response = await orderAPI.getAll(null, studentId)
    const orders = response.data.results || response.data
    
    if (!Array.isArray(orders) || orders.length === 0) return
    
    // 統計品項頻率
    const itemCounts = {}
    
    // 我們需要獲取每個訂單的詳細項目
    // 這裡為了效能，我們只取最近的 10 筆訂單
    const recentOrders = orders.slice(0, 10)
    
    // 由於 orderAPI.getAll 返回的訂單可能不包含詳細項目，我們可能需要逐個獲取
    // 或者如果後端已經提供了 items 欄位，可以直接使用
    // 假設後端沒有提供 items，我們需要另外查詢。這裡簡化邏輯，假設後端返回的 orders 包含 items 或我們跳過這步
    // 如果無法獲取 items，則無法推薦。
    
    // 暫時無法獲取歷史訂單項目，因為 API 可能不支援一次獲取所有項目
    // 這裡做一個假設性的實現，如果 orders 裡有 items
    /*
    recentOrders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                const name = item.item_name
                itemCounts[name] = (itemCounts[name] || 0) + 1
            })
        }
    })
    
    // 排序
    frequentItems.value = Object.entries(itemCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5) // 取前 5 名
        .map(entry => entry[0])
        
    if (frequentItems.value.length > 0) {
        showRecommendation.value = true
    }
    */
  } catch (error) {
    console.error('獲取歷史訂單失敗', error)
  }
}

const fetchOrders = async () => {
  if (!currentGroupOrderId.value) return
  try {
    const response = await orderAPI.getAll(currentGroupOrderId.value)
    const data = response.data.results || response.data
    orders.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('取得訂單列表失敗', error)
    orders.value = []
  }
}

const randomChoose = () => {
  // 先使用使用者輸入的品項，若無則退回常點推薦
  let pool = []
  if (customChoiceInput.value.trim()) {
    // 支援逗號、換行、空白分隔
    pool = customChoiceInput.value
      .split(/[,\\n\\s]+/)
      .map(s => s.trim())
      .filter(Boolean)
  } else if (frequentItems.value.length > 0) {
    pool = [...frequentItems.value]
  }

  if (pool.length === 0) {
    alert('請先輸入至少一個可選品項，或等待推薦產生。')
    return
  }

  const randomIndex = Math.floor(Math.random() * pool.length)
  const chosenItem = pool[randomIndex]
  
  if (orderForm.value.items.length > 0) {
    orderForm.value.items[0].item_name = chosenItem
  } else {
    orderForm.value.items.push({ item_name: chosenItem, quantity: 1, unit_price: 0 })
  }
  alert(`命運為你選擇了：${chosenItem}`)
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
    await fetchOrders()

    // 若為學生，提交後返回學生首頁
    if (isStudent.value) {
      alert('訂單已送出！即將返回學生首頁。')
      router.push('/student-home')
      return
    }
    
    // 重置表單（非學生）
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

const getOrderStatusDisplay = (status) => {
  const map = {
    'Pending': '待確認',
    'Confirmed': '已確認',
    'Cancelled': '已取消'
  }
  return map[status] || status
}

onMounted(() => {
  loading.value = true
  Promise.all([fetchGroupOrder(), fetchStudents()]).finally(() => {
    loading.value = false
  })

  // 訂單輪詢（即時更新）
  ordersTimer = setInterval(fetchOrders, 10000)
})

onUnmounted(() => {
  if (ordersTimer) {
    clearInterval(ordersTimer)
  }
})
</script>

