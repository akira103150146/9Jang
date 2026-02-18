"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleQuerySchema = exports.AddPermissionsSchema = exports.UpdateRoleSchema = exports.CreateRolePermissionSchema = exports.CreateRoleSchema = exports.RolePermissionSchema = exports.RoleSchema = exports.PermissionTypeEnum = void 0;
const zod_1 = require("zod");
/**
 * 權限類型枚舉
 */
exports.PermissionTypeEnum = zod_1.z.enum(['page', 'api']);
/**
 * 角色 Schema
 * 對應後端 AccountRole 模型
 */
exports.RoleSchema = zod_1.z.object({
    id: zod_1.z.number().int().positive(),
    code: zod_1.z.string().nullable().optional(),
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().max(500).optional().default(''),
    is_active: zod_1.z.boolean().default(true),
    created_at: zod_1.z.string().datetime().optional(),
    updated_at: zod_1.z.string().datetime().optional(),
});
/**
 * 角色權限 Schema
 * 對應後端 AccountRolePermission 模型
 */
exports.RolePermissionSchema = zod_1.z.object({
    id: zod_1.z.number().int().positive(),
    role_id: zod_1.z.number().int().positive(),
    permission_type: exports.PermissionTypeEnum,
    resource: zod_1.z.string().min(1).max(255),
    method: zod_1.z.string().nullable().optional(),
    created_at: zod_1.z.string().datetime().optional(),
});
/**
 * 建立角色 DTO Schema
 */
exports.CreateRoleSchema = exports.RoleSchema.omit({
    id: true,
    created_at: true,
    updated_at: true
}).extend({
    permissions: zod_1.z.array(zod_1.z.object({
        permission_type: exports.PermissionTypeEnum,
        resource: zod_1.z.string().min(1).max(255),
        method: zod_1.z.string().nullable().optional(),
    })).optional(),
});
/**
 * 建立角色權限 DTO Schema
 */
exports.CreateRolePermissionSchema = exports.RolePermissionSchema.omit({
    id: true,
    created_at: true
});
/**
 * 更新角色 DTO Schema
 */
exports.UpdateRoleSchema = exports.RoleSchema.partial().omit({
    id: true,
    created_at: true,
    updated_at: true
});
/**
 * 批次新增權限 DTO Schema
 */
exports.AddPermissionsSchema = zod_1.z.object({
    permissions: zod_1.z.array(exports.CreateRolePermissionSchema).min(1),
});
/**
 * 角色查詢 DTO Schema
 */
exports.RoleQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    page_size: zod_1.z.coerce.number().int().positive().max(100).default(10),
    search: zod_1.z.string().optional(),
    is_active: zod_1.z.coerce.boolean().optional(),
});
