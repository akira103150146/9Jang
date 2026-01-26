"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveStudentsFromGroupSchema = exports.AddStudentsToGroupSchema = exports.StudentGroupQuerySchema = exports.UpdateStudentGroupSchema = exports.CreateStudentGroupSchema = exports.StudentGroupSchema = void 0;
const zod_1 = require("zod");
/**
 * 學生群組資料 Schema
 * 對應後端 StudentGroup 模型
 */
exports.StudentGroupSchema = zod_1.z.object({
    group_id: zod_1.z.number().int().positive(),
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().nullable().optional(),
    group_type: zod_1.z.string().default('teaching'),
    created_by_id: zod_1.z.number().int().positive().nullable().optional(),
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime()
});
/**
 * 創建學生群組 DTO Schema
 */
exports.CreateStudentGroupSchema = exports.StudentGroupSchema.omit({
    group_id: true,
    created_at: true,
    updated_at: true
}).extend({
    description: zod_1.z.string().optional(),
    group_type: zod_1.z.string().optional().default('teaching'),
    created_by_id: zod_1.z.number().int().positive().optional()
});
/**
 * 更新學生群組 DTO Schema
 */
exports.UpdateStudentGroupSchema = exports.StudentGroupSchema.partial().omit({
    group_id: true,
    created_at: true,
    updated_at: true
});
/**
 * 學生群組列表查詢參數 Schema
 */
exports.StudentGroupQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    group_type: zod_1.z.string().optional(),
    page: zod_1.z.coerce.number().int().positive().default(1),
    page_size: zod_1.z.coerce.number().int().positive().max(100).default(10)
});
/**
 * 添加學生到群組 DTO Schema
 */
exports.AddStudentsToGroupSchema = zod_1.z.object({
    student_ids: zod_1.z.array(zod_1.z.number().int().positive()).min(1)
});
/**
 * 從群組移除學生 DTO Schema
 */
exports.RemoveStudentsFromGroupSchema = zod_1.z.object({
    student_ids: zod_1.z.array(zod_1.z.number().int().positive()).min(1)
});
