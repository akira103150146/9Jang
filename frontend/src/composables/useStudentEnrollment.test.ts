import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { useStudentEnrollment } from './useStudentEnrollment'
import { enrollmentAPI, enrollmentPeriodAPI, studentAPI } from '../services/api'
import { normalizeStudent, type NormalizedStudent } from '../utils/studentUtils'

// Mock APIs
vi.mock('../services/api', () => ({
  enrollmentAPI: {
    getAll: vi.fn(),
    create: vi.fn()
  },
  enrollmentPeriodAPI: {
    getByEnrollment: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  },
  studentAPI: {
    getById: vi.fn()
  }
}))

// Mock router
const mockRoute = {
  query: {},
  params: {},
  path: '/students',
  name: 'students',
  meta: {}
}

describe('useStudentEnrollment', () => {
  let selectedStudent: ReturnType<typeof ref<NormalizedStudent | null>>
  let students: ReturnType<typeof ref<NormalizedStudent[]>>
  let updateStudent: (id: number, data: Partial<NormalizedStudent>) => void
  let fetchStudents: (queryString?: string) => Promise<void>

  beforeEach(() => {
    vi.clearAllMocks()
    global.alert = vi.fn()
    
    selectedStudent = ref<NormalizedStudent | null>({
      id: 1,
      name: '測試學生',
      school: '測試學校',
      grade: '一年級',
      phone: '0912345678',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      notes: '',
      total_fees: 0,
      unpaid_fees: 0,
      enrollments_count: 0,
      enrollments: [],
      student_groups: [],
      has_tuition_needed: false,
      username: '',
      password: '',
      is_account_active: null,
      must_change_password: null,
      is_deleted: false,
      deleted_at: null
    })

    students = ref([selectedStudent.value!])
    
    updateStudent = vi.fn()
    fetchStudents = vi.fn().mockResolvedValue(undefined)
  })

  it('should initialize with default state', () => {
    const { 
      showEnrollmentModal, 
      enrollmentForm, 
      studentEnrollments,
      showPeriodModal,
      periods
    } = useStudentEnrollment(
      selectedStudent,
      students,
      updateStudent,
      fetchStudents,
      mockRoute as any
    )

    expect(showEnrollmentModal.value).toBe(false)
    expect(enrollmentForm.value.course).toBe('')
    expect(enrollmentForm.value.discount_rate).toBe(0)
    expect(studentEnrollments.value).toEqual([])
    expect(showPeriodModal.value).toBe(false)
    expect(periods.value).toEqual([])
  })

  it('should open enrollment modal and fetch enrollments', async () => {
    const mockEnrollments = {
      data: {
        results: [
          {
            enrollment_id: 1,
            student: 1,
            course_name: '數學',
            enroll_date: '2024-01-01',
            discount_rate: 0,
            periods: [],
            is_deleted: false,
            is_active: true
          }
        ]
      }
    }

    vi.mocked(enrollmentAPI.getAll).mockResolvedValueOnce(mockEnrollments as any)

    const { openEnrollmentModal, showEnrollmentModal, studentEnrollments, loadingEnrollments } = 
      useStudentEnrollment(selectedStudent, students, updateStudent, fetchStudents, mockRoute as any)

    await openEnrollmentModal(selectedStudent.value!)

    expect(showEnrollmentModal.value).toBe(true)
    expect(selectedStudent.value).toBeTruthy()
    expect(loadingEnrollments.value).toBe(false)
    expect(studentEnrollments.value.length).toBe(1)
    expect(studentEnrollments.value[0].course_name).toBe('數學')
  })

  it('should filter enrollments by student id', async () => {
    const mockEnrollments = {
      data: {
        results: [
          {
            enrollment_id: 1,
            student: 1,
            course_name: '數學',
            enroll_date: '2024-01-01',
            discount_rate: 0,
            is_deleted: false
          },
          {
            enrollment_id: 2,
            student: 2,
            course_name: '英文',
            enroll_date: '2024-01-01',
            discount_rate: 0,
            is_deleted: false
          }
        ]
      }
    }

    vi.mocked(enrollmentAPI.getAll).mockResolvedValueOnce(mockEnrollments as any)

    const { openEnrollmentModal, studentEnrollments } = 
      useStudentEnrollment(selectedStudent, students, updateStudent, fetchStudents, mockRoute as any)

    await openEnrollmentModal(selectedStudent.value!)

    expect(studentEnrollments.value.length).toBe(1)
    expect(studentEnrollments.value[0].enrollment_id).toBe(1)
  })

  it('should filter out deleted enrollments', async () => {
    const mockEnrollments = {
      data: {
        results: [
          {
            enrollment_id: 1,
            student: 1,
            course_name: '數學',
            enroll_date: '2024-01-01',
            discount_rate: 0,
            is_deleted: false
          },
          {
            enrollment_id: 2,
            student: 1,
            course_name: '英文',
            enroll_date: '2024-01-01',
            discount_rate: 0,
            is_deleted: true
          }
        ]
      }
    }

    vi.mocked(enrollmentAPI.getAll).mockResolvedValueOnce(mockEnrollments as any)

    const { openEnrollmentModal, studentEnrollments } = 
      useStudentEnrollment(selectedStudent, students, updateStudent, fetchStudents, mockRoute as any)

    await openEnrollmentModal(selectedStudent.value!)

    expect(studentEnrollments.value.length).toBe(1)
    expect(studentEnrollments.value[0].enrollment_id).toBe(1)
  })

  it('should close enrollment modal', () => {
    const { closeEnrollmentModal, showEnrollmentModal, enrollmentForm } = 
      useStudentEnrollment(selectedStudent, students, updateStudent, fetchStudents, mockRoute as any)

    showEnrollmentModal.value = true
    closeEnrollmentModal()

    expect(showEnrollmentModal.value).toBe(false)
    expect(selectedStudent.value).toBe(null)
    expect(enrollmentForm.value.course).toBe('')
  })

  it('should save enrollment successfully', async () => {
    const mockCreateResponse = { data: { enrollment_id: 1 } }
    const mockStudentResponse = {
      data: {
        student_id: 1,
        name: '測試學生',
        school: '測試學校',
        grade: '一年級',
        enrollments_count: 1
      }
    }

    vi.mocked(enrollmentAPI.create).mockResolvedValueOnce(mockCreateResponse as any)
    vi.mocked(enrollmentAPI.getAll).mockResolvedValueOnce({ data: { results: [] } } as any)
    vi.mocked(studentAPI.getById).mockResolvedValueOnce(mockStudentResponse as any)

    const { openEnrollmentModal, saveEnrollment, enrollmentForm } = 
      useStudentEnrollment(selectedStudent, students, updateStudent, fetchStudents, mockRoute as any)

    await openEnrollmentModal(selectedStudent.value!)
    
    enrollmentForm.value = {
      course: '1',
      enroll_date: '2024-01-01',
      discount_rate: 10
    }

    await saveEnrollment()

    expect(enrollmentAPI.create).toHaveBeenCalledWith({
      student: 1,
      course: 1,
      enroll_date: '2024-01-01',
      discount_rate: 10
    })
    expect(global.alert).toHaveBeenCalledWith('報名成功！')
  })

  it('should handle enrollment save error', async () => {
    vi.mocked(enrollmentAPI.create).mockRejectedValueOnce({
      response: {
        data: {
          detail: '報名失敗'
        }
      }
    })

    const { saveEnrollment, enrollmentForm } = 
      useStudentEnrollment(selectedStudent, students, updateStudent, fetchStudents, mockRoute as any)

    enrollmentForm.value = {
      course: '1',
      enroll_date: '2024-01-01',
      discount_rate: 0
    }

    await saveEnrollment()

    expect(global.alert).toHaveBeenCalledWith('報名失敗：報名失敗')
  })

  it('should open period modal and fetch periods', async () => {
    const mockEnrollment = {
      enrollment_id: 1,
      course_name: '數學',
      enroll_date: '2024-01-01',
      discount_rate: 0,
      periods: [],
      is_deleted: false,
      is_active: true
    }

    const mockPeriods = {
      data: {
        results: [
          {
            period_id: 1,
            start_date: '2024-01-01T00:00:00',
            end_date: '2024-01-31T00:00:00',
            is_active: true,
            notes: '第一個月'
          }
        ]
      }
    }

    vi.mocked(enrollmentPeriodAPI.getByEnrollment).mockResolvedValueOnce(mockPeriods as any)

    const { openPeriodModal, showPeriodModal, periods, loadingPeriods } = 
      useStudentEnrollment(selectedStudent, students, updateStudent, fetchStudents, mockRoute as any)

    await openPeriodModal(mockEnrollment)

    expect(showPeriodModal.value).toBe(true)
    expect(loadingPeriods.value).toBe(false)
    expect(periods.value.length).toBe(1)
    expect(periods.value[0].start_date).toBe('2024-01-01')
    expect(periods.value[0].end_date).toBe('2024-01-31')
  })

  it('should create initial period if no periods exist', async () => {
    const mockEnrollment = {
      enrollment_id: 1,
      course_name: '數學',
      enroll_date: '2024-01-01',
      discount_rate: 0,
      periods: [],
      is_deleted: false,
      is_active: true
    }

    vi.mocked(enrollmentPeriodAPI.getByEnrollment).mockResolvedValueOnce({ data: { results: [] } } as any)

    const { openPeriodModal, periods } = 
      useStudentEnrollment(selectedStudent, students, updateStudent, fetchStudents, mockRoute as any)

    await openPeriodModal(mockEnrollment)

    expect(periods.value.length).toBe(1)
    expect(periods.value[0].start_date).toBe('2024-01-01')
    expect(periods.value[0].notes).toBe('初始上課期間')
  })

  it('should add period', () => {
    const { addPeriod, periods } = 
      useStudentEnrollment(selectedStudent, students, updateStudent, fetchStudents, mockRoute as any)

    addPeriod()

    expect(periods.value.length).toBe(1)
    expect(periods.value[0].period_id).toBe(null)
    expect(periods.value[0].is_active).toBe(true)
  })

  it('should remove period if more than one exists', () => {
    const { addPeriod, removePeriod, periods } = 
      useStudentEnrollment(selectedStudent, students, updateStudent, fetchStudents, mockRoute as any)

    addPeriod()
    addPeriod()
    expect(periods.value.length).toBe(2)

    removePeriod(0)
    expect(periods.value.length).toBe(1)
  })

  it('should not remove last period', () => {
    global.alert = vi.fn()
    
    const { addPeriod, removePeriod, periods } = 
      useStudentEnrollment(selectedStudent, students, updateStudent, fetchStudents, mockRoute as any)

    addPeriod()
    expect(periods.value.length).toBe(1)

    removePeriod(0)
    expect(periods.value.length).toBe(1)
    expect(global.alert).toHaveBeenCalledWith('至少需要保留一個上課期間')
  })

  it('should close period modal', () => {
    const { closePeriodModal, showPeriodModal, periods } = 
      useStudentEnrollment(selectedStudent, students, updateStudent, fetchStudents, mockRoute as any)

    showPeriodModal.value = true
    periods.value = [{ period_id: 1, start_date: '2024-01-01', end_date: '2024-01-31', is_active: true, notes: '' }]
    
    closePeriodModal()

    expect(showPeriodModal.value).toBe(false)
    expect(periods.value).toEqual([])
  })

  it('should save periods successfully', async () => {
    const mockEnrollment = {
      enrollment_id: 1,
      course_name: '數學',
      enroll_date: '2024-01-01',
      discount_rate: 0,
      periods: [],
      is_deleted: false,
      is_active: true
    }

    const mockExistingPeriods = {
      data: { results: [] }
    }

    const mockStudentResponse = {
      data: {
        student_id: 1,
        name: '測試學生',
        school: '測試學校',
        grade: '一年級'
      }
    }

    vi.mocked(enrollmentPeriodAPI.getByEnrollment).mockResolvedValue(mockExistingPeriods as any)
    vi.mocked(enrollmentPeriodAPI.create).mockResolvedValue({ data: {} } as any)
    vi.mocked(enrollmentAPI.getAll).mockResolvedValue({ data: { results: [] } } as any)
    vi.mocked(studentAPI.getById).mockResolvedValue(mockStudentResponse as any)

    const composable = useStudentEnrollment(selectedStudent, students, updateStudent, fetchStudents, mockRoute as any)

    await composable.openPeriodModal(mockEnrollment)
    composable.addPeriod()
    composable.periods.value[0].start_date = '2024-01-01'
    composable.periods.value[0].end_date = '2024-01-31'

    await composable.savePeriods()

    expect(enrollmentPeriodAPI.create).toHaveBeenCalled()
    expect(global.alert).toHaveBeenCalledWith('儲存成功！')
  })

  it('should not save enrollment without selected student', async () => {
    selectedStudent.value = null

    const { saveEnrollment } = 
      useStudentEnrollment(selectedStudent, students, updateStudent, fetchStudents, mockRoute as any)

    await saveEnrollment()

    expect(enrollmentAPI.create).not.toHaveBeenCalled()
  })

  it('should not save periods without selected enrollment', async () => {
    const { savePeriods } = 
      useStudentEnrollment(selectedStudent, students, updateStudent, fetchStudents, mockRoute as any)

    await savePeriods()

    expect(enrollmentPeriodAPI.create).not.toHaveBeenCalled()
  })
})
