import { z } from 'zod'

/**
 * 題目標籤 Schema
 * 對應後端 CramschoolQuestionTag 模型
 */
export const QuestionTagSchema = z.object({
  question_tag_id: z.number().int().positive(),
  question_id: z.number().int().positive(),
  tag_id: z.number().int().positive(),
})
export type QuestionTag = z.infer<typeof QuestionTagSchema>

/**
 * 創建題目標籤 DTO Schema
 */
export const CreateQuestionTagSchema = QuestionTagSchema.omit({
  question_tag_id: true,
})
export type CreateQuestionTagDto = z.infer<typeof CreateQuestionTagSchema>

/**
 * 更新題目標籤 DTO Schema
 */
export const UpdateQuestionTagSchema = QuestionTagSchema.partial().omit({
  question_tag_id: true,
})
export type UpdateQuestionTagDto = z.infer<typeof UpdateQuestionTagSchema>
