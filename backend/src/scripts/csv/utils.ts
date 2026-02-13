/**
 * CSV Seeder 工具函式
 */

import { PrismaClient } from '@prisma/client';
import type { PrismaModelName } from './types';

/**
 * 將 snake_case 轉換為 camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * 將 camelCase 轉換為 snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * 將對象的所有鍵從 snake_case 轉換為 camelCase
 */
export function convertKeysToCamelCase(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[snakeToCamel(key)] = value;
  }
  return result;
}

/**
 * 將對象的所有鍵從 camelCase 轉換為 snake_case
 */
export function convertKeysToSnakeCase(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[camelToSnake(key)] = value;
  }
  return result;
}

/**
 * Django 模型名稱到 Prisma 模型名稱的映射
 */
export const MODEL_MAP: Record<string, PrismaModelName> = {
  'account.CustomUser': 'accountCustomUser',
  'account.Role': 'accountRole',
  'account.RolePermission': 'accountRolePermission',
  'account.AuditLog': 'accountAuditLog',
  'cramschool.Student': 'cramschoolStudent',
  'cramschool.Teacher': 'cramschoolTeacher',
  'cramschool.Course': 'cramschoolCourse',
  'cramschool.StudentEnrollment': 'cramschoolStudentEnrollment',
  'cramschool.EnrollmentPeriod': 'cramschoolEnrollmentPeriod',
  'cramschool.ExtraFee': 'cramschoolExtraFee',
  'cramschool.SessionRecord': 'cramschoolSessionRecord',
  'cramschool.Attendance': 'cramschoolAttendance',
  'cramschool.Leave': 'cramschoolLeave',
  'cramschool.Subject': 'cramschoolSubject',
  'cramschool.QuestionBank': 'cramschoolQuestionBank',
  'cramschool.Hashtag': 'cramschoolHashtag',
  'cramschool.QuestionTag': 'cramschoolQuestionTag',
  'cramschool.StudentAnswer': 'cramschoolStudentAnswer',
  'cramschool.ErrorLog': 'cramschoolErrorLog',
  'cramschool.ErrorLogImage': 'cramschoolErrorLogImage',
  'cramschool.StudentMistakeNote': 'cramschoolStudentMistakeNote',
  'cramschool.StudentMistakeNoteImage': 'cramschoolStudentMistakeNoteImage',
  'cramschool.Restaurant': 'cramschoolRestaurant',
  'cramschool.GroupOrder': 'cramschoolGroupOrder',
  'cramschool.Order': 'cramschoolOrder',
  'cramschool.OrderItem': 'cramschoolOrderItem',
  'cramschool.StudentGroup': 'cramschoolStudentGroup',
  'cramschool.StudentGroupStudent': 'cramschoolStudentGroupStudent',
  'cramschool.ContentTemplate': 'cramschoolContentTemplate',
  'cramschool.ContentTemplateTag': 'cramschoolContentTemplateTag',
  'cramschool.LearningResource': 'cramschoolLearningResource',
  'cramschool.LearningResourceCourse': 'cramschoolLearningResourceCourse',
  'cramschool.LearningResourceStudentGroup': 'cramschoolLearningResourceStudentGroup',
  'cramschool.LearningResourceTag': 'cramschoolLearningResourceTag',
  'cramschool.CoursePdf': 'cramschoolCoursePdf',
  'cramschool.CoursePdfStudentGroup': 'cramschoolCoursePdfStudentGroup',
};

/**
 * 簡化模型名稱到 Prisma 模型名稱的映射
 */
