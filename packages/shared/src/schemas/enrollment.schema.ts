import { z } from 'zod'

/**
 * 學生報名 Schema
 * 對應後端 StudentEnrollment 模型
 */
export const StudentEnrollmentSchema = z.object({
  enrollment_id: z.number().int().positive(),
  student_id: z.number().int().positive(),
  course_id: z.number().int().positive(),
  enroll_date: z.string().date(),
  discount_rate: z.number().nonnegative().default(0),
  is_active: z.boolean().default(true),
  is_deleted: z.boolean().default(false),
  deleted_at: z.string().datetime().nullable().optional()
})
export type StudentEnrollment = z.infer<typeof StudentEnrollmentSchema>

/**
 * 創建學生報名 DTO Schema
 */
export const CreateStudentEnrollmentSchema = StudentEnrollmentSchema.omit({
  enrollment_id: true,
  is_deleted: true,
  deleted_at: true
})
export type CreateStudentEnrollmentDto = z.infer<typeof CreateStudentEnrollmentSchema>

/**
 * 報名期間 Schema
 */
export const EnrollmentPeriodSchema = z.object({
  period_id: z.number().int().positive(),
  enrollment_id: z.number().int().positive(),
  start_date: z.string().date(),
  end_date: z.string().date().nullable().optional(),
  is_active: z.boolean().default(true),
  notes: z.string().nullable().optional()
})
export type EnrollmentPeriod = z.infer<typeof EnrollmentPeriodSchema>

/**
 * 創建報名期間 DTO Schema
 */
export const CreateEnrollmentPeriodSchema = EnrollmentPeriodSchema.omit({
  period_id: true
})
export type CreateEnrollmentPeriodDto = z.infer<typeof CreateEnrollmentPeriodSchema>
