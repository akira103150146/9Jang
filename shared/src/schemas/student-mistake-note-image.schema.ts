import { z } from 'zod'

/**
 * 學生錯題筆記圖片 Schema
 * 對應後端 CramschoolStudentMistakeNoteImage 模型
 */
export const StudentMistakeNoteImageSchema = z.object({
  image_id: z.number().int().positive(),
  note_id: z.number().int().positive(),
  image_path: z.string(),
  caption: z.string().nullable().optional(),
  sort_order: z.number().int().nonnegative().default(0),
  created_at: z.string().datetime().optional(),
})
export type StudentMistakeNoteImage = z.infer<typeof StudentMistakeNoteImageSchema>

/**
 * 創建學生錯題筆記圖片 DTO Schema
 */
export const CreateStudentMistakeNoteImageSchema = StudentMistakeNoteImageSchema.omit({
  image_id: true,
  created_at: true,
})
export type CreateStudentMistakeNoteImageDto = z.infer<typeof CreateStudentMistakeNoteImageSchema>

/**
 * 更新學生錯題筆記圖片 DTO Schema
 */
export const UpdateStudentMistakeNoteImageSchema = StudentMistakeNoteImageSchema.partial().omit({
  image_id: true,
  note_id: true,
  created_at: true,
})
export type UpdateStudentMistakeNoteImageDto = z.infer<typeof UpdateStudentMistakeNoteImageSchema>
