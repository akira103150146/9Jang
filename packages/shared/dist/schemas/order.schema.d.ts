import { z } from 'zod';
/**
 * 訂單 Schema
 * 對應後端 CramschoolOrder 模型
 */
export declare const OrderSchema: z.ZodObject<{
    order_id: z.ZodNumber;
    group_order_id: z.ZodNumber;
    student_id: z.ZodNumber;
    status: z.ZodDefault<z.ZodString>;
    total_amount: z.ZodDefault<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    created_at: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodOptional<z.ZodString>;
    is_deleted: z.ZodDefault<z.ZodBoolean>;
    deleted_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status: string;
    student_id: number;
    is_deleted: boolean;
    group_order_id: number;
    order_id: number;
    total_amount: number;
    created_at?: string | undefined;
    updated_at?: string | undefined;
    notes?: string | null | undefined;
    deleted_at?: string | null | undefined;
}, {
    student_id: number;
    group_order_id: number;
    order_id: number;
    status?: string | undefined;
    created_at?: string | undefined;
    updated_at?: string | undefined;
    notes?: string | null | undefined;
    is_deleted?: boolean | undefined;
    deleted_at?: string | null | undefined;
    total_amount?: number | undefined;
}>;
export type Order = z.infer<typeof OrderSchema>;
/**
 * 創建訂單 DTO Schema
 */
export declare const CreateOrderSchema: z.ZodObject<Omit<{
    order_id: z.ZodNumber;
    group_order_id: z.ZodNumber;
    student_id: z.ZodNumber;
    status: z.ZodDefault<z.ZodString>;
    total_amount: z.ZodDefault<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    created_at: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodOptional<z.ZodString>;
    is_deleted: z.ZodDefault<z.ZodBoolean>;
    deleted_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "created_at" | "updated_at" | "is_deleted" | "deleted_at" | "order_id">, "strip", z.ZodTypeAny, {
    status: string;
    student_id: number;
    group_order_id: number;
    total_amount: number;
    notes?: string | null | undefined;
}, {
    student_id: number;
    group_order_id: number;
    status?: string | undefined;
    notes?: string | null | undefined;
    total_amount?: number | undefined;
}>;
export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;
/**
 * 更新訂單 DTO Schema
 */
export declare const UpdateOrderSchema: z.ZodObject<Omit<{
    order_id: z.ZodOptional<z.ZodNumber>;
    group_order_id: z.ZodOptional<z.ZodNumber>;
    student_id: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    total_amount: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    created_at: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    updated_at: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    is_deleted: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    deleted_at: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "created_at" | "updated_at" | "is_deleted" | "deleted_at" | "order_id">, "strip", z.ZodTypeAny, {
    status?: string | undefined;
    student_id?: number | undefined;
    notes?: string | null | undefined;
    group_order_id?: number | undefined;
    total_amount?: number | undefined;
}, {
    status?: string | undefined;
    student_id?: number | undefined;
    notes?: string | null | undefined;
    group_order_id?: number | undefined;
    total_amount?: number | undefined;
}>;
export type UpdateOrderDto = z.infer<typeof UpdateOrderSchema>;
