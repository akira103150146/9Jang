import { z } from 'zod'

/**
 * 權限類型枚舉
 */
export const PermissionTypeEnum = z.enum(['page', 'api'])

/**
 * 角色 Schema
 * 對應後端 AccountRole 模型
 */
export const RoleSchema = z.object({
  id: z.number().int().positive(),
  code: z.string().nullable().optional(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().default(''),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
})

export type Role = z.infer<typeof RoleSchema>

/**
 * 角色權限 Schema
 * 對應後端 AccountRolePermission 模型
 */
export const RolePermissionSchema = z.object({
  id: z.number().int().positive(),
  role_id: z.number().int().positive(),
  permission_type: PermissionTypeEnum,
  resource: z.string().min(1).max(255),
  method: z.string().nullable().optional(),
  created_at: z.string().datetime().optional(),
})

export type RolePermission = z.infer<typeof RolePermissionSchema>

/**
 * 建立角色 DTO Schema
 */
export const CreateRoleSchema = RoleSchema.omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
})

export type CreateRoleDto = z.infer<typeof CreateRoleSchema>

/**
 * 建立角色權限 DTO Schema
 */
export const CreateRolePermissionSchema = RolePermissionSchema.omit({ 
  id: true, 
  created_at: true 
})

export type CreateRolePermissionDto = z.infer<typeof CreateRolePermissionSchema>

/**
 * 更新角色 DTO Schema
 */
export const UpdateRoleSchema = RoleSchema.partial().omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
})

export type UpdateRoleDto = z.infer<typeof UpdateRoleSchema>

/**
 * 批次新增權限 DTO Schema
 */
export const AddPermissionsSchema = z.object({
  permissions: z.array(CreateRolePermissionSchema).min(1),
})

export type AddPermissionsDto = z.infer<typeof AddPermissionsSchema>

/**
 * 角色查詢 DTO Schema
 */
export const RoleQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  is_active: z.coerce.boolean().optional(),
})

export type RoleQueryDto = z.infer<typeof RoleQuerySchema>
