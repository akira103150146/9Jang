"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateOrderSchema = exports.CreateOrderSchema = exports.OrderSchema = void 0;
const zod_1 = require("zod");
/**
 * 訂單 Schema
 * 對應後端 CramschoolOrder 模型
 */
exports.OrderSchema = zod_1.z.object({
    order_id: zod_1.z.number().int().positive(),
    group_order_id: zod_1.z.number().int().positive(),
    student_id: zod_1.z.number().int().positive(),
    status: zod_1.z.string().default('Pending'),
    total_amount: zod_1.z.number().nonnegative().default(0),
    notes: zod_1.z.string().nullable().optional(),
    created_at: zod_1.z.string().datetime().optional(),
    updated_at: zod_1.z.string().datetime().optional(),
    is_deleted: zod_1.z.boolean().default(false),
    deleted_at: zod_1.z.string().datetime().nullable().optional(),
});
/**
 * 創建訂單 DTO Schema
 */
exports.CreateOrderSchema = exports.OrderSchema.omit({
    order_id: true,
    created_at: true,
    updated_at: true,
    is_deleted: true,
    deleted_at: true,
});
/**
 * 更新訂單 DTO Schema
 */
exports.UpdateOrderSchema = exports.OrderSchema.partial().omit({
    order_id: true,
    created_at: true,
    updated_at: true,
    is_deleted: true,
    deleted_at: true,
});
