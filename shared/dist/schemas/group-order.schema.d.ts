import { z } from 'zod';
/**
 * 團購 Schema
 * 對應後端 CramschoolGroupOrder 模型
 */
export declare const GroupOrderSchema: z.ZodObject<{
    group_order_id: z.ZodNumber;
    restaurant_id: z.ZodNumber;
    title: z.ZodString;
    order_link: z.ZodString;
    status: z.ZodDefault<z.ZodString>;
    deadline: z.ZodString;
    created_by_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    created_at: z.ZodOptional<z.ZodString>;
    closed_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status: string;
    title: string;
    restaurant_id: number;
    group_order_id: number;
    order_link: string;
    deadline: string;
    created_at?: string | undefined;
    created_by_id?: number | null | undefined;
    closed_at?: string | null | undefined;
}, {
    title: string;
    restaurant_id: number;
    group_order_id: number;
    order_link: string;
    deadline: string;
    status?: string | undefined;
    created_at?: string | undefined;
    created_by_id?: number | null | undefined;
    closed_at?: string | null | undefined;
}>;
export type GroupOrder = z.infer<typeof GroupOrderSchema>;
/**
 * 創建團購 DTO Schema
 */
export declare const CreateGroupOrderSchema: z.ZodObject<Omit<{
    group_order_id: z.ZodNumber;
    restaurant_id: z.ZodNumber;
    title: z.ZodString;
    order_link: z.ZodString;
    status: z.ZodDefault<z.ZodString>;
    deadline: z.ZodString;
    created_by_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    created_at: z.ZodOptional<z.ZodString>;
    closed_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "created_at" | "group_order_id" | "closed_at">, "strip", z.ZodTypeAny, {
    status: string;
    title: string;
    restaurant_id: number;
    order_link: string;
    deadline: string;
    created_by_id?: number | null | undefined;
}, {
    title: string;
    restaurant_id: number;
    order_link: string;
    deadline: string;
    status?: string | undefined;
    created_by_id?: number | null | undefined;
}>;
export type CreateGroupOrderDto = z.infer<typeof CreateGroupOrderSchema>;
/**
 * 更新團購 DTO Schema
 */
export declare const UpdateGroupOrderSchema: z.ZodObject<Omit<{
    group_order_id: z.ZodOptional<z.ZodNumber>;
    restaurant_id: z.ZodOptional<z.ZodNumber>;
    title: z.ZodOptional<z.ZodString>;
    order_link: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    deadline: z.ZodOptional<z.ZodString>;
    created_by_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    created_at: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    closed_at: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "created_at" | "group_order_id">, "strip", z.ZodTypeAny, {
    status?: string | undefined;
    title?: string | undefined;
    created_by_id?: number | null | undefined;
    restaurant_id?: number | undefined;
    order_link?: string | undefined;
    deadline?: string | undefined;
    closed_at?: string | null | undefined;
}, {
    status?: string | undefined;
    title?: string | undefined;
    created_by_id?: number | null | undefined;
    restaurant_id?: number | undefined;
    order_link?: string | undefined;
    deadline?: string | undefined;
    closed_at?: string | null | undefined;
}>;
export type UpdateGroupOrderDto = z.infer<typeof UpdateGroupOrderSchema>;
