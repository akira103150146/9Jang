import { z } from 'zod'

/**
 * 學生群組資料 Schema
 * 對應後端 StudentGroup 模型
 */
export const StudentGroupSchema = z.object({
  group_id: z.number().int().positive(),
  name: z.string().min(1).max(100),
  description: z.string().nullable().optional(),
  group_type: z.string().default('teaching'),
  created_by_id: z.number().int().positive().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

export type StudentGroup = z.infer<typeof StudentGroupSchema>

/**
 * 創建學生群組 DTO Schema
 */
export const CreateStudentGroupSchema = StudentGroupSchema.omit({
  group_id: true,
  created_at: true,
  updated_at: true
}).extend({
  description: z.string().optional(),
  group_type: z.string().optional().default('teaching'),
  created_by_id: z.number().int().positive().optional()
})
export type CreateStudentGroupDto = z.infer<typeof CreateStudentGroupSchema>

/**
 * 更新學生群組 DTO Schema
 */
export const UpdateStudentGroupSchema = StudentGroupSchema.partial().omit({
  group_id: true,
  created_at: true,
  updated_at: true
})
export type UpdateStudentGroupDto = z.infer<typeof UpdateStudentGroupSchema>

/**
 * 學生群組列表查詢參數 Schema
 */
export const StudentGroupQuerySchema = z.object({
  search: z.string().optional(),
  group_type: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().positive().max(100).default(10)
})
export type StudentGroupQuery = z.infer<typeof StudentGroupQuerySchema>

/**
 * 添加學生到群組 DTO Schema
 */
export const AddStudentsToGroupSchema = z.object({
  student_ids: z.array(z.number().int().positive()).min(1)
})
export type AddStudentsToGroupDto = z.infer<typeof AddStudentsToGroupSchema>

/**
 * 從群組移除學生 DTO Schema
 */
export const RemoveStudentsFromGroupSchema = z.object({
  student_ids: z.array(z.number().int().positive()).min(1)
})
export type RemoveStudentsFromGroupDto = z.infer<typeof RemoveStudentsFromGroupSchema>
