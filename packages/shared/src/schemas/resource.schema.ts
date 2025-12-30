import { z } from 'zod'
import { TiptapDocumentSchema } from '../types/tiptap'

/**
 * 教學資源模式枚舉
 */
export const LearningResourceModeEnum = z.enum([
  'HANDOUT',
  'ONLINE_QUIZ',
  'LEETCODE',
  'LISTENING_TEST',
  'FLASHCARD'
])

/**
 * 教學資源 Schema
 * 對應後端 LearningResource 模型
 */
export const LearningResourceSchema = z.object({
  resource_id: z.number().int().positive(),
  title: z.string().min(1).max(200),
  mode: LearningResourceModeEnum.default('HANDOUT'),
  course_ids: z.array(z.number().int().positive()).optional().default([]),
  student_group_ids: z.array(z.number().int().positive()).optional().default([]),
  structure: z.array(z.any()).optional().default([]), // 舊格式（向後兼容）
  tiptap_structure: TiptapDocumentSchema.nullable().optional(), // Tiptap JSON 結構
  settings: z.record(z.any()).optional().default({}),
  tag_ids: z.array(z.number().int().positive()).optional().default([]),
  created_by: z.number().int().positive().nullable().optional(),
  is_individualized: z.boolean().default(false),
  available_from: z.string().datetime().nullable().optional(),
  available_until: z.string().datetime().nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
})

export type LearningResource = z.infer<typeof LearningResourceSchema>

/**
 * 創建教學資源 DTO Schema
 */
export const CreateLearningResourceSchema = LearningResourceSchema.omit({
  resource_id: true,
  created_at: true,
  updated_at: true
}).partial({
  structure: true,
  tiptap_structure: true,
  settings: true,
  course_ids: true,
  student_group_ids: true,
  tag_ids: true,
  created_by: true,
  available_from: true,
  available_until: true
})
export type CreateLearningResourceDto = z.infer<typeof CreateLearningResourceSchema>

/**
 * 更新教學資源 DTO Schema
 */
export const UpdateLearningResourceSchema = LearningResourceSchema.partial().omit({
  resource_id: true,
  created_at: true,
  updated_at: true
})
export type UpdateLearningResourceDto = z.infer<typeof UpdateLearningResourceSchema>

/**
 * 內容模板 Schema
 * 對應後端 ContentTemplate 模型
 */
export const ContentTemplateSchema = z.object({
  template_id: z.number().int().positive(),
  title: z.string().min(1).max(200),
  structure: z.array(z.any()).optional().default([]), // 舊格式（向後兼容）
  tiptap_structure: TiptapDocumentSchema.nullable().optional(), // Tiptap JSON 結構
  created_by: z.number().int().positive().nullable().optional(),
  is_public: z.boolean().default(false),
  tag_ids: z.array(z.number().int().positive()).optional().default([]),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
})
export type ContentTemplate = z.infer<typeof ContentTemplateSchema>

/**
 * 創建內容模板 DTO Schema
 */
export const CreateContentTemplateSchema = ContentTemplateSchema.omit({
  template_id: true,
  created_at: true,
  updated_at: true
}).partial({
  structure: true,
  tiptap_structure: true,
  created_by: true,
  tag_ids: true
})
export type CreateContentTemplateDto = z.infer<typeof CreateContentTemplateSchema>

/**
 * 更新內容模板 DTO Schema
 */
export const UpdateContentTemplateSchema = ContentTemplateSchema.partial().omit({
  template_id: true,
  created_at: true,
  updated_at: true
})
export type UpdateContentTemplateDto = z.infer<typeof UpdateContentTemplateSchema>
