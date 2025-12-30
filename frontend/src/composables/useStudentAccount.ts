import { ref } from 'vue'
import { studentAPI } from '../services/api'
import type { NormalizedStudent } from '../utils/studentUtils'

/**
 * 密碼表單類型
 */
export interface PasswordForm {
  password: string
}

/**
 * 學生帳號管理 Composable
 * 處理密碼顯示、編輯和帳號狀態切換
 */
export function useStudentAccount() {
  const visiblePasswords = ref<Record<number, boolean>>({})
  const editingPasswords = ref<Record<number, boolean>>({})
  const passwordForms = ref<Record<number, PasswordForm>>({})

  /**
   * 切換密碼顯示/隱藏
   */
  const togglePasswordVisibility = (studentId: number): void => {
    visiblePasswords.value[studentId] = !visiblePasswords.value[studentId]
  }

  /**
   * 開始編輯密碼
   */
  const startEditPassword = (student: NormalizedStudent): void => {
    passwordForms.value[student.id] = {
      password: student.password || '',
    }
    editingPasswords.value[student.id] = true
  }

  /**
   * 取消編輯密碼
   */
  const cancelEditPassword = (studentId: number): void => {
    editingPasswords.value[studentId] = false
    delete passwordForms.value[studentId]
  }

  /**
   * 保存密碼
   */
  const savePassword = async (student: NormalizedStudent): Promise<void> => {
    const newPassword = passwordForms.value[student.id]?.password
    if (!newPassword) {
      alert('請輸入新密碼')
      return
    }

    try {
      const response = await studentAPI.resetPassword(student.id, newPassword)
      alert('密碼已更新')
      // 更新本地數據
      student.password = response.data.password
      editingPasswords.value[student.id] = false
      delete passwordForms.value[student.id]
    } catch (error) {
      console.error('更新密碼失敗:', error)
      alert('更新密碼失敗，請稍後再試')
    }
  }

  /**
   * 切換帳號狀態
   */
  const toggleAccountStatus = async (student: NormalizedStudent): Promise<void> => {
    if (!(student as { user?: number }).user) {
      alert('該學生尚未創建帳號')
      return
    }

    const action = student.is_account_active ? '停用' : '啟用'
    if (!confirm(`確定要${action}學生 ${student.name} 的帳號嗎？`)) {
      return
    }

    try {
      const response = await studentAPI.toggleAccountStatus(student.id)
      student.is_account_active = response.data.is_active
      alert(`帳號已${response.data.is_active ? '啟用' : '停用'}`)
    } catch (error) {
      console.error('切換帳號狀態失敗:', error)
      alert('操作失敗，請稍後再試')
    }
  }

  return {
    visiblePasswords,
    editingPasswords,
    passwordForms,
    togglePasswordVisibility,
    startEditPassword,
    cancelEditPassword,
    savePassword,
    toggleAccountStatus,
  }
}

