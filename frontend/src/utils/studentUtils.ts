/**
 * 學生相關工具函數
 */

export interface NormalizedStudent {
  id: number
  name: string
  school: string
  grade: string
  phone: string
  emergency_contact_name: string
  emergency_contact_phone: string
  notes: string
  total_fees: number
  unpaid_fees: number
  enrollments_count: number
  enrollments: Array<{
    enrollment_id: number
    course_id?: number
    course_name: string
    enroll_date?: string
    is_active?: boolean
  }>
  student_groups: Array<{
    group_id: number
    name: string
    description?: string
  }>
  has_tuition_needed: boolean
  username: string
  password: string
  is_account_active: boolean | null
  must_change_password: boolean | null
  is_deleted: boolean
  deleted_at: string | null
}

export interface RawStudentData {
  student_id?: number
  id?: number
  name: string
  school: string
  grade: string
  phone?: string
  contact?: string
  emergency_contact_name?: string
  emergencyContactName?: string
  emergency_contact_phone?: string
  emergencyContactPhone?: string
  notes?: string
  total_fees?: number
  unpaid_fees?: number
  enrollments_count?: number
  enrollments?: Array<unknown>
  student_groups?: Array<unknown>
  has_tuition_needed?: boolean
  username?: string
  password?: string
  is_account_active?: boolean | null
  must_change_password?: boolean | null
  is_deleted?: boolean
  deleted_at?: string | null
}

/**
 * 標準化學生數據，統一字段名稱和格式
 */
export const normalizeStudent = (student: RawStudentData): NormalizedStudent => ({
  id: student.student_id || student.id || 0,
  name: student.name,
  school: student.school,
  grade: student.grade,
  phone: student.phone || student.contact || '',
  emergency_contact_name: student.emergency_contact_name || student.emergencyContactName || '',
  emergency_contact_phone: student.emergency_contact_phone || student.emergencyContactPhone || '',
  notes: student.notes || '',
  total_fees: student.total_fees || 0,
  unpaid_fees: student.unpaid_fees || 0,
  enrollments_count: student.enrollments_count || 0,
  enrollments: (student.enrollments as NormalizedStudent['enrollments']) || [],
  student_groups: (student.student_groups as NormalizedStudent['student_groups']) || [],
  has_tuition_needed: student.has_tuition_needed || false,
  username: student.username || '',
  password: student.password || '',
  is_account_active: student.is_account_active,
  must_change_password: student.must_change_password,
  is_deleted: student.is_deleted || false,
  deleted_at: student.deleted_at || null,
})

