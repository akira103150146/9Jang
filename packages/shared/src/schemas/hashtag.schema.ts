import { z } from 'zod'

/**
 * 標籤 Schema
 * 對應後端 CramschoolHashtag 模型
 */
export const HashtagSchema = z.object({
  tag_id: z.number().int().positive(),
  tag_name: z.string().min(1),
  creator_id: z.number().int().positive().nullable().optional(),
  creator_name: z.string().optional(),
})
export type Hashtag = z.infer<typeof HashtagSchema>

/**
 * 創建標籤 DTO Schema
 */
export const CreateHashtagSchema = HashtagSchema.omit({
  tag_id: true,
  creator_name: true,
})
export type CreateHashtagDto = z.infer<typeof CreateHashtagSchema>

/**
 * 更新標籤 DTO Schema
 */
export const UpdateHashtagSchema = HashtagSchema.partial().omit({
  tag_id: true,
  creator_name: true,
})
export type UpdateHashtagDto = z.infer<typeof UpdateHashtagSchema>
