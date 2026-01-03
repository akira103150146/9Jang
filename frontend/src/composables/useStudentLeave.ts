import { ref, type Ref } from 'vue'
import { leaveAPI } from '../services/api'
import { formatDate } from '../utils/studentFormatters'
import {
  LEAVE_STATUS_MAP,
  LEAVE_STATUS_COLORS,
  DEFAULT_LEAVE_FORM,
} from '../constants/studentConstants'
import type { NormalizedStudent } from '../utils/studentUtils'

/**
 * 請假記錄類型
 */
export interface Leave {
  leave_id: number
  student_name: string
  course_name: string
  leave_date: string
  reason: string
  approval_status: 'Pending' | 'Approved' | 'Rejected'
  is_deleted: boolean
  deleted_at: string | null
}

/**
 * 請假表單類型
 */
export interface LeaveForm {
  course: string
  leave_date: string
  reason: string
  approval_status: 'Pending' | 'Approved' | 'Rejected'
}

/**
 * 請假數據類型
 */
export interface LeaveData {
  leaves: Leave[]
}

/**
 * 課程類型
 */
export interface Course {
  course_id?: number
  id?: number
  course_name?: string
  [key: string]: unknown
}

/**
 * 學生請假管理 Composable
 */
export function useStudentLeave(
  selectedStudent: Ref<NormalizedStudent | null>,
  courses: Ref<Course[]>
) {
  const showLeaveModal = ref(false)
  const loadingLeave = ref(false)
  const savingLeave = ref(false)
  const showDeletedLeaves = ref(false)
  const leaveData = ref<LeaveData>({
    leaves: [],
  })
  const leaveForm = ref<LeaveForm>({ ...DEFAULT_LEAVE_FORM })

  /**
   * 打開請假模態框
   */
  const openLeaveModal = async (student: NormalizedStudent): Promise<void> => {
    selectedStudent.value = student
    showLeaveModal.value = true
    loadingLeave.value = true

    try {
      const leavesResponse = await leaveAPI.getAll(showDeletedLeaves.value)
      const leavesData = leavesResponse.data.results || leavesResponse.data
      const allLeaves = Array.isArray(leavesData) ? leavesData : []

      // #region agent log
      fetch('http://127.0.0.1:2000/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStudentLeave.ts:81',message:'Processing leaves data',data:{allLeavesLength:allLeaves.length,firstLeave:JSON.stringify(allLeaves[0])},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      
      leaveData.value = {
        leaves: allLeaves
          .filter((l: unknown) => {
            const leave = l as {
              student?: number | { student_id?: number; id?: number }
              student_id?: number
              [key: string]: unknown
            }
            const leaveStudentId =
              leave.student_id ||
              (typeof leave.student === 'number'
                ? leave.student
                : leave.student && typeof leave.student === 'object'
                  ? leave.student.student_id || (leave.student as { id?: number }).id
                  : null)
            return leaveStudentId === student.id || leaveStudentId === student.id
          })
          .map((l: unknown) => {
            const leave = l as {
              leave_id?: number
              id?: number
              course_id?: number
              course?: { course_id?: number; course_name?: string } | number
              student_name?: string
              student?: { name?: string }
              course_name?: string
              leave_date?: string
              reason?: string
              approval_status?: string
              is_deleted?: boolean
              deleted_at?: string | null
            }
            // #region agent log
            fetch('http://127.0.0.1:2000/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStudentLeave.ts:99',message:'Mapping leave data',data:{leave:JSON.stringify(leave),courseId:leave.course_id,course:leave.course,courseName:leave.course_name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            
            const mappedLeave = {
              leave_id: leave.leave_id || leave.id || 0,
              student_name: leave.student_name || leave.student?.name || '',
              course_name: leave.course_name || (typeof leave.course === 'object' && leave.course ? leave.course.course_name : '') || '',
              leave_date: leave.leave_date || '',
              reason: leave.reason || '',
              approval_status: (leave.approval_status as 'Pending' | 'Approved' | 'Rejected') || 'Pending',
              is_deleted: leave.is_deleted || false,
              deleted_at: leave.deleted_at || null,
            } as Leave
            
            // #region agent log
            fetch('http://127.0.0.1:2000/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStudentLeave.ts:121',message:'Mapped leave result',data:{mappedLeave:JSON.stringify(mappedLeave),courseName:mappedLeave.course_name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            
            return mappedLeave
          }),
      }
      
      // #region agent log
      fetch('http://127.0.0.1:2000/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStudentLeave.ts:127',message:'Final leaves data',data:{leavesCount:leaveData.value.leaves.length,firstLeave:JSON.stringify(leaveData.value.leaves[0])},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
    } catch (error) {
      console.error('獲取請假記錄失敗：', error)
      alert('獲取請假記錄失敗')
      leaveData.value = {
        leaves: [],
      }
    } finally {
      loadingLeave.value = false
    }
  }

  /**
   * 關閉請假模態框
   */
  const closeLeaveModal = (): void => {
    showLeaveModal.value = false
    selectedStudent.value = null
    leaveData.value = {
      leaves: [],
    }
    leaveForm.value = { ...DEFAULT_LEAVE_FORM }
  }

  /**
   * 提交請假記錄
   */
  const submitLeave = async (): Promise<void> => {
    if (!selectedStudent.value) return

    // #region agent log
    fetch('http://127.0.0.1:2000/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStudentLeave.ts:150',message:'submitLeave called',data:{leaveForm:JSON.stringify(leaveForm.value),selectedStudentId:selectedStudent.value.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    // 驗證必填字段
    if (!leaveForm.value.course) {
      // #region agent log
      fetch('http://127.0.0.1:2000/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStudentLeave.ts:154',message:'Course validation failed',data:{course:leaveForm.value.course},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      alert('請選擇課程')
      return
    }
    if (!leaveForm.value.leave_date) {
      alert('請選擇請假日期')
      return
    }
    const trimmedReason = leaveForm.value.reason.trim()
    if (!trimmedReason) {
      alert('請輸入請假原因')
      return
    }

    savingLeave.value = true
    try {
      const courseIdParsed = parseInt(String(leaveForm.value.course))
      // #region agent log
      fetch('http://127.0.0.1:2000/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStudentLeave.ts:172',message:'Parsing course_id',data:{courseValue:leaveForm.value.course,courseIdParsed,isNaN:isNaN(courseIdParsed)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      const submitData = {
        student_id: selectedStudent.value.id,
        course_id: courseIdParsed,
        leave_date: leaveForm.value.leave_date,
        reason: trimmedReason,
        approval_status: leaveForm.value.approval_status,
      }
      
      // #region agent log
      fetch('http://127.0.0.1:2000/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStudentLeave.ts:180',message:'Submitting leave data',data:{submitData:JSON.stringify(submitData)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion

      const response = await leaveAPI.create(submitData)
      // #region agent log
      fetch('http://127.0.0.1:2000/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStudentLeave.ts:185',message:'Leave created response',data:{response:JSON.stringify(response.data)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      alert('新增請假記錄成功！')

      leaveForm.value = { ...DEFAULT_LEAVE_FORM }

      // 重新載入請假記錄
      if (selectedStudent.value) {
        await openLeaveModal(selectedStudent.value)
      }
    } catch (error: unknown) {
      console.error('新增請假記錄失敗:', error)
      // #region agent log
      fetch('http://127.0.0.1:2000/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStudentLeave.ts:196',message:'Leave creation error',data:{error:JSON.stringify(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      const err = error as { response?: { data?: { detail?: string } } }
      if (err.response?.data) {
        const errorMsg = err.response.data.detail || JSON.stringify(err.response.data)
        alert(`新增請假記錄失敗：${errorMsg}`)
      } else {
        alert('新增請假記錄失敗，請稍後再試')
      }
    } finally {
      savingLeave.value = false
    }
  }

  /**
   * 刪除請假記錄
   */
  const deleteLeave = async (leaveId: number, studentName: string): Promise<void> => {
    if (
      !confirm(
        `確定要刪除 ${studentName} 的這筆請假記錄嗎？\n（此操作為軟刪除，資料將被隱藏但不會真正刪除）`
      )
    ) {
      return
    }

    try {
      await leaveAPI.delete(leaveId)
      alert('刪除成功（已隱藏）')
      // 重新載入請假記錄
      if (selectedStudent.value) {
        await openLeaveModal(selectedStudent.value)
      }
    } catch (error) {
      console.error('刪除請假記錄失敗:', error)
      alert('刪除請假記錄失敗，請稍後再試')
    }
  }

  /**
   * 恢復請假記錄
   */
  const restoreLeave = async (leaveId: number, studentName: string): Promise<void> => {
    if (!confirm(`確定要恢復 ${studentName} 的這筆請假記錄嗎？`)) {
      return
    }

    try {
      await leaveAPI.restore(leaveId)
      alert('恢復成功')
      // 重新載入請假記錄
      if (selectedStudent.value) {
        await openLeaveModal(selectedStudent.value)
      }
    } catch (error) {
      console.error('恢復請假記錄失敗:', error)
      alert('恢復請假記錄失敗，請稍後再試')
    }
  }

  /**
   * 獲取請假狀態顏色
   */
  const getLeaveStatusColor = (status: string): string => {
    return LEAVE_STATUS_COLORS[status] || 'bg-slate-50 text-slate-600'
  }

  /**
   * 獲取請假狀態顯示文字
   */
  const getLeaveStatusDisplay = (status: string): string => {
    return LEAVE_STATUS_MAP[status] || status
  }

  return {
    // 狀態
    showLeaveModal,
    loadingLeave,
    savingLeave,
    leaveData,
    leaveForm,
    // 函數
    openLeaveModal,
    closeLeaveModal,
    submitLeave,
    deleteLeave,
    restoreLeave,
    getLeaveStatusColor,
    getLeaveStatusDisplay,
  }
}