export const SIMPLE_MODEL_MAP: Record<string, PrismaModelName> = {
  'CustomUser': 'accountCustomUser',
  'Role': 'accountRole',
  'AccountRole': 'accountRole', // 新增別名
  'RolePermission': 'accountRolePermission',
  'AccountRolePermission': 'accountRolePermission', // 新增別名
  'AuditLog': 'accountAuditLog',
  'Student': 'cramschoolStudent',
  'Teacher': 'cramschoolTeacher',
  'Course': 'cramschoolCourse',
  'StudentEnrollment': 'cramschoolStudentEnrollment',
  'EnrollmentPeriod': 'cramschoolEnrollmentPeriod',
  'ExtraFee': 'cramschoolExtraFee',
  'SessionRecord': 'cramschoolSessionRecord',
  'Attendance': 'cramschoolAttendance',
  'Leave': 'cramschoolLeave',
  'Subject': 'cramschoolSubject',
  'QuestionBank': 'cramschoolQuestionBank',
  'Hashtag': 'cramschoolHashtag',
  'QuestionTag': 'cramschoolQuestionTag',
  'StudentAnswer': 'cramschoolStudentAnswer',
  'ErrorLog': 'cramschoolErrorLog',
  'ErrorLogImage': 'cramschoolErrorLogImage',
  'StudentMistakeNote': 'cramschoolStudentMistakeNote',
  'StudentMistakeNoteImage': 'cramschoolStudentMistakeNoteImage',
  'Restaurant': 'cramschoolRestaurant',
  'GroupOrder': 'cramschoolGroupOrder',
  'Order': 'cramschoolOrder',
  'OrderItem': 'cramschoolOrderItem',
  'StudentGroup': 'cramschoolStudentGroup',
  'StudentGroupStudent': 'cramschoolStudentGroupStudent',
  'ContentTemplate': 'cramschoolContentTemplate',
  'ContentTemplateTag': 'cramschoolContentTemplateTag',
  'LearningResource': 'cramschoolLearningResource',
  'LearningResourceCourse': 'cramschoolLearningResourceCourse',
  'LearningResourceStudentGroup': 'cramschoolLearningResourceStudentGroup',
  'LearningResourceTag': 'cramschoolLearningResourceTag',
  'CoursePdf': 'cramschoolCoursePdf',
  'CoursePdfStudentGroup': 'cramschoolCoursePdfStudentGroup',
};

/**
 * 模型主鍵欄位映射
 */
export const PRIMARY_KEY_MAP: Partial<Record<PrismaModelName, string>> = {
  'accountCustomUser': 'id',
  'accountRole': 'id',
  'accountRolePermission': 'id',
  'accountAuditLog': 'id',
  'cramschoolStudent': 'studentId',
  'cramschoolTeacher': 'teacherId',
  'cramschoolCourse': 'courseId',
  'cramschoolStudentEnrollment': 'enrollmentId',
  'cramschoolEnrollmentPeriod': 'periodId',
  'cramschoolExtraFee': 'feeId',
  'cramschoolSessionRecord': 'sessionId',
  'cramschoolAttendance': 'attendanceId',
  'cramschoolLeave': 'leaveId',
  'cramschoolSubject': 'subjectId',
  'cramschoolQuestionBank': 'questionId',
  'cramschoolHashtag': 'tagId',
  'cramschoolQuestionTag': 'questionTagId',
  'cramschoolStudentAnswer': 'answerId',
  'cramschoolErrorLog': 'errorLogId',
  'cramschoolErrorLogImage': 'imageId',
  'cramschoolStudentMistakeNote': 'noteId',
  'cramschoolStudentMistakeNoteImage': 'imageId',
  'cramschoolRestaurant': 'restaurantId',
  'cramschoolGroupOrder': 'groupOrderId',
  'cramschoolOrder': 'orderId',
  'cramschoolOrderItem': 'orderItemId',
  'cramschoolStudentGroup': 'groupId',
  'cramschoolStudentGroupStudent': 'id',
  'cramschoolContentTemplate': 'templateId',
  'cramschoolContentTemplateTag': 'id',
  'cramschoolLearningResource': 'resourceId',
  'cramschoolLearningResourceCourse': 'id',
  'cramschoolLearningResourceStudentGroup': 'id',
  'cramschoolLearningResourceTag': 'id',
  'cramschoolCoursePdf': 'pdfId',
  'cramschoolCoursePdfStudentGroup': 'id',
};

/**
 * 預設查找欄位映射
 */
