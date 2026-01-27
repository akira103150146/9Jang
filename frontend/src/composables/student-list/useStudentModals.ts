/**
 * useStudentModals
 * 統一管理學生列表相關的所有模態框狀態
 */

import { ref, type Ref } from 'vue'
import type { NormalizedStudent } from '../../utils/studentUtils'

export function useStudentModals() {
  // 選中的學生（用於多個模態框）
  const selectedStudent: Ref<NormalizedStudent | null> = ref(null)

  // 標籤相關
  const showTagManager: Ref<boolean> = ref(false)
  const showAddTagModal: Ref<boolean> = ref(false)
  const selectedStudentForTag: Ref<NormalizedStudent | null> = ref(null)

  // 報名相關
  const showEnrollmentModal: Ref<boolean> = ref(false)
  const showPeriodModal: Ref<boolean> = ref(false)

  // 學費相關
  const showTuitionModal: Ref<boolean> = ref(false)

  // 請假相關
  const showLeaveModal: Ref<boolean> = ref(false)

  /**
   * 打開標籤管理模態框
   */
  const openTagManager = (): void => {
    showTagManager.value = true
  }

  /**
   * 關閉標籤管理模態框
   */
  const closeTagManager = (): void => {
    showTagManager.value = false
  }

  /**
   * 打開添加標籤模態框
   */
  const openAddTagModal = (student: NormalizedStudent): void => {
    selectedStudentForTag.value = student
    showAddTagModal.value = true
  }

  /**
   * 關閉添加標籤模態框
   */
  const closeAddTagModal = (): void => {
    showAddTagModal.value = false
    selectedStudentForTag.value = null
  }

  /**
   * 打開報名模態框
   */
  const openEnrollmentModal = (student: NormalizedStudent): void => {
    selectedStudent.value = student
    showEnrollmentModal.value = true
  }

  /**
   * 關閉報名模態框
   */
  const closeEnrollmentModal = (): void => {
    showEnrollmentModal.value = false
  }

  /**
   * 打開期間管理模態框
   */
  const openPeriodModal = (): void => {
    showPeriodModal.value = true
  }

  /**
   * 關閉期間管理模態框
   */
  const closePeriodModal = (): void => {
    showPeriodModal.value = false
  }

  /**
   * 打開學費模態框
   */
  const openTuitionModal = (student: NormalizedStudent): void => {
    selectedStudent.value = student
    showTuitionModal.value = true
  }

  /**
   * 關閉學費模態框
   */
  const closeTuitionModal = (): void => {
    showTuitionModal.value = false
  }

  /**
   * 打開請假模態框
   */
  const openLeaveModal = (student: NormalizedStudent): void => {
    selectedStudent.value = student
    showLeaveModal.value = true
  }

  /**
   * 關閉請假模態框
   */
  const closeLeaveModal = (): void => {
    showLeaveModal.value = false
  }

  return {
    selectedStudent,
    showTagManager,
    showAddTagModal,
    selectedStudentForTag,
    showEnrollmentModal,
    showPeriodModal,
    showTuitionModal,
    showLeaveModal,
    openTagManager,
    closeTagManager,
    openAddTagModal,
    closeAddTagModal,
    openEnrollmentModal,
    closeEnrollmentModal,
    openPeriodModal,
    closePeriodModal,
    openTuitionModal,
    closeTuitionModal,
    openLeaveModal,
    closeLeaveModal,
  }
}
