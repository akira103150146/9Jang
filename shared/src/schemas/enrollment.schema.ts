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
  deleted_at: z.string().datetime().nullable().optional(),
  // 關聯數據（從 include 查詢中獲取）
  course_name: z.string().optional(),
  student_name: z.string().optional(),
})
export type StudentEnrollment = z.infer<typeof StudentEnrollmentSchema>

/**
 * 創建學生報名 DTO Schema
 */
export const CreateStudentEnrollmentSchema = StudentEnrollmentSchema.omit({
  enrollment_id: true,
  is_deleted: true,
  deleted_at: true
}).extend({
  enroll_date: z.string().refine(
    (val) => {
      // 接受多種日期格式：YYYY-MM-DD, YYYY/MM/DD, 或 ISO 格式
      const dateStr = val.replace(/\//g, '-');
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (dateRegex.test(dateStr)) {
        const date = new Date(dateStr);
        return !isNaN(date.getTime());
      }
      // 也接受 ISO 格式
      const isoDate = new Date(val);
      return !isNaN(isoDate.getTime());
    },
    { message: 'Invalid date format. Expected YYYY-MM-DD or YYYY/MM/DD' }
  ),
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
