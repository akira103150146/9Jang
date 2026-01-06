"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAttendanceSchema = exports.CreateAttendanceSchema = exports.AttendanceSchema = void 0;
const zod_1 = require("zod");
/**
 * 出席記錄 Schema
 * 對應後端 CramschoolAttendance 模型
 */
exports.AttendanceSchema = zod_1.z.object({
    attendance_id: zod_1.z.number().int().positive(),
    session_id: zod_1.z.number().int().positive(),
    student_id: zod_1.z.number().int().positive(),
    status: zod_1.z.enum(['Present', 'Absent', 'Late', 'Leave']).default('Absent'),
    is_deleted: zod_1.z.boolean().default(false),
    deleted_at: zod_1.z.string().datetime().nullable().optional(),
    // 擴展字段（從關聯查詢中獲取）
    student_name: zod_1.z.string().optional(),
    session_id_display: zod_1.z.number().int().positive().optional(),
    course_name: zod_1.z.string().optional(),
    session_date: zod_1.z.string().date().optional(),
});
/**
 * 創建出席記錄 DTO Schema
 */
exports.CreateAttendanceSchema = exports.AttendanceSchema.omit({
    attendance_id: true,
    is_deleted: true,
    deleted_at: true,
    student_name: true,
    session_id_display: true,
    course_name: true,
    session_date: true,
});
/**
 * 更新出席記錄 DTO Schema
 */
exports.UpdateAttendanceSchema = exports.AttendanceSchema.partial().omit({
    attendance_id: true,
    is_deleted: true,
    deleted_at: true,
    student_name: true,
    session_id_display: true,
    course_name: true,
    session_date: true,
});
