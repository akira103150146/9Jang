import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useStudentList } from './useStudentList'
import { studentAPI } from '../services/api'
import { mockStudents } from '../data/mockData'

// Mock studentAPI
vi.mock('../services/api', () => ({
  studentAPI: {
    getAll: vi.fn(),
    delete: vi.fn(),
    restore: vi.fn()
  }
}))

// Mock mockData
vi.mock('../data/mockData', () => ({
  mockStudents: [
    { student_id: 1, name: 'Mock 學生1', school: 'Mock 學校', grade: '一年級' },
    { student_id: 2, name: 'Mock 學生2', school: 'Mock 學校', grade: '二年級' }
  ]
}))

describe('useStudentList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.alert = vi.fn()
    global.confirm = vi.fn(() => true)
  })

  it('should initialize with empty state', () => {
    const { students, loading, usingMock, showDeleted } = useStudentList()

    expect(students.value).toEqual([])
    expect(loading.value).toBe(false)
    expect(usingMock.value).toBe(false)
    expect(showDeleted.value).toBe(false)
  })

  it('should fetch students successfully', async () => {
    const mockResponse = {
      data: {
        results: [
          { student_id: 1, name: '學生1', school: '學校1', grade: '一年級', total_fees: 1000, unpaid_fees: 500 },
          { student_id: 2, name: '學生2', school: '學校2', grade: '二年級', total_fees: 2000, unpaid_fees: 0 }
        ]
      }
    }

    vi.mocked(studentAPI.getAll).mockResolvedValueOnce(mockResponse as any)

    const { fetchStudents, students, loading, usingMock } = useStudentList()

    await fetchStudents()

    expect(loading.value).toBe(false)
    expect(usingMock.value).toBe(false)
    expect(students.value.length).toBe(2)
    expect(students.value[0].name).toBe('學生1')
    expect(students.value[1].name).toBe('學生2')
  })

  it('should handle API response without results', async () => {
    const mockResponse = {
      data: [
        { student_id: 1, name: '學生1', school: '學校1', grade: '一年級' }
      ]
    }

    vi.mocked(studentAPI.getAll).mockResolvedValueOnce(mockResponse as any)

    const { fetchStudents, students } = useStudentList()

    await fetchStudents()

    expect(students.value.length).toBe(1)
  })

  it('should use mock data on API failure', async () => {
    vi.mocked(studentAPI.getAll).mockRejectedValueOnce(new Error('API Error'))

    const { fetchStudents, students, usingMock } = useStudentList()

    await fetchStudents()

    expect(usingMock.value).toBe(true)
    expect(students.value.length).toBeGreaterThan(0)
  })

  it('should calculate total fees', async () => {
    const mockResponse = {
      data: {
        results: [
          { student_id: 1, name: '學生1', school: '學校1', grade: '一年級', total_fees: 1000, unpaid_fees: 500 },
          { student_id: 2, name: '學生2', school: '學校2', grade: '二年級', total_fees: 2000, unpaid_fees: 0 },
          { student_id: 3, name: '學生3', school: '學校3', grade: '三年級', total_fees: 1500, unpaid_fees: 300 }
        ]
      }
    }

    vi.mocked(studentAPI.getAll).mockResolvedValueOnce(mockResponse as any)

    const { fetchStudents, totalFees } = useStudentList()

    await fetchStudents()

    expect(totalFees.value).toBe(4500)
  })

  it('should calculate unpaid fees', async () => {
    const mockResponse = {
      data: {
        results: [
          { student_id: 1, name: '學生1', school: '學校1', grade: '一年級', total_fees: 1000, unpaid_fees: 500 },
          { student_id: 2, name: '學生2', school: '學校2', grade: '二年級', total_fees: 2000, unpaid_fees: 0 },
          { student_id: 3, name: '學生3', school: '學校3', grade: '三年級', total_fees: 1500, unpaid_fees: 300 }
        ]
      }
    }

    vi.mocked(studentAPI.getAll).mockResolvedValueOnce(mockResponse as any)

    const { fetchStudents, unpaidFees } = useStudentList()

    await fetchStudents()

    expect(unpaidFees.value).toBe(800)
  })

  it('should filter students with tuition needed', async () => {
    const mockResponse = {
      data: {
        results: [
          { student_id: 1, name: '學生1', school: '學校1', grade: '一年級', has_tuition_needed: true },
          { student_id: 2, name: '學生2', school: '學校2', grade: '二年級', has_tuition_needed: false },
          { student_id: 3, name: '學生3', school: '學校3', grade: '三年級', has_tuition_needed: true }
        ]
      }
    }

    vi.mocked(studentAPI.getAll).mockResolvedValueOnce(mockResponse as any)

    const { fetchStudents, studentsWithTuitionNeeded } = useStudentList()

    await fetchStudents()

    expect(studentsWithTuitionNeeded.value.length).toBe(2)
    expect(studentsWithTuitionNeeded.value[0].id).toBe(1)
    expect(studentsWithTuitionNeeded.value[1].id).toBe(3)
  })

  it('should delete student successfully', async () => {
    const mockResponse = {
      data: {
        results: [
          { student_id: 1, name: '學生1', school: '學校1', grade: '一年級' }
        ]
      }
    }

    vi.mocked(studentAPI.getAll).mockResolvedValue(mockResponse as any)
    vi.mocked(studentAPI.delete).mockResolvedValueOnce({} as any)

    const { fetchStudents, deleteStudent } = useStudentList()
    await fetchStudents()

    await deleteStudent(1, '學生1')

    expect(studentAPI.delete).toHaveBeenCalledWith(1)
    expect(global.alert).toHaveBeenCalledWith('刪除成功（已隱藏）')
  })

  it('should not delete student without id', async () => {
    const { deleteStudent } = useStudentList()

    await deleteStudent(0, '學生1')

    expect(studentAPI.delete).not.toHaveBeenCalled()
    expect(global.alert).toHaveBeenCalledWith('示意資料無法刪除，請於 API 可用後再操作。')
  })

  it('should not delete student if user cancels', async () => {
    global.confirm = vi.fn(() => false)

    const { deleteStudent } = useStudentList()

    await deleteStudent(1, '學生1')

    expect(studentAPI.delete).not.toHaveBeenCalled()
  })

  it('should handle delete error', async () => {
    vi.mocked(studentAPI.delete).mockRejectedValueOnce(new Error('Delete failed'))

    const { deleteStudent } = useStudentList()

    await deleteStudent(1, '學生1')

    expect(global.alert).toHaveBeenCalledWith('刪除失敗，請稍後再試')
  })

  it('should restore student successfully', async () => {
    const mockResponse = {
      data: {
        results: [
          { student_id: 1, name: '學生1', school: '學校1', grade: '一年級' }
        ]
      }
    }

    vi.mocked(studentAPI.getAll).mockResolvedValue(mockResponse as any)
    vi.mocked(studentAPI.restore).mockResolvedValueOnce({} as any)

    const { fetchStudents, restoreStudent } = useStudentList()
    await fetchStudents()

    await restoreStudent(1, '學生1')

    expect(studentAPI.restore).toHaveBeenCalledWith(1)
    expect(global.alert).toHaveBeenCalledWith('恢復成功')
  })

  it('should not restore student if user cancels', async () => {
    global.confirm = vi.fn(() => false)

    const { restoreStudent } = useStudentList()

    await restoreStudent(1, '學生1')

    expect(studentAPI.restore).not.toHaveBeenCalled()
  })

  it('should handle restore error', async () => {
    vi.mocked(studentAPI.restore).mockRejectedValueOnce(new Error('Restore failed'))

    const { restoreStudent } = useStudentList()

    await restoreStudent(1, '學生1')

    expect(global.alert).toHaveBeenCalledWith('恢復失敗，請稍後再試')
  })

  it('should update student data', async () => {
    const mockResponse = {
      data: {
        results: [
          { student_id: 1, name: '學生1', school: '學校1', grade: '一年級', phone: '0912345678' }
        ]
      }
    }

    vi.mocked(studentAPI.getAll).mockResolvedValueOnce(mockResponse as any)

    const { fetchStudents, updateStudent, students } = useStudentList()

    await fetchStudents()

    updateStudent(1, { phone: '0987654321', name: '更新後的學生1' })

    expect(students.value[0].phone).toBe('0987654321')
    expect(students.value[0].name).toBe('更新後的學生1')
  })

  it('should not update non-existent student', async () => {
    const mockResponse = {
      data: {
        results: [
          { student_id: 1, name: '學生1', school: '學校1', grade: '一年級' }
        ]
      }
    }

    vi.mocked(studentAPI.getAll).mockResolvedValueOnce(mockResponse as any)

    const { fetchStudents, updateStudent, students } = useStudentList()

    await fetchStudents()

    const originalName = students.value[0].name
    updateStudent(999, { name: '不存在的學生' })

    expect(students.value[0].name).toBe(originalName)
  })

  it('should handle fees with null or undefined', async () => {
    const mockResponse = {
      data: {
        results: [
          { student_id: 1, name: '學生1', school: '學校1', grade: '一年級' },
          { student_id: 2, name: '學生2', school: '學校2', grade: '二年級', total_fees: 1000, unpaid_fees: null }
        ]
      }
    }

    vi.mocked(studentAPI.getAll).mockResolvedValueOnce(mockResponse as any)

    const { fetchStudents, totalFees, unpaidFees } = useStudentList()

    await fetchStudents()

    expect(totalFees.value).toBe(1000)
    expect(unpaidFees.value).toBe(0)
  })

  it('should pass query params to fetchStudents', async () => {
    const mockResponse = {
      data: { results: [] }
    }

    vi.mocked(studentAPI.getAll).mockResolvedValueOnce(mockResponse as any)

    const { fetchStudents } = useStudentList()

    await fetchStudents('name=測試&school=學校')

    expect(studentAPI.getAll).toHaveBeenCalledWith(false, 'name=測試&school=學校')
  })

  it('should use showDeleted flag when fetching', async () => {
    const mockResponse = {
      data: { results: [] }
    }

    vi.mocked(studentAPI.getAll).mockResolvedValueOnce(mockResponse as any)

    const { fetchStudents, showDeleted } = useStudentList()

    showDeleted.value = true
    await fetchStudents()

    expect(studentAPI.getAll).toHaveBeenCalledWith(true, '')
  })
})
