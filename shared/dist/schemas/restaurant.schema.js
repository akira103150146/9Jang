"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRestaurantSchema = exports.CreateRestaurantSchema = exports.RestaurantSchema = void 0;
const zod_1 = require("zod");
/**
 * 餐廳 Schema
 * 對應後端 CramschoolRestaurant 模型
 */
exports.RestaurantSchema = zod_1.z.object({
    restaurant_id: zod_1.z.number().int().positive(),
    name: zod_1.z.string().min(1),
    phone: zod_1.z.string().nullable().optional(),
    address: zod_1.z.string().nullable().optional(),
    menu_image_path: zod_1.z.string().nullable().optional(),
    is_active: zod_1.z.boolean().default(true),
    created_at: zod_1.z.string().datetime().optional(),
    updated_at: zod_1.z.string().datetime().optional(),
});
/**
 * 創建餐廳 DTO Schema
 */
exports.CreateRestaurantSchema = exports.RestaurantSchema.omit({
    restaurant_id: true,
    created_at: true,
    updated_at: true,
});
/**
 * 更新餐廳 DTO Schema
 */
exports.UpdateRestaurantSchema = exports.RestaurantSchema.partial().omit({
    restaurant_id: true,
    created_at: true,
    updated_at: true,
});
