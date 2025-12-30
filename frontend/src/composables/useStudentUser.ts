import { ref, computed, onMounted } from 'vue'

/**
 * 用戶信息類型
 */
export interface User {
  role?: 'ADMIN' | 'TEACHER' | 'ACCOUNTANT'
  [key: string]: unknown
}

/**
 * 學生用戶管理 Composable
 * 處理用戶角色檢查和用戶信息管理
 */
export function useStudentUser() {
  const currentUser = ref<User | null>(null)

  /**
   * 獲取當前用戶信息
   */
  const fetchCurrentUser = async (): Promise<void> => {
    try {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        currentUser.value = JSON.parse(userStr) as User
      }
    } catch (error) {
      console.error('獲取用戶信息失敗:', error)
      currentUser.value = null
    }
  }

  /**
   * 檢查是否為管理員
   */
  const isAdmin = computed(() => {
    return currentUser.value?.role === 'ADMIN'
  })

  /**
   * 檢查是否為老師
   */
  const isTeacher = computed(() => {
    return currentUser.value?.role === 'TEACHER'
  })

  /**
   * 檢查是否為會計
   */
  const isAccountant = computed(() => {
    return currentUser.value?.role === 'ACCOUNTANT'
  })

  /**
   * 檢查是否可以看到會計功能（管理員或會計）
   */
  const canSeeAccountingFeatures = computed(() => {
    return isAdmin.value || isAccountant.value
  })

  return {
    currentUser,
    fetchCurrentUser,
    isAdmin,
    isTeacher,
    isAccountant,
    canSeeAccountingFeatures,
  }
}

