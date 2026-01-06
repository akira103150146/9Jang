"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateQuestionTagSchema = exports.CreateQuestionTagSchema = exports.QuestionTagSchema = void 0;
const zod_1 = require("zod");
/**
 * 題目標籤 Schema
 * 對應後端 CramschoolQuestionTag 模型
 */
exports.QuestionTagSchema = zod_1.z.object({
    question_tag_id: zod_1.z.number().int().positive(),
    question_id: zod_1.z.number().int().positive(),
    tag_id: zod_1.z.number().int().positive(),
});
/**
 * 創建題目標籤 DTO Schema
 */
exports.CreateQuestionTagSchema = exports.QuestionTagSchema.omit({
    question_tag_id: true,
});
/**
 * 更新題目標籤 DTO Schema
 */
exports.UpdateQuestionTagSchema = exports.QuestionTagSchema.partial().omit({
    question_tag_id: true,
});
