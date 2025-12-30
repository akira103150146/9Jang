"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagSchema = exports.SubjectSchema = exports.QuestionQuerySchema = exports.UpdateQuestionSchema = exports.CreateQuestionSchema = exports.QuestionSchema = exports.QuestionTypeEnum = exports.QuestionLevelEnum = void 0;
const zod_1 = require("zod");
const tiptap_1 = require("../types/tiptap");
/**
 * 題目年級枚舉
 */
exports.QuestionLevelEnum = zod_1.z.enum(['JHS', 'SHS', 'VCS']);
/**
 * 題目類型枚舉
 */
exports.QuestionTypeEnum = zod_1.z.enum([
    'SINGLE_CHOICE',
    'MULTIPLE_CHOICE',
    'FILL_IN_BLANK',
    'PROGRAMMING',
    'LISTENING'
]);
/**
 * 題目庫 Schema
 * 對應後端 QuestionBank 模型
 */
exports.QuestionSchema = zod_1.z.object({
    question_id: zod_1.z.number().int().positive(),
    subject_id: zod_1.z.number().int().positive(),
    level: exports.QuestionLevelEnum,
    chapter: zod_1.z.string().max(100),
    content: tiptap_1.TiptapDocumentSchema, // 題目內容 (Tiptap JSON)
    image_path: zod_1.z.string().max(255).nullable().optional(),
    correct_answer: tiptap_1.TiptapDocumentSchema, // 正確答案 (Tiptap JSON)
    difficulty: zod_1.z.number().int().min(1).max(5).default(1),
    question_type: exports.QuestionTypeEnum.default('SINGLE_CHOICE'),
    options: zod_1.z.array(tiptap_1.TiptapDocumentSchema).optional(), // 選擇題選項列表（每個選項也是 Tiptap JSON）
    metadata: zod_1.z.record(zod_1.z.any()).optional(), // 模式特定元資料
    question_number: zod_1.z.string().max(50).nullable().optional(),
    origin: zod_1.z.string().max(200).nullable().optional(),
    origin_detail: zod_1.z.string().max(200).nullable().optional(),
    source: zod_1.z.string().max(100).nullable().optional().default('九章自命題'),
    created_by: zod_1.z.number().int().positive().nullable().optional(),
    imported_from_error_log: zod_1.z.number().int().positive().nullable().optional(),
    imported_student: zod_1.z.number().int().positive().nullable().optional(),
    solution_content: tiptap_1.TiptapDocumentSchema.nullable().optional(), // 詳解內容 (Tiptap JSON)
    search_text_content: zod_1.z.string().nullable().optional(),
    created_at: zod_1.z.string().datetime().optional(),
    updated_at: zod_1.z.string().datetime().optional(),
    // 關聯數據（可選，視 API 響應而定）
    tags: zod_1.z.array(zod_1.z.number().int().positive()).optional(),
    tag_names: zod_1.z.array(zod_1.z.string()).optional()
});
/**
 * 創建題目 DTO Schema
 */
exports.CreateQuestionSchema = exports.QuestionSchema.omit({
    question_id: true,
    search_text_content: true,
    created_at: true,
    updated_at: true,
    tags: true,
    tag_names: true
}).partial({
    image_path: true,
    options: true,
    metadata: true,
    question_number: true,
    origin: true,
    origin_detail: true,
    source: true,
    created_by: true,
    imported_from_error_log: true,
    imported_student: true,
    solution_content: true
});
/**
 * 更新題目 DTO Schema
 */
exports.UpdateQuestionSchema = exports.QuestionSchema.partial().omit({
    question_id: true,
    search_text_content: true,
    created_at: true,
    updated_at: true,
    tags: true,
    tag_names: true
});
/**
 * 題目查詢參數 Schema
 */
exports.QuestionQuerySchema = zod_1.z.object({
    subject: zod_1.z.number().int().positive().optional(),
    level: exports.QuestionLevelEnum.optional(),
    chapter: zod_1.z.string().optional(),
    question_type: exports.QuestionTypeEnum.optional(),
    tags: zod_1.z.array(zod_1.z.number().int().positive()).optional(),
    search: zod_1.z.string().optional(),
    difficulty: zod_1.z.number().int().min(1).max(5).optional(),
    source: zod_1.z.string().optional(),
    page: zod_1.z.coerce.number().int().positive().default(1),
    page_size: zod_1.z.coerce.number().int().positive().max(100).default(10)
});
/**
 * 科目 Schema
 */
exports.SubjectSchema = zod_1.z.object({
    subject_id: zod_1.z.number().int().positive(),
    name: zod_1.z.string().min(1).max(50),
    code: zod_1.z.string().max(20).nullable().optional(),
    description: zod_1.z.string().nullable().optional()
});
/**
 * 標籤 Schema
 */
exports.TagSchema = zod_1.z.object({
    tag_id: zod_1.z.number().int().positive(),
    tag_name: zod_1.z.string().min(1).max(50),
    creator_id: zod_1.z.number().int().positive().nullable().optional()
});
