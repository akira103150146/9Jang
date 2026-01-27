/**
 * @deprecated 此文件已重構為模組化結構
 * 
 * 請使用新的模組化 API：
 * - import { studentAPI } from '@/services/student/student.api'
 * - import { teacherAPI } from '@/services/teacher/teacher.api'
 * - import { questionBankAPI } from '@/services/question/question.api'
 * - 等等...
 * 
 * 此文件僅作為向後兼容層，將在未來版本中移除
 */

// 導入核心 API 實例和工具
export { api, getBackendBaseURL } from './api/index'
export type { PaginatedResponse, ApiResponse } from './api/types'
export { normalizeDateTime, validateResponse } from './api/utils'
export { setTokens, getToken, getRefreshToken, clearTokens } from './api/token'

// 導入並重新導出所有模組化 API
export { studentAPI } from './student/student.api'
export { teacherAPI } from './teacher/teacher.api'
export { courseAPI } from './course/course.api'
export { questionBankAPI } from './question/question.api'
export { resourceAPI as learningResourceAPI } from './resource/resource.api'
export { templateAPI as contentTemplateAPI } from './template/template.api'
export { authAPI } from './auth/auth.api'
export { enrollmentAPI } from './enrollment/enrollment.api'
export { enrollmentPeriodAPI } from './enrollment-period/enrollment-period.api'
export { feeAPI } from './fee/fee.api'
export { sessionAPI } from './session/session.api'
export { attendanceAPI } from './attendance/attendance.api'
export { leaveAPI } from './leave/leave.api'
export { subjectAPI } from './subject/subject.api'
export { hashtagAPI } from './hashtag/hashtag.api'
export { errorLogAPI } from './error-log/error-log.api'
export { errorLogImageAPI } from './error-log/error-log-image.api'
export { studentMistakeNoteAPI } from './student-mistake-note/student-mistake-note.api'
export { studentMistakeNoteImageAPI } from './student-mistake-note/student-mistake-note-image.api'
export { studentAnswerAPI } from './student-answer/student-answer.api'
export { uploadImageAPI } from './upload/upload.api'
export { restaurantAPI } from './restaurant/restaurant.api'
export { groupOrderAPI } from './group-order/group-order.api'
export { orderAPI } from './order/order.api'
export { orderItemAPI } from './order/order-item.api'
export { roleAPI } from './role/role.api'
export { rolePermissionAPI } from './role/role-permission.api'
export { auditLogAPI } from './audit-log/audit-log.api'
export { userAPI } from './user/user.api'
export { studentGroupAPI } from './student-group/student-group.api'
export { generationAPI } from './generation/generation.api'
export { roleSwitchAPI } from './role-switch/role-switch.api'

// 導出 api 實例作為默認導出（向後兼容）
import apiInstance from './api/index'
export default apiInstance
