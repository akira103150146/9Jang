import { z } from 'zod'

/**
 * 課程 PDF 講義 Schema
 * 對應後端 CramschoolCoursePdf 模型
 */
export const CoursePdfSchema = z.object({
  pdf_id: z.number().int().positive(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).nullable().optional(),
  file_path: z.string(),
  file_size: z.number().int().positive(),
  course_id: z.number().int().positive(),
  uploaded_by_id: z.number().int().positive(),
  student_group_ids: z.array(z.number().int().positive()).optional().default([]),
  allow_download: z.boolean().default(false),
  is_visible_to_all: z.boolean().default(false),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
})

export type CoursePdf = z.infer<typeof CoursePdfSchema>

/**
 * 創建課程 PDF DTO Schema
 */
export const CreateCoursePdfSchema = CoursePdfSchema.omit({
  pdf_id: true,
  file_path: true,
  file_size: true,
  uploaded_by_id: true,
  created_at: true,
  updated_at: true
}).partial({
  description: true,
  student_group_ids: true,
  allow_download: true,
  is_visible_to_all: true,
  is_active: true
})

export type CreateCoursePdfDto = z.infer<typeof CreateCoursePdfSchema>

/**
 * 更新課程 PDF DTO Schema
 */
export const UpdateCoursePdfSchema = CoursePdfSchema.partial().omit({
  pdf_id: true,
  file_path: true,
  file_size: true,
  uploaded_by_id: true,
  course_id: true,
  created_at: true,
  updated_at: true
})

export type UpdateCoursePdfDto = z.infer<typeof UpdateCoursePdfSchema>
