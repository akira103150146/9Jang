"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTeacherSchema = exports.CreateTeacherSchema = exports.TeacherSchema = exports.TeacherPermissionLevelEnum = void 0;
const zod_1 = require("zod");
/**
 * 老師權限等級枚舉
 */
exports.TeacherPermissionLevelEnum = zod_1.z.enum(['Teacher', 'Admin', 'Accountant']);
/**
 * 老師資料 Schema
 * 對應後端 Teacher 模型
 */
exports.TeacherSchema = zod_1.z.object({
    teacher_id: zod_1.z.number().int().positive(),
    name: zod_1.z.string().min(1).max(100),
    user_id: zod_1.z.number().int().positive().nullable().optional(),
    permission_level: exports.TeacherPermissionLevelEnum.default('Teacher'),
    phone: zod_1.z.string().max(20).nullable().optional(),
    hire_date: zod_1.z.string().date().nullable().optional()
});
/**
 * 創建老師 DTO Schema
 */
exports.CreateTeacherSchema = exports.TeacherSchema.omit({
    teacher_id: true
}).partial({
    user_id: true,
    permission_level: true
});
/**
 * 更新老師 DTO Schema
 */
exports.UpdateTeacherSchema = exports.TeacherSchema.partial().omit({
    teacher_id: true
});
