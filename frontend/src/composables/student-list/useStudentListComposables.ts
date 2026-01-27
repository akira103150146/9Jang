/**
 * useStudentListComposables
 * 統一管理學生列表所需的所有 composables
 * 簡化主組件中的 composable 初始化邏輯
 */

import { ref, computed, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import type { NormalizedStudent } from '../../utils/studentUtils'
import { useStudentUser } from '../useStudentUser'
import { useStudentList } from '../useStudentList'
import { useStudentFilters } from '../useStudentFilters'
import { useStudentEnrollment } from '../useStudentEnrollment'
import { useStudentTuition } from '../useStudentTuition'
import { useStudentTags } from '../useStudentTags'
import { useStudentLeave } from '../useStudentLeave'
import { useStudentAccount } from '../useStudentAccount'
import { useStudentModals } from './useStudentModals'
import { useStudentCourses } from './useStudentCourses'

export function useStudentListComposables() {
  const route = useRoute()

  // 用戶權限 composable
  const { currentUser, fetchCurrentUser, isAdmin, isTeacher, isAccountant, canSeeAccountingFeatures } = useStudentUser()

  // 學生列表 composable
  const {
    students,
    loading,
    usingMock,
    showDeleted,
    totalFees,
    unpaidFees,
    studentsWithTuitionNeeded,
    fetchStudents,
    deleteStudent,
    restoreStudent,
    updateStudent,
  } = useStudentList()

  // 課程 composable
  const { courses, fetchCourses } = useStudentCourses()

  // 模態框管理 composable
  const {
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
  } = useStudentModals()

  // 篩選 composable
  const {
    filters,
    showFilters,
    isFiltering,
    hasActiveFilters,
    buildQueryParams,
    applyFilters,
    clearFilters,
    removeFilter,
    syncFiltersFromRoute: syncFiltersFromRouteComposable,
    getActiveFilters,
  } = useStudentFilters(canSeeAccountingFeatures, async (queryString: string) => {
    await fetchStudents(queryString)
  })

  // 報名管理 composable
  const enrollmentComposable = useStudentEnrollment(
    selectedStudent,
    students,
    updateStudent,
    fetchStudents,
    route
  )

  // 學費管理 composable
  const tuitionComposable = useStudentTuition(
    selectedStudent,
    studentsWithTuitionNeeded,
    fetchStudents,
    canSeeAccountingFeatures
  )

  // 標籤管理 composable
  const tagsComposable = useStudentTags(students, updateStudent, fetchStudents, route)

  // 請假管理 composable
  const leaveComposable = useStudentLeave(selectedStudent, courses)

  // 帳號管理 composable
  const accountComposable = useStudentAccount()

  // 從 composables 提取需要的狀態和方法
  const {
    enrollmentForm,
    studentEnrollments,
    loadingEnrollments,
    savingEnrollment,
    selectedEnrollment,
    periods,
    loadingPeriods,
    savingPeriods,
    saveEnrollment,
    addPeriod,
    removePeriod,
    savePeriods,
  } = enrollmentComposable

  const {
    tuitionStatus,
    loadingTuition,
    savingTuitions,
    batchGeneratingTuitions,
    hasSelectedTuitions,
    selectedCount,
    generateAllTuitions,
    handleBatchGenerateTuitions,
  } = tuitionComposable

  const {
    availableTags,
    tagForm,
    editingTag,
    isCreatingTag,
    savingTag,
    addingTagToStudent,
    fetchTags,
    startCreateTag,
    createTag,
    editTag,
    updateTag,
    deleteTag,
    saveTag,
    addTagToStudent,
    removeStudentFromTag,
  } = tagsComposable

  const {
    loadingLeave,
    savingLeave,
    leaveData,
    leaveForm,
    submitLeave,
    deleteLeave,
    restoreLeave,
    getLeaveStatusColor,
    getLeaveStatusDisplay,
  } = leaveComposable

  const {
    visiblePasswords,
    editingPasswords,
    passwordForms,
    togglePasswordVisibility,
    startEditPassword,
    cancelEditPassword,
    savePassword,
    toggleAccountStatus,
  } = accountComposable

  // 計算表格欄位數（用於 colspan）
  const tableColspan = computed(() => {
    let cols = 5 // 基礎欄位：姓名、學校/年級、手機、緊急聯絡人、操作
    if (isAdmin.value) cols += 1 // 帳號/密碼
    if (canSeeAccountingFeatures.value || isTeacher.value) cols += 1 // 報名課程
    if (canSeeAccountingFeatures.value || isTeacher.value) cols += 1 // 標籤
    if (canSeeAccountingFeatures.value) cols += 1 // 總費用/待繳
    return cols
  })

  // 獲取活躍篩選的顯示標籤（computed）
  const activeFilters = computed(() => {
    return getActiveFilters(
      availableTags.value,
      courses.value.map(c => ({
        course_id: c.course_id || c.id || 0,
        course_name: c.course_name || ''
      }))
    )
  })

  /**
   * 取消標籤表單（返回到列表視圖）
   */
  const cancelTagForm = (): void => {
    if (editingTag.value) {
      editingTag.value = null
    }
    if (isCreatingTag.value) {
      isCreatingTag.value = false
    }
    tagForm.value = { name: '', description: '' }
  }

  /**
   * 同步篩選從路由
   */
  const syncFiltersFromRoute = (): void => {
    syncFiltersFromRouteComposable()
  }

  /**
   * 處理顯示已刪除選項的變更
   */
  const handleShowDeletedChange = (): void => {
    const queryParams: Record<string, string> = {}
    Object.keys(route.query).forEach(key => {
      const value = route.query[key]
      if (typeof value === 'string') {
        queryParams[key] = value
      }
    })
    const queryString = new URLSearchParams(queryParams).toString()
    fetchStudents(queryString)
  }

  return {
    // 用戶權限
    currentUser,
    fetchCurrentUser,
    isAdmin,
    isTeacher,
    isAccountant,
    canSeeAccountingFeatures,

    // 學生列表
    students,
    loading,
    usingMock,
    showDeleted,
    totalFees,
    unpaidFees,
    studentsWithTuitionNeeded,
    fetchStudents,
    deleteStudent,
    restoreStudent,
    updateStudent,

    // 課程
    courses,
    fetchCourses,

    // 模態框狀態
    selectedStudent,
    showTagManager,
    showAddTagModal,
    selectedStudentForTag,
    showEnrollmentModal,
    showPeriodModal,
    showTuitionModal,
    showLeaveModal,

    // 模態框操作
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

    // 篩選
    filters,
    showFilters,
    isFiltering,
    hasActiveFilters,
    activeFilters,
    clearFilters,
    removeFilter,
    syncFiltersFromRoute,
    handleShowDeletedChange,

    // 報名
    enrollmentForm,
    studentEnrollments,
    loadingEnrollments,
    savingEnrollment,
    selectedEnrollment,
    periods,
    loadingPeriods,
    savingPeriods,
    saveEnrollment,
    addPeriod,
    removePeriod,
    savePeriods,

    // 學費
    tuitionStatus,
    loadingTuition,
    savingTuitions,
    batchGeneratingTuitions,
    hasSelectedTuitions,
    selectedCount,
    generateAllTuitions,
    handleBatchGenerateTuitions,

    // 標籤
    availableTags,
    tagForm,
    editingTag,
    isCreatingTag,
    savingTag,
    addingTagToStudent,
    fetchTags,
    startCreateTag,
    saveTag,
    cancelTagForm,
    editTag,
    deleteTag,
    addTagToStudent,
    removeStudentFromTag,

    // 請假
    loadingLeave,
    savingLeave,
    leaveData,
    leaveForm,
    submitLeave,
    deleteLeave,
    restoreLeave,
    getLeaveStatusColor,
    getLeaveStatusDisplay,

    // 帳號
    visiblePasswords,
    editingPasswords,
    passwordForms,
    togglePasswordVisibility,
    startEditPassword,
    cancelEditPassword,
    savePassword,
    toggleAccountStatus,

    // 表格
    tableColspan,
  }
}
