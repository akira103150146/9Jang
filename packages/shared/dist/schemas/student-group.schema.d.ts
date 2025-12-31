import { z } from 'zod';
/**
 * 學生群組資料 Schema
 * 對應後端 StudentGroup 模型
 */
export declare const StudentGroupSchema: z.ZodObject<{
    group_id: z.ZodNumber;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    group_type: z.ZodDefault<z.ZodString>;
    created_by_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    created_at: string;
    updated_at: string;
    group_id: number;
    group_type: string;
    description?: string | null | undefined;
    created_by_id?: number | null | undefined;
}, {
    name: string;
    created_at: string;
    updated_at: string;
    group_id: number;
    description?: string | null | undefined;
    group_type?: string | undefined;
    created_by_id?: number | null | undefined;
}>;
export type StudentGroup = z.infer<typeof StudentGroupSchema>;
/**
 * 創建學生群組 DTO Schema
 */
export declare const CreateStudentGroupSchema: z.ZodObject<{
    name: z.ZodString;
} & {
    description: z.ZodOptional<z.ZodString>;
    group_type: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    created_by_id: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    group_type: string;
    description?: string | undefined;
    created_by_id?: number | undefined;
}, {
    name: string;
    description?: string | undefined;
    group_type?: string | undefined;
    created_by_id?: number | undefined;
}>;
export type CreateStudentGroupDto = z.infer<typeof CreateStudentGroupSchema>;
/**
 * 更新學生群組 DTO Schema
 */
export declare const UpdateStudentGroupSchema: z.ZodObject<Omit<{
    group_id: z.ZodOptional<z.ZodNumber>;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    group_type: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    created_by_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    created_at: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodOptional<z.ZodString>;
}, "created_at" | "updated_at" | "group_id">, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | null | undefined;
    group_type?: string | undefined;
    created_by_id?: number | null | undefined;
}, {
    name?: string | undefined;
    description?: string | null | undefined;
    group_type?: string | undefined;
    created_by_id?: number | null | undefined;
}>;
export type UpdateStudentGroupDto = z.infer<typeof UpdateStudentGroupSchema>;
/**
 * 學生群組列表查詢參數 Schema
 */
export declare const StudentGroupQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    group_type: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    page_size: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    page_size: number;
    search?: string | undefined;
    group_type?: string | undefined;
}, {
    page?: number | undefined;
    search?: string | undefined;
    page_size?: number | undefined;
    group_type?: string | undefined;
}>;
export type StudentGroupQuery = z.infer<typeof StudentGroupQuerySchema>;
/**
 * 添加學生到群組 DTO Schema
 */
export declare const AddStudentsToGroupSchema: z.ZodObject<{
    student_ids: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    student_ids: number[];
}, {
    student_ids: number[];
}>;
export type AddStudentsToGroupDto = z.infer<typeof AddStudentsToGroupSchema>;
/**
 * 從群組移除學生 DTO Schema
 */
export declare const RemoveStudentsFromGroupSchema: z.ZodObject<{
    student_ids: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    student_ids: number[];
}, {
    student_ids: number[];
}>;
export type RemoveStudentsFromGroupDto = z.infer<typeof RemoveStudentsFromGroupSchema>;
