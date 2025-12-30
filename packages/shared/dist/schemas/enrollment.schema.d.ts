import { z } from 'zod';
/**
 * 學生報名 Schema
 * 對應後端 StudentEnrollment 模型
 */
export declare const StudentEnrollmentSchema: z.ZodObject<{
    enrollment_id: z.ZodNumber;
    student_id: z.ZodNumber;
    course_id: z.ZodNumber;
    enroll_date: z.ZodString;
    discount_rate: z.ZodDefault<z.ZodNumber>;
    is_active: z.ZodDefault<z.ZodBoolean>;
    is_deleted: z.ZodDefault<z.ZodBoolean>;
    deleted_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    is_active: boolean;
    student_id: number;
    is_deleted: boolean;
    course_id: number;
    enrollment_id: number;
    enroll_date: string;
    discount_rate: number;
    deleted_at?: string | null | undefined;
}, {
    student_id: number;
    course_id: number;
    enrollment_id: number;
    enroll_date: string;
    is_active?: boolean | undefined;
    is_deleted?: boolean | undefined;
    deleted_at?: string | null | undefined;
    discount_rate?: number | undefined;
}>;
export type StudentEnrollment = z.infer<typeof StudentEnrollmentSchema>;
/**
 * 創建學生報名 DTO Schema
 */
export declare const CreateStudentEnrollmentSchema: z.ZodObject<Omit<{
    enrollment_id: z.ZodNumber;
    student_id: z.ZodNumber;
    course_id: z.ZodNumber;
    enroll_date: z.ZodString;
    discount_rate: z.ZodDefault<z.ZodNumber>;
    is_active: z.ZodDefault<z.ZodBoolean>;
    is_deleted: z.ZodDefault<z.ZodBoolean>;
    deleted_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "is_deleted" | "deleted_at" | "enrollment_id">, "strip", z.ZodTypeAny, {
    is_active: boolean;
    student_id: number;
    course_id: number;
    enroll_date: string;
    discount_rate: number;
}, {
    student_id: number;
    course_id: number;
    enroll_date: string;
    is_active?: boolean | undefined;
    discount_rate?: number | undefined;
}>;
export type CreateStudentEnrollmentDto = z.infer<typeof CreateStudentEnrollmentSchema>;
/**
 * 報名期間 Schema
 */
export declare const EnrollmentPeriodSchema: z.ZodObject<{
    period_id: z.ZodNumber;
    enrollment_id: z.ZodNumber;
    start_date: z.ZodString;
    end_date: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    is_active: z.ZodDefault<z.ZodBoolean>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    is_active: boolean;
    enrollment_id: number;
    period_id: number;
    start_date: string;
    notes?: string | null | undefined;
    end_date?: string | null | undefined;
}, {
    enrollment_id: number;
    period_id: number;
    start_date: string;
    is_active?: boolean | undefined;
    notes?: string | null | undefined;
    end_date?: string | null | undefined;
}>;
export type EnrollmentPeriod = z.infer<typeof EnrollmentPeriodSchema>;
/**
 * 創建報名期間 DTO Schema
 */
export declare const CreateEnrollmentPeriodSchema: z.ZodObject<Omit<{
    period_id: z.ZodNumber;
    enrollment_id: z.ZodNumber;
    start_date: z.ZodString;
    end_date: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    is_active: z.ZodDefault<z.ZodBoolean>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "period_id">, "strip", z.ZodTypeAny, {
    is_active: boolean;
    enrollment_id: number;
    start_date: string;
    notes?: string | null | undefined;
    end_date?: string | null | undefined;
}, {
    enrollment_id: number;
    start_date: string;
    is_active?: boolean | undefined;
    notes?: string | null | undefined;
    end_date?: string | null | undefined;
}>;
export type CreateEnrollmentPeriodDto = z.infer<typeof CreateEnrollmentPeriodSchema>;
