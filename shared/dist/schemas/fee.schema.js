"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeeQuerySchema = exports.BatchUpdateFeeStatusSchema = exports.UpdateFeeSchema = exports.CreateFeeSchema = exports.FeeSchema = void 0;
const zod_1 = require("zod");
/**
 * 費用 Schema
 * 對應後端 CramschoolExtraFee 模型
 */
exports.FeeSchema = zod_1.z.object({
    fee_id: zod_1.z.number().int().positive(),
    student_id: zod_1.z.number().int().positive(),
    item: zod_1.z.string(),
    amount: zod_1.z.number().nonnegative(),
    fee_date: zod_1.z.string().date(),
    payment_status: zod_1.z.enum(['Paid', 'Unpaid', 'Partial']).default('Unpaid'),
    notes: zod_1.z.string().nullable().optional(),
    paid_at: zod_1.z.string().datetime().nullable().optional(),
    is_deleted: zod_1.z.boolean().default(false),
    deleted_at: zod_1.z.string().datetime().nullable().optional(),
    student_name: zod_1.z.string().optional(), // 從關聯查詢中獲取
});
/**
 * 創建費用 DTO Schema
 */
exports.CreateFeeSchema = exports.FeeSchema.omit({
    fee_id: true,
    is_deleted: true,
    deleted_at: true,
    student_name: true,
}).extend({
    paid_at: zod_1.z.string().datetime().nullable().optional(),
});
/**
 * 更新費用 DTO Schema
 */
exports.UpdateFeeSchema = exports.CreateFeeSchema.partial();
/**
 * 批次更新費用狀態 DTO Schema
 */
exports.BatchUpdateFeeStatusSchema = zod_1.z.object({
    fee_ids: zod_1.z.array(zod_1.z.number().int().positive()),
    payment_status: zod_1.z.enum(['Paid', 'Unpaid', 'Partial']),
});
/**
 * 費用查詢參數 Schema
 */
exports.FeeQuerySchema = zod_1.z.object({
    student: zod_1.z.number().int().positive().optional(),
    include_deleted: zod_1.z.boolean().default(false).optional(),
});
