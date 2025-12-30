import { z } from 'zod';
/**
 * 課程上課日枚舉
 */
export declare const CourseDayEnum: z.ZodEnum<["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]>;
/**
 * 課程狀態枚舉
 */
export declare const CourseStatusEnum: z.ZodEnum<["Active", "Pending", "Closed"]>;
/**
 * 課程資料 Schema
 * 對應後端 Course 模型
 */
export declare const CourseSchema: z.ZodObject<{
    course_id: z.ZodNumber;
    course_name: z.ZodString;
    teacher_id: z.ZodNumber;
    start_time: z.ZodString;
    end_time: z.ZodString;
    day_of_week: z.ZodEnum<["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]>;
    fee_per_session: z.ZodNumber;
    status: z.ZodDefault<z.ZodEnum<["Active", "Pending", "Closed"]>>;
}, "strip", z.ZodTypeAny, {
    status: "Active" | "Pending" | "Closed";
    teacher_id: number;
    course_id: number;
    course_name: string;
    start_time: string;
    end_time: string;
    day_of_week: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
    fee_per_session: number;
}, {
    teacher_id: number;
    course_id: number;
    course_name: string;
    start_time: string;
    end_time: string;
    day_of_week: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
    fee_per_session: number;
    status?: "Active" | "Pending" | "Closed" | undefined;
}>;
export type Course = z.infer<typeof CourseSchema>;
/**
 * 創建課程 DTO Schema
 */
export declare const CreateCourseSchema: z.ZodObject<Omit<{
    course_id: z.ZodNumber;
    course_name: z.ZodString;
    teacher_id: z.ZodNumber;
    start_time: z.ZodString;
    end_time: z.ZodString;
    day_of_week: z.ZodEnum<["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]>;
    fee_per_session: z.ZodNumber;
    status: z.ZodDefault<z.ZodEnum<["Active", "Pending", "Closed"]>>;
}, "course_id">, "strip", z.ZodTypeAny, {
    status: "Active" | "Pending" | "Closed";
    teacher_id: number;
    course_name: string;
    start_time: string;
    end_time: string;
    day_of_week: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
    fee_per_session: number;
}, {
    teacher_id: number;
    course_name: string;
    start_time: string;
    end_time: string;
    day_of_week: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
    fee_per_session: number;
    status?: "Active" | "Pending" | "Closed" | undefined;
}>;
export type CreateCourseDto = z.infer<typeof CreateCourseSchema>;
/**
 * 更新課程 DTO Schema
 */
export declare const UpdateCourseSchema: z.ZodObject<Omit<{
    course_id: z.ZodOptional<z.ZodNumber>;
    course_name: z.ZodOptional<z.ZodString>;
    teacher_id: z.ZodOptional<z.ZodNumber>;
    start_time: z.ZodOptional<z.ZodString>;
    end_time: z.ZodOptional<z.ZodString>;
    day_of_week: z.ZodOptional<z.ZodEnum<["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]>>;
    fee_per_session: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["Active", "Pending", "Closed"]>>>;
}, "course_id">, "strip", z.ZodTypeAny, {
    status?: "Active" | "Pending" | "Closed" | undefined;
    teacher_id?: number | undefined;
    course_name?: string | undefined;
    start_time?: string | undefined;
    end_time?: string | undefined;
    day_of_week?: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun" | undefined;
    fee_per_session?: number | undefined;
}, {
    status?: "Active" | "Pending" | "Closed" | undefined;
    teacher_id?: number | undefined;
    course_name?: string | undefined;
    start_time?: string | undefined;
    end_time?: string | undefined;
    day_of_week?: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun" | undefined;
    fee_per_session?: number | undefined;
}>;
export type UpdateCourseDto = z.infer<typeof UpdateCourseSchema>;
