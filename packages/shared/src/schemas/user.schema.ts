import { z } from 'zod'

/**
 * 用戶角色枚舉
 */
export const UserRoleEnum = z.enum(['ADMIN', 'TEACHER', 'STUDENT', 'ACCOUNTANT'])

/**
 * 自訂用戶 Schema
 * 對應後端 CustomUser 模型
 */
export const UserSchema = z.object({
  id: z.number().int().positive(),
  username: z.string().min(1),
  email: z.string().email().optional().nullable(),
  first_name: z.string().optional().default(''),
  last_name: z.string().optional().default(''),
  role: UserRoleEnum,
  role_display: z.string().optional(), // 人類可讀的角色顯示名稱
  custom_role: z.number().int().positive().nullable().optional(),
  custom_role_name: z.string().nullable().optional(),
  is_staff: z.boolean().default(false),
  is_active: z.boolean().default(true),
  must_change_password: z.boolean().default(false),
  student_id: z.number().int().positive().nullable().optional()
})

export type User = z.infer<typeof UserSchema>

/**
 * 登入請求 DTO Schema
 */
export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})
export type LoginRequestDto = z.infer<typeof LoginRequestSchema>

/**
 * 登入響應 Schema
 */
export const LoginResponseSchema = z.object({
  access: z.string(),
  refresh: z.string(),
  user: UserSchema
})
export type LoginResponse = z.infer<typeof LoginResponseSchema>

/**
 * Token 刷新請求 Schema
 */
export const RefreshTokenRequestSchema = z.object({
  refresh: z.string()
})
export type RefreshTokenRequestDto = z.infer<typeof RefreshTokenRequestSchema>

/**
 * Token 刷新響應 Schema
 */
export const RefreshTokenResponseSchema = z.object({
  access: z.string()
})
export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>

/**
 * 修改密碼請求 Schema
 */
export const ChangePasswordRequestSchema = z.object({
  old_password: z.string().min(1),
  new_password: z.string().min(1)
})
export type ChangePasswordRequestDto = z.infer<typeof ChangePasswordRequestSchema>

/**
 * 角色 Schema
 */
export const RoleSchema = z.object({
  id: z.number().int().positive(),
  code: z.string().nullable().optional(),
  name: z.string().min(1),
  description: z.string().optional().default(''),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
})
export type Role = z.infer<typeof RoleSchema>

/**
 * 角色權限 Schema
 */
export const RolePermissionSchema = z.object({
  id: z.number().int().positive(),
  role: z.number().int().positive(),
  permission_type: z.enum(['page', 'api']),
  resource: z.string().min(1),
  method: z.string().nullable().optional(),
  created_at: z.string().datetime().optional()
})
export type RolePermission = z.infer<typeof RolePermissionSchema>

/**
 * 審計日誌 Schema
 */
export const AuditLogSchema = z.object({
  id: z.number().int().positive(),
  user: z.number().int().positive().nullable().optional(),
  role: z.number().int().positive().nullable().optional(),
  impersonated_by: z.number().int().positive().nullable().optional(),
  action_type: z.enum(['create', 'update', 'delete', 'view', 'login', 'logout', 'other']),
  resource_type: z.string().min(1),
  resource_id: z.string().nullable().optional(),
  resource_name: z.string().nullable().optional(),
  description: z.string().optional().default(''),
  ip_address: z.string().ip().nullable().optional(),
  user_agent: z.string().nullable().optional(),
  request_data: z.record(z.any()).optional().default({}),
  response_status: z.number().int().nullable().optional(),
  created_at: z.string().datetime()
})
export type AuditLog = z.infer<typeof AuditLogSchema>
