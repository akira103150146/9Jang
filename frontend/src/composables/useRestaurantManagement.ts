import { ref, computed, type Ref } from 'vue'
import { restaurantAPI, uploadImageAPI } from '../services/api'
import { getBackendBaseURL } from '../services/api'

/**
 * 店家類型
 */
export interface Restaurant {
  restaurant_id: number
  name: string
  phone?: string
  address?: string
  menu_image_path?: string
  is_active: boolean
  [key: string]: unknown
}

/**
 * 店家表單數據類型
 */
export interface RestaurantFormData {
  name: string
  phone: string
  address: string
  menu_image_path: string
  is_active: boolean
}

/**
 * 獲取後端基礎 URL
 */
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || getBackendBaseURL()

/**
 * 店家管理 Composable
 */
export function useRestaurantManagement() {
  const restaurants = ref<Restaurant[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const showRestaurantForm = ref(false)
  const editingRestaurant = ref<Restaurant | null>(null)
  const menuImagePreview = ref('')
  const menuFileInput = ref<HTMLInputElement | null>(null)
  const restaurantForm = ref<RestaurantFormData>({
    name: '',
    phone: '',
    address: '',
    menu_image_path: '',
    is_active: true
  })

  const activeRestaurants = computed(() => {
    return restaurants.value.filter(r => r.is_active)
  })

  /**
   * 獲取店家列表
   */
  const fetchRestaurants = async (): Promise<void> => {
    try {
      const response = await restaurantAPI.getAll()
      const data = response.data.results || response.data
      restaurants.value = Array.isArray(data) ? data : []
    } catch (error) {
      console.error('獲取店家失敗：', error)
      restaurants.value = []
    }
  }

  /**
   * 打開新增店家表單
   */
  const openRestaurantForm = (): void => {
    editingRestaurant.value = null
    restaurantForm.value = {
      name: '',
      phone: '',
      address: '',
      menu_image_path: '',
      is_active: true
    }
    menuImagePreview.value = ''
    showRestaurantForm.value = true
  }

  /**
   * 打開編輯店家表單
   */
  const editRestaurant = (restaurant: Restaurant): void => {
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

  /**
   * 關閉店家表單
   */
  const closeRestaurantForm = (): void => {
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
    if (menuFileInput.value) {
      menuFileInput.value.value = ''
    }
  }

  /**
   * 處理菜單圖片選擇
   */
  const handleMenuImageSelect = async (event: Event): Promise<void> => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
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
      menuImagePreview.value = (e.target?.result as string) || ''
    }
    reader.readAsDataURL(file)

    try {
      const response = await uploadImageAPI.upload(file)
      restaurantForm.value.menu_image_path = response.data.image_path
      if (response.data.image_url) {
        menuImagePreview.value = `${BACKEND_BASE_URL}${response.data.image_url}`
      }
    } catch (error) {
      console.error('上傳圖片失敗：', error)
      alert('上傳圖片失敗')
    }
  }

  /**
   * 清除菜單圖片
   */
  const clearMenuImage = (): void => {
    menuImagePreview.value = ''
    restaurantForm.value.menu_image_path = ''
    if (menuFileInput.value) {
      menuFileInput.value.value = ''
    }
  }

  /**
   * 保存店家
   */
  const saveRestaurant = async (): Promise<void> => {
    saving.value = true
    try {
      if (editingRestaurant.value) {
        await restaurantAPI.update(editingRestaurant.value.restaurant_id, restaurantForm.value)
      } else {
        await restaurantAPI.create(restaurantForm.value)
      }
      closeRestaurantForm()
      await fetchRestaurants()
    } catch (error) {
      console.error('儲存店家失敗：', error)
      alert('儲存失敗，請稍後再試')
    } finally {
      saving.value = false
    }
  }

  /**
   * 刪除店家
   */
  const deleteRestaurant = async (id: number, name: string): Promise<void> => {
    if (!confirm(`確定要刪除店家「${name}」嗎？`)) return
    
    try {
      await restaurantAPI.delete(id)
      await fetchRestaurants()
    } catch (error) {
      console.error('刪除店家失敗：', error)
      alert('刪除失敗，請稍後再試')
    }
  }

  /**
   * 獲取圖片 URL
   */
  const getImageUrl = (path: string): string => {
    if (!path) return ''
    return `${BACKEND_BASE_URL}/media/${path}`
  }

  return {
    // 狀態
    restaurants,
    loading,
    saving,
    showRestaurantForm,
    editingRestaurant,
    menuImagePreview,
    menuFileInput,
    restaurantForm,
    activeRestaurants,
    
    // 方法
    fetchRestaurants,
    openRestaurantForm,
    editRestaurant,
    closeRestaurantForm,
    handleMenuImageSelect,
    clearMenuImage,
    saveRestaurant,
    deleteRestaurant,
    getImageUrl
  }
}

