import { z } from 'zod'

/**
 * 請假記錄 Schema
 * 對應後端 Leave 模型
 */
export const LeaveSchema = z.object({
  leave_id: z.number().int().positive(),
  student_id: z.number().int().positive(),
  course_id: z.number().int().positive(),
  leave_date: z.string().date(),
  reason: z.string().min(1),
  approval_status: z.enum(['Pending', 'Approved', 'Rejected']).default('Pending'),
  is_deleted: z.boolean().default(false),
  deleted_at: z.string().datetime().nullable().optional()
})
export type Leave = z.infer<typeof LeaveSchema>

/**
 * 創建請假記錄 DTO Schema
 */
export const CreateLeaveSchema = LeaveSchema.omit({
  leave_id: true,
  is_deleted: true,
  deleted_at: true
})
export type CreateLeaveDto = z.infer<typeof CreateLeaveSchema>

/**
 * 更新請假記錄 DTO Schema
 */
export const UpdateLeaveSchema = LeaveSchema.partial().omit({
  leave_id: true,
  is_deleted: true,
  deleted_at: true
})
export type UpdateLeaveDto = z.infer<typeof UpdateLeaveSchema>
