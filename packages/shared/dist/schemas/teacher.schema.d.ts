import { z } from 'zod';
/**
 * 老師權限等級枚舉
 */
export declare const TeacherPermissionLevelEnum: z.ZodEnum<["Teacher", "Admin", "Accountant"]>;
/**
 * 老師資料 Schema
 * 對應後端 Teacher 模型
 */
export declare const TeacherSchema: z.ZodObject<{
    teacher_id: z.ZodNumber;
    name: z.ZodString;
    user_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    permission_level: z.ZodDefault<z.ZodEnum<["Teacher", "Admin", "Accountant"]>>;
    phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    hire_date: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    teacher_id: number;
    permission_level: "Teacher" | "Admin" | "Accountant";
    phone?: string | null | undefined;
    user_id?: number | null | undefined;
    hire_date?: string | null | undefined;
}, {
    name: string;
    teacher_id: number;
    phone?: string | null | undefined;
    user_id?: number | null | undefined;
    permission_level?: "Teacher" | "Admin" | "Accountant" | undefined;
    hire_date?: string | null | undefined;
}>;
export type Teacher = z.infer<typeof TeacherSchema>;
/**
 * 創建老師 DTO Schema
 */
export declare const CreateTeacherSchema: z.ZodObject<{
    name: z.ZodString;
    phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    user_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    permission_level: z.ZodOptional<z.ZodDefault<z.ZodEnum<["Teacher", "Admin", "Accountant"]>>>;
    hire_date: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    phone?: string | null | undefined;
    user_id?: number | null | undefined;
    permission_level?: "Teacher" | "Admin" | "Accountant" | undefined;
    hire_date?: string | null | undefined;
}, {
    name: string;
    phone?: string | null | undefined;
    user_id?: number | null | undefined;
    permission_level?: "Teacher" | "Admin" | "Accountant" | undefined;
    hire_date?: string | null | undefined;
}>;
export type CreateTeacherDto = z.infer<typeof CreateTeacherSchema>;
/**
 * 更新老師 DTO Schema
 */
export declare const UpdateTeacherSchema: z.ZodObject<Omit<{
    teacher_id: z.ZodOptional<z.ZodNumber>;
    name: z.ZodOptional<z.ZodString>;
    user_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    permission_level: z.ZodOptional<z.ZodDefault<z.ZodEnum<["Teacher", "Admin", "Accountant"]>>>;
    phone: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    hire_date: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "teacher_id">, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    phone?: string | null | undefined;
    user_id?: number | null | undefined;
    permission_level?: "Teacher" | "Admin" | "Accountant" | undefined;
    hire_date?: string | null | undefined;
}, {
    name?: string | undefined;
    phone?: string | null | undefined;
    user_id?: number | null | undefined;
    permission_level?: "Teacher" | "Admin" | "Accountant" | undefined;
    hire_date?: string | null | undefined;
}>;
export type UpdateTeacherDto = z.infer<typeof UpdateTeacherSchema>;
