/**
 * Student Types
 * 學生相關的類型定義
 */

export interface StudentGroup {
  group: {
    groupId: number
    name: string
    description: string | null
    groupType: string
  }
}

import { Decimal } from '@prisma/client/runtime/library'

export interface Enrollment {
  enrollmentId: number
  courseId: number
  course: { 
    courseName: string 
  }
  enrollDate: Date
  discountRate: number | string | Decimal
  isActive: boolean
}

export interface TuitionStatus {
  student_id: number
  total_unpaid: number
  total_paid: number
  tuition_months: Array<{
    year: number
    month: number
    enrollment_id: number
    course_name: string
    has_fee: boolean
    weeks: number
  }>
}

export interface AccountStatus {
  is_active: boolean
}

export interface TuitionGenerationResult {
  success: boolean
  message?: string
  fee_id?: number
}

export interface BatchTuitionResult {
  success: boolean
  count: number
  results: Array<{
    student_id: number
    student_name: string
    fees_generated: number
  }>
}

export interface PasswordResetResult {
  success: boolean
  message: string
}

export interface AttendanceAndLeaves {
  student_id: number
  student_name: string
  attendance: unknown[]
  leaves: unknown[]
}
