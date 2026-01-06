"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSubjectSchema = exports.CreateSubjectSchema = exports.SubjectSchema = void 0;
const zod_1 = require("zod");
/**
 * 科目 Schema
 * 對應後端 CramschoolSubject 模型
 */
exports.SubjectSchema = zod_1.z.object({
    subject_id: zod_1.z.number().int().positive(),
    name: zod_1.z.string().min(1),
    code: zod_1.z.string().nullable().optional(),
    description: zod_1.z.string().nullable().optional(),
    created_at: zod_1.z.string().datetime().optional(),
});
/**
 * 創建科目 DTO Schema
 */
exports.CreateSubjectSchema = exports.SubjectSchema.omit({
    subject_id: true,
    created_at: true,
});
/**
 * 更新科目 DTO Schema
 */
exports.UpdateSubjectSchema = exports.SubjectSchema.partial().omit({
    subject_id: true,
    created_at: true,
});
