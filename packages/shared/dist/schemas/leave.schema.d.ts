import { z } from 'zod';
/**
 * 請假記錄 Schema
 * 對應後端 Leave 模型
 */
export declare const LeaveSchema: z.ZodObject<{
    leave_id: z.ZodNumber;
    student_id: z.ZodNumber;
    course_id: z.ZodNumber;
    leave_date: z.ZodString;
    reason: z.ZodString;
    approval_status: z.ZodDefault<z.ZodEnum<["Pending", "Approved", "Rejected"]>>;
    is_deleted: z.ZodDefault<z.ZodBoolean>;
    deleted_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    student_id: number;
    is_deleted: boolean;
    course_id: number;
    leave_id: number;
    leave_date: string;
    reason: string;
    approval_status: "Pending" | "Approved" | "Rejected";
    deleted_at?: string | null | undefined;
}, {
    student_id: number;
    course_id: number;
    leave_id: number;
    leave_date: string;
    reason: string;
    is_deleted?: boolean | undefined;
    deleted_at?: string | null | undefined;
    approval_status?: "Pending" | "Approved" | "Rejected" | undefined;
}>;
export type Leave = z.infer<typeof LeaveSchema>;
/**
 * 創建請假記錄 DTO Schema
 */
export declare const CreateLeaveSchema: z.ZodObject<Omit<{
    leave_id: z.ZodNumber;
    student_id: z.ZodNumber;
    course_id: z.ZodNumber;
    leave_date: z.ZodString;
    reason: z.ZodString;
    approval_status: z.ZodDefault<z.ZodEnum<["Pending", "Approved", "Rejected"]>>;
    is_deleted: z.ZodDefault<z.ZodBoolean>;
    deleted_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "is_deleted" | "deleted_at" | "leave_id">, "strip", z.ZodTypeAny, {
    student_id: number;
    course_id: number;
    leave_date: string;
    reason: string;
    approval_status: "Pending" | "Approved" | "Rejected";
}, {
    student_id: number;
    course_id: number;
    leave_date: string;
    reason: string;
    approval_status?: "Pending" | "Approved" | "Rejected" | undefined;
}>;
export type CreateLeaveDto = z.infer<typeof CreateLeaveSchema>;
/**
 * 更新請假記錄 DTO Schema
 */
export declare const UpdateLeaveSchema: z.ZodObject<Omit<{
    leave_id: z.ZodOptional<z.ZodNumber>;
    student_id: z.ZodOptional<z.ZodNumber>;
    course_id: z.ZodOptional<z.ZodNumber>;
    leave_date: z.ZodOptional<z.ZodString>;
    reason: z.ZodOptional<z.ZodString>;
    approval_status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["Pending", "Approved", "Rejected"]>>>;
    is_deleted: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    deleted_at: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "is_deleted" | "deleted_at" | "leave_id">, "strip", z.ZodTypeAny, {
    student_id?: number | undefined;
    course_id?: number | undefined;
    leave_date?: string | undefined;
    reason?: string | undefined;
    approval_status?: "Pending" | "Approved" | "Rejected" | undefined;
}, {
    student_id?: number | undefined;
    course_id?: number | undefined;
    leave_date?: string | undefined;
    reason?: string | undefined;
    approval_status?: "Pending" | "Approved" | "Rejected" | undefined;
}>;
export type UpdateLeaveDto = z.infer<typeof UpdateLeaveSchema>;
