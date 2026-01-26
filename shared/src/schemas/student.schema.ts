import { z } from 'zod'

/**
 * 學生資料 Schema
 * 對應後端 Student 模型
 */
export const StudentSchema = z.object({
  student_id: z.number().int().positive(),
  name: z.string().min(1).max(100),
  school: z.string().min(1).max(100),
  grade: z.string().max(20),
  phone: z.string().max(20).nullable().optional(),
  emergency_contact_name: z.string().max(100).nullable().optional(),
  emergency_contact_phone: z.string().max(20).nullable().optional(),
  notes: z.string().nullable().optional(),
  is_deleted: z.boolean().default(false),
  deleted_at: z.string().datetime().nullable().optional(),
  user_id: z.number().int().positive().nullable().optional(),
  initial_password: z.string().max(50).nullable().optional(),
  // 計算字段（從後端返回）
  has_tuition_needed: z.boolean().optional(),
  total_fees: z.number().optional(),
  unpaid_fees: z.number().optional(),
  enrollments_count: z.number().optional(),
})

export type Student = z.infer<typeof StudentSchema>

/**
 * 創建學生 DTO Schema
 */
export const CreateStudentSchema = StudentSchema.omit({
  student_id: true,
  is_deleted: true,
  deleted_at: true
}).extend({
  initial_password: z.string().max(50).optional()
})
export type CreateStudentDto = z.infer<typeof CreateStudentSchema>

/**
 * 更新學生 DTO Schema
 */
export const UpdateStudentSchema = StudentSchema.partial().omit({
  student_id: true,
  is_deleted: true,
  deleted_at: true
})
export type UpdateStudentDto = z.infer<typeof UpdateStudentSchema>

/**
 * 學生列表查詢參數 Schema
 */
export const StudentQuerySchema = z.object({
  search: z.string().optional(),
  school: z.string().optional(),
  grade: z.string().optional(),
  tag: z.string().optional(),
  course: z.string().optional(),
  has_unpaid_fees: z.enum(['yes', 'no']).optional(),
  has_leave: z.enum(['yes', 'no']).optional(),
  include_deleted: z.boolean().optional().default(false),
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().positive().max(100).default(10)
})
export type StudentQuery = z.infer<typeof StudentQuerySchema>

/**
 * 學生學費狀態響應 Schema
 */
export const StudentTuitionStatusSchema = z.object({
  student_id: z.number().int().positive(),
  total_unpaid: z.number().nonnegative(),
  total_paid: z.number().nonnegative(),
  fees: z.array(z.any()).optional() // 詳細費用列表
})
export type StudentTuitionStatus = z.infer<typeof StudentTuitionStatusSchema>
