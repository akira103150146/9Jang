"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateStudentMistakeNoteSchema = exports.CreateStudentMistakeNoteSchema = exports.StudentMistakeNoteSchema = void 0;
const zod_1 = require("zod");
/**
 * 學生錯題筆記 Schema
 * 對應後端 CramschoolStudentMistakeNote 模型
 */
exports.StudentMistakeNoteSchema = zod_1.z.object({
    note_id: zod_1.z.number().int().positive(),
    student_id: zod_1.z.number().int().positive(),
    title: zod_1.z.string(),
    subject: zod_1.z.string().nullable().optional(),
    content: zod_1.z.string().nullable().optional(),
    created_at: zod_1.z.string().datetime().optional(),
    updated_at: zod_1.z.string().datetime().optional(),
    is_deleted: zod_1.z.boolean().default(false),
    deleted_at: zod_1.z.string().datetime().nullable().optional(),
});
/**
 * 創建學生錯題筆記 DTO Schema
 */
exports.CreateStudentMistakeNoteSchema = exports.StudentMistakeNoteSchema.omit({
    note_id: true,
    created_at: true,
    updated_at: true,
    is_deleted: true,
    deleted_at: true,
});
/**
 * 更新學生錯題筆記 DTO Schema
 */
exports.UpdateStudentMistakeNoteSchema = exports.StudentMistakeNoteSchema.partial().omit({
    note_id: true,
    created_at: true,
    updated_at: true,
    is_deleted: true,
    deleted_at: true,
});
