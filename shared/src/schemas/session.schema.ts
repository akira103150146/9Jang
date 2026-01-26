import { z } from 'zod'

/**
 * 上課記錄 Schema
 * 對應後端 CramschoolSessionRecord 模型
 */
export const SessionSchema = z.object({
  session_id: z.number().int().positive(),
  course_id: z.number().int().positive(),
  session_date: z.string().date(),
  // 擴展字段（從關聯查詢中獲取）
  course_name: z.string().optional(),
})
export type Session = z.infer<typeof SessionSchema>

/**
 * 創建上課記錄 DTO Schema
 */
export const CreateSessionSchema = SessionSchema.omit({
  session_id: true,
  course_name: true,
})
export type CreateSessionDto = z.infer<typeof CreateSessionSchema>

/**
 * 更新上課記錄 DTO Schema
 */
export const UpdateSessionSchema = SessionSchema.partial().omit({
  session_id: true,
  course_name: true,
})
export type UpdateSessionDto = z.infer<typeof UpdateSessionSchema>
