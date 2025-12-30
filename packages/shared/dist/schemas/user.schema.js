"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogSchema = exports.RolePermissionSchema = exports.RoleSchema = exports.ChangePasswordRequestSchema = exports.RefreshTokenResponseSchema = exports.RefreshTokenRequestSchema = exports.LoginResponseSchema = exports.LoginRequestSchema = exports.UserSchema = exports.UserRoleEnum = void 0;
const zod_1 = require("zod");
/**
 * 用戶角色枚舉
 */
exports.UserRoleEnum = zod_1.z.enum(['ADMIN', 'TEACHER', 'STUDENT', 'ACCOUNTANT']);
/**
 * 自訂用戶 Schema
 * 對應後端 CustomUser 模型
 */
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.number().int().positive(),
    username: zod_1.z.string().min(1),
    email: zod_1.z.string().email().optional().nullable(),
    first_name: zod_1.z.string().optional().default(''),
    last_name: zod_1.z.string().optional().default(''),
    role: exports.UserRoleEnum,
    role_display: zod_1.z.string().optional(), // 人類可讀的角色顯示名稱
    custom_role: zod_1.z.number().int().positive().nullable().optional(),
    custom_role_name: zod_1.z.string().nullable().optional(),
    is_staff: zod_1.z.boolean().default(false),
    is_active: zod_1.z.boolean().default(true),
    must_change_password: zod_1.z.boolean().default(false),
    student_id: zod_1.z.number().int().positive().nullable().optional()
});
/**
 * 登入請求 DTO Schema
 */
exports.LoginRequestSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1)
});
/**
 * 登入響應 Schema
 */
exports.LoginResponseSchema = zod_1.z.object({
    access: zod_1.z.string(),
    refresh: zod_1.z.string(),
    user: exports.UserSchema
});
/**
 * Token 刷新請求 Schema
 */
exports.RefreshTokenRequestSchema = zod_1.z.object({
    refresh: zod_1.z.string()
});
/**
 * Token 刷新響應 Schema
 */
exports.RefreshTokenResponseSchema = zod_1.z.object({
    access: zod_1.z.string()
});
/**
 * 修改密碼請求 Schema
 */
exports.ChangePasswordRequestSchema = zod_1.z.object({
    old_password: zod_1.z.string().min(1),
    new_password: zod_1.z.string().min(1)
});
/**
 * 角色 Schema
 */
exports.RoleSchema = zod_1.z.object({
    id: zod_1.z.number().int().positive(),
    code: zod_1.z.string().nullable().optional(),
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional().default(''),
    is_active: zod_1.z.boolean().default(true),
    created_at: zod_1.z.string().datetime().optional(),
    updated_at: zod_1.z.string().datetime().optional()
});
/**
 * 角色權限 Schema
 */
exports.RolePermissionSchema = zod_1.z.object({
    id: zod_1.z.number().int().positive(),
    role: zod_1.z.number().int().positive(),
    permission_type: zod_1.z.enum(['page', 'api']),
    resource: zod_1.z.string().min(1),
    method: zod_1.z.string().nullable().optional(),
    created_at: zod_1.z.string().datetime().optional()
});
/**
 * 審計日誌 Schema
 */
exports.AuditLogSchema = zod_1.z.object({
    id: zod_1.z.number().int().positive(),
    user: zod_1.z.number().int().positive().nullable().optional(),
    role: zod_1.z.number().int().positive().nullable().optional(),
    impersonated_by: zod_1.z.number().int().positive().nullable().optional(),
    action_type: zod_1.z.enum(['create', 'update', 'delete', 'view', 'login', 'logout', 'other']),
    resource_type: zod_1.z.string().min(1),
    resource_id: zod_1.z.string().nullable().optional(),
    resource_name: zod_1.z.string().nullable().optional(),
    description: zod_1.z.string().optional().default(''),
    ip_address: zod_1.z.string().ip().nullable().optional(),
    user_agent: zod_1.z.string().nullable().optional(),
    request_data: zod_1.z.record(zod_1.z.any()).optional().default({}),
    response_status: zod_1.z.number().int().nullable().optional(),
    created_at: zod_1.z.string().datetime()
});
