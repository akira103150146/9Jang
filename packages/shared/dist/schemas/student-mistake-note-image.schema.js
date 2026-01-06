"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateStudentMistakeNoteImageSchema = exports.CreateStudentMistakeNoteImageSchema = exports.StudentMistakeNoteImageSchema = void 0;
const zod_1 = require("zod");
/**
 * 學生錯題筆記圖片 Schema
 * 對應後端 CramschoolStudentMistakeNoteImage 模型
 */
exports.StudentMistakeNoteImageSchema = zod_1.z.object({
    image_id: zod_1.z.number().int().positive(),
    note_id: zod_1.z.number().int().positive(),
    image_path: zod_1.z.string(),
    caption: zod_1.z.string().nullable().optional(),
    sort_order: zod_1.z.number().int().nonnegative().default(0),
    created_at: zod_1.z.string().datetime().optional(),
});
/**
 * 創建學生錯題筆記圖片 DTO Schema
 */
exports.CreateStudentMistakeNoteImageSchema = exports.StudentMistakeNoteImageSchema.omit({
    image_id: true,
    created_at: true,
});
/**
 * 更新學生錯題筆記圖片 DTO Schema
 */
exports.UpdateStudentMistakeNoteImageSchema = exports.StudentMistakeNoteImageSchema.partial().omit({
    image_id: true,
    note_id: true,
    created_at: true,
});
