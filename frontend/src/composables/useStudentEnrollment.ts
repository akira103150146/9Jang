import { ref, type Ref } from 'vue'
import { type RouteLocationNormalized } from 'vue-router'
import { enrollmentAPI, enrollmentPeriodAPI, studentAPI } from '../services/api'
import { normalizeStudent, type NormalizedStudent } from '../utils/studentUtils'
import { DEFAULT_ENROLLMENT_FORM } from '../constants/studentConstants'

/**
 * 報名記錄類型
 */
export interface Enrollment {
  enrollment_id: number
  course_name: string
  enroll_date: string
  discount_rate: number
  periods: Array<unknown>
  is_deleted: boolean
  deleted_at: string | null
  is_active?: boolean
}

/**
 * 上課期間類型
 */
export interface Period {
  period_id: number | null
  start_date: string
  end_date: string
  is_active: boolean
  notes: string
}

/**
 * 報名表單類型
 */
export interface EnrollmentForm {
  course: string
  enroll_date: string
  discount_rate: number
}

/**
 * 學生報名管理 Composable
 */
export function useStudentEnrollment(
  selectedStudent: Ref<NormalizedStudent | null>,
  students: Ref<NormalizedStudent[]>,
  updateStudent: (id: number, data: Partial<NormalizedStudent>) => void,
  fetchStudents: (queryString?: string) => Promise<void>,
  route: RouteLocationNormalized
) {
  const showEnrollmentModal = ref(false)
  const enrollmentForm = ref<EnrollmentForm>({ ...DEFAULT_ENROLLMENT_FORM })
  const studentEnrollments = ref<Enrollment[]>([])
  const loadingEnrollments = ref(false)
  const savingEnrollment = ref(false)

  const showPeriodModal = ref(false)
  const selectedEnrollment = ref<Enrollment | null>(null)
  const periods = ref<Period[]>([])
  const loadingPeriods = ref(false)
  const savingPeriods = ref(false)

  /**
   * 打開報名模態框
   */
  const openEnrollmentModal = async (student: NormalizedStudent): Promise<void> => {
    selectedStudent.value = student
    enrollmentForm.value = { ...DEFAULT_ENROLLMENT_FORM }
    showEnrollmentModal.value = true
    loadingEnrollments.value = true

    try {
      // 只獲取未刪除的報名記錄
      const response = await enrollmentAPI.getAll(false)
      const data = response.data.results || response.data
      const allEnrollments = Array.isArray(data) ? data : []

      studentEnrollments.value = allEnrollments
        .filter((e: unknown) => {
          const enrollment = e as {
            student?: number | { student_id?: number; id?: number }
            student_id?: number
            is_deleted?: boolean
            [key: string]: unknown
          }
          // 只包含未刪除的報名記錄
          if (enrollment.is_deleted) return false
          
          const enrollmentStudentId =
            enrollment.student_id ||
            (typeof enrollment.student === 'number'
              ? enrollment.student
              : enrollment.student && typeof enrollment.student === 'object'
                ? enrollment.student.student_id || (enrollment.student as { id?: number }).id
                : null)
          return enrollmentStudentId === student.id
        })
        .map((e: unknown) => {
          const enrollment = e as {
            enrollment_id?: number
            id?: number
            course_name?: string
            course?: { course_name?: string }
            enroll_date?: string
            discount_rate?: number
            periods?: Array<unknown>
            is_active?: boolean
          }
          return {
            enrollment_id: enrollment.enrollment_id || enrollment.id || 0,
            course_name: enrollment.course_name || enrollment.course?.course_name || '',
            enroll_date: enrollment.enroll_date || '',
            discount_rate: enrollment.discount_rate || 0,
            periods: enrollment.periods || [],
            is_deleted: false, // 不再需要追蹤 is_deleted
            deleted_at: null,
            is_active: enrollment.is_active !== undefined ? enrollment.is_active : true,
          } as Enrollment
        })
    } catch (error) {
      console.error('獲取報名記錄失敗:', error)
      studentEnrollments.value = []
    } finally {
      loadingEnrollments.value = false
    }
  }

  /**
   * 關閉報名模態框
   */
  const closeEnrollmentModal = (): void => {
    showEnrollmentModal.value = false
    selectedStudent.value = null
    studentEnrollments.value = []
    enrollmentForm.value = { ...DEFAULT_ENROLLMENT_FORM }
  }

  /**
   * 保存報名
   */
  const saveEnrollment = async (): Promise<void> => {
    if (!selectedStudent.value) return

    savingEnrollment.value = true
    try {
      const submitData = {
        student_id: selectedStudent.value.id,
        course_id: parseInt(enrollmentForm.value.course),
        enroll_date: enrollmentForm.value.enroll_date,
        discount_rate: parseFloat(String(enrollmentForm.value.discount_rate)) || 0,
      }

      await enrollmentAPI.create(submitData)
      alert('報名成功！')

      enrollmentForm.value = { ...DEFAULT_ENROLLMENT_FORM }

      // 獲取該學生的最新數據（部分更新）
      try {
        const response = await studentAPI.getById(selectedStudent.value.id)
        const updatedStudentData = normalizeStudent(response.data)

        updateStudent(selectedStudent.value.id, updatedStudentData)
        Object.assign(selectedStudent.value, updatedStudentData)

        // 重新載入報名記錄
        await openEnrollmentModal(selectedStudent.value)
      } catch (fetchError) {
        console.error('獲取學生最新數據失敗，嘗試刷新整個列表:', fetchError)
        const queryString = new URLSearchParams(route.query).toString()
        await fetchStudents(queryString)
        if (selectedStudent.value) {
          const updatedStudent = students.value.find((s) => s.id === selectedStudent.value!.id)
          if (updatedStudent) {
            selectedStudent.value = updatedStudent
            await openEnrollmentModal(updatedStudent)
          }
        }
      }
    } catch (error: unknown) {
      console.error('報名失敗:', error)
      const err = error as { response?: { data?: { detail?: string } } }
      if (err.response?.data) {
        const errorMsg = err.response.data.detail || JSON.stringify(err.response.data)
        alert(`報名失敗：${errorMsg}`)
      } else {
        alert('報名失敗，請稍後再試')
      }
    } finally {
      savingEnrollment.value = false
    }
  }


  /**
   * 打開期間管理模態框
   */
  const openPeriodModal = async (enrollment: Enrollment): Promise<void> => {
    selectedEnrollment.value = enrollment
    showPeriodModal.value = true
    loadingPeriods.value = true

    try {
      const response = await enrollmentPeriodAPI.getByEnrollment(enrollment.enrollment_id)
      const data = response.data.results || response.data
      periods.value = Array.isArray(data)
        ? data.map((p: unknown) => {
            const period = p as {
              period_id?: number
              start_date?: string
              end_date?: string
              is_active?: boolean
              notes?: string
            }
            return {
              period_id: period.period_id || null,
              start_date: period.start_date ? period.start_date.split('T')[0] : '',
              end_date: period.end_date ? period.end_date.split('T')[0] : '',
              is_active: period.is_active !== undefined ? period.is_active : true,
              notes: period.notes || '',
            } as Period
          })
        : []

      // 如果沒有期間記錄，創建一個初始期間
      if (periods.value.length === 0 && enrollment.enroll_date) {
        periods.value = [
          {
            period_id: null,
            start_date: enrollment.enroll_date.split('T')[0] || enrollment.enroll_date,
            end_date: '',
            is_active: true,
            notes: '初始上課期間',
          },
        ]
      }
    } catch (error) {
      console.error('獲取上課期間失敗:', error)
      periods.value = []
    } finally {
      loadingPeriods.value = false
    }
  }

  /**
   * 關閉期間管理模態框
   */
  const closePeriodModal = (): void => {
    showPeriodModal.value = false
    selectedEnrollment.value = null
    periods.value = []
  }

  /**
   * 添加期間
   */
  const addPeriod = (): void => {
    periods.value.push({
      period_id: null,
      start_date: '',
      end_date: '',
      is_active: true,
      notes: '',
    })
  }

  /**
   * 移除期間
   */
  const removePeriod = (index: number): void => {
    if (periods.value.length > 1) {
      periods.value.splice(index, 1)
    } else {
      alert('至少需要保留一個上課期間')
    }
  }

  /**
   * 保存期間
   */
  const savePeriods = async (): Promise<void> => {
    if (!selectedEnrollment.value || !selectedStudent.value) return

    savingPeriods.value = true
    try {
      const enrollmentId = selectedEnrollment.value.enrollment_id

      // 獲取現有的期間記錄
      const existingResponse = await enrollmentPeriodAPI.getByEnrollment(enrollmentId)
      const existingData = existingResponse.data.results || existingResponse.data
      const existingPeriods = Array.isArray(existingData) ? existingData : []
      const existingIds = existingPeriods.map((p: unknown) => {
        const period = p as { period_id?: number }
        return period.period_id
      })

      // 保存或更新期間
      for (const period of periods.value) {
        const periodData = {
          enrollment_id: enrollmentId,
          start_date: period.start_date,
          end_date: period.end_date || null,
          is_active: period.is_active,
          notes: period.notes || '',
        }

        if (period.period_id && existingIds.includes(period.period_id)) {
          // 更新現有期間
          await enrollmentPeriodAPI.update(period.period_id, periodData)
        } else if (!period.period_id) {
          // 創建新期間
          await enrollmentPeriodAPI.create(periodData)
        }
      }

      // 刪除已移除的期間
      const currentIds = periods.value.filter((p) => p.period_id).map((p) => p.period_id)
      for (const existing of existingPeriods) {
        const period = existing as { period_id?: number }
        if (period.period_id && !currentIds.includes(period.period_id)) {
          await enrollmentPeriodAPI.delete(period.period_id)
        }
      }

      alert('儲存成功！')
      closePeriodModal()

      // 獲取該學生的最新數據（部分更新）
      try {
        const response = await studentAPI.getById(selectedStudent.value.id)
        const updatedStudentData = normalizeStudent(response.data)

        updateStudent(selectedStudent.value.id, updatedStudentData)
        Object.assign(selectedStudent.value, updatedStudentData)

        await openEnrollmentModal(selectedStudent.value)
      } catch (fetchError) {
        console.error('獲取學生最新數據失敗，嘗試刷新整個列表:', fetchError)
        const queryString = new URLSearchParams(route.query).toString()
        await fetchStudents(queryString)
        if (selectedStudent.value) {
          const updatedStudent = students.value.find((s) => s.id === selectedStudent.value!.id)
          if (updatedStudent) {
            selectedStudent.value = updatedStudent
            await openEnrollmentModal(updatedStudent)
          }
        }
      }
    } catch (error: unknown) {
      console.error('儲存期間失敗:', error)
      const err = error as { response?: { data?: { detail?: string } } }
      if (err.response?.data) {
        const errorMsg = err.response.data.detail || JSON.stringify(err.response.data)
        alert(`儲存失敗：${errorMsg}`)
      } else {
        alert('儲存失敗，請稍後再試')
      }
    } finally {
      savingPeriods.value = false
    }
  }

  return {
    // 狀態
    showEnrollmentModal,
    enrollmentForm,
    studentEnrollments,
    loadingEnrollments,
    savingEnrollment,
    showPeriodModal,
    selectedEnrollment,
    periods,
    loadingPeriods,
    savingPeriods,
    // 函數
    openEnrollmentModal,
    closeEnrollmentModal,
    saveEnrollment,
    openPeriodModal,
    closePeriodModal,
    addPeriod,
    removePeriod,
    savePeriods,
  }
}

