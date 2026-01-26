import { z } from 'zod';
/**
 * 學生作答 Schema
 * 對應後端 CramschoolStudentAnswer 模型
 */
export declare const StudentAnswerSchema: z.ZodObject<{
    answer_id: z.ZodNumber;
    student_id: z.ZodNumber;
    question_id: z.ZodNumber;
    test_name: z.ZodString;
    submission_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    is_correct: z.ZodDefault<z.ZodBoolean>;
    scanned_file_path: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    is_deleted: z.ZodDefault<z.ZodBoolean>;
    deleted_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    student_id: number;
    is_deleted: boolean;
    question_id: number;
    answer_id: number;
    test_name: string;
    is_correct: boolean;
    deleted_at?: string | null | undefined;
    submission_id?: number | null | undefined;
    scanned_file_path?: string | null | undefined;
}, {
    student_id: number;
    question_id: number;
    answer_id: number;
    test_name: string;
    is_deleted?: boolean | undefined;
    deleted_at?: string | null | undefined;
    submission_id?: number | null | undefined;
    is_correct?: boolean | undefined;
    scanned_file_path?: string | null | undefined;
}>;
export type StudentAnswer = z.infer<typeof StudentAnswerSchema>;
/**
 * 創建學生作答 DTO Schema
 */
export declare const CreateStudentAnswerSchema: z.ZodObject<Omit<{
    answer_id: z.ZodNumber;
    student_id: z.ZodNumber;
    question_id: z.ZodNumber;
    test_name: z.ZodString;
    submission_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    is_correct: z.ZodDefault<z.ZodBoolean>;
    scanned_file_path: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    is_deleted: z.ZodDefault<z.ZodBoolean>;
    deleted_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "is_deleted" | "deleted_at" | "answer_id">, "strip", z.ZodTypeAny, {
    student_id: number;
    question_id: number;
    test_name: string;
    is_correct: boolean;
    submission_id?: number | null | undefined;
    scanned_file_path?: string | null | undefined;
}, {
    student_id: number;
    question_id: number;
    test_name: string;
    submission_id?: number | null | undefined;
    is_correct?: boolean | undefined;
    scanned_file_path?: string | null | undefined;
}>;
export type CreateStudentAnswerDto = z.infer<typeof CreateStudentAnswerSchema>;
/**
 * 更新學生作答 DTO Schema
 */
export declare const UpdateStudentAnswerSchema: z.ZodObject<Omit<{
    answer_id: z.ZodOptional<z.ZodNumber>;
    student_id: z.ZodOptional<z.ZodNumber>;
    question_id: z.ZodOptional<z.ZodNumber>;
    test_name: z.ZodOptional<z.ZodString>;
    submission_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    is_correct: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    scanned_file_path: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    is_deleted: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    deleted_at: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "is_deleted" | "deleted_at" | "answer_id">, "strip", z.ZodTypeAny, {
    student_id?: number | undefined;
    question_id?: number | undefined;
    test_name?: string | undefined;
    submission_id?: number | null | undefined;
    is_correct?: boolean | undefined;
    scanned_file_path?: string | null | undefined;
}, {
    student_id?: number | undefined;
    question_id?: number | undefined;
    test_name?: string | undefined;
    submission_id?: number | null | undefined;
    is_correct?: boolean | undefined;
    scanned_file_path?: string | null | undefined;
}>;
export type UpdateStudentAnswerDto = z.infer<typeof UpdateStudentAnswerSchema>;
