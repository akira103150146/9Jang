import { z } from 'zod';
/**
 * 用戶角色枚舉
 */
export declare const UserRoleEnum: z.ZodEnum<["ADMIN", "TEACHER", "STUDENT", "ACCOUNTANT"]>;
/**
 * 自訂用戶 Schema
 * 對應後端 CustomUser 模型
 */
export declare const UserSchema: z.ZodObject<{
    id: z.ZodNumber;
    username: z.ZodString;
    email: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    first_name: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    last_name: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    role: z.ZodEnum<["ADMIN", "TEACHER", "STUDENT", "ACCOUNTANT"]>;
    role_display: z.ZodOptional<z.ZodString>;
    custom_role: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    custom_role_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    is_staff: z.ZodDefault<z.ZodBoolean>;
    is_active: z.ZodDefault<z.ZodBoolean>;
    must_change_password: z.ZodDefault<z.ZodBoolean>;
    student_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    role: "ADMIN" | "TEACHER" | "STUDENT" | "ACCOUNTANT";
    is_staff: boolean;
    is_active: boolean;
    must_change_password: boolean;
    email?: string | null | undefined;
    role_display?: string | undefined;
    custom_role?: number | null | undefined;
    custom_role_name?: string | null | undefined;
    student_id?: number | null | undefined;
}, {
    id: number;
    username: string;
    role: "ADMIN" | "TEACHER" | "STUDENT" | "ACCOUNTANT";
    email?: string | null | undefined;
    first_name?: string | undefined;
    last_name?: string | undefined;
    role_display?: string | undefined;
    custom_role?: number | null | undefined;
    custom_role_name?: string | null | undefined;
    is_staff?: boolean | undefined;
    is_active?: boolean | undefined;
    must_change_password?: boolean | undefined;
    student_id?: number | null | undefined;
}>;
export type User = z.infer<typeof UserSchema>;
/**
 * 登入請求 DTO Schema
 */
export declare const LoginRequestSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type LoginRequestDto = z.infer<typeof LoginRequestSchema>;
/**
 * 登入響應 Schema
 */
