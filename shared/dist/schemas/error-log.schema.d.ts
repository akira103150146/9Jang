import { z } from 'zod';
/**
 * 錯題記錄 Schema
 * 對應後端 CramschoolErrorLog 模型
 */
export declare const ErrorLogSchema: z.ZodObject<{
    error_log_id: z.ZodNumber;
    student_id: z.ZodNumber;
    question_id: z.ZodNumber;
    error_count: z.ZodDefault<z.ZodNumber>;
    review_status: z.ZodDefault<z.ZodString>;
    is_deleted: z.ZodDefault<z.ZodBoolean>;
    deleted_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    student_id: number;
    is_deleted: boolean;
    question_id: number;
    error_log_id: number;
    error_count: number;
    review_status: string;
    deleted_at?: string | null | undefined;
}, {
    student_id: number;
    question_id: number;
    error_log_id: number;
    is_deleted?: boolean | undefined;
    deleted_at?: string | null | undefined;
    error_count?: number | undefined;
    review_status?: string | undefined;
}>;
export type ErrorLog = z.infer<typeof ErrorLogSchema>;
/**
 * 創建錯題記錄 DTO Schema
 */
export declare const CreateErrorLogSchema: z.ZodObject<Omit<{
    error_log_id: z.ZodNumber;
    student_id: z.ZodNumber;
    question_id: z.ZodNumber;
    error_count: z.ZodDefault<z.ZodNumber>;
    review_status: z.ZodDefault<z.ZodString>;
    is_deleted: z.ZodDefault<z.ZodBoolean>;
    deleted_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "is_deleted" | "deleted_at" | "error_log_id">, "strip", z.ZodTypeAny, {
    student_id: number;
    question_id: number;
    error_count: number;
    review_status: string;
}, {
    student_id: number;
    question_id: number;
    error_count?: number | undefined;
    review_status?: string | undefined;
}>;
export type CreateErrorLogDto = z.infer<typeof CreateErrorLogSchema>;
/**
 * 更新錯題記錄 DTO Schema
 */
export declare const UpdateErrorLogSchema: z.ZodObject<Omit<{
    error_log_id: z.ZodOptional<z.ZodNumber>;
    student_id: z.ZodOptional<z.ZodNumber>;
    question_id: z.ZodOptional<z.ZodNumber>;
    error_count: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    review_status: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    is_deleted: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    deleted_at: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "is_deleted" | "deleted_at" | "error_log_id">, "strip", z.ZodTypeAny, {
    student_id?: number | undefined;
    question_id?: number | undefined;
    error_count?: number | undefined;
    review_status?: string | undefined;
}, {
    student_id?: number | undefined;
    question_id?: number | undefined;
    error_count?: number | undefined;
    review_status?: string | undefined;
}>;
export type UpdateErrorLogDto = z.infer<typeof UpdateErrorLogSchema>;
