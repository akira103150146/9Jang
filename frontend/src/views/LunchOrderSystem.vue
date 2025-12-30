<template>
  <div class="space-y-6">
    <header class="rounded-3xl border border-blue-100 bg-gradient-to-r from-white to-orange-50 p-6 shadow-sm">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div class="flex items-center gap-4">
          <button @click="$router.go(-1)" class="text-slate-400 hover:text-slate-600">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <p class="text-sm font-semibold text-slate-500">餐飲服務</p>
            <h2 class="text-2xl font-bold text-slate-900">訂便當系統</h2>
            <p class="mt-2 text-sm text-slate-500">管理店家、創建團購、處理訂單</p>
          </div>
        </div>
        <div class="flex gap-3" v-if="!isStudent">
          <button
            @click="openRestaurantForm"
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
    <section class="grid gap-4 md:grid-cols-3" v-if="!isStudent">
      <div class="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">店家總數</p>
        <p class="mt-2 text-3xl font-bold text-slate-900">{{ restaurants.length }}</p>
      </div>
      <div class="rounded-3xl border border-green-100 bg-white p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">進行中團購</p>
        <p class="mt-2 text-3xl font-bold text-green-600">
          {{ activeGroupOrders.length }}
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
        v-if="isStudent"
        @click="activeTab = 'my_orders'"
        :class="[
          'px-4 py-2 text-sm font-semibold transition-colors',
          activeTab === 'my_orders'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-slate-600 hover:text-slate-900'
        ]"
      >
        我的訂單 ({{ myOrders.length }})
      </button>
      <button
        @click="activeTab = 'history'"
        :class="[
          'px-4 py-2 text-sm font-semibold transition-colors',
          activeTab === 'history'
            ? 'text-gray-600 border-b-2 border-gray-600'
            : 'text-slate-600 hover:text-slate-900'
        ]"
      >
        歷史團購 ({{ completedGroupOrders.length }})
      </button>
    </div>

    <!-- 進行中的團購 -->
    <ActiveGroupOrders
      v-if="activeTab === 'active'"
      :active-group-orders="activeGroupOrders"
      :loading="loading"
      :can-complete-group="canCompleteGroup"
      @copy-link="copyLink"
      @complete="completeGroupOrder"
    />

    <!-- 我的訂單 (學生專用) -->
    <MyOrdersTab
      v-if="activeTab === 'my_orders' && isStudent"
      :my-orders="myOrders"
      :loading="loading"
    />

    <!-- 歷史團購 -->
    <HistoryGroupOrders
      v-if="activeTab === 'history'"
      :completed-group-orders="completedGroupOrders"
      :loading="loading"
    />

    <!-- 店家列表 -->
    <RestaurantList
      v-if="!isStudent"
      :restaurants="restaurants"
      :loading="loading"
      :get-image-url="getImageUrl"
      @edit="editRestaurant"
      @delete="deleteRestaurant"
    />

    <!-- 新增/編輯店家對話框 -->
    <RestaurantFormModal
      :is-open="showRestaurantForm"
      v-model:restaurant-form="restaurantForm"
      :editing-restaurant="editingRestaurant"
      :menu-image-preview="menuImagePreview"
      :saving="saving"
      @close="closeRestaurantForm"
      @save="saveRestaurant"
      @image-select="handleMenuImageSelect"
      @clear-image="clearMenuImage"
    />

    <!-- 新增團購對話框 -->
    <GroupOrderFormModal
      :is-open="showGroupOrderForm"
      v-model:group-order-form="groupOrderForm"
      :active-restaurants="activeRestaurants"
      :saving="saving"
      @close="closeGroupOrderForm"
      @save="createGroupOrder"
      @restaurant-change="updateGroupOrderTitle"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { authAPI } from '../services/api'
import { useLunchOrderTabs } from '../composables/useLunchOrderTabs'
import { useRestaurantManagement } from '../composables/useRestaurantManagement'
import { useGroupOrderManagement } from '../composables/useGroupOrderManagement'

// Components
import ActiveGroupOrders from '../components/lunch-order/ActiveGroupOrders.vue'
import MyOrdersTab from '../components/lunch-order/MyOrdersTab.vue'
import HistoryGroupOrders from '../components/lunch-order/HistoryGroupOrders.vue'
import RestaurantList from '../components/lunch-order/RestaurantList.vue'
import RestaurantFormModal from '../components/lunch-order/RestaurantFormModal.vue'
import GroupOrderFormModal from '../components/lunch-order/GroupOrderFormModal.vue'

const isStudent = ref(false)
const userRole = ref('')
const studentId = ref<number | null>(null)
const loading = ref(false)

// 使用 composables
const restaurantComposable = useRestaurantManagement()
const groupOrderComposable = useGroupOrderManagement(
  restaurantComposable.restaurants,
  userRole,
  studentId
)
const tabsComposable = useLunchOrderTabs(
  groupOrderComposable.groupOrders,
  groupOrderComposable.myOrders,
  isStudent
)

// 從 composables 提取狀態和方法
const {
  restaurants,
  saving: savingRestaurant,
  showRestaurantForm,
  editingRestaurant,
  menuImagePreview,
  menuFileInput,
  restaurantForm,
  activeRestaurants,
  fetchRestaurants,
  openRestaurantForm,
  editRestaurant,
  closeRestaurantForm,
  handleMenuImageSelect,
  clearMenuImage,
  saveRestaurant,
  deleteRestaurant,
  getImageUrl
} = restaurantComposable

const {
  groupOrders,
  myOrders,
  saving: savingGroupOrder,
  showGroupOrderForm,
  groupOrderForm,
  activeGroupOrders,
  completedGroupOrders,
  totalOrders,
  canCompleteGroup,
  fetchGroupOrders,
  fetchMyOrders,
  openGroupOrderForm,
  closeGroupOrderForm,
  createGroupOrder,
  completeGroupOrder,
  copyLink,
  updateGroupOrderTitle
} = groupOrderComposable

const {
  activeTab
} = tabsComposable

// 合併 saving 狀態
const saving = computed(() => savingRestaurant.value || savingGroupOrder.value)

// 合併 loading 狀態
const updateLoading = async (fn: () => Promise<void>) => {
  loading.value = true
  try {
    await fn()
  } finally {
    loading.value = false
  }
}

// 監聽店家選擇變化，自動更新團購標題
watch(
  () => groupOrderForm.value.restaurant,
  () => {
    updateGroupOrderTitle()
  }
)

onMounted(async () => {
  loading.value = true
  
  try {
    const user = await authAPI.getCurrentUser()
    const userData = user.data
    userRole.value = userData.role || ''
    if (userData.role === 'STUDENT') {
      isStudent.value = true
      studentId.value = userData.student_id || null
      if (studentId.value) {
        await fetchMyOrders()
      }
    }
  } catch (e) {
    console.error('獲取用戶角色失敗', e)
  }

  await Promise.all([
    fetchRestaurants(),
    fetchGroupOrders()
  ])
  
  loading.value = false
})
</script>
