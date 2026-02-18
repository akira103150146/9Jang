import { z } from 'zod';
/**
 * 權限類型枚舉
 */
export declare const PermissionTypeEnum: z.ZodEnum<["page", "api"]>;
/**
 * 角色 Schema
 * 對應後端 AccountRole 模型
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
    description: string;
    name: string;
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
 * 對應後端 AccountRolePermission 模型
 */
export declare const RolePermissionSchema: z.ZodObject<{
    id: z.ZodNumber;
    role_id: z.ZodNumber;
    permission_type: z.ZodEnum<["page", "api"]>;
    resource: z.ZodString;
    method: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    created_at: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: number;
    role_id: number;
    permission_type: "page" | "api";
    resource: string;
    created_at?: string | undefined;
    method?: string | null | undefined;
}, {
    id: number;
    role_id: number;
    permission_type: "page" | "api";
    resource: string;
    created_at?: string | undefined;
    method?: string | null | undefined;
}>;
export type RolePermission = z.infer<typeof RolePermissionSchema>;
/**
 * 建立角色 DTO Schema
 */
export declare const CreateRoleSchema: z.ZodObject<Omit<{
    id: z.ZodNumber;
    code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    name: z.ZodString;
    description: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    is_active: z.ZodDefault<z.ZodBoolean>;
    created_at: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodOptional<z.ZodString>;
}, "id" | "created_at" | "updated_at"> & {
    permissions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        permission_type: z.ZodEnum<["page", "api"]>;
        resource: z.ZodString;
        method: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        permission_type: "page" | "api";
        resource: string;
        method?: string | null | undefined;
    }, {
        permission_type: "page" | "api";
        resource: string;
        method?: string | null | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    is_active: boolean;
    description: string;
    name: string;
    code?: string | null | undefined;
    permissions?: {
        permission_type: "page" | "api";
        resource: string;
        method?: string | null | undefined;
    }[] | undefined;
}, {
    name: string;
    code?: string | null | undefined;
    is_active?: boolean | undefined;
    description?: string | undefined;
    permissions?: {
        permission_type: "page" | "api";
        resource: string;
        method?: string | null | undefined;
    }[] | undefined;
}>;
export type CreateRoleDto = z.infer<typeof CreateRoleSchema>;
/**
 * 建立角色權限 DTO Schema
 */
export declare const CreateRolePermissionSchema: z.ZodObject<Omit<{
    id: z.ZodNumber;
    role_id: z.ZodNumber;
    permission_type: z.ZodEnum<["page", "api"]>;
    resource: z.ZodString;
    method: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    created_at: z.ZodOptional<z.ZodString>;
}, "id" | "created_at">, "strip", z.ZodTypeAny, {
    role_id: number;
    permission_type: "page" | "api";
    resource: string;
    method?: string | null | undefined;
}, {
    role_id: number;
    permission_type: "page" | "api";
    resource: string;
    method?: string | null | undefined;
}>;
export type CreateRolePermissionDto = z.infer<typeof CreateRolePermissionSchema>;
/**
 * 更新角色 DTO Schema
 */
export declare const UpdateRoleSchema: z.ZodObject<Omit<{
    id: z.ZodOptional<z.ZodNumber>;
    code: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodString>>>;
    is_active: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    created_at: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    updated_at: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "id" | "created_at" | "updated_at">, "strip", z.ZodTypeAny, {
    code?: string | null | undefined;
    is_active?: boolean | undefined;
    description?: string | undefined;
    name?: string | undefined;
}, {
    code?: string | null | undefined;
    is_active?: boolean | undefined;
    description?: string | undefined;
    name?: string | undefined;
}>;
export type UpdateRoleDto = z.infer<typeof UpdateRoleSchema>;
/**
 * 批次新增權限 DTO Schema
 */
export declare const AddPermissionsSchema: z.ZodObject<{
    permissions: z.ZodArray<z.ZodObject<Omit<{
        id: z.ZodNumber;
        role_id: z.ZodNumber;
        permission_type: z.ZodEnum<["page", "api"]>;
        resource: z.ZodString;
        method: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        created_at: z.ZodOptional<z.ZodString>;
    }, "id" | "created_at">, "strip", z.ZodTypeAny, {
        role_id: number;
        permission_type: "page" | "api";
        resource: string;
        method?: string | null | undefined;
    }, {
        role_id: number;
        permission_type: "page" | "api";
        resource: string;
        method?: string | null | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    permissions: {
        role_id: number;
        permission_type: "page" | "api";
        resource: string;
        method?: string | null | undefined;
    }[];
}, {
    permissions: {
        role_id: number;
        permission_type: "page" | "api";
        resource: string;
        method?: string | null | undefined;
    }[];
}>;
export type AddPermissionsDto = z.infer<typeof AddPermissionsSchema>;
/**
 * 角色查詢 DTO Schema
 */
export declare const RoleQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    page_size: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    is_active: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    page: number;
    page_size: number;
    is_active?: boolean | undefined;
    search?: string | undefined;
}, {
    is_active?: boolean | undefined;
    page?: number | undefined;
    page_size?: number | undefined;
    search?: string | undefined;
}>;
export type RoleQueryDto = z.infer<typeof RoleQuerySchema>;
