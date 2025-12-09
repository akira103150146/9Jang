<template>
  <div class="space-y-6">
    <header class="rounded-3xl border border-blue-100 bg-gradient-to-r from-white to-green-50 p-6 shadow-sm">
      <div class="flex items-center gap-4">
        <router-link
          to="/lunch-orders"
          class="text-slate-400 hover:text-slate-600"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </router-link>
        <div>
          <h2 class="text-2xl font-bold text-slate-900">{{ groupOrder?.title || '載入中...' }}</h2>
          <p class="mt-1 text-sm text-slate-500">{{ groupOrder?.restaurant_name }}</p>
        </div>
      </div>
    </header>

    <div v-if="loading" class="text-center py-12 text-slate-500">載入中...</div>
    
    <div v-else-if="groupOrder" class="space-y-6">
      <!-- 團購資訊 -->
      <div class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div class="grid gap-4 md:grid-cols-3">
          <div>
            <p class="text-xs font-semibold text-slate-500">截止時間</p>
            <p class="mt-1 text-lg font-semibold text-slate-900">{{ formatDateTime(groupOrder.deadline) }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-slate-500">訂單數</p>
            <p class="mt-1 text-lg font-semibold text-slate-900">{{ groupOrder.orders_count }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-slate-500">總金額</p>
            <p class="mt-1 text-lg font-semibold text-green-600">${{ groupOrder.total_amount }}</p>
          </div>
        </div>
        
        <div v-if="groupOrder.status === 'Open'" class="mt-4 flex gap-3">
          <button
            @click="completeGroupOrder"
            class="rounded-full bg-green-500 px-5 py-2 text-sm font-semibold text-white hover:bg-green-600"
          >
            完成團購
          </button>
        </div>
      </div>

      <!-- 訂單列表 -->
      <div>
        <h3 class="text-lg font-semibold text-slate-900 mb-4">訂單列表</h3>
        <div v-if="orders.length === 0" class="rounded-3xl border border-slate-100 bg-white p-12 text-center">
          <p class="text-slate-500">目前還沒有訂單</p>
        </div>
        <div v-else class="space-y-4">
          <article
            v-for="order in orders"
            :key="order.order_id"
            class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div class="flex items-start justify-between mb-3">
              <div>
                <h4 class="text-lg font-semibold text-slate-900">{{ order.student_name }}</h4>
                <p class="text-sm text-slate-600 mt-1">訂單時間：{{ formatDateTime(order.created_at) }}</p>
              </div>
              <div class="text-right">
                <p class="text-lg font-semibold text-slate-900">${{ order.total_amount }}</p>
                <span
                  :class="[
                    'mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold',
                    order.status === 'Confirmed' ? 'bg-green-50 text-green-600' :
                    order.status === 'Pending' ? 'bg-yellow-50 text-yellow-600' :
                    'bg-gray-50 text-gray-600'
                  ]"
                >
                  {{ getOrderStatusDisplay(order.status) }}
                </span>
              </div>
            </div>
            
            <div v-if="order.items && order.items.length > 0" class="mt-3 space-y-2">
              <div
                v-for="item in order.items"
                :key="item.order_item_id"
                class="flex items-center justify-between text-sm bg-slate-50 rounded-lg px-3 py-2"
              >
                <div class="flex-1">
                  <span class="font-semibold text-slate-900">{{ item.item_name }}</span>
                  <div class="flex items-center gap-3 mt-1 text-xs text-slate-600">
                    <span>數量：<strong class="text-slate-700">{{ item.quantity }}</strong></span>
                    <span>單價：<strong class="text-slate-700">${{ item.unit_price }}</strong></span>
                  </div>
                </div>
                <div class="text-right">
                  <span class="text-xs text-slate-500 block">小計</span>
                  <span class="font-semibold text-slate-900">${{ item.subtotal }}</span>
                </div>
              </div>
            </div>
            
            <div v-if="order.notes" class="mt-3 text-sm text-slate-600">
              <span class="font-semibold">備註：</span>{{ order.notes }}
            </div>

            <div class="mt-4 flex gap-2">
              <button
                v-if="order.status === 'Pending'"
                @click="confirmOrder(order.order_id)"
                class="rounded-full bg-green-500 px-4 py-2 text-xs font-semibold text-white hover:bg-green-600"
              >
                確認訂單
              </button>
              <button
                @click="deleteOrder(order.order_id, order.student_name)"
                class="rounded-full bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600"
              >
                刪除
              </button>
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { groupOrderAPI, orderAPI } from '../services/api'

const route = useRoute()
const groupOrderId = parseInt(route.params.id)

const groupOrder = ref(null)
const orders = ref([])
const loading = ref(false)

const fetchGroupOrder = async () => {
  try {
    const response = await groupOrderAPI.getById(groupOrderId)
    groupOrder.value = response.data
  } catch (error) {
    console.error('獲取團購失敗：', error)
    alert('獲取團購資訊失敗')
  }
}

const fetchOrders = async () => {
  try {
    const response = await orderAPI.getAll(groupOrderId)
    const data = response.data.results || response.data
    orders.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('獲取訂單失敗：', error)
    orders.value = []
  }
}

const confirmOrder = async (orderId) => {
  try {
    // 先獲取完整訂單數據
    const orderResponse = await orderAPI.getById(orderId)
    const order = orderResponse.data
    
    // 更新時包含所有必要字段
    await orderAPI.update(orderId, {
      group_order: order.group_order,
      student: order.student,
      status: 'Confirmed',
      total_amount: order.total_amount,
      notes: order.notes || null
    })
    fetchOrders()
    fetchGroupOrder()
  } catch (error) {
    console.error('確認訂單失敗：', error)
    if (error.response?.data) {
      const errorMsg = typeof error.response.data === 'string' 
        ? error.response.data 
        : JSON.stringify(error.response.data)
      alert(`確認失敗：${errorMsg}`)
    } else {
      alert('確認失敗')
    }
  }
}

const deleteOrder = async (orderId, studentName) => {
  if (!confirm(`確定要刪除 ${studentName} 的訂單嗎？`)) return
  
  try {
    await orderAPI.delete(orderId)
    fetchOrders()
    fetchGroupOrder()
  } catch (error) {
    console.error('刪除訂單失敗：', error)
    alert('刪除失敗')
  }
}

const completeGroupOrder = async () => {
  if (!confirm('確定要完成這個團購嗎？完成後將自動為所有訂單生成費用。')) return
  
  try {
    const response = await groupOrderAPI.complete(groupOrderId)
    fetchGroupOrder()
    const feesCreated = response.data.fees_created || 0
    if (feesCreated > 0) {
      alert(`團購已完成！已自動生成 ${feesCreated} 筆餐費記錄。\n請前往「學生資訊」頁面查看各學生的費用記錄。`)
    } else {
      alert('團購已完成！\n（沒有生成新的費用記錄，可能已存在或沒有訂單）')
    }
  } catch (error) {
    console.error('完成團購失敗：', error)
    if (error.response?.data) {
      const errorMsg = typeof error.response.data === 'string' 
        ? error.response.data 
        : JSON.stringify(error.response.data)
      alert(`操作失敗：${errorMsg}`)
    } else {
      alert('操作失敗')
    }
  }
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
  Promise.all([fetchGroupOrder(), fetchOrders()]).finally(() => {
    loading.value = false
  })
})
</script>

