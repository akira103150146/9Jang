"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateLeaveSchema = exports.CreateLeaveSchema = exports.LeaveSchema = void 0;
const zod_1 = require("zod");
/**
 * 請假記錄 Schema
 * 對應後端 Leave 模型
 */
exports.LeaveSchema = zod_1.z.object({
    leave_id: zod_1.z.number().int().positive(),
    student_id: zod_1.z.number().int().positive(),
    course_id: zod_1.z.number().int().positive(),
    leave_date: zod_1.z.string().date(),
    reason: zod_1.z.string().min(1),
    approval_status: zod_1.z.enum(['Pending', 'Approved', 'Rejected']).default('Pending'),
    is_deleted: zod_1.z.boolean().default(false),
    deleted_at: zod_1.z.string().datetime().nullable().optional()
});
/**
 * 創建請假記錄 DTO Schema
 */
exports.CreateLeaveSchema = exports.LeaveSchema.omit({
    leave_id: true,
    is_deleted: true,
    deleted_at: true
});
/**
 * 更新請假記錄 DTO Schema
 */
exports.UpdateLeaveSchema = exports.LeaveSchema.partial().omit({
    leave_id: true,
    is_deleted: true,
    deleted_at: true
});
