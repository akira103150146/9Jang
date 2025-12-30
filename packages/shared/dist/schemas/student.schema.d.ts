import { z } from 'zod';
/**
 * 學生資料 Schema
 * 對應後端 Student 模型
 */
export declare const StudentSchema: z.ZodObject<{
    student_id: z.ZodNumber;
    name: z.ZodString;
    school: z.ZodString;
    grade: z.ZodString;
    phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    emergency_contact_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    emergency_contact_phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    is_deleted: z.ZodDefault<z.ZodBoolean>;
    deleted_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    user_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    initial_password: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    student_id: number;
    name: string;
    school: string;
    grade: string;
    is_deleted: boolean;
    phone?: string | null | undefined;
    emergency_contact_name?: string | null | undefined;
    emergency_contact_phone?: string | null | undefined;
    notes?: string | null | undefined;
    deleted_at?: string | null | undefined;
    user_id?: number | null | undefined;
    initial_password?: string | null | undefined;
}, {
    student_id: number;
    name: string;
    school: string;
    grade: string;
    phone?: string | null | undefined;
    emergency_contact_name?: string | null | undefined;
    emergency_contact_phone?: string | null | undefined;
    notes?: string | null | undefined;
    is_deleted?: boolean | undefined;
    deleted_at?: string | null | undefined;
    user_id?: number | null | undefined;
    initial_password?: string | null | undefined;
}>;
export type Student = z.infer<typeof StudentSchema>;
/**
 * 創建學生 DTO Schema
 */
export declare const CreateStudentSchema: z.ZodObject<{
    name: z.ZodString;
    school: z.ZodString;
    grade: z.ZodString;
    phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    emergency_contact_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    emergency_contact_phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    user_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
} & {
    initial_password: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    school: string;
    grade: string;
    phone?: string | null | undefined;
    emergency_contact_name?: string | null | undefined;
    emergency_contact_phone?: string | null | undefined;
    notes?: string | null | undefined;
    user_id?: number | null | undefined;
    initial_password?: string | undefined;
}, {
    name: string;
    school: string;
    grade: string;
    phone?: string | null | undefined;
    emergency_contact_name?: string | null | undefined;
    emergency_contact_phone?: string | null | undefined;
    notes?: string | null | undefined;
    user_id?: number | null | undefined;
    initial_password?: string | undefined;
}>;
export type CreateStudentDto = z.infer<typeof CreateStudentSchema>;
/**
 * 更新學生 DTO Schema
 */
export declare const UpdateStudentSchema: z.ZodObject<Omit<{
    student_id: z.ZodOptional<z.ZodNumber>;
    name: z.ZodOptional<z.ZodString>;
    school: z.ZodOptional<z.ZodString>;
    grade: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    emergency_contact_name: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    emergency_contact_phone: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    is_deleted: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    deleted_at: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    user_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    initial_password: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "student_id" | "is_deleted" | "deleted_at">, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    school?: string | undefined;
    grade?: string | undefined;
    phone?: string | null | undefined;
    emergency_contact_name?: string | null | undefined;
    emergency_contact_phone?: string | null | undefined;
    notes?: string | null | undefined;
    user_id?: number | null | undefined;
    initial_password?: string | null | undefined;
}, {
    name?: string | undefined;
    school?: string | undefined;
    grade?: string | undefined;
    phone?: string | null | undefined;
    emergency_contact_name?: string | null | undefined;
    emergency_contact_phone?: string | null | undefined;
    notes?: string | null | undefined;
    user_id?: number | null | undefined;
    initial_password?: string | null | undefined;
}>;
export type UpdateStudentDto = z.infer<typeof UpdateStudentSchema>;
/**
 * 學生列表查詢參數 Schema
 */
export declare const StudentQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    school: z.ZodOptional<z.ZodString>;
    grade: z.ZodOptional<z.ZodString>;
    tag: z.ZodOptional<z.ZodString>;
    course: z.ZodOptional<z.ZodString>;
    has_unpaid_fees: z.ZodOptional<z.ZodEnum<["yes", "no"]>>;
    has_leave: z.ZodOptional<z.ZodEnum<["yes", "no"]>>;
    include_deleted: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    page: z.ZodDefault<z.ZodNumber>;
    page_size: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    include_deleted: boolean;
    page_size: number;
    school?: string | undefined;
    grade?: string | undefined;
    search?: string | undefined;
    tag?: string | undefined;
    course?: string | undefined;
    has_unpaid_fees?: "yes" | "no" | undefined;
    has_leave?: "yes" | "no" | undefined;
}, {
    page?: number | undefined;
    school?: string | undefined;
    grade?: string | undefined;
    search?: string | undefined;
    tag?: string | undefined;
    course?: string | undefined;
    has_unpaid_fees?: "yes" | "no" | undefined;
    has_leave?: "yes" | "no" | undefined;
    include_deleted?: boolean | undefined;
    page_size?: number | undefined;
}>;
export type StudentQuery = z.infer<typeof StudentQuerySchema>;
/**
 * 學生學費狀態響應 Schema
 */
export declare const StudentTuitionStatusSchema: z.ZodObject<{
    student_id: z.ZodNumber;
    total_unpaid: z.ZodNumber;
    total_paid: z.ZodNumber;
    fees: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
}, "strip", z.ZodTypeAny, {
    student_id: number;
    total_unpaid: number;
    total_paid: number;
    fees?: any[] | undefined;
}, {
    student_id: number;
    total_unpaid: number;
    total_paid: number;
    fees?: any[] | undefined;
}>;
export type StudentTuitionStatus = z.infer<typeof StudentTuitionStatusSchema>;
