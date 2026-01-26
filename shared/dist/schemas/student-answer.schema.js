"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateStudentAnswerSchema = exports.CreateStudentAnswerSchema = exports.StudentAnswerSchema = void 0;
const zod_1 = require("zod");
/**
 * 學生作答 Schema
 * 對應後端 CramschoolStudentAnswer 模型
 */
exports.StudentAnswerSchema = zod_1.z.object({
    answer_id: zod_1.z.number().int().positive(),
    student_id: zod_1.z.number().int().positive(),
    question_id: zod_1.z.number().int().positive(),
    test_name: zod_1.z.string(),
    submission_id: zod_1.z.number().int().positive().nullable().optional(),
    is_correct: zod_1.z.boolean().default(false),
    scanned_file_path: zod_1.z.string().nullable().optional(),
    is_deleted: zod_1.z.boolean().default(false),
    deleted_at: zod_1.z.string().datetime().nullable().optional(),
});
/**
 * 創建學生作答 DTO Schema
 */
exports.CreateStudentAnswerSchema = exports.StudentAnswerSchema.omit({
    answer_id: true,
    is_deleted: true,
    deleted_at: true,
});
/**
 * 更新學生作答 DTO Schema
 */
exports.UpdateStudentAnswerSchema = exports.StudentAnswerSchema.partial().omit({
    answer_id: true,
    is_deleted: true,
    deleted_at: true,
});
