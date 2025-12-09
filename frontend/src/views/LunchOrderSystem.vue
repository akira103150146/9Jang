<template>
  <div class="space-y-6">
    <header class="rounded-3xl border border-blue-100 bg-gradient-to-r from-white to-orange-50 p-6 shadow-sm">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-semibold text-slate-500">餐飲服務</p>
          <h2 class="text-2xl font-bold text-slate-900">訂便當系統</h2>
          <p class="mt-2 text-sm text-slate-500">管理店家、創建團購、處理訂單</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="showRestaurantForm = true"
            class="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:from-orange-600 hover:to-amber-600"
          >
            + 新增店家
          </button>
          <button
            @click="openGroupOrderForm"
            class="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:from-green-600 hover:to-emerald-600"
          >
            + 創建團購
          </button>
        </div>
      </div>
    </header>

    <!-- 統計卡片 -->
    <section class="grid gap-4 md:grid-cols-3">
      <div class="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">店家總數</p>
        <p class="mt-2 text-3xl font-bold text-slate-900">{{ restaurants.length }}</p>
      </div>
      <div class="rounded-3xl border border-green-100 bg-white p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">進行中團購</p>
        <p class="mt-2 text-3xl font-bold text-green-600">
          {{ groupOrders.filter(g => g.status === 'Open').length }}
        </p>
      </div>
      <div class="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">總訂單數</p>
        <p class="mt-2 text-3xl font-bold text-blue-600">{{ totalOrders }}</p>
      </div>
    </section>

    <!-- 標籤切換 -->
    <div class="flex gap-2 border-b border-slate-200">
      <button
        @click="activeTab = 'active'"
        :class="[
          'px-4 py-2 text-sm font-semibold transition-colors',
          activeTab === 'active'
            ? 'text-green-600 border-b-2 border-green-600'
            : 'text-slate-600 hover:text-slate-900'
        ]"
      >
        進行中 ({{ activeGroupOrders.length }})
      </button>
      <button
        @click="activeTab = 'history'"
        :class="[
          'px-4 py-2 text-sm font-semibold transition-colors',
          activeTab === 'history'
            ? 'text-green-600 border-b-2 border-green-600'
            : 'text-slate-600 hover:text-slate-900'
        ]"
      >
        歷史記錄 ({{ completedGroupOrders.length }})
      </button>
    </div>

    <!-- 進行中的團購 -->
    <section v-if="activeTab === 'active'">
      <h3 class="text-lg font-semibold text-slate-900 mb-4">進行中的團購</h3>
      <div v-if="loading" class="text-center py-12 text-slate-500">載入中...</div>
      <div v-else-if="activeGroupOrders.length === 0" class="rounded-3xl border border-slate-100 bg-white p-12 text-center">
        <p class="text-slate-500">目前沒有進行中的團購</p>
      </div>
      <div v-else class="grid gap-4 md:grid-cols-2">
        <article
          v-for="groupOrder in activeGroupOrders"
          :key="groupOrder.group_order_id"
          class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">
                {{ groupOrder.restaurant_name }}
              </p>
              <h4 class="mt-1 text-lg font-semibold text-slate-900">{{ groupOrder.title }}</h4>
              <p class="mt-2 text-sm text-slate-600">
                截止時間：{{ formatDateTime(groupOrder.deadline) }}
              </p>
              <p class="text-sm text-slate-600">
                訂單數：{{ groupOrder.orders_count }} | 總金額：${{ groupOrder.total_amount }}
              </p>
              <div class="mt-3">
                <label class="block text-xs font-semibold text-slate-700 mb-1">團購連結</label>
                <div class="flex items-center gap-2">
                  <input
                    :value="getOrderLink(groupOrder.order_link)"
                    readonly
                    class="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                  />
                  <button
                    @click="copyLink(groupOrder.order_link)"
                    class="rounded-lg bg-green-500 px-3 py-2 text-xs font-semibold text-white hover:bg-green-600"
                  >
                    複製
                  </button>
                </div>
              </div>
            </div>
            <span class="ml-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
              {{ getStatusDisplay(groupOrder.status) }}
            </span>
          </div>
          <div class="mt-4 flex gap-2">
            <router-link
              :to="`/lunch-orders/${groupOrder.group_order_id}`"
              class="rounded-full bg-blue-500 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600"
            >
              查看訂單
            </router-link>
            <button
              @click="completeGroupOrder(groupOrder.group_order_id)"
              class="rounded-full bg-green-500 px-4 py-2 text-xs font-semibold text-white hover:bg-green-600"
            >
              完成團購
            </button>
          </div>
        </article>
      </div>
    </section>

    <!-- 歷史團購 -->
    <section v-if="activeTab === 'history'">
      <h3 class="text-lg font-semibold text-slate-900 mb-4">歷史團購記錄</h3>
      <div v-if="loading" class="text-center py-12 text-slate-500">載入中...</div>
      <div v-else-if="completedGroupOrders.length === 0" class="rounded-3xl border border-slate-100 bg-white p-12 text-center">
        <p class="text-slate-500">目前沒有歷史團購記錄</p>
      </div>
      <div v-else class="grid gap-4 md:grid-cols-2">
        <article
          v-for="groupOrder in completedGroupOrders"
          :key="groupOrder.group_order_id"
          class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">
                {{ groupOrder.restaurant_name }}
              </p>
              <h4 class="mt-1 text-lg font-semibold text-slate-900">{{ groupOrder.title }}</h4>
              <p class="mt-2 text-sm text-slate-600">
                建立時間：{{ formatDateTime(groupOrder.created_at) }}
              </p>
              <p v-if="groupOrder.closed_at" class="text-sm text-slate-600">
                完成時間：{{ formatDateTime(groupOrder.closed_at) }}
              </p>
              <p class="text-sm text-slate-600">
                訂單數：{{ groupOrder.orders_count }} | 總金額：${{ groupOrder.total_amount }}
              </p>
            </div>
            <span
              :class="[
                'ml-2 rounded-full px-3 py-1 text-xs font-semibold',
                groupOrder.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                groupOrder.status === 'Closed' ? 'bg-gray-50 text-gray-600' :
                'bg-slate-50 text-slate-600'
              ]"
            >
              {{ getStatusDisplay(groupOrder.status) }}
            </span>
          </div>
          <div class="mt-4">
            <router-link
              :to="`/lunch-orders/${groupOrder.group_order_id}`"
              class="rounded-full bg-blue-500 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600 inline-block"
            >
              查看詳情
            </router-link>
          </div>
        </article>
      </div>
    </section>

    <!-- 店家列表 -->
    <section>
      <h3 class="text-lg font-semibold text-slate-900 mb-4">店家管理</h3>
      <div v-if="loading" class="text-center py-12 text-slate-500">載入中...</div>
      <div v-else-if="restaurants.length === 0" class="rounded-3xl border border-slate-100 bg-white p-12 text-center">
        <p class="text-slate-500">目前沒有店家，點擊「新增店家」開始建立</p>
      </div>
      <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="restaurant in restaurants"
          :key="restaurant.restaurant_id"
          class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
        >
          <div class="flex items-start justify-between mb-3">
            <div>
              <h4 class="text-lg font-semibold text-slate-900">{{ restaurant.name }}</h4>
              <p v-if="restaurant.phone" class="text-sm text-slate-600 mt-1">{{ restaurant.phone }}</p>
              <p v-if="restaurant.address" class="text-xs text-slate-500 mt-1">{{ restaurant.address }}</p>
            </div>
            <span
              :class="[
                'rounded-full px-3 py-1 text-xs font-semibold',
                restaurant.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'
              ]"
            >
              {{ restaurant.is_active ? '啟用' : '停用' }}
            </span>
          </div>
          <div v-if="restaurant.menu_image_path" class="mb-3">
            <img
              :src="getImageUrl(restaurant.menu_image_path)"
              alt="菜單"
              class="w-full h-48 object-cover rounded-lg border border-slate-200"
            />
          </div>
          <div class="flex gap-2">
            <button
              @click="editRestaurant(restaurant)"
              class="rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-600"
            >
              編輯
            </button>
            <button
              @click="deleteRestaurant(restaurant.restaurant_id, restaurant.name)"
              class="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white hover:bg-red-600"
            >
              刪除
            </button>
          </div>
        </article>
      </div>
    </section>

    <!-- 新增/編輯店家對話框 -->
    <div
      v-if="showRestaurantForm"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
      @click.self="showRestaurantForm = false"
    >
      <div class="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-slate-900">
            {{ editingRestaurant ? '編輯店家' : '新增店家' }}
          </h3>
          <button @click="closeRestaurantForm" class="text-slate-400 hover:text-slate-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveRestaurant" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">店家名稱 *</label>
            <input
              v-model="restaurantForm.name"
              type="text"
              required
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">電話</label>
            <input
              v-model="restaurantForm.phone"
              type="text"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">地址</label>
            <input
              v-model="restaurantForm.address"
              type="text"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">菜單圖片</label>
            <div class="space-y-3">
              <div v-if="menuImagePreview" class="relative rounded-lg border border-slate-300 overflow-hidden bg-slate-50">
                <img :src="menuImagePreview" alt="菜單預覽" class="w-full max-h-64 object-contain" />
                <button
                  type="button"
                  @click="clearMenuImage"
                  class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <label class="block">
                <input
                  type="file"
                  ref="menuFileInput"
                  @change="handleMenuImageSelect"
                  accept="image/*"
                  class="hidden"
                />
                <div class="w-full rounded-lg border-2 border-dashed border-slate-300 px-4 py-3 text-center cursor-pointer hover:border-orange-500 hover:bg-orange-50">
                  <span class="text-sm font-semibold text-slate-700">選擇菜單圖片</span>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label class="flex items-center gap-2">
              <input
                v-model="restaurantForm.is_active"
                type="checkbox"
                class="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
              />
              <span class="text-sm font-semibold text-slate-700">啟用</span>
            </label>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="closeRestaurantForm"
              class="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {{ saving ? '儲存中...' : '儲存' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 新增團購對話框 -->
    <div
      v-if="showGroupOrderForm"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
      @click.self="showGroupOrderForm = false"
    >
      <div class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-slate-900">創建團購</h3>
          <button @click="showGroupOrderForm = false" class="text-slate-400 hover:text-slate-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="createGroupOrder" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">店家 *</label>
            <select
              v-model="groupOrderForm.restaurant"
              required
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
            >
              <option value="">請選擇店家</option>
              <option
                v-for="restaurant in activeRestaurants"
                :key="restaurant.restaurant_id"
                :value="restaurant.restaurant_id"
              >
                {{ restaurant.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">團購標題 *</label>
            <input
              v-model="groupOrderForm.title"
              type="text"
              required
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
              placeholder="例如：週五午餐團購"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">截止時間 *</label>
            <input
              v-model="groupOrderForm.deadline"
              type="datetime-local"
              required
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
            />
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="showGroupOrderForm = false"
              class="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="rounded-full bg-green-500 px-5 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50"
            >
              {{ saving ? '建立中...' : '建立' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { restaurantAPI, groupOrderAPI, uploadImageAPI } from '../services/api'

const restaurants = ref([])
const groupOrders = ref([])
const loading = ref(false)
const saving = ref(false)
const showRestaurantForm = ref(false)
const showGroupOrderForm = ref(false)
const editingRestaurant = ref(null)
const menuImagePreview = ref('')
const menuFileInput = ref(null)
const activeTab = ref('active')

const restaurantForm = ref({
  name: '',
  phone: '',
  address: '',
  menu_image_path: '',
  is_active: true
})

const groupOrderForm = ref({
  restaurant: '',
  title: '',
  deadline: ''
})

const activeRestaurants = computed(() => {
  return restaurants.value.filter(r => r.is_active)
})

const activeGroupOrders = computed(() => {
  return groupOrders.value.filter(g => g.status === 'Open')
})

const completedGroupOrders = computed(() => {
  return groupOrders.value.filter(g => g.status === 'Closed' || g.status === 'Completed')
})

const totalOrders = computed(() => {
  return groupOrders.value.reduce((sum, g) => sum + (g.orders_count || 0), 0)
})

const fetchRestaurants = async () => {
  try {
    const response = await restaurantAPI.getAll()
    const data = response.data.results || response.data
    restaurants.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('獲取店家失敗：', error)
    restaurants.value = []
  }
}

const fetchGroupOrders = async () => {
  try {
    const response = await groupOrderAPI.getAll()
    const data = response.data.results || response.data
    groupOrders.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('獲取團購失敗：', error)
    groupOrders.value = []
  }
}

const handleMenuImageSelect = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    alert('請選擇圖片文件')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('圖片文件大小不能超過 5MB')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    menuImagePreview.value = e.target.result
  }
  reader.readAsDataURL(file)

  try {
    const response = await uploadImageAPI.upload(file)
    restaurantForm.value.menu_image_path = response.data.image_path
    if (response.data.image_url) {
      menuImagePreview.value = `http://localhost:8000${response.data.image_url}`
    }
  } catch (error) {
    console.error('上傳圖片失敗：', error)
    alert('上傳圖片失敗')
  }
}

const clearMenuImage = () => {
  menuImagePreview.value = ''
  restaurantForm.value.menu_image_path = ''
  if (menuFileInput.value) menuFileInput.value.value = ''
}

const editRestaurant = (restaurant) => {
  editingRestaurant.value = restaurant
  restaurantForm.value = {
    name: restaurant.name,
    phone: restaurant.phone || '',
    address: restaurant.address || '',
    menu_image_path: restaurant.menu_image_path || '',
    is_active: restaurant.is_active
  }
  if (restaurant.menu_image_path) {
    menuImagePreview.value = getImageUrl(restaurant.menu_image_path)
  }
  showRestaurantForm.value = true
}

const closeRestaurantForm = () => {
  showRestaurantForm.value = false
  editingRestaurant.value = null
  restaurantForm.value = {
    name: '',
    phone: '',
    address: '',
    menu_image_path: '',
    is_active: true
  }
  menuImagePreview.value = ''
}

const saveRestaurant = async () => {
  saving.value = true
  try {
    if (editingRestaurant.value) {
      await restaurantAPI.update(editingRestaurant.value.restaurant_id, restaurantForm.value)
    } else {
      await restaurantAPI.create(restaurantForm.value)
    }
    closeRestaurantForm()
    fetchRestaurants()
  } catch (error) {
    console.error('儲存店家失敗：', error)
    alert('儲存失敗，請稍後再試')
  } finally {
    saving.value = false
  }
}

const deleteRestaurant = async (id, name) => {
  if (!confirm(`確定要刪除店家「${name}」嗎？`)) return
  
  try {
    await restaurantAPI.delete(id)
    fetchRestaurants()
  } catch (error) {
    console.error('刪除店家失敗：', error)
    alert('刪除失敗，請稍後再試')
  }
}

const openGroupOrderForm = () => {
  // 計算兩個小時後的時間
  const now = new Date()
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000)
  
  // 轉換為 datetime-local 格式 (YYYY-MM-DDTHH:mm)
  const year = twoHoursLater.getFullYear()
  const month = String(twoHoursLater.getMonth() + 1).padStart(2, '0')
  const day = String(twoHoursLater.getDate()).padStart(2, '0')
  const hours = String(twoHoursLater.getHours()).padStart(2, '0')
  const minutes = String(twoHoursLater.getMinutes()).padStart(2, '0')
  
  const deadline = `${year}-${month}-${day}T${hours}:${minutes}`
  
  groupOrderForm.value = {
    restaurant: '',
    title: '',
    deadline: deadline
  }
  showGroupOrderForm.value = true
}

const createGroupOrder = async () => {
  saving.value = true
  try {
    await groupOrderAPI.create({
      restaurant: groupOrderForm.value.restaurant,
      title: groupOrderForm.value.title,
      deadline: groupOrderForm.value.deadline,
      status: 'Open'
    })
    showGroupOrderForm.value = false
    groupOrderForm.value = {
      restaurant: '',
      title: '',
      deadline: ''
    }
    fetchGroupOrders()
    alert('團購已建立！連結已自動生成。')
  } catch (error) {
    console.error('創建團購失敗：', error)
    alert('創建失敗，請稍後再試')
  } finally {
    saving.value = false
  }
}

const completeGroupOrder = async (id) => {
  if (!confirm('確定要完成這個團購嗎？完成後將自動為所有訂單生成費用。')) return
  
  try {
    const response = await groupOrderAPI.complete(id)
    fetchGroupOrders()
    const feesCreated = response.data.fees_created || 0
    if (feesCreated > 0) {
      alert(`團購已完成！已自動生成 ${feesCreated} 筆餐費記錄。\n請前往「費用追蹤」頁面查看。`)
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
      alert('操作失敗，請稍後再試')
    }
  }
}

const getOrderLink = (link) => {
  return `${window.location.origin}/lunch-orders/join/${link}`
}

const copyLink = (link) => {
  const fullLink = getOrderLink(link)
  navigator.clipboard.writeText(fullLink).then(() => {
    alert('連結已複製到剪貼簿')
  }).catch(() => {
    alert('複製失敗，請手動複製')
  })
}

const getImageUrl = (path) => {
  if (!path) return ''
  return `http://localhost:8000/media/${path}`
}

const formatDateTime = (datetime) => {
  if (!datetime) return ''
  const date = new Date(datetime)
  return date.toLocaleString('zh-TW')
}

const getStatusDisplay = (status) => {
  const map = {
    'Open': '進行中',
    'Closed': '已結束',
    'Completed': '已完成'
  }
  return map[status] || status
}

onMounted(() => {
  loading.value = true
  Promise.all([fetchRestaurants(), fetchGroupOrders()]).finally(() => {
    loading.value = false
  })
})
</script>

