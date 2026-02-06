"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCoursePdfSchema = exports.CreateCoursePdfSchema = exports.CoursePdfSchema = void 0;
const zod_1 = require("zod");
/**
 * 課程 PDF 講義 Schema
 * 對應後端 CramschoolCoursePdf 模型
 */
exports.CoursePdfSchema = zod_1.z.object({
    pdf_id: zod_1.z.number().int().positive(),
    title: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().max(1000).nullable().optional(),
    file_path: zod_1.z.string(),
    file_size: zod_1.z.number().int().positive(),
    course_id: zod_1.z.number().int().positive(),
    uploaded_by_id: zod_1.z.number().int().positive(),
    student_group_ids: zod_1.z.array(zod_1.z.number().int().positive()).optional().default([]),
    allow_download: zod_1.z.boolean().default(false),
    is_visible_to_all: zod_1.z.boolean().default(false),
    is_active: zod_1.z.boolean().default(true),
    created_at: zod_1.z.string().datetime().optional(),
    updated_at: zod_1.z.string().datetime().optional()
});
/**
 * 創建課程 PDF DTO Schema
 */
exports.CreateCoursePdfSchema = exports.CoursePdfSchema.omit({
    pdf_id: true,
    file_path: true,
    file_size: true,
    uploaded_by_id: true,
    created_at: true,
    updated_at: true
}).partial({
    description: true,
    student_group_ids: true,
    allow_download: true,
    is_visible_to_all: true,
    is_active: true
});
/**
 * 更新課程 PDF DTO Schema
 */
exports.UpdateCoursePdfSchema = exports.CoursePdfSchema.partial().omit({
    pdf_id: true,
    file_path: true,
    file_size: true,
    uploaded_by_id: true,
    course_id: true,
    created_at: true,
    updated_at: true
});
