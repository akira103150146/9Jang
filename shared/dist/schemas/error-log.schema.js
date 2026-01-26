"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateErrorLogSchema = exports.CreateErrorLogSchema = exports.ErrorLogSchema = void 0;
const zod_1 = require("zod");
/**
 * 錯題記錄 Schema
 * 對應後端 CramschoolErrorLog 模型
 */
exports.ErrorLogSchema = zod_1.z.object({
    error_log_id: zod_1.z.number().int().positive(),
    student_id: zod_1.z.number().int().positive(),
    question_id: zod_1.z.number().int().positive(),
    error_count: zod_1.z.number().int().nonnegative().default(1),
    review_status: zod_1.z.string().default('New'),
    is_deleted: zod_1.z.boolean().default(false),
    deleted_at: zod_1.z.string().datetime().nullable().optional(),
});
/**
 * 創建錯題記錄 DTO Schema
 */
exports.CreateErrorLogSchema = exports.ErrorLogSchema.omit({
    error_log_id: true,
    is_deleted: true,
    deleted_at: true,
});
/**
 * 更新錯題記錄 DTO Schema
 */
exports.UpdateErrorLogSchema = exports.ErrorLogSchema.partial().omit({
    error_log_id: true,
    is_deleted: true,
    deleted_at: true,
});
