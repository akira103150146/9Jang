import { ref, computed, type Ref } from 'vue'
import { studentAPI } from '../services/api'
import { formatAmount } from '../utils/studentFormatters'
import type { NormalizedStudent } from '../utils/studentUtils'

/**
 * 學費狀態項目類型
 */
export interface TuitionStatusItem {
  year: number
  month: number
  enrollment_id: number
  course_name?: string
  weekly_fee?: number
  has_fee: boolean
  selected?: boolean
  weeks?: number
  [key: string]: unknown
}

/**
 * 學生學費管理 Composable
 */
export function useStudentTuition(
  selectedStudent: Ref<NormalizedStudent | null>,
  studentsWithTuitionNeeded: Ref<NormalizedStudent[]>,
  fetchStudents: (queryParams?: string) => Promise<void>,
  canSeeAccountingFeatures: Ref<boolean>
) {
  const showTuitionModal = ref(false)
  const tuitionStatus = ref<TuitionStatusItem[]>([])
  const loadingTuition = ref(false)
  const savingTuitions = ref(false)
  const batchGeneratingTuitions = ref(false)

  /**
   * 打開學費生成模態框
   */
  const openTuitionModal = async (student: NormalizedStudent): Promise<void> => {
    if (!canSeeAccountingFeatures.value) {
      return
    }

    selectedStudent.value = student
    showTuitionModal.value = true
    loadingTuition.value = true

    try {
      const response = await studentAPI.getTuitionStatus(student.id)
      const months = (response.data.tuition_months || []) as TuitionStatusItem[]

      // 只顯示未生成的學費項目（has_fee = false），並初始化每個項目
      tuitionStatus.value = months
        .filter((item) => !item.has_fee) // 只保留未生成的項目
        .map((item) => ({
          ...item,
          selected: true, // 預設選中所有未生成的項目
          weeks: item.weeks || 4, // 預設4週
        }))

      // 如果沒有未生成的項目，顯示提示並關閉模態框
      if (tuitionStatus.value.length === 0) {
        alert('該學生沒有需要生成的學費，請在費用明細頁面查看已生成的學費')
        closeTuitionModal()
      }
    } catch (error) {
      console.error('獲取學費狀態失敗：', error)
      alert('獲取學費狀態失敗')
      tuitionStatus.value = []
    } finally {
      loadingTuition.value = false
    }
  }

  /**
   * 關閉學費生成模態框
   */
  const closeTuitionModal = (): void => {
    showTuitionModal.value = false
    selectedStudent.value = null
    tuitionStatus.value = []
  }

  /**
   * 檢查是否有選中的學費項目
   */
  const hasSelectedTuitions = computed(() => {
    return tuitionStatus.value.some((item) => item.selected)
  })

  /**
   * 選中的學費項目數量
   */
  const selectedCount = computed(() => {
    return tuitionStatus.value.filter((item) => item.selected).length
  })

  /**
   * 生成選中的學費
   */
  const generateAllTuitions = async (): Promise<void> => {
    if (!hasSelectedTuitions.value) {
      alert('請至少選擇一個項目')
      return
    }

    if (!selectedStudent.value) {
      return
    }

    if (!confirm(`確定要生成 ${selectedCount.value} 項學費嗎？`)) {
      return
    }

    savingTuitions.value = true
    const selectedItems = tuitionStatus.value.filter((item) => item.selected)
    let successCount = 0
    let failCount = 0

    try {
      for (const item of selectedItems) {
        try {
          await studentAPI.generateTuition(selectedStudent.value.id, {
            year: item.year,
            month: item.month,
            enrollment_id: item.enrollment_id,
            weeks: item.weeks || 4,
          })
          successCount++
        } catch (error) {
          console.error(`生成 ${item.year}年${item.month}月學費失敗：`, error)
          failCount++
        }
      }

      if (failCount === 0) {
        alert(`成功生成 ${successCount} 項學費！`)
        closeTuitionModal()
        await fetchStudents() // 刷新學生列表
      } else {
        alert(`成功生成 ${successCount} 項，失敗 ${failCount} 項`)
      }
    } catch (error) {
      console.error('批量生成學費失敗：', error)
      alert('批量生成學費時發生錯誤')
    } finally {
      savingTuitions.value = false
    }
  }

  /**
   * 批次生成所有學生的學費
   */
  const handleBatchGenerateTuitions = async (): Promise<void> => {
    const studentsNeedingTuition = studentsWithTuitionNeeded.value

    if (studentsNeedingTuition.length === 0) {
      alert('目前沒有需要生成學費的學生')
      return
    }

    if (
      !confirm(
        `確定要批次生成 ${studentsNeedingTuition.length} 位學生的學費嗎？\n系統將為每位學生生成所有未生成的學費月份。`
      )
    ) {
      return
    }

    batchGeneratingTuitions.value = true

    try {
      // 獲取需要生成學費的學生ID列表
      const studentIds = studentsNeedingTuition.map((s) => s.id)

      const response = await studentAPI.batchGenerateTuitions(studentIds, 4) // 預設4週
      const result = response.data as {
        total_students?: number
        success_count?: number
        fail_count?: number
        total_fees_generated?: number
        errors?: Array<unknown>
      }

      let message = `批次生成完成！\n`
      message += `處理學生數：${result.total_students || 0}\n`
      message += `成功：${result.success_count || 0} 位\n`
      message += `失敗：${result.fail_count || 0} 位\n`
      message += `總共生成：${result.total_fees_generated || 0} 筆學費記錄`

      if (result.errors && result.errors.length > 0) {
        console.error('批次生成學費錯誤：', result.errors)
        message += `\n\n有 ${result.errors.length} 個錯誤，請查看控制台詳情`
      }

      alert(message)

      // 刷新學生列表以更新「需要生成學費」的數量和費用統計
      // 添加時間戳確保強制刷新
      await fetchStudents(`?t=${Date.now()}`)
    } catch (error) {
      console.error('批次生成學費失敗：', error)
      alert('批次生成學費時發生錯誤，請稍後再試')
    } finally {
      batchGeneratingTuitions.value = false
    }
  }

  return {
    // 狀態
    showTuitionModal,
    tuitionStatus,
    loadingTuition,
    savingTuitions,
    batchGeneratingTuitions,
    // Computed
    hasSelectedTuitions,
    selectedCount,
    // 函數
    openTuitionModal,
    closeTuitionModal,
    generateAllTuitions,
    handleBatchGenerateTuitions,
  }
}

