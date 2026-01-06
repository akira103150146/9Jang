import { z } from 'zod';
/**
 * 出席記錄 Schema
 * 對應後端 CramschoolAttendance 模型
 */
export declare const AttendanceSchema: z.ZodObject<{
    attendance_id: z.ZodNumber;
    session_id: z.ZodNumber;
    student_id: z.ZodNumber;
    status: z.ZodDefault<z.ZodEnum<["Present", "Absent", "Late", "Leave"]>>;
    is_deleted: z.ZodDefault<z.ZodBoolean>;
    deleted_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    student_name: z.ZodOptional<z.ZodString>;
    session_id_display: z.ZodOptional<z.ZodNumber>;
    course_name: z.ZodOptional<z.ZodString>;
    session_date: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "Present" | "Absent" | "Late" | "Leave";
    student_id: number;
    is_deleted: boolean;
    attendance_id: number;
    session_id: number;
    deleted_at?: string | null | undefined;
    course_name?: string | undefined;
    student_name?: string | undefined;
    session_id_display?: number | undefined;
    session_date?: string | undefined;
}, {
    student_id: number;
    attendance_id: number;
    session_id: number;
    status?: "Present" | "Absent" | "Late" | "Leave" | undefined;
    is_deleted?: boolean | undefined;
    deleted_at?: string | null | undefined;
    course_name?: string | undefined;
    student_name?: string | undefined;
    session_id_display?: number | undefined;
    session_date?: string | undefined;
}>;
export type Attendance = z.infer<typeof AttendanceSchema>;
/**
 * 創建出席記錄 DTO Schema
 */
export declare const CreateAttendanceSchema: z.ZodObject<Omit<{
    attendance_id: z.ZodNumber;
    session_id: z.ZodNumber;
    student_id: z.ZodNumber;
    status: z.ZodDefault<z.ZodEnum<["Present", "Absent", "Late", "Leave"]>>;
    is_deleted: z.ZodDefault<z.ZodBoolean>;
    deleted_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    student_name: z.ZodOptional<z.ZodString>;
    session_id_display: z.ZodOptional<z.ZodNumber>;
    course_name: z.ZodOptional<z.ZodString>;
    session_date: z.ZodOptional<z.ZodString>;
}, "is_deleted" | "deleted_at" | "course_name" | "student_name" | "attendance_id" | "session_id_display" | "session_date">, "strip", z.ZodTypeAny, {
    status: "Present" | "Absent" | "Late" | "Leave";
    student_id: number;
    session_id: number;
}, {
    student_id: number;
    session_id: number;
    status?: "Present" | "Absent" | "Late" | "Leave" | undefined;
}>;
export type CreateAttendanceDto = z.infer<typeof CreateAttendanceSchema>;
/**
 * 更新出席記錄 DTO Schema
 */
export declare const UpdateAttendanceSchema: z.ZodObject<Omit<{
    attendance_id: z.ZodOptional<z.ZodNumber>;
    session_id: z.ZodOptional<z.ZodNumber>;
    student_id: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["Present", "Absent", "Late", "Leave"]>>>;
    is_deleted: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    deleted_at: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    student_name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    session_id_display: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    course_name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    session_date: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "is_deleted" | "deleted_at" | "course_name" | "student_name" | "attendance_id" | "session_id_display" | "session_date">, "strip", z.ZodTypeAny, {
    status?: "Present" | "Absent" | "Late" | "Leave" | undefined;
    student_id?: number | undefined;
    session_id?: number | undefined;
}, {
    status?: "Present" | "Absent" | "Late" | "Leave" | undefined;
    student_id?: number | undefined;
    session_id?: number | undefined;
}>;
export type UpdateAttendanceDto = z.infer<typeof UpdateAttendanceSchema>;
