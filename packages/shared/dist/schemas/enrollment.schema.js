"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateEnrollmentPeriodSchema = exports.EnrollmentPeriodSchema = exports.CreateStudentEnrollmentSchema = exports.StudentEnrollmentSchema = void 0;
const zod_1 = require("zod");
/**
 * 學生報名 Schema
 * 對應後端 StudentEnrollment 模型
 */
exports.StudentEnrollmentSchema = zod_1.z.object({
    enrollment_id: zod_1.z.number().int().positive(),
    student_id: zod_1.z.number().int().positive(),
    course_id: zod_1.z.number().int().positive(),
    enroll_date: zod_1.z.string().date(),
    discount_rate: zod_1.z.number().nonnegative().default(0),
    is_active: zod_1.z.boolean().default(true),
    is_deleted: zod_1.z.boolean().default(false),
    deleted_at: zod_1.z.string().datetime().nullable().optional()
});
/**
 * 創建學生報名 DTO Schema
 */
exports.CreateStudentEnrollmentSchema = exports.StudentEnrollmentSchema.omit({
    enrollment_id: true,
    is_deleted: true,
    deleted_at: true
});
/**
 * 報名期間 Schema
 */
exports.EnrollmentPeriodSchema = zod_1.z.object({
    period_id: zod_1.z.number().int().positive(),
    enrollment_id: zod_1.z.number().int().positive(),
    start_date: zod_1.z.string().date(),
    end_date: zod_1.z.string().date().nullable().optional(),
    is_active: zod_1.z.boolean().default(true),
    notes: zod_1.z.string().nullable().optional()
});
/**
 * 創建報名期間 DTO Schema
 */
exports.CreateEnrollmentPeriodSchema = exports.EnrollmentPeriodSchema.omit({
    period_id: true
});
