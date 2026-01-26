import { z } from 'zod'

/**
 * 學生錯題筆記 Schema
 * 對應後端 CramschoolStudentMistakeNote 模型
 */
export const StudentMistakeNoteSchema = z.object({
  note_id: z.number().int().positive(),
  student_id: z.number().int().positive(),
  title: z.string(),
  subject: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  is_deleted: z.boolean().default(false),
  deleted_at: z.string().datetime().nullable().optional(),
})
export type StudentMistakeNote = z.infer<typeof StudentMistakeNoteSchema>

/**
 * 創建學生錯題筆記 DTO Schema
 */
export const CreateStudentMistakeNoteSchema = StudentMistakeNoteSchema.omit({
  note_id: true,
  created_at: true,
  updated_at: true,
  is_deleted: true,
  deleted_at: true,
})
export type CreateStudentMistakeNoteDto = z.infer<typeof CreateStudentMistakeNoteSchema>

/**
 * 更新學生錯題筆記 DTO Schema
 */
export const UpdateStudentMistakeNoteSchema = StudentMistakeNoteSchema.partial().omit({
  note_id: true,
  created_at: true,
  updated_at: true,
  is_deleted: true,
  deleted_at: true,
})
export type UpdateStudentMistakeNoteDto = z.infer<typeof UpdateStudentMistakeNoteSchema>
