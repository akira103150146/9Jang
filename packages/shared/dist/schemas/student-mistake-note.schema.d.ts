import { z } from 'zod';
/**
 * 學生錯題筆記 Schema
 * 對應後端 CramschoolStudentMistakeNote 模型
 */
export declare const StudentMistakeNoteSchema: z.ZodObject<{
    note_id: z.ZodNumber;
    student_id: z.ZodNumber;
    title: z.ZodString;
    subject: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    content: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    created_at: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodOptional<z.ZodString>;
    is_deleted: z.ZodDefault<z.ZodBoolean>;
    deleted_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    student_id: number;
    is_deleted: boolean;
    note_id: number;
    content?: string | null | undefined;
    created_at?: string | undefined;
    updated_at?: string | undefined;
    deleted_at?: string | null | undefined;
    subject?: string | null | undefined;
}, {
    title: string;
    student_id: number;
    note_id: number;
    content?: string | null | undefined;
    created_at?: string | undefined;
    updated_at?: string | undefined;
    is_deleted?: boolean | undefined;
    deleted_at?: string | null | undefined;
    subject?: string | null | undefined;
}>;
export type StudentMistakeNote = z.infer<typeof StudentMistakeNoteSchema>;
/**
 * 創建學生錯題筆記 DTO Schema
 */
export declare const CreateStudentMistakeNoteSchema: z.ZodObject<Omit<{
    note_id: z.ZodNumber;
    student_id: z.ZodNumber;
    title: z.ZodString;
    subject: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    content: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    created_at: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodOptional<z.ZodString>;
    is_deleted: z.ZodDefault<z.ZodBoolean>;
    deleted_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "created_at" | "updated_at" | "is_deleted" | "deleted_at" | "note_id">, "strip", z.ZodTypeAny, {
    title: string;
    student_id: number;
    content?: string | null | undefined;
    subject?: string | null | undefined;
}, {
    title: string;
    student_id: number;
    content?: string | null | undefined;
    subject?: string | null | undefined;
}>;
export type CreateStudentMistakeNoteDto = z.infer<typeof CreateStudentMistakeNoteSchema>;
/**
 * 更新學生錯題筆記 DTO Schema
 */
export declare const UpdateStudentMistakeNoteSchema: z.ZodObject<Omit<{
    note_id: z.ZodOptional<z.ZodNumber>;
    student_id: z.ZodOptional<z.ZodNumber>;
    title: z.ZodOptional<z.ZodString>;
    subject: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    content: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    created_at: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    updated_at: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    is_deleted: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    deleted_at: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "created_at" | "updated_at" | "is_deleted" | "deleted_at" | "note_id">, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    content?: string | null | undefined;
    student_id?: number | undefined;
    subject?: string | null | undefined;
}, {
    title?: string | undefined;
    content?: string | null | undefined;
    student_id?: number | undefined;
    subject?: string | null | undefined;
}>;
export type UpdateStudentMistakeNoteDto = z.infer<typeof UpdateStudentMistakeNoteSchema>;