export declare const LoginResponseSchema: z.ZodObject<{
    access: z.ZodString;
    refresh: z.ZodString;
    user: z.ZodObject<{
        id: z.ZodNumber;
        username: z.ZodString;
        email: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        first_name: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        last_name: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        role: z.ZodEnum<["ADMIN", "TEACHER", "STUDENT", "ACCOUNTANT"]>;
        role_display: z.ZodOptional<z.ZodString>;
        custom_role: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        custom_role_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        is_staff: z.ZodDefault<z.ZodBoolean>;
        is_active: z.ZodDefault<z.ZodBoolean>;
        must_change_password: z.ZodDefault<z.ZodBoolean>;
        student_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        username: string;
        first_name: string;
        last_name: string;
        role: "ADMIN" | "TEACHER" | "STUDENT" | "ACCOUNTANT";
        is_staff: boolean;
        is_active: boolean;
        must_change_password: boolean;
        email?: string | null | undefined;
        role_display?: string | undefined;
        custom_role?: number | null | undefined;
        custom_role_name?: string | null | undefined;
        student_id?: number | null | undefined;
    }, {
        id: number;
        username: string;
        role: "ADMIN" | "TEACHER" | "STUDENT" | "ACCOUNTANT";
        email?: string | null | undefined;
        first_name?: string | undefined;
        last_name?: string | undefined;
        role_display?: string | undefined;
        custom_role?: number | null | undefined;
        custom_role_name?: string | null | undefined;
        is_staff?: boolean | undefined;
        is_active?: boolean | undefined;
        must_change_password?: boolean | undefined;
        student_id?: number | null | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    access: string;
    refresh: string;
    user: {
        id: number;
        username: string;
        first_name: string;
        last_name: string;
        role: "ADMIN" | "TEACHER" | "STUDENT" | "ACCOUNTANT";
        is_staff: boolean;
        is_active: boolean;
        must_change_password: boolean;
        email?: string | null | undefined;
        role_display?: string | undefined;
        custom_role?: number | null | undefined;
        custom_role_name?: string | null | undefined;
        student_id?: number | null | undefined;
    };
}, {
    access: string;
    refresh: string;
    user: {
        id: number;
        username: string;
        role: "ADMIN" | "TEACHER" | "STUDENT" | "ACCOUNTANT";
        email?: string | null | undefined;
        first_name?: string | undefined;
        last_name?: string | undefined;
        role_display?: string | undefined;
        custom_role?: number | null | undefined;
        custom_role_name?: string | null | undefined;
        is_staff?: boolean | undefined;
        is_active?: boolean | undefined;
        must_change_password?: boolean | undefined;
        student_id?: number | null | undefined;
    };
}>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
/**
 * Token 刷新請求 Schema
 */
export declare const RefreshTokenRequestSchema: z.ZodObject<{
    refresh: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refresh: string;
}, {
    refresh: string;
}>;
export type RefreshTokenRequestDto = z.infer<typeof RefreshTokenRequestSchema>;
/**
 * Token 刷新響應 Schema
 */
export declare const RefreshTokenResponseSchema: z.ZodObject<{
    access: z.ZodString;
}, "strip", z.ZodTypeAny, {
    access: string;
}, {
    access: string;
}>;
export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;
/**
 * 修改密碼請求 Schema
 */
export declare const ChangePasswordRequestSchema: z.ZodObject<{
    old_password: z.ZodString;
    new_password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    old_password: string;
    new_password: string;
}, {
    old_password: string;
    new_password: string;
}>;
export type ChangePasswordRequestDto = z.infer<typeof ChangePasswordRequestSchema>;
/**
 * 角色 Schema
 */
export declare const RoleSchema: z.ZodObject<{
    id: z.ZodNumber;
    code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    name: z.ZodString;
    description: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    is_active: z.ZodDefault<z.ZodBoolean>;
    created_at: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: number;
    is_active: boolean;
    name: string;
    description: string;
    code?: string | null | undefined;
    created_at?: string | undefined;
    updated_at?: string | undefined;
}, {
    id: number;
    name: string;
    code?: string | null | undefined;
    is_active?: boolean | undefined;
    description?: string | undefined;
    created_at?: string | undefined;
    updated_at?: string | undefined;
}>;
export type Role = z.infer<typeof RoleSchema>;
/**
 * 角色權限 Schema
 */
export declare const RolePermissionSchema: z.ZodObject<{
    id: z.ZodNumber;
    role: z.ZodNumber;
    permission_type: z.ZodEnum<["page", "api"]>;
    resource: z.ZodString;
    method: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    created_at: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: number;
    role: number;
    permission_type: "page" | "api";
    resource: string;
    created_at?: string | undefined;
    method?: string | null | undefined;
}, {
    id: number;
    role: number;
    permission_type: "page" | "api";
    resource: string;
    created_at?: string | undefined;
    method?: string | null | undefined;
}>;
export type RolePermission = z.infer<typeof RolePermissionSchema>;
/**
 * 審計日誌 Schema
 */
export declare const AuditLogSchema: z.ZodObject<{
    id: z.ZodNumber;
    user: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    role: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    impersonated_by: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    action_type: z.ZodEnum<["create", "update", "delete", "view", "login", "logout", "other"]>;
    resource_type: z.ZodString;
    resource_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    resource_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    description: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    ip_address: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    user_agent: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    request_data: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
    response_status: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    created_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: number;
    description: string;
    created_at: string;
    action_type: "create" | "update" | "delete" | "view" | "login" | "logout" | "other";
    resource_type: string;
    request_data: Record<string, any>;
    role?: number | null | undefined;
    user?: number | null | undefined;
    impersonated_by?: number | null | undefined;
    resource_id?: string | null | undefined;
    resource_name?: string | null | undefined;
    ip_address?: string | null | undefined;
    user_agent?: string | null | undefined;
    response_status?: number | null | undefined;
}, {
    id: number;
    created_at: string;
    action_type: "create" | "update" | "delete" | "view" | "login" | "logout" | "other";
    resource_type: string;
    role?: number | null | undefined;
    user?: number | null | undefined;
    description?: string | undefined;
    impersonated_by?: number | null | undefined;
    resource_id?: string | null | undefined;
    resource_name?: string | null | undefined;
    ip_address?: string | null | undefined;
    user_agent?: string | null | undefined;
    request_data?: Record<string, any> | undefined;
    response_status?: number | null | undefined;
}>;
export type AuditLog = z.infer<typeof AuditLogSchema>;
