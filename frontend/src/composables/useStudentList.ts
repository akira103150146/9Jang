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
  
  // 分頁相關狀態
  const currentPage = ref(1)
  const pageSize = ref(10)
  const totalCount = ref(0)
  const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

  /**
   * 獲取學生列表
   */
  const fetchStudents = async (queryParams = ''): Promise<void> => {
    loading.value = true
    try {
      // 添加分頁參數
      const params = new URLSearchParams(queryParams)
      params.append('page', currentPage.value.toString())
      params.append('page_size', pageSize.value.toString())
      
      const response = await studentAPI.getAll(showDeleted.value, params.toString())
      
      // 判斷是否為分頁響應
      if (response.data && typeof response.data === 'object' && 'results' in response.data) {
        // 分頁響應
        const paginatedData = response.data
        students.value = paginatedData.results.map((item: unknown) => normalizeStudent(item as any))
        totalCount.value = paginatedData.count
      } else {
        // 非分頁響應（向後兼容）
        const data = Array.isArray(response.data) ? response.data : []
        students.value = data.map((item: unknown) => normalizeStudent(item as any))
        totalCount.value = students.value.length
      }
      
      usingMock.value = false
    } catch (error) {
      console.warn('獲取學生資料失敗，使用 mock 資料：', error)
      students.value = mockStudents.map(item => normalizeStudent(item as any))
      totalCount.value = students.value.length
      usingMock.value = true
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 設置當前頁碼
   */
  const setCurrentPage = (page: number): void => {
    if (page >= 1 && (totalPages.value === 0 || page <= totalPages.value)) {
      currentPage.value = page
    }
  }
  
  /**
   * 設置每頁顯示數量
   */
  const setPageSize = (size: number): void => {
    pageSize.value = size
    currentPage.value = 1 // 重置到第一頁
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
    // 分頁相關
    currentPage,
    pageSize,
    totalCount,
    totalPages,
    setCurrentPage,
    setPageSize,
  }
}

