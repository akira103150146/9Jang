import { z } from 'zod';
/**
 * 學生錯題筆記圖片 Schema
 * 對應後端 CramschoolStudentMistakeNoteImage 模型
 */
export declare const StudentMistakeNoteImageSchema: z.ZodObject<{
    image_id: z.ZodNumber;
    note_id: z.ZodNumber;
    image_path: z.ZodString;
    caption: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    sort_order: z.ZodDefault<z.ZodNumber>;
    created_at: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    image_path: string;
    note_id: number;
    image_id: number;
    sort_order: number;
    created_at?: string | undefined;
    caption?: string | null | undefined;
}, {
    image_path: string;
    note_id: number;
    image_id: number;
    created_at?: string | undefined;
    caption?: string | null | undefined;
    sort_order?: number | undefined;
}>;
export type StudentMistakeNoteImage = z.infer<typeof StudentMistakeNoteImageSchema>;
/**
 * 創建學生錯題筆記圖片 DTO Schema
 */
export declare const CreateStudentMistakeNoteImageSchema: z.ZodObject<Omit<{
    image_id: z.ZodNumber;
    note_id: z.ZodNumber;
    image_path: z.ZodString;
    caption: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    sort_order: z.ZodDefault<z.ZodNumber>;
    created_at: z.ZodOptional<z.ZodString>;
}, "created_at" | "image_id">, "strip", z.ZodTypeAny, {
    image_path: string;
    note_id: number;
    sort_order: number;
    caption?: string | null | undefined;
}, {
    image_path: string;
    note_id: number;
    caption?: string | null | undefined;
    sort_order?: number | undefined;
}>;
export type CreateStudentMistakeNoteImageDto = z.infer<typeof CreateStudentMistakeNoteImageSchema>;
/**
 * 更新學生錯題筆記圖片 DTO Schema
 */
export declare const UpdateStudentMistakeNoteImageSchema: z.ZodObject<Omit<{
    image_id: z.ZodOptional<z.ZodNumber>;
    note_id: z.ZodOptional<z.ZodNumber>;
    image_path: z.ZodOptional<z.ZodString>;
    caption: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    sort_order: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    created_at: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "created_at" | "note_id" | "image_id">, "strip", z.ZodTypeAny, {
    image_path?: string | undefined;
    caption?: string | null | undefined;
    sort_order?: number | undefined;
}, {
    image_path?: string | undefined;
    caption?: string | null | undefined;
    sort_order?: number | undefined;
}>;
export type UpdateStudentMistakeNoteImageDto = z.infer<typeof UpdateStudentMistakeNoteImageSchema>;
