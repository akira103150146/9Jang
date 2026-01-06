"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateErrorLogImageSchema = exports.CreateErrorLogImageSchema = exports.ErrorLogImageSchema = void 0;
const zod_1 = require("zod");
/**
 * 錯題圖片 Schema
 * 對應後端 CramschoolErrorLogImage 模型
 */
exports.ErrorLogImageSchema = zod_1.z.object({
    image_id: zod_1.z.number().int().positive(),
    error_log_id: zod_1.z.number().int().positive(),
    image_path: zod_1.z.string(),
    caption: zod_1.z.string().nullable().optional(),
    sort_order: zod_1.z.number().int().nonnegative().default(0),
    created_at: zod_1.z.string().datetime().optional(),
});
/**
 * 創建錯題圖片 DTO Schema
 */
exports.CreateErrorLogImageSchema = exports.ErrorLogImageSchema.omit({
    image_id: true,
    created_at: true,
});
/**
 * 更新錯題圖片 DTO Schema
 */
exports.UpdateErrorLogImageSchema = exports.ErrorLogImageSchema.partial().omit({
    image_id: true,
    error_log_id: true,
    created_at: true,
});
