import { z } from 'zod';
/**
 * 上課記錄 Schema
 * 對應後端 CramschoolSessionRecord 模型
 */
export declare const SessionSchema: z.ZodObject<{
    session_id: z.ZodNumber;
    course_id: z.ZodNumber;
    session_date: z.ZodString;
    course_name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    course_id: number;
    session_id: number;
    session_date: string;
    course_name?: string | undefined;
}, {
    course_id: number;
    session_id: number;
    session_date: string;
    course_name?: string | undefined;
}>;
export type Session = z.infer<typeof SessionSchema>;
/**
 * 創建上課記錄 DTO Schema
 */
export declare const CreateSessionSchema: z.ZodObject<Omit<{
    session_id: z.ZodNumber;
    course_id: z.ZodNumber;
    session_date: z.ZodString;
    course_name: z.ZodOptional<z.ZodString>;
}, "course_name" | "session_id">, "strip", z.ZodTypeAny, {
    course_id: number;
    session_date: string;
}, {
    course_id: number;
    session_date: string;
}>;
export type CreateSessionDto = z.infer<typeof CreateSessionSchema>;
/**
 * 更新上課記錄 DTO Schema
 */
export declare const UpdateSessionSchema: z.ZodObject<Omit<{
    session_id: z.ZodOptional<z.ZodNumber>;
    course_id: z.ZodOptional<z.ZodNumber>;
    session_date: z.ZodOptional<z.ZodString>;
    course_name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "course_name" | "session_id">, "strip", z.ZodTypeAny, {
    course_id?: number | undefined;
    session_date?: string | undefined;
}, {
    course_id?: number | undefined;
    session_date?: string | undefined;
}>;
export type UpdateSessionDto = z.infer<typeof UpdateSessionSchema>;
