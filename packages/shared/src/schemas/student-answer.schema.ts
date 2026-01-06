import { z } from 'zod'

/**
 * 學生作答 Schema
 * 對應後端 CramschoolStudentAnswer 模型
 */
export const StudentAnswerSchema = z.object({
  answer_id: z.number().int().positive(),
  student_id: z.number().int().positive(),
  question_id: z.number().int().positive(),
  test_name: z.string(),
  submission_id: z.number().int().positive().nullable().optional(),
  is_correct: z.boolean().default(false),
  scanned_file_path: z.string().nullable().optional(),
  is_deleted: z.boolean().default(false),
  deleted_at: z.string().datetime().nullable().optional(),
})
export type StudentAnswer = z.infer<typeof StudentAnswerSchema>

/**
 * 創建學生作答 DTO Schema
 */
export const CreateStudentAnswerSchema = StudentAnswerSchema.omit({
  answer_id: true,
  is_deleted: true,
  deleted_at: true,
})
export type CreateStudentAnswerDto = z.infer<typeof CreateStudentAnswerSchema>

/**
 * 更新學生作答 DTO Schema
 */
export const UpdateStudentAnswerSchema = StudentAnswerSchema.partial().omit({
  answer_id: true,
  is_deleted: true,
  deleted_at: true,
})
export type UpdateStudentAnswerDto = z.infer<typeof UpdateStudentAnswerSchema>