export const DEFAULT_LOOKUP_FIELDS: Partial<Record<PrismaModelName, string[]>> = {
  'accountCustomUser': ['username'],
  'accountRole': ['code'],
  'accountRolePermission': ['id'],
  'accountAuditLog': ['id'],
  'cramschoolStudent': ['studentId'],
  'cramschoolTeacher': ['teacherId'],
  'cramschoolCourse': ['courseId'],
  'cramschoolStudentEnrollment': ['enrollmentId'],
  'cramschoolEnrollmentPeriod': ['periodId'],
  'cramschoolExtraFee': ['feeId'],
  'cramschoolSessionRecord': ['sessionId'],
  'cramschoolAttendance': ['attendanceId'],
  'cramschoolLeave': ['leaveId'],
  'cramschoolSubject': ['subjectId'],
  'cramschoolQuestionBank': ['questionId'],
  'cramschoolHashtag': ['tagId'],
  'cramschoolQuestionTag': ['questionTagId'],
  'cramschoolStudentAnswer': ['answerId'],
  'cramschoolErrorLog': ['errorLogId'],
  'cramschoolErrorLogImage': ['imageId'],
  'cramschoolStudentMistakeNote': ['noteId'],
  'cramschoolStudentMistakeNoteImage': ['imageId'],
  'cramschoolRestaurant': ['restaurantId'],
  'cramschoolGroupOrder': ['groupOrderId'],
  'cramschoolOrder': ['orderId'],
  'cramschoolOrderItem': ['orderItemId'],
  'cramschoolStudentGroup': ['groupId'],
  'cramschoolStudentGroupStudent': ['id'],
  'cramschoolContentTemplate': ['templateId'],
  'cramschoolContentTemplateTag': ['id'],
  'cramschoolLearningResource': ['resourceId'],
  'cramschoolLearningResourceCourse': ['id'],
  'cramschoolLearningResourceStudentGroup': ['id'],
  'cramschoolLearningResourceTag': ['id'],
  'cramschoolCoursePdf': ['pdfId'],
  'cramschoolCoursePdfStudentGroup': ['id'],
};

/**
 * 獲取 Prisma 模型
 */
export function getPrismaModel(prisma: PrismaClient, modelName: string): any {
  // 嘗試從簡化名稱映射
  let prismaModelName = SIMPLE_MODEL_MAP[modelName];
  
  // 如果沒找到，嘗試從完整名稱映射
  if (!prismaModelName) {
    prismaModelName = MODEL_MAP[modelName];
  }
  
  // 如果還是沒找到，嘗試直接使用 camelCase 名稱
  if (!prismaModelName) {
    const camelName = modelName.charAt(0).toLowerCase() + modelName.slice(1);
    if (camelName in prisma) {
      prismaModelName = camelName as PrismaModelName;
    }
  }
  
  if (!prismaModelName) {
    throw new Error(`找不到模型映射: ${modelName}`);
  }

  const model = prisma[prismaModelName];
  if (!model) {
    throw new Error(`找不到 Prisma 模型: ${String(prismaModelName)}`);
  }

  return model;
}

/**
 * 獲取模型的主鍵欄位名稱
 */
export function getPrimaryKey(prismaModelName: PrismaModelName): string {
  return PRIMARY_KEY_MAP[prismaModelName] || 'id';
}

/**
 * 獲取模型的預設查找欄位
 */
export function getLookupFields(prismaModelName: PrismaModelName): string[] {
  return DEFAULT_LOOKUP_FIELDS[prismaModelName] || [getPrimaryKey(prismaModelName)];
}

/**
 * 從物件中提取 ID
 */
export function extractId(obj: any, prismaModelName: PrismaModelName): any {
  const primaryKey = getPrimaryKey(prismaModelName);
  return obj[primaryKey] || obj.id || obj[Object.keys(obj)[0]];
}

/**
 * 獲取顯示名稱
 */
export function getDisplayName(modelName: string, data: Record<string, any>): string {
  // 嘗試使用常見的顯示欄位
  for (const fieldName of ['name', 'username', 'title', 'code', 'courseName']) {
    if (fieldName in data) {
      return `${modelName}: ${data[fieldName]}`;
    }
  }
  // 如果都沒有，使用第一個欄位
  if (Object.keys(data).length > 0) {
    const firstKey = Object.keys(data)[0];
    return `${modelName}: ${firstKey}=${data[firstKey]}`;
  }
  return modelName;
}

/**
 * 檢查字串是否為時間格式
 */
export function isTimeFormat(value: string): boolean {
  const timePattern = /^\d{1,2}:\d{2}(:\d{2})?$/;
  return timePattern.test(value);
}

/**
 * 檢查字串是否為外鍵引用格式
 */
export function isForeignKeyReference(value: string): boolean {
  if (typeof value !== 'string') return false;
  
  // 檢查是否為時間格式
  if (isTimeFormat(value)) return false;
  
  // 檢查是否為外鍵引用格式
  // @ModelName:field_name:value 或 app.ModelName:field_name:value
  const simplePattern = /^@(\w+):(\w+):(.+)$/;
  const fullPattern = /^(\w+)\.(\w+):(\w+):(.+)$/;
  
  return simplePattern.test(value) || fullPattern.test(value);
}
