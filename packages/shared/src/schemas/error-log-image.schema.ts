import { z } from 'zod'

/**
 * 錯題圖片 Schema
 * 對應後端 CramschoolErrorLogImage 模型
 */
export const ErrorLogImageSchema = z.object({
  image_id: z.number().int().positive(),
  error_log_id: z.number().int().positive(),
  image_path: z.string(),
  caption: z.string().nullable().optional(),
  sort_order: z.number().int().nonnegative().default(0),
  created_at: z.string().datetime().optional(),
})
export type ErrorLogImage = z.infer<typeof ErrorLogImageSchema>

/**
 * 創建錯題圖片 DTO Schema
 */
export const CreateErrorLogImageSchema = ErrorLogImageSchema.omit({
  image_id: true,
  created_at: true,
})
export type CreateErrorLogImageDto = z.infer<typeof CreateErrorLogImageSchema>

/**
 * 更新錯題圖片 DTO Schema
 */
export const UpdateErrorLogImageSchema = ErrorLogImageSchema.partial().omit({
  image_id: true,
  error_log_id: true,
  created_at: true,
})
export type UpdateErrorLogImageDto = z.infer<typeof UpdateErrorLogImageSchema>
