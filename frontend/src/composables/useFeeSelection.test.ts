import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { useFeeSelection, type Fee } from './useFeeSelection'
import { feeAPI } from '../services/api'

// Mock feeAPI
vi.mock('../services/api', () => ({
  feeAPI: {
    batchUpdate: vi.fn().mockResolvedValue({})
  }
}))

describe('useFeeSelection', () => {
  let fees: ReturnType<typeof ref<Fee[]>>
  let onFeesUpdated: () => Promise<void>

  beforeEach(() => {
    fees = ref<Fee[]>([
      { fee_id: 1, student: 1, student_name: '學生1', item: 'Tuition', amount: 1000, fee_date: '2024-01-01', payment_status: 'Unpaid' },
      { fee_id: 2, student: 2, student_name: '學生2', item: 'Meal', amount: 500, fee_date: '2024-01-02', payment_status: 'Paid' },
      { fee_id: 3, student: 3, student_name: '學生3', item: 'Transport', amount: 300, fee_date: '2024-01-03', payment_status: 'Unpaid' }
    ])
    onFeesUpdated = vi.fn().mockResolvedValue(undefined)
    vi.clearAllMocks()
  })

  it('should initialize with empty selection', () => {
    const { selectedFees, isAllSelected } = useFeeSelection(fees)
    
    expect(selectedFees.value).toEqual([])
    expect(isAllSelected.value).toBe(false)
  })

  it('should check if fee is selected', () => {
    const { isSelected, toggleSelect } = useFeeSelection(fees)
    
    expect(isSelected(1)).toBe(false)
    
    toggleSelect(1)
    expect(isSelected(1)).toBe(true)
  })

  it('should toggle fee selection', () => {
    const { toggleSelect, selectedFees } = useFeeSelection(fees)
    
    toggleSelect(1)
    expect(selectedFees.value).toContain(1)
    
    toggleSelect(1)
    expect(selectedFees.value).not.toContain(1)
  })

  it('should toggle select all', () => {
    const { toggleSelectAll, selectedFees, isAllSelected } = useFeeSelection(fees)
    
    toggleSelectAll()
    expect(selectedFees.value.length).toBe(3)
    expect(isAllSelected.value).toBe(true)
    
    toggleSelectAll()
    expect(selectedFees.value.length).toBe(0)
    expect(isAllSelected.value).toBe(false)
  })

  it('should clear selection', () => {
    const { toggleSelect, clearSelection, selectedFees } = useFeeSelection(fees)
    
    toggleSelect(1)
    toggleSelect(2)
    expect(selectedFees.value.length).toBe(2)
    
    clearSelection()
    expect(selectedFees.value.length).toBe(0)
  })

  it('should detect all selected state', () => {
    const { toggleSelectAll, isAllSelected } = useFeeSelection(fees)
    
    expect(isAllSelected.value).toBe(false)
    
    toggleSelectAll()
    expect(isAllSelected.value).toBe(true)
  })

  it('should batch update status', async () => {
    const { toggleSelect, batchUpdateStatus } = useFeeSelection(fees, onFeesUpdated)
    
    toggleSelect(1)
    toggleSelect(3)
    
    // Mock confirm
    global.confirm = vi.fn(() => true)
    
    await batchUpdateStatus('Paid')
    
    expect(feeAPI.batchUpdate).toHaveBeenCalledWith([1, 3], 'Paid')
    expect(onFeesUpdated).toHaveBeenCalled()
  })

  it('should not batch update if no selection', async () => {
    const { batchUpdateStatus } = useFeeSelection(fees)
    
    global.alert = vi.fn()
    global.confirm = vi.fn(() => true)
    
    await batchUpdateStatus('Paid')
    
    expect(feeAPI.batchUpdate).not.toHaveBeenCalled()
    expect(global.alert).toHaveBeenCalledWith('請至少選擇一筆費用記錄')
  })

  it('should not batch update if user cancels', async () => {
    const { toggleSelect, batchUpdateStatus } = useFeeSelection(fees)
    
    toggleSelect(1)
    global.confirm = vi.fn(() => false)
    
    await batchUpdateStatus('Paid')
    
    expect(feeAPI.batchUpdate).not.toHaveBeenCalled()
  })

  it('should handle batch update error', async () => {
    const { toggleSelect, batchUpdateStatus } = useFeeSelection(fees)
    
    toggleSelect(1)
    global.confirm = vi.fn(() => true)
    global.alert = vi.fn()
    
    vi.mocked(feeAPI.batchUpdate).mockRejectedValueOnce({
      response: {
        data: {
          detail: '更新失敗'
        }
      }
    })
    
    await batchUpdateStatus('Paid')
    
    expect(global.alert).toHaveBeenCalledWith('批次更新失敗：更新失敗')
  })

  it('should clear selection after successful batch update', async () => {
    const { toggleSelect, batchUpdateStatus, selectedFees } = useFeeSelection(fees, onFeesUpdated)
    
    toggleSelect(1)
    global.confirm = vi.fn(() => true)
    global.alert = vi.fn()
    
    await batchUpdateStatus('Paid')
    
    expect(selectedFees.value.length).toBe(0)
  })
})
