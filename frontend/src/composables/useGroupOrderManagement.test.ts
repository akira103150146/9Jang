import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { useGroupOrderManagement } from './useGroupOrderManagement'
import { groupOrderAPI, orderAPI } from '../services/api'

// Mock APIs
vi.mock('../services/api', () => ({
  groupOrderAPI: {
    getAll: vi.fn(),
    create: vi.fn(),
    complete: vi.fn()
  },
  orderAPI: {
    getAll: vi.fn()
  }
}))

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined)
  }
})

describe('useGroupOrderManagement', () => {
  let restaurants: ReturnType<typeof ref<Array<{ restaurant_id: number; name: string }>>>
  let userRole: ReturnType<typeof ref<string>>
  let studentId: ReturnType<typeof ref<number | null>>

  beforeEach(() => {
    vi.clearAllMocks()
    global.alert = vi.fn()
    global.confirm = vi.fn(() => true)

    restaurants = ref([
      { restaurant_id: 1, name: '餐廳1' },
      { restaurant_id: 2, name: '餐廳2' }
    ])
    userRole = ref('ADMIN')
    studentId = ref(1)
  })

  it('should initialize with default state', () => {
    const { 
      groupOrders, 
      myOrders, 
      loading,
      saving,
      showGroupOrderForm,
      groupOrderForm
    } = useGroupOrderManagement(restaurants, userRole, studentId)

    expect(groupOrders.value).toEqual([])
    expect(myOrders.value).toEqual([])
    expect(loading.value).toBe(false)
    expect(saving.value).toBe(false)
    expect(showGroupOrderForm.value).toBe(false)
    expect(groupOrderForm.value.restaurant).toBe('')
    expect(groupOrderForm.value.title).toBe('')
  })

  it('should fetch group orders successfully', async () => {
    const mockGroupOrders = {
      data: {
        results: [
          { group_order_id: 1, title: '團購1', status: 'Open', orders_count: 5 },
          { group_order_id: 2, title: '團購2', status: 'Closed', orders_count: 3 }
        ]
      }
    }

    vi.mocked(groupOrderAPI.getAll).mockResolvedValueOnce(mockGroupOrders as any)

    const { fetchGroupOrders, groupOrders } = useGroupOrderManagement(restaurants, userRole, studentId)

    await fetchGroupOrders()

    expect(groupOrders.value.length).toBe(2)
    expect(groupOrders.value[0].title).toBe('團購1')
  })

  it('should handle fetch group orders error', async () => {
    vi.mocked(groupOrderAPI.getAll).mockRejectedValueOnce(new Error('API Error'))

    const { fetchGroupOrders, groupOrders } = useGroupOrderManagement(restaurants, userRole, studentId)

    await fetchGroupOrders()

    expect(groupOrders.value).toEqual([])
  })

  it('should fetch my orders successfully', async () => {
    const mockOrders = {
      data: {
        results: [
          { order_id: 1, group_order_title: '團購1', total_amount: 100 },
          { order_id: 2, group_order_title: '團購2', total_amount: 200 }
        ]
      }
    }

    vi.mocked(orderAPI.getAll).mockResolvedValueOnce(mockOrders as any)

    const { fetchMyOrders, myOrders } = useGroupOrderManagement(restaurants, userRole, studentId)

    await fetchMyOrders()

    expect(myOrders.value.length).toBe(2)
  })

  it('should not fetch my orders without studentId', async () => {
    studentId.value = null

    const { fetchMyOrders, myOrders } = useGroupOrderManagement(restaurants, userRole, studentId)

    await fetchMyOrders()

    expect(orderAPI.getAll).not.toHaveBeenCalled()
    expect(myOrders.value).toEqual([])
  })

  it('should filter active group orders', async () => {
    const mockGroupOrders = {
      data: {
        results: [
          { group_order_id: 1, title: '團購1', status: 'Open', orders_count: 5 },
          { group_order_id: 2, title: '團購2', status: 'Closed', orders_count: 3 },
          { group_order_id: 3, title: '團購3', status: 'Open', orders_count: 2 }
        ]
      }
    }

    vi.mocked(groupOrderAPI.getAll).mockResolvedValueOnce(mockGroupOrders as any)

    const { fetchGroupOrders, activeGroupOrders } = useGroupOrderManagement(restaurants, userRole, studentId)

    await fetchGroupOrders()

    expect(activeGroupOrders.value.length).toBe(2)
    expect(activeGroupOrders.value[0].status).toBe('Open')
    expect(activeGroupOrders.value[1].status).toBe('Open')
  })

  it('should filter completed group orders', async () => {
    const mockGroupOrders = {
      data: {
        results: [
          { group_order_id: 1, title: '團購1', status: 'Open', orders_count: 5 },
          { group_order_id: 2, title: '團購2', status: 'Closed', orders_count: 3 },
          { group_order_id: 3, title: '團購3', status: 'Completed', orders_count: 2 }
        ]
      }
    }

    vi.mocked(groupOrderAPI.getAll).mockResolvedValueOnce(mockGroupOrders as any)

    const { fetchGroupOrders, completedGroupOrders } = useGroupOrderManagement(restaurants, userRole, studentId)

    await fetchGroupOrders()

    expect(completedGroupOrders.value.length).toBe(2)
  })

  it('should calculate total orders', async () => {
    const mockGroupOrders = {
      data: {
        results: [
          { group_order_id: 1, title: '團購1', status: 'Open', orders_count: 5 },
          { group_order_id: 2, title: '團購2', status: 'Closed', orders_count: 3 },
          { group_order_id: 3, title: '團購3', status: 'Open', orders_count: 2 }
        ]
      }
    }

    vi.mocked(groupOrderAPI.getAll).mockResolvedValueOnce(mockGroupOrders as any)

    const { fetchGroupOrders, totalOrders } = useGroupOrderManagement(restaurants, userRole, studentId)

    await fetchGroupOrders()

    expect(totalOrders.value).toBe(10)
  })

  it('should check if user can complete group', () => {
    userRole.value = 'ADMIN'
    const { canCompleteGroup } = useGroupOrderManagement(restaurants, userRole, studentId)
    expect(canCompleteGroup.value).toBe(true)

    userRole.value = 'ACCOUNTANT'
    const { canCompleteGroup: canComplete2 } = useGroupOrderManagement(restaurants, userRole, studentId)
    expect(canComplete2.value).toBe(true)

    userRole.value = 'TEACHER'
    const { canCompleteGroup: canComplete3 } = useGroupOrderManagement(restaurants, userRole, studentId)
    expect(canComplete3.value).toBe(true)

    userRole.value = 'STUDENT'
    const { canCompleteGroup: canComplete4 } = useGroupOrderManagement(restaurants, userRole, studentId)
    expect(canComplete4.value).toBe(false)
  })

  it('should get selected restaurant name', () => {
    const { groupOrderForm, selectedRestaurantName } = useGroupOrderManagement(restaurants, userRole, studentId)

    groupOrderForm.value.restaurant = '1'
    expect(selectedRestaurantName.value).toBe('餐廳1')

    groupOrderForm.value.restaurant = '2'
    expect(selectedRestaurantName.value).toBe('餐廳2')

    groupOrderForm.value.restaurant = ''
    expect(selectedRestaurantName.value).toBe('')
  })

  it('should open group order form with default deadline', () => {
    const { openGroupOrderForm, showGroupOrderForm, groupOrderForm } = 
      useGroupOrderManagement(restaurants, userRole, studentId)

    openGroupOrderForm()

    expect(showGroupOrderForm.value).toBe(true)
    expect(groupOrderForm.value.restaurant).toBe('')
    expect(groupOrderForm.value.title).toBe('')
    expect(groupOrderForm.value.deadline).toBeTruthy()
    // Deadline should be approximately 2 hours from now
    const deadlineDate = new Date(groupOrderForm.value.deadline)
    const now = new Date()
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    const diff = Math.abs(deadlineDate.getTime() - twoHoursLater.getTime())
    expect(diff).toBeLessThan(60000) // Within 1 minute
  })

  it('should close group order form', () => {
    const { openGroupOrderForm, closeGroupOrderForm, showGroupOrderForm, groupOrderForm } = 
      useGroupOrderManagement(restaurants, userRole, studentId)

    openGroupOrderForm()
    closeGroupOrderForm()

    expect(showGroupOrderForm.value).toBe(false)
    expect(groupOrderForm.value.restaurant).toBe('')
    expect(groupOrderForm.value.title).toBe('')
  })

  it('should create group order successfully', async () => {
    const mockGroupOrders = {
      data: { results: [] }
    }

    vi.mocked(groupOrderAPI.create).mockResolvedValueOnce({ data: {} } as any)
    vi.mocked(groupOrderAPI.getAll).mockResolvedValueOnce(mockGroupOrders as any)

    const { openGroupOrderForm, createGroupOrder, groupOrderForm } = 
      useGroupOrderManagement(restaurants, userRole, studentId)

    openGroupOrderForm()
    groupOrderForm.value = {
      restaurant: '1',
      title: '測試團購',
      deadline: '2024-12-31T12:00'
    }

    await createGroupOrder()

    expect(groupOrderAPI.create).toHaveBeenCalledWith({
      restaurant: '1',
      title: '測試團購',
      deadline: '2024-12-31T12:00',
      status: 'Open'
    })
    expect(global.alert).toHaveBeenCalledWith('團購已建立！連結已自動生成。')
  })

  it('should handle create group order error', async () => {
    vi.mocked(groupOrderAPI.create).mockRejectedValueOnce(new Error('Create failed'))

    const { openGroupOrderForm, createGroupOrder, groupOrderForm } = 
      useGroupOrderManagement(restaurants, userRole, studentId)

    openGroupOrderForm()
    groupOrderForm.value = {
      restaurant: '1',
      title: '測試團購',
      deadline: '2024-12-31T12:00'
    }

    await createGroupOrder()

    expect(global.alert).toHaveBeenCalledWith('創建失敗，請稍後再試')
  })

  it('should complete group order successfully', async () => {
    const mockGroupOrders = {
      data: { results: [] }
    }

    vi.mocked(groupOrderAPI.complete).mockResolvedValueOnce({
      data: { fees_created: 5 }
    } as any)
    vi.mocked(groupOrderAPI.getAll).mockResolvedValueOnce(mockGroupOrders as any)

    const { completeGroupOrder } = useGroupOrderManagement(restaurants, userRole, studentId)

    await completeGroupOrder(1)

    expect(groupOrderAPI.complete).toHaveBeenCalledWith(1)
    expect(global.alert).toHaveBeenCalledWith(
      expect.stringContaining('團購已完成！已自動生成 5 筆餐費記錄。')
    )
  })

  it('should not complete group order without permission', async () => {
    userRole.value = 'STUDENT'

    const { completeGroupOrder } = useGroupOrderManagement(restaurants, userRole, studentId)

    await completeGroupOrder(1)

    expect(groupOrderAPI.complete).not.toHaveBeenCalled()
    expect(global.alert).toHaveBeenCalledWith('只有管理者或會計可以完成團購')
  })

  it('should not complete group order if user cancels', async () => {
    global.confirm = vi.fn(() => false)

    const { completeGroupOrder } = useGroupOrderManagement(restaurants, userRole, studentId)

    await completeGroupOrder(1)

    expect(groupOrderAPI.complete).not.toHaveBeenCalled()
  })

  it('should get order link', () => {
    const { getOrderLink } = useGroupOrderManagement(restaurants, userRole, studentId)

    const link = getOrderLink('abc123')

    expect(link).toContain('/lunch-orders/join/abc123')
  })

  it('should copy link to clipboard', async () => {
    const { copyLink } = useGroupOrderManagement(restaurants, userRole, studentId)

    // Wait for the promise to resolve
    await new Promise(resolve => setTimeout(resolve, 10))
    await copyLink('abc123')
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('/lunch-orders/join/abc123')
    )
    // Alert is called asynchronously, wait a bit
    await new Promise(resolve => setTimeout(resolve, 50))
    expect(global.alert).toHaveBeenCalledWith('連結已複製到剪貼簿')
  })

  it('should handle copy link error', async () => {
    // Create a new composable instance to avoid state pollution
    const newRestaurants = ref([{ restaurant_id: 1, name: '餐廳1' }])
    const newUserRole = ref('ADMIN')
    const newStudentId = ref(1)
    
    // Mock clipboard to reject
    const originalWriteText = navigator.clipboard.writeText
    navigator.clipboard.writeText = vi.fn().mockRejectedValueOnce(new Error('Copy failed'))

    const { copyLink } = useGroupOrderManagement(newRestaurants, newUserRole, newStudentId)

    await copyLink('abc123')
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(global.alert).toHaveBeenCalledWith('複製失敗，請手動複製')
    
    // Restore original
    navigator.clipboard.writeText = originalWriteText
  })

  it('should update group order title when restaurant is selected', () => {
    const { openGroupOrderForm, updateGroupOrderTitle, groupOrderForm, selectedRestaurantName } = 
      useGroupOrderManagement(restaurants, userRole, studentId)

    openGroupOrderForm()
    groupOrderForm.value.restaurant = '1'
    updateGroupOrderTitle()

    expect(groupOrderForm.value.title).toBe('餐廳1')
  })

  it('should not update title if user has manually entered one', () => {
    const { openGroupOrderForm, updateGroupOrderTitle, groupOrderForm } = 
      useGroupOrderManagement(restaurants, userRole, studentId)

    openGroupOrderForm()
    groupOrderForm.value.restaurant = '1'
    groupOrderForm.value.title = '手動輸入的標題'
    
    updateGroupOrderTitle()

    expect(groupOrderForm.value.title).toBe('手動輸入的標題')
  })
})
