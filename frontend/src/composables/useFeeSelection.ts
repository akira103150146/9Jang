import { ref, computed, type Ref } from 'vue'
import { feeAPI } from '../services/api'

/**
 * 費用類型
 */
export interface Fee {
  fee_id: number
  student: number
  student_name: string
  item: string
  amount: number
  fee_date: string
  paid_at?: string
  payment_status: 'Paid' | 'Unpaid' | 'Partial'
  notes?: string
  [key: string]: unknown
}

/**
 * 費用選擇管理 Composable
 */
export function useFeeSelection(
  fees: Ref<Fee[]>,
  onFeesUpdated?: () => Promise<void>
) {
  const selectedFees = ref<number[]>([])
  const batchUpdating = ref(false)

  /**
   * 檢查費用是否被選中
   */
  const isSelected = (feeId: number): boolean => {
    return selectedFees.value.includes(feeId)
  }

  /**
   * 切換選擇狀態
   */
  const toggleSelect = (feeId: number): void => {
    const index = selectedFees.value.indexOf(feeId)
    if (index > -1) {
      selectedFees.value.splice(index, 1)
    } else {
      selectedFees.value.push(feeId)
    }
  }

  /**
   * 是否全選
   */
  const isAllSelected = computed(() => {
    return fees.value.length > 0 && selectedFees.value.length === fees.value.length
  })

  /**
   * 切換全選
   */
  const toggleSelectAll = (): void => {
    if (isAllSelected.value) {
      selectedFees.value = []
    } else {
      selectedFees.value = fees.value.map(fee => fee.fee_id)
    }
  }

  /**
   * 清除選擇
   */
  const clearSelection = (): void => {
    selectedFees.value = []
  }

  /**
   * 批次更新狀態
   */
  const batchUpdateStatus = async (paymentStatus: 'Paid' | 'Unpaid'): Promise<void> => {
    if (selectedFees.value.length === 0) {
      alert('請至少選擇一筆費用記錄')
      return
    }

    const statusText = paymentStatus === 'Paid' ? '已繳費' : '未繳費'
    if (!confirm(`確定要將選中的 ${selectedFees.value.length} 筆費用記錄標記為「${statusText}」嗎？`)) {
      return
    }

    batchUpdating.value = true
    try {
      await feeAPI.batchUpdate(selectedFees.value, paymentStatus)
      alert(`成功更新 ${selectedFees.value.length} 筆費用記錄為「${statusText}」`)
      clearSelection()
      if (onFeesUpdated) {
        await onFeesUpdated()
      }
    } catch (error) {
      console.error('批次更新失敗:', error)
      const err = error as { response?: { data?: { detail?: string } } }
      if (err.response?.data) {
        const errorData = err.response.data
        const errorMsg = errorData.detail || JSON.stringify(errorData)
        alert(`批次更新失敗：${errorMsg}`)
      } else {
        alert('批次更新失敗，請稍後再試')
      }
    } finally {
      batchUpdating.value = false
    }
  }

  return {
    // 狀態
    selectedFees,
    batchUpdating,
    isAllSelected,
    
    // 方法
    isSelected,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    batchUpdateStatus
  }
}

