import { z } from 'zod'

/**
 * 出席記錄 Schema
 * 對應後端 CramschoolAttendance 模型
 */
export const AttendanceSchema = z.object({
  attendance_id: z.number().int().positive(),
  session_id: z.number().int().positive(),
  student_id: z.number().int().positive(),
  status: z.enum(['Present', 'Absent', 'Late', 'Leave']).default('Absent'),
  is_deleted: z.boolean().default(false),
  deleted_at: z.string().datetime().nullable().optional(),
  // 擴展字段（從關聯查詢中獲取）
  student_name: z.string().optional(),
  session_id_display: z.number().int().positive().optional(),
  course_name: z.string().optional(),
  session_date: z.string().date().optional(),
})
export type Attendance = z.infer<typeof AttendanceSchema>

/**
 * 創建出席記錄 DTO Schema
 */
export const CreateAttendanceSchema = AttendanceSchema.omit({
  attendance_id: true,
  is_deleted: true,
  deleted_at: true,
  student_name: true,
  session_id_display: true,
  course_name: true,
  session_date: true,
})
export type CreateAttendanceDto = z.infer<typeof CreateAttendanceSchema>

/**
 * 更新出席記錄 DTO Schema
 */
export const UpdateAttendanceSchema = AttendanceSchema.partial().omit({
  attendance_id: true,
  is_deleted: true,
  deleted_at: true,
  student_name: true,
  session_id_display: true,
  course_name: true,
  session_date: true,
})
export type UpdateAttendanceDto = z.infer<typeof UpdateAttendanceSchema>
