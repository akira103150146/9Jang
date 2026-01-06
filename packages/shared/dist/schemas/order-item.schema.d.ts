import { z } from 'zod';
/**
 * 訂單項目 Schema
 * 對應後端 CramschoolOrderItem 模型
 */
export declare const OrderItemSchema: z.ZodObject<{
    order_item_id: z.ZodNumber;
    order_id: z.ZodNumber;
    item_name: z.ZodString;
    quantity: z.ZodDefault<z.ZodNumber>;
    unit_price: z.ZodNumber;
    subtotal: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    order_id: number;
    order_item_id: number;
    item_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
}, {
    order_id: number;
    order_item_id: number;
    item_name: string;
    unit_price: number;
    subtotal: number;
    quantity?: number | undefined;
}>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
/**
 * 創建訂單項目 DTO Schema
 */
export declare const CreateOrderItemSchema: z.ZodObject<Omit<{
    order_item_id: z.ZodNumber;
    order_id: z.ZodNumber;
    item_name: z.ZodString;
    quantity: z.ZodDefault<z.ZodNumber>;
    unit_price: z.ZodNumber;
    subtotal: z.ZodNumber;
}, "order_item_id">, "strip", z.ZodTypeAny, {
    order_id: number;
    item_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
}, {
    order_id: number;
    item_name: string;
    unit_price: number;
    subtotal: number;
    quantity?: number | undefined;
}>;
export type CreateOrderItemDto = z.infer<typeof CreateOrderItemSchema>;
/**
 * 更新訂單項目 DTO Schema
 */
export declare const UpdateOrderItemSchema: z.ZodObject<Omit<{
    order_item_id: z.ZodOptional<z.ZodNumber>;
    order_id: z.ZodOptional<z.ZodNumber>;
    item_name: z.ZodOptional<z.ZodString>;
    quantity: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    unit_price: z.ZodOptional<z.ZodNumber>;
    subtotal: z.ZodOptional<z.ZodNumber>;
}, "order_item_id">, "strip", z.ZodTypeAny, {
    order_id?: number | undefined;
    item_name?: string | undefined;
    quantity?: number | undefined;
    unit_price?: number | undefined;
    subtotal?: number | undefined;
}, {
    order_id?: number | undefined;
    item_name?: string | undefined;
    quantity?: number | undefined;
    unit_price?: number | undefined;
    subtotal?: number | undefined;
}>;
export type UpdateOrderItemDto = z.infer<typeof UpdateOrderItemSchema>;
