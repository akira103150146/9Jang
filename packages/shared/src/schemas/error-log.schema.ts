import { z } from 'zod'

/**
 * 錯題記錄 Schema
 * 對應後端 CramschoolErrorLog 模型
 */
export const ErrorLogSchema = z.object({
  error_log_id: z.number().int().positive(),
  student_id: z.number().int().positive(),
  question_id: z.number().int().positive(),
  error_count: z.number().int().nonnegative().default(1),
  review_status: z.string().default('New'),
  is_deleted: z.boolean().default(false),
  deleted_at: z.string().datetime().nullable().optional(),
})
export type ErrorLog = z.infer<typeof ErrorLogSchema>

/**
 * 創建錯題記錄 DTO Schema
 */
export const CreateErrorLogSchema = ErrorLogSchema.omit({
  error_log_id: true,
  is_deleted: true,
  deleted_at: true,
})
export type CreateErrorLogDto = z.infer<typeof CreateErrorLogSchema>

/**
 * 更新錯題記錄 DTO Schema
 */
export const UpdateErrorLogSchema = ErrorLogSchema.partial().omit({
  error_log_id: true,
  is_deleted: true,
  deleted_at: true,
})
export type UpdateErrorLogDto = z.infer<typeof UpdateErrorLogSchema>
