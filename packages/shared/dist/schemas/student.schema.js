"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentTuitionStatusSchema = exports.StudentQuerySchema = exports.UpdateStudentSchema = exports.CreateStudentSchema = exports.StudentSchema = void 0;
const zod_1 = require("zod");
/**
 * 學生資料 Schema
 * 對應後端 Student 模型
 */
exports.StudentSchema = zod_1.z.object({
    student_id: zod_1.z.number().int().positive(),
    name: zod_1.z.string().min(1).max(100),
    school: zod_1.z.string().min(1).max(100),
    grade: zod_1.z.string().max(20),
    phone: zod_1.z.string().max(20).nullable().optional(),
    emergency_contact_name: zod_1.z.string().max(100).nullable().optional(),
    emergency_contact_phone: zod_1.z.string().max(20).nullable().optional(),
    notes: zod_1.z.string().nullable().optional(),
    is_deleted: zod_1.z.boolean().default(false),
    deleted_at: zod_1.z.string().datetime().nullable().optional(),
    user_id: zod_1.z.number().int().positive().nullable().optional(),
    initial_password: zod_1.z.string().max(50).nullable().optional()
});
/**
 * 創建學生 DTO Schema
 */
exports.CreateStudentSchema = exports.StudentSchema.omit({
    student_id: true,
    is_deleted: true,
    deleted_at: true
}).extend({
    initial_password: zod_1.z.string().max(50).optional()
});
/**
 * 更新學生 DTO Schema
 */
exports.UpdateStudentSchema = exports.StudentSchema.partial().omit({
    student_id: true,
    is_deleted: true,
    deleted_at: true
});
/**
 * 學生列表查詢參數 Schema
 */
exports.StudentQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    school: zod_1.z.string().optional(),
    grade: zod_1.z.string().optional(),
    tag: zod_1.z.string().optional(),
    course: zod_1.z.string().optional(),
    has_unpaid_fees: zod_1.z.enum(['yes', 'no']).optional(),
    has_leave: zod_1.z.enum(['yes', 'no']).optional(),
    include_deleted: zod_1.z.boolean().optional().default(false),
    page: zod_1.z.coerce.number().int().positive().default(1),
    page_size: zod_1.z.coerce.number().int().positive().max(100).default(10)
});
/**
 * 學生學費狀態響應 Schema
 */
exports.StudentTuitionStatusSchema = zod_1.z.object({
    student_id: zod_1.z.number().int().positive(),
    total_unpaid: zod_1.z.number().nonnegative(),
    total_paid: zod_1.z.number().nonnegative(),
    fees: zod_1.z.array(zod_1.z.any()).optional() // 詳細費用列表
});
