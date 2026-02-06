import { z } from 'zod';
/**
 * 課程 PDF 講義 Schema
 * 對應後端 CramschoolCoursePdf 模型
 */
export declare const CoursePdfSchema: z.ZodObject<{
    pdf_id: z.ZodNumber;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    file_path: z.ZodString;
    file_size: z.ZodNumber;
    course_id: z.ZodNumber;
    uploaded_by_id: z.ZodNumber;
    student_group_ids: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>>;
    allow_download: z.ZodDefault<z.ZodBoolean>;
    is_visible_to_all: z.ZodDefault<z.ZodBoolean>;
    is_active: z.ZodDefault<z.ZodBoolean>;
    created_at: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    is_active: boolean;
    course_id: number;
    pdf_id: number;
    file_path: string;
    file_size: number;
    uploaded_by_id: number;
    student_group_ids: number[];
    allow_download: boolean;
    is_visible_to_all: boolean;
    description?: string | null | undefined;
    created_at?: string | undefined;
    updated_at?: string | undefined;
}, {
    title: string;
    course_id: number;
    pdf_id: number;
    file_path: string;
    file_size: number;
    uploaded_by_id: number;
    is_active?: boolean | undefined;
    description?: string | null | undefined;
    created_at?: string | undefined;
    updated_at?: string | undefined;
    student_group_ids?: number[] | undefined;
    allow_download?: boolean | undefined;
    is_visible_to_all?: boolean | undefined;
}>;
export type CoursePdf = z.infer<typeof CoursePdfSchema>;
/**
 * 創建課程 PDF DTO Schema
 */
export declare const CreateCoursePdfSchema: z.ZodObject<{
    title: z.ZodString;
    is_active: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    description: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    course_id: z.ZodNumber;
    student_group_ids: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>>>;
    allow_download: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    is_visible_to_all: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    course_id: number;
    is_active?: boolean | undefined;
    description?: string | null | undefined;
    student_group_ids?: number[] | undefined;
    allow_download?: boolean | undefined;
    is_visible_to_all?: boolean | undefined;
}, {
    title: string;
    course_id: number;
    is_active?: boolean | undefined;
    description?: string | null | undefined;
    student_group_ids?: number[] | undefined;
    allow_download?: boolean | undefined;
    is_visible_to_all?: boolean | undefined;
}>;
export type CreateCoursePdfDto = z.infer<typeof CreateCoursePdfSchema>;
/**
 * 更新課程 PDF DTO Schema
 */
export declare const UpdateCoursePdfSchema: z.ZodObject<Omit<{
    pdf_id: z.ZodOptional<z.ZodNumber>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    file_path: z.ZodOptional<z.ZodString>;
    file_size: z.ZodOptional<z.ZodNumber>;
    course_id: z.ZodOptional<z.ZodNumber>;
    uploaded_by_id: z.ZodOptional<z.ZodNumber>;
    student_group_ids: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>>>;
    allow_download: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    is_visible_to_all: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    is_active: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    created_at: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    updated_at: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "created_at" | "updated_at" | "course_id" | "pdf_id" | "file_path" | "file_size" | "uploaded_by_id">, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    is_active?: boolean | undefined;
    description?: string | null | undefined;
    student_group_ids?: number[] | undefined;
    allow_download?: boolean | undefined;
    is_visible_to_all?: boolean | undefined;
}, {
    title?: string | undefined;
    is_active?: boolean | undefined;
    description?: string | null | undefined;
    student_group_ids?: number[] | undefined;
    allow_download?: boolean | undefined;
    is_visible_to_all?: boolean | undefined;
}>;
export type UpdateCoursePdfDto = z.infer<typeof UpdateCoursePdfSchema>;
