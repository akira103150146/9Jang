import { z } from 'zod';
/**
 * 錯題圖片 Schema
 * 對應後端 CramschoolErrorLogImage 模型
 */
export declare const ErrorLogImageSchema: z.ZodObject<{
    image_id: z.ZodNumber;
    error_log_id: z.ZodNumber;
    image_path: z.ZodString;
    caption: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    sort_order: z.ZodDefault<z.ZodNumber>;
    created_at: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    image_path: string;
    error_log_id: number;
    image_id: number;
    sort_order: number;
    created_at?: string | undefined;
    caption?: string | null | undefined;
}, {
    image_path: string;
    error_log_id: number;
    image_id: number;
    created_at?: string | undefined;
    caption?: string | null | undefined;
    sort_order?: number | undefined;
}>;
export type ErrorLogImage = z.infer<typeof ErrorLogImageSchema>;
/**
 * 創建錯題圖片 DTO Schema
 */
export declare const CreateErrorLogImageSchema: z.ZodObject<Omit<{
    image_id: z.ZodNumber;
    error_log_id: z.ZodNumber;
    image_path: z.ZodString;
    caption: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    sort_order: z.ZodDefault<z.ZodNumber>;
    created_at: z.ZodOptional<z.ZodString>;
}, "created_at" | "image_id">, "strip", z.ZodTypeAny, {
    image_path: string;
    error_log_id: number;
    sort_order: number;
    caption?: string | null | undefined;
}, {
    image_path: string;
    error_log_id: number;
    caption?: string | null | undefined;
    sort_order?: number | undefined;
}>;
export type CreateErrorLogImageDto = z.infer<typeof CreateErrorLogImageSchema>;
/**
 * 更新錯題圖片 DTO Schema
 */
export declare const UpdateErrorLogImageSchema: z.ZodObject<Omit<{
    image_id: z.ZodOptional<z.ZodNumber>;
    error_log_id: z.ZodOptional<z.ZodNumber>;
    image_path: z.ZodOptional<z.ZodString>;
    caption: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    sort_order: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    created_at: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "created_at" | "error_log_id" | "image_id">, "strip", z.ZodTypeAny, {
    image_path?: string | undefined;
    caption?: string | null | undefined;
    sort_order?: number | undefined;
}, {
    image_path?: string | undefined;
    caption?: string | null | undefined;
    sort_order?: number | undefined;
}>;
export type UpdateErrorLogImageDto = z.infer<typeof UpdateErrorLogImageSchema>;
