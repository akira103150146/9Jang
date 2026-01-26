"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSessionSchema = exports.CreateSessionSchema = exports.SessionSchema = void 0;
const zod_1 = require("zod");
/**
 * 上課記錄 Schema
 * 對應後端 CramschoolSessionRecord 模型
 */
exports.SessionSchema = zod_1.z.object({
    session_id: zod_1.z.number().int().positive(),
    course_id: zod_1.z.number().int().positive(),
    session_date: zod_1.z.string().date(),
    // 擴展字段（從關聯查詢中獲取）
    course_name: zod_1.z.string().optional(),
});
/**
 * 創建上課記錄 DTO Schema
 */
exports.CreateSessionSchema = exports.SessionSchema.omit({
    session_id: true,
    course_name: true,
});
/**
 * 更新上課記錄 DTO Schema
 */
exports.UpdateSessionSchema = exports.SessionSchema.partial().omit({
    session_id: true,
    course_name: true,
});
