import { z } from 'zod';
/**
 * 科目 Schema
 * 對應後端 CramschoolSubject 模型
 */
export declare const SubjectSchema: z.ZodObject<{
    subject_id: z.ZodNumber;
    name: z.ZodString;
    code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    created_at: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    subject_id: number;
    code?: string | null | undefined;
    description?: string | null | undefined;
    created_at?: string | undefined;
}, {
    name: string;
    subject_id: number;
    code?: string | null | undefined;
    description?: string | null | undefined;
    created_at?: string | undefined;
}>;
export type Subject = z.infer<typeof SubjectSchema>;
/**
 * 創建科目 DTO Schema
 */
export declare const CreateSubjectSchema: z.ZodObject<Omit<{
    subject_id: z.ZodNumber;
    name: z.ZodString;
    code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    created_at: z.ZodOptional<z.ZodString>;
}, "created_at" | "subject_id">, "strip", z.ZodTypeAny, {
    name: string;
    code?: string | null | undefined;
    description?: string | null | undefined;
}, {
    name: string;
    code?: string | null | undefined;
    description?: string | null | undefined;
}>;
export type CreateSubjectDto = z.infer<typeof CreateSubjectSchema>;
/**
 * 更新科目 DTO Schema
 */
export declare const UpdateSubjectSchema: z.ZodObject<Omit<{
    subject_id: z.ZodOptional<z.ZodNumber>;
    name: z.ZodOptional<z.ZodString>;
    code: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    description: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    created_at: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "created_at" | "subject_id">, "strip", z.ZodTypeAny, {
    code?: string | null | undefined;
    name?: string | undefined;
    description?: string | null | undefined;
}, {
    code?: string | null | undefined;
    name?: string | undefined;
    description?: string | null | undefined;
}>;
export type UpdateSubjectDto = z.infer<typeof UpdateSubjectSchema>;
