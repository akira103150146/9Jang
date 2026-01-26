"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateGroupOrderSchema = exports.CreateGroupOrderSchema = exports.GroupOrderSchema = void 0;
const zod_1 = require("zod");
/**
 * 團購 Schema
 * 對應後端 CramschoolGroupOrder 模型
 */
exports.GroupOrderSchema = zod_1.z.object({
    group_order_id: zod_1.z.number().int().positive(),
    restaurant_id: zod_1.z.number().int().positive(),
    title: zod_1.z.string().min(1),
    order_link: zod_1.z.string().url(),
    status: zod_1.z.string().default('Open'),
    deadline: zod_1.z.string().datetime(),
    created_by_id: zod_1.z.number().int().positive().nullable().optional(),
    created_at: zod_1.z.string().datetime().optional(),
    closed_at: zod_1.z.string().datetime().nullable().optional(),
});
/**
 * 創建團購 DTO Schema
 */
exports.CreateGroupOrderSchema = exports.GroupOrderSchema.omit({
    group_order_id: true,
    created_at: true,
    closed_at: true,
});
/**
 * 更新團購 DTO Schema
 */
exports.UpdateGroupOrderSchema = exports.GroupOrderSchema.partial().omit({
    group_order_id: true,
    created_at: true,
});
