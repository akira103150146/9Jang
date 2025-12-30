"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateContentTemplateSchema = exports.CreateContentTemplateSchema = exports.ContentTemplateSchema = exports.UpdateLearningResourceSchema = exports.CreateLearningResourceSchema = exports.LearningResourceSchema = exports.LearningResourceModeEnum = void 0;
const zod_1 = require("zod");
const tiptap_1 = require("../types/tiptap");
/**
 * 教學資源模式枚舉
 */
exports.LearningResourceModeEnum = zod_1.z.enum([
    'HANDOUT',
    'ONLINE_QUIZ',
    'LEETCODE',
    'LISTENING_TEST',
    'FLASHCARD'
]);
/**
 * 教學資源 Schema
 * 對應後端 LearningResource 模型
 */
exports.LearningResourceSchema = zod_1.z.object({
    resource_id: zod_1.z.number().int().positive(),
    title: zod_1.z.string().min(1).max(200),
    mode: exports.LearningResourceModeEnum.default('HANDOUT'),
    course_ids: zod_1.z.array(zod_1.z.number().int().positive()).optional().default([]),
    student_group_ids: zod_1.z.array(zod_1.z.number().int().positive()).optional().default([]),
    structure: zod_1.z.array(zod_1.z.any()).optional().default([]), // 舊格式（向後兼容）
    tiptap_structure: tiptap_1.TiptapDocumentSchema.nullable().optional(), // Tiptap JSON 結構
    settings: zod_1.z.record(zod_1.z.any()).optional().default({}),
    tag_ids: zod_1.z.array(zod_1.z.number().int().positive()).optional().default([]),
    created_by: zod_1.z.number().int().positive().nullable().optional(),
    is_individualized: zod_1.z.boolean().default(false),
    available_from: zod_1.z.string().datetime().nullable().optional(),
    available_until: zod_1.z.string().datetime().nullable().optional(),
    created_at: zod_1.z.string().datetime().optional(),
    updated_at: zod_1.z.string().datetime().optional()
});
/**
 * 創建教學資源 DTO Schema
 */
exports.CreateLearningResourceSchema = exports.LearningResourceSchema.omit({
    resource_id: true,
    created_at: true,
    updated_at: true
}).partial({
    structure: true,
    tiptap_structure: true,
    settings: true,
    course_ids: true,
    student_group_ids: true,
    tag_ids: true,
    created_by: true,
    available_from: true,
    available_until: true
});
/**
 * 更新教學資源 DTO Schema
 */
exports.UpdateLearningResourceSchema = exports.LearningResourceSchema.partial().omit({
    resource_id: true,
    created_at: true,
    updated_at: true
});
/**
 * 內容模板 Schema
 * 對應後端 ContentTemplate 模型
 */
exports.ContentTemplateSchema = zod_1.z.object({
    template_id: zod_1.z.number().int().positive(),
    title: zod_1.z.string().min(1).max(200),
    structure: zod_1.z.array(zod_1.z.any()).optional().default([]), // 舊格式（向後兼容）
    tiptap_structure: tiptap_1.TiptapDocumentSchema.nullable().optional(), // Tiptap JSON 結構
    created_by: zod_1.z.number().int().positive().nullable().optional(),
    is_public: zod_1.z.boolean().default(false),
    tag_ids: zod_1.z.array(zod_1.z.number().int().positive()).optional().default([]),
    created_at: zod_1.z.string().datetime().optional(),
    updated_at: zod_1.z.string().datetime().optional()
});
/**
 * 創建內容模板 DTO Schema
 */
exports.CreateContentTemplateSchema = exports.ContentTemplateSchema.omit({
    template_id: true,
    created_at: true,
    updated_at: true
}).partial({
    structure: true,
    tiptap_structure: true,
    created_by: true,
    tag_ids: true
});
/**
 * 更新內容模板 DTO Schema
 */
exports.UpdateContentTemplateSchema = exports.ContentTemplateSchema.partial().omit({
    template_id: true,
    created_at: true,
    updated_at: true
});
