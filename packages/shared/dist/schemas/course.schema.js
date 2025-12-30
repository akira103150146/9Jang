"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCourseSchema = exports.CreateCourseSchema = exports.CourseSchema = exports.CourseStatusEnum = exports.CourseDayEnum = void 0;
const zod_1 = require("zod");
/**
 * 課程上課日枚舉
 */
exports.CourseDayEnum = zod_1.z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
/**
 * 課程狀態枚舉
 */
exports.CourseStatusEnum = zod_1.z.enum(['Active', 'Pending', 'Closed']);
/**
 * 課程資料 Schema
 * 對應後端 Course 模型
 */
exports.CourseSchema = zod_1.z.object({
    course_id: zod_1.z.number().int().positive(),
    course_name: zod_1.z.string().min(1).max(100),
    teacher_id: zod_1.z.number().int().positive(),
    start_time: zod_1.z.string(), // TimeField 在 JSON 中為字符串格式 "HH:MM:SS"
    end_time: zod_1.z.string(), // TimeField 在 JSON 中為字符串格式 "HH:MM:SS"
    day_of_week: exports.CourseDayEnum,
    fee_per_session: zod_1.z.number().nonnegative(), // DecimalField 轉換為數字
    status: exports.CourseStatusEnum.default('Active')
});
/**
 * 創建課程 DTO Schema
 */
exports.CreateCourseSchema = exports.CourseSchema.omit({
    course_id: true
});
/**
 * 更新課程 DTO Schema
 */
exports.UpdateCourseSchema = exports.CourseSchema.partial().omit({
    course_id: true
});
