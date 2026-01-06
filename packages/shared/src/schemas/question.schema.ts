import { z } from 'zod'
import { TiptapDocumentSchema } from '../types/tiptap'

/**
 * 題目年級枚舉
 */
export const QuestionLevelEnum = z.enum(['JHS', 'SHS', 'VCS'])

/**
 * 題目類型枚舉
 */
export const QuestionTypeEnum = z.enum([
  'SINGLE_CHOICE',
  'MULTIPLE_CHOICE',
  'FILL_IN_BLANK',
  'PROGRAMMING',
  'LISTENING'
])

/**
 * 題目庫 Schema
 * 對應後端 QuestionBank 模型
 */
export const QuestionSchema = z.object({
  question_id: z.number().int().positive(),
  subject_id: z.number().int().positive(),
  level: QuestionLevelEnum,
  chapter: z.string().max(100),
  content: TiptapDocumentSchema, // 題目內容 (Tiptap JSON)
  image_path: z.string().max(255).nullable().optional(),
  correct_answer: TiptapDocumentSchema, // 正確答案 (Tiptap JSON)
  difficulty: z.number().int().min(1).max(5).default(1),
  question_type: QuestionTypeEnum.default('SINGLE_CHOICE'),
  options: z.array(TiptapDocumentSchema).optional(), // 選擇題選項列表（每個選項也是 Tiptap JSON）
  metadata: z.record(z.any()).optional(), // 模式特定元資料
  question_number: z.string().max(50).nullable().optional(),
  origin: z.string().max(200).nullable().optional(),
  origin_detail: z.string().max(200).nullable().optional(),
  source: z.string().max(100).nullable().optional().default('九章自命題'),
  created_by: z.number().int().positive().nullable().optional(),
  imported_from_error_log: z.number().int().positive().nullable().optional(),
  imported_student: z.number().int().positive().nullable().optional(),
  solution_content: TiptapDocumentSchema.nullable().optional(), // 詳解內容 (Tiptap JSON)
  search_text_content: z.string().nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  // 關聯數據（可選，視 API 響應而定）
  tags: z.array(z.number().int().positive()).optional(),
  tag_names: z.array(z.string()).optional()
})

export type Question = z.infer<typeof QuestionSchema>

/**
 * 創建題目 DTO Schema
 */
export const CreateQuestionSchema = QuestionSchema.omit({
  question_id: true,
  search_text_content: true,
  created_at: true,
  updated_at: true,
  tags: true,
  tag_names: true
}).partial({
  image_path: true,
  options: true,
  metadata: true,
  question_number: true,
  origin: true,
  origin_detail: true,
  source: true,
  created_by: true,
  imported_from_error_log: true,
  imported_student: true,
  solution_content: true
})
export type CreateQuestionDto = z.infer<typeof CreateQuestionSchema>

/**
 * 更新題目 DTO Schema
 */
export const UpdateQuestionSchema = QuestionSchema.partial().omit({
  question_id: true,
  search_text_content: true,
  created_at: true,
  updated_at: true,
  tags: true,
  tag_names: true
})
export type UpdateQuestionDto = z.infer<typeof UpdateQuestionSchema>

/**
 * 題目查詢參數 Schema
 */
export const QuestionQuerySchema = z.object({
  subject: z.number().int().positive().optional(),
  level: QuestionLevelEnum.optional(),
  chapter: z.string().optional(),
  question_type: QuestionTypeEnum.optional(),
  tags: z.array(z.number().int().positive()).optional(),
  search: z.string().optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
  source: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().positive().max(100).default(10)
})
export type QuestionQuery = z.infer<typeof QuestionQuerySchema>

/**
 * 標籤 Schema
 */
export const TagSchema = z.object({
  tag_id: z.number().int().positive(),
  tag_name: z.string().min(1).max(50),
  creator_id: z.number().int().positive().nullable().optional()
})
export type Tag = z.infer<typeof TagSchema>
