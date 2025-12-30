import { z } from 'zod'

/**
 * 老師權限等級枚舉
 */
export const TeacherPermissionLevelEnum = z.enum(['Teacher', 'Admin', 'Accountant'])

/**
 * 老師資料 Schema
 * 對應後端 Teacher 模型
 */
export const TeacherSchema = z.object({
  teacher_id: z.number().int().positive(),
  name: z.string().min(1).max(100),
  user_id: z.number().int().positive().nullable().optional(),
  permission_level: TeacherPermissionLevelEnum.default('Teacher'),
  phone: z.string().max(20).nullable().optional(),
  hire_date: z.string().date().nullable().optional()
})

export type Teacher = z.infer<typeof TeacherSchema>

/**
 * 創建老師 DTO Schema
 */
export const CreateTeacherSchema = TeacherSchema.omit({
  teacher_id: true
}).partial({
  user_id: true,
  permission_level: true
})
export type CreateTeacherDto = z.infer<typeof CreateTeacherSchema>

/**
 * 更新老師 DTO Schema
 */
export const UpdateTeacherSchema = TeacherSchema.partial().omit({
  teacher_id: true
})
export type UpdateTeacherDto = z.infer<typeof UpdateTeacherSchema>
