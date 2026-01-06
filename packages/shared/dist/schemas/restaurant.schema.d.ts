import { z } from 'zod';
/**
 * 餐廳 Schema
 * 對應後端 CramschoolRestaurant 模型
 */
export declare const RestaurantSchema: z.ZodObject<{
    restaurant_id: z.ZodNumber;
    name: z.ZodString;
    phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    address: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    menu_image_path: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    is_active: z.ZodDefault<z.ZodBoolean>;
    created_at: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    is_active: boolean;
    name: string;
    restaurant_id: number;
    created_at?: string | undefined;
    updated_at?: string | undefined;
    phone?: string | null | undefined;
    address?: string | null | undefined;
    menu_image_path?: string | null | undefined;
}, {
    name: string;
    restaurant_id: number;
    is_active?: boolean | undefined;
    created_at?: string | undefined;
    updated_at?: string | undefined;
    phone?: string | null | undefined;
    address?: string | null | undefined;
    menu_image_path?: string | null | undefined;
}>;
export type Restaurant = z.infer<typeof RestaurantSchema>;
/**
 * 創建餐廳 DTO Schema
 */
export declare const CreateRestaurantSchema: z.ZodObject<Omit<{
    restaurant_id: z.ZodNumber;
    name: z.ZodString;
    phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    address: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    menu_image_path: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    is_active: z.ZodDefault<z.ZodBoolean>;
    created_at: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodOptional<z.ZodString>;
}, "created_at" | "updated_at" | "restaurant_id">, "strip", z.ZodTypeAny, {
    is_active: boolean;
    name: string;
    phone?: string | null | undefined;
    address?: string | null | undefined;
    menu_image_path?: string | null | undefined;
}, {
    name: string;
    is_active?: boolean | undefined;
    phone?: string | null | undefined;
    address?: string | null | undefined;
    menu_image_path?: string | null | undefined;
}>;
export type CreateRestaurantDto = z.infer<typeof CreateRestaurantSchema>;
/**
 * 更新餐廳 DTO Schema
 */
export declare const UpdateRestaurantSchema: z.ZodObject<Omit<{
    restaurant_id: z.ZodOptional<z.ZodNumber>;
    name: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    address: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    menu_image_path: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    is_active: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    created_at: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    updated_at: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "created_at" | "updated_at" | "restaurant_id">, "strip", z.ZodTypeAny, {
    is_active?: boolean | undefined;
    name?: string | undefined;
    phone?: string | null | undefined;
    address?: string | null | undefined;
    menu_image_path?: string | null | undefined;
}, {
    is_active?: boolean | undefined;
    name?: string | undefined;
    phone?: string | null | undefined;
    address?: string | null | undefined;
    menu_image_path?: string | null | undefined;
}>;
export type UpdateRestaurantDto = z.infer<typeof UpdateRestaurantSchema>;
