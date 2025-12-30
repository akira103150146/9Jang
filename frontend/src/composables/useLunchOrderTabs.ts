import { ref, computed, type Ref } from 'vue'

/**
 * Tab 類型
 */
export type LunchOrderTab = 'active' | 'my_orders' | 'history'

/**
 * 團購訂單類型
 */
export interface GroupOrder {
  group_order_id: number
  restaurant_name: string
  title: string
  deadline: string
  created_at: string
  closed_at?: string
  orders_count: number
  total_amount: number
  status: 'Open' | 'Closed' | 'Completed'
  order_link?: string
  [key: string]: unknown
}

/**
 * 個人訂單類型
 */
export interface MyOrder {
  order_id: number
  group_order_title: string
  total_amount: number
  created_at: string
  status: 'Confirmed' | 'Pending' | string
  items: Array<{
    order_item_id: number
    item_name: string
    quantity: number
    subtotal: number
    [key: string]: unknown
  }>
  [key: string]: unknown
}

/**
 * Tab 切換管理 Composable
 */
export function useLunchOrderTabs(
  groupOrders: Ref<GroupOrder[]>,
  myOrders: Ref<MyOrder[]>,
  isStudent: Ref<boolean>
) {
  const activeTab = ref<LunchOrderTab>('active')

  const activeGroupOrders = computed(() => {
    return groupOrders.value.filter(g => g.status === 'Open')
  })

  const completedGroupOrders = computed(() => {
    return groupOrders.value.filter(g => g.status === 'Closed' || g.status === 'Completed')
  })

  const totalOrders = computed(() => {
    return groupOrders.value.reduce((sum, g) => sum + (g.orders_count || 0), 0)
  })

  return {
    activeTab,
    activeGroupOrders,
    completedGroupOrders,
    totalOrders
  }
}

