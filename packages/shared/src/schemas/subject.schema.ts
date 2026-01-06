import { z } from 'zod'

/**
 * 科目 Schema
 * 對應後端 CramschoolSubject 模型
 */
export const SubjectSchema = z.object({
  subject_id: z.number().int().positive(),
  name: z.string().min(1),
  code: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  created_at: z.string().datetime().optional(),
})
export type Subject = z.infer<typeof SubjectSchema>

/**
 * 創建科目 DTO Schema
 */
export const CreateSubjectSchema = SubjectSchema.omit({
  subject_id: true,
  created_at: true,
})
export type CreateSubjectDto = z.infer<typeof CreateSubjectSchema>

/**
 * 更新科目 DTO Schema
 */
export const UpdateSubjectSchema = SubjectSchema.partial().omit({
  subject_id: true,
  created_at: true,
})
export type UpdateSubjectDto = z.infer<typeof UpdateSubjectSchema>
