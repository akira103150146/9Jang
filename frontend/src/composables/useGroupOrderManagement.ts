import { ref, computed, type Ref } from 'vue'
import { groupOrderAPI, orderAPI } from '../services/api'
import type { GroupOrder, MyOrder } from './useLunchOrderTabs'

/**
 * 團購表單數據類型
 */
export interface GroupOrderFormData {
  restaurant: string
  title: string
  deadline: string
}

/**
 * 團購管理 Composable
 */
export function useGroupOrderManagement(
  restaurants: Ref<Array<{ restaurant_id: number; name: string; [key: string]: unknown }>>,
  userRole: Ref<string>,
  studentId: Ref<number | null>
) {
  const groupOrders = ref<GroupOrder[]>([])
  const myOrders = ref<MyOrder[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const showGroupOrderForm = ref(false)
  const groupOrderForm = ref<GroupOrderFormData>({
    restaurant: '',
    title: '',
    deadline: ''
  })
  const autoGroupOrderTitle = ref('')

  const activeGroupOrders = computed(() => {
    return groupOrders.value.filter(g => g.status === 'Open')
  })

  const completedGroupOrders = computed(() => {
    return groupOrders.value.filter(g => g.status === 'Closed' || g.status === 'Completed')
  })

  const totalOrders = computed(() => {
    return groupOrders.value.reduce((sum, g) => sum + (g.orders_count || 0), 0)
  })

  const canCompleteGroup = computed(() => {
    return ['ADMIN', 'ACCOUNTANT', 'TEACHER'].includes(userRole.value)
  })

  const selectedRestaurantName = computed(() => {
    const selectedId = groupOrderForm.value.restaurant
    if (!selectedId) return ''
    const restaurant = restaurants.value.find(r => r.restaurant_id === parseInt(selectedId))
    return restaurant?.name || ''
  })

  /**
   * 獲取團購列表
   */
  const fetchGroupOrders = async (): Promise<void> => {
    try {
      const response = await groupOrderAPI.getAll()
      const data = response.data.results || response.data
      groupOrders.value = Array.isArray(data) ? data : []
    } catch (error) {
      console.error('獲取團購失敗：', error)
      groupOrders.value = []
    }
  }

  /**
   * 獲取個人訂單
   */
  const fetchMyOrders = async (): Promise<void> => {
    if (!studentId.value) return
    try {
      const response = await orderAPI.getAll(null, studentId.value)
      const data = response.data.results || response.data
      myOrders.value = Array.isArray(data) ? data : []
    } catch (error) {
      console.error('獲取個人訂單失敗：', error)
      myOrders.value = []
    }
  }

  /**
   * 打開創建團購表單
   */
  const openGroupOrderForm = (): void => {
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
    autoGroupOrderTitle.value = ''
    showGroupOrderForm.value = true
  }

  /**
   * 關閉創建團購表單
   */
  const closeGroupOrderForm = (): void => {
    showGroupOrderForm.value = false
    groupOrderForm.value = {
      restaurant: '',
      title: '',
      deadline: ''
    }
    autoGroupOrderTitle.value = ''
  }

  /**
   * 創建團購
   */
  const createGroupOrder = async (): Promise<void> => {
    saving.value = true
    try {
      await groupOrderAPI.create({
        restaurant: groupOrderForm.value.restaurant,
        title: groupOrderForm.value.title,
        deadline: groupOrderForm.value.deadline,
        status: 'Open'
      })
      closeGroupOrderForm()
      await fetchGroupOrders()
      alert('團購已建立！連結已自動生成。')
    } catch (error) {
      console.error('創建團購失敗：', error)
      alert('創建失敗，請稍後再試')
    } finally {
      saving.value = false
    }
  }

  /**
   * 完成團購
   */
  const completeGroupOrder = async (id: number): Promise<void> => {
    if (!canCompleteGroup.value) {
      alert('只有管理者或會計可以完成團購')
      return
    }
    if (!confirm('確定要完成這個團購嗎？完成後將自動為所有訂單生成費用。')) return
    
    try {
      const response = await groupOrderAPI.complete(id)
      await fetchGroupOrders()
      const feesCreated = response.data.fees_created || 0
      if (feesCreated > 0) {
        alert(`團購已完成！已自動生成 ${feesCreated} 筆餐費記錄。\n請前往「學生資訊」頁面查看各學生的費用記錄。`)
      } else {
        alert('團購已完成！\n（沒有生成新的費用記錄，可能已存在或沒有訂單）')
      }
    } catch (error) {
      console.error('完成團購失敗：', error)
      const err = error as { response?: { data?: unknown } }
      if (err.response?.data) {
        const errorData = err.response.data
        const errorMsg = typeof errorData === 'string' 
          ? errorData 
          : JSON.stringify(errorData)
        alert(`操作失敗：${errorMsg}`)
      } else {
        alert('操作失敗，請稍後再試')
      }
    }
  }

  /**
   * 獲取訂單連結
   */
  const getOrderLink = (link: string): string => {
    return `${window.location.origin}/lunch-orders/join/${link}`
  }

  /**
   * 複製連結
   */
  const copyLink = (link: string): void => {
    const fullLink = getOrderLink(link)
    navigator.clipboard.writeText(fullLink).then(() => {
      alert('連結已複製到剪貼簿')
    }).catch(() => {
      alert('複製失敗，請手動複製')
    })
  }

  /**
   * 更新團購標題（當選擇店家時自動填充）
   */
  const updateGroupOrderTitle = (): void => {
    const name = selectedRestaurantName.value
    if (!name) return

    // 僅在使用者尚未手動輸入標題時，才自動帶入店家名稱
    if (!groupOrderForm.value.title || groupOrderForm.value.title === autoGroupOrderTitle.value) {
      groupOrderForm.value.title = name
      autoGroupOrderTitle.value = name
    }
  }

  return {
    // 狀態
    groupOrders,
    myOrders,
    loading,
    saving,
    showGroupOrderForm,
    groupOrderForm,
    autoGroupOrderTitle,
    activeGroupOrders,
    completedGroupOrders,
    totalOrders,
    canCompleteGroup,
    selectedRestaurantName,
    
    // 方法
    fetchGroupOrders,
    fetchMyOrders,
    openGroupOrderForm,
    closeGroupOrderForm,
    createGroupOrder,
    completeGroupOrder,
    getOrderLink,
    copyLink,
    updateGroupOrderTitle
  }
}

