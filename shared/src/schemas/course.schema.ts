import { z } from 'zod'

/**
 * 課程上課日枚舉
 */
export const CourseDayEnum = z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])

/**
 * 課程狀態枚舉
 */
export const CourseStatusEnum = z.enum(['Active', 'Pending', 'Closed'])

/**
 * 課程資料 Schema
 * 對應後端 Course 模型
 */
export const CourseSchema = z.object({
  course_id: z.number().int().positive(),
  course_name: z.string().min(1).max(100),
  teacher_id: z.number().int().positive(),
  start_time: z.string(), // TimeField 在 JSON 中為字符串格式 "HH:MM:SS"
  end_time: z.string(), // TimeField 在 JSON 中為字符串格式 "HH:MM:SS"
  day_of_week: CourseDayEnum,
  fee_per_session: z.number().nonnegative(), // DecimalField 轉換為數字
  status: CourseStatusEnum.default('Active'),
  enrollments_count: z.number().int().nonnegative().optional() // 報名該課程的學生人數（排除已刪除的報名）
})

export type Course = z.infer<typeof CourseSchema>

/**
 * 創建課程 DTO Schema
 */
export const CreateCourseSchema = CourseSchema.omit({
  course_id: true
})
export type CreateCourseDto = z.infer<typeof CreateCourseSchema>

/**
 * 更新課程 DTO Schema
 */
export const UpdateCourseSchema = CourseSchema.partial().omit({
  course_id: true
})
export type UpdateCourseDto = z.infer<typeof UpdateCourseSchema>
