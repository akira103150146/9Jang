"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateHashtagSchema = exports.CreateHashtagSchema = exports.HashtagSchema = void 0;
const zod_1 = require("zod");
/**
 * 標籤 Schema
 * 對應後端 CramschoolHashtag 模型
 */
exports.HashtagSchema = zod_1.z.object({
    tag_id: zod_1.z.number().int().positive(),
    tag_name: zod_1.z.string().min(1),
    creator_id: zod_1.z.number().int().positive().nullable().optional(),
    creator_name: zod_1.z.string().optional(),
});
/**
 * 創建標籤 DTO Schema
 */
exports.CreateHashtagSchema = exports.HashtagSchema.omit({
    tag_id: true,
    creator_name: true,
});
/**
 * 更新標籤 DTO Schema
 */
exports.UpdateHashtagSchema = exports.HashtagSchema.partial().omit({
    tag_id: true,
    creator_name: true,
});
