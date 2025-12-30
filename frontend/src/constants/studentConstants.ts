/**
 * 學生管理相關常量
 */

export const LEAVE_STATUS_MAP: Record<string, string> = {
  'Pending': '待審核',
  'Approved': '已核准',
  'Rejected': '已拒絕'
}

export const LEAVE_STATUS_COLORS: Record<string, string> = {
  'Pending': 'bg-amber-50 text-amber-600',
  'Approved': 'bg-green-50 text-green-600',
  'Rejected': 'bg-rose-50 text-rose-600'
}

export const DEFAULT_LEAVE_STATUS = 'Pending'

export const DEFAULT_ENROLLMENT_FORM = {
  course: '',
  enroll_date: new Date().toISOString().split('T')[0],
  discount_rate: 0
}

export const DEFAULT_LEAVE_FORM = {
  course: '',
  leave_date: new Date().toISOString().split('T')[0],
  reason: '',
  approval_status: DEFAULT_LEAVE_STATUS as 'Pending' | 'Approved' | 'Rejected'
}

