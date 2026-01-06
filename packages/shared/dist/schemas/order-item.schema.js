"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateOrderItemSchema = exports.CreateOrderItemSchema = exports.OrderItemSchema = void 0;
const zod_1 = require("zod");
/**
 * 訂單項目 Schema
 * 對應後端 CramschoolOrderItem 模型
 */
exports.OrderItemSchema = zod_1.z.object({
    order_item_id: zod_1.z.number().int().positive(),
    order_id: zod_1.z.number().int().positive(),
    item_name: zod_1.z.string().min(1),
    quantity: zod_1.z.number().int().positive().default(1),
    unit_price: zod_1.z.number().nonnegative(),
    subtotal: zod_1.z.number().nonnegative(),
});
/**
 * 創建訂單項目 DTO Schema
 */
exports.CreateOrderItemSchema = exports.OrderItemSchema.omit({
    order_item_id: true,
});
/**
 * 更新訂單項目 DTO Schema
 */
exports.UpdateOrderItemSchema = exports.OrderItemSchema.partial().omit({
    order_item_id: true,
});
