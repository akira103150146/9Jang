import { ref, computed } from 'vue'
import { studentAPI } from '../services/api'
import { normalizeStudent, type NormalizedStudent } from '../utils/studentUtils'
import { mockStudents } from '../data/mockData'

/**
 * 學生列表管理 Composable
 */
export function useStudentList() {
  const students = ref<NormalizedStudent[]>([])
  const loading = ref(false)
  const usingMock = ref(false)
  const showDeleted = ref(false)

  /**
   * 獲取學生列表
   */
  const fetchStudents = async (queryParams = ''): Promise<void> => {
    loading.value = true
    try {
      const response = await studentAPI.getAll(showDeleted.value, queryParams)
      const data = response.data.results || response.data
      students.value = data.map((item: unknown) => normalizeStudent(item as any))
      usingMock.value = false
    } catch (error) {
      console.warn('獲取學生資料失敗，使用 mock 資料：', error)
      students.value = mockStudents.map(item => normalizeStudent(item as any))
      usingMock.value = true
    } finally {
      loading.value = false
    }
  }

  /**
   * 刪除學生（軟刪除）
   */
  const deleteStudent = async (id: number, name: string): Promise<void> => {
    if (!id) {
      alert('示意資料無法刪除，請於 API 可用後再操作。')
      return
    }

    if (!confirm(`確定要刪除學生 ${name} 的資料嗎？\n（此操作為軟刪除，資料將被隱藏但不會真正刪除）`)) {
      return
    }

    try {
      await studentAPI.delete(id)
      alert('刪除成功（已隱藏）')
      await fetchStudents()
    } catch (error) {
      console.error('刪除失敗:', error)
      alert('刪除失敗，請稍後再試')
    }
  }

  /**
   * 恢復已刪除的學生
   */
  const restoreStudent = async (id: number, name: string): Promise<void> => {
    if (!confirm(`確定要恢復學生 ${name} 的資料嗎？`)) {
      return
    }

    try {
      await studentAPI.restore(id)
      alert('恢復成功')
      await fetchStudents()
    } catch (error) {
      console.error('恢復失敗:', error)
      alert('恢復失敗，請稍後再試')
    }
  }

  /**
   * 更新單個學生的數據
   */
  const updateStudent = (studentId: number, updatedData: Partial<NormalizedStudent>): void => {
    const index = students.value.findIndex(s => s.id === studentId)
    if (index !== -1) {
      Object.assign(students.value[index], updatedData)
    }
  }

  /**
   * 計算總費用
   */
  const totalFees = computed(() => {
    return students.value.reduce((sum, s) => sum + (s.total_fees || 0), 0)
  })

  /**
   * 計算待繳費用
   */
  const unpaidFees = computed(() => {
    return students.value.reduce((sum, s) => sum + (s.unpaid_fees || 0), 0)
  })

  /**
   * 需要生成學費的學生列表
   */
  const studentsWithTuitionNeeded = computed(() => {
    return students.value.filter(s => s.has_tuition_needed === true)
  })

  return {
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
  }
}

