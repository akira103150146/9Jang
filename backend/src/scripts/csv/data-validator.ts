/**
 * 資料驗證器
 * 使用 Zod schema 驗證 CSV 資料
 */

import { z } from 'zod';
import type { PrismaModelName } from './types';
import { SIMPLE_MODEL_MAP } from './utils';

// 從 shared 匯入 Zod schemas
import {
  CreateStudentSchema,
  UpdateStudentSchema,
  CreateTeacherSchema,
  UpdateTeacherSchema,
  CreateCourseSchema,
  UpdateCourseSchema,
  CreateSubjectSchema,
  UpdateSubjectSchema,
  StudentEnrollmentSchema,
  CreateStudentEnrollmentSchema,
  CreateFeeSchema,
  UpdateFeeSchema,
  CreateAttendanceSchema,
  UpdateAttendanceSchema,
  CreateLeaveSchema,
  UpdateLeaveSchema,
  CreateSessionSchema,
  UpdateSessionSchema,
  CreateQuestionSchema,
  UpdateQuestionSchema,
  CreateHashtagSchema,
  UpdateHashtagSchema,
  CreateStudentAnswerSchema,
  UpdateStudentAnswerSchema,
  CreateErrorLogSchema,
  UpdateErrorLogSchema,
  CreateStudentMistakeNoteSchema,
  UpdateStudentMistakeNoteSchema,
  CreateRestaurantSchema,
  UpdateRestaurantSchema,
  CreateGroupOrderSchema,
  UpdateGroupOrderSchema,
  CreateOrderSchema,
  UpdateOrderSchema,
  CreateOrderItemSchema,
  UpdateOrderItemSchema,
  CreateStudentGroupSchema,
  UpdateStudentGroupSchema,
  CreateLearningResourceSchema,
  UpdateLearningResourceSchema,
} from '@9jang/shared';

/**
 * 創建 schema 映射
 */
const CREATE_SCHEMA_MAP: Partial<Record<PrismaModelName, z.ZodType<any>>> = {
  'cramschoolStudent': CreateStudentSchema,
  'cramschoolTeacher': CreateTeacherSchema,
  'cramschoolCourse': CreateCourseSchema,
  'cramschoolSubject': CreateSubjectSchema,
  'cramschoolStudentEnrollment': CreateStudentEnrollmentSchema,
  'cramschoolExtraFee': CreateFeeSchema,
  'cramschoolAttendance': CreateAttendanceSchema,
  'cramschoolLeave': CreateLeaveSchema,
  'cramschoolSessionRecord': CreateSessionSchema,
  'cramschoolQuestionBank': CreateQuestionSchema,
  'cramschoolHashtag': CreateHashtagSchema,
  'cramschoolStudentAnswer': CreateStudentAnswerSchema,
  'cramschoolErrorLog': CreateErrorLogSchema,
  'cramschoolStudentMistakeNote': CreateStudentMistakeNoteSchema,
  'cramschoolRestaurant': CreateRestaurantSchema,
  'cramschoolGroupOrder': CreateGroupOrderSchema,
  'cramschoolOrder': CreateOrderSchema,
  'cramschoolOrderItem': CreateOrderItemSchema,
  'cramschoolStudentGroup': CreateStudentGroupSchema,
  'cramschoolLearningResource': CreateLearningResourceSchema,
};

/**
 * 更新 schema 映射
 */
const UPDATE_SCHEMA_MAP: Partial<Record<PrismaModelName, z.ZodType<any>>> = {
  'cramschoolStudent': UpdateStudentSchema,
  'cramschoolTeacher': UpdateTeacherSchema,
  'cramschoolCourse': UpdateCourseSchema,
  'cramschoolSubject': UpdateSubjectSchema,
  'cramschoolStudentEnrollment': StudentEnrollmentSchema.partial(),
  'cramschoolExtraFee': UpdateFeeSchema,
  'cramschoolAttendance': UpdateAttendanceSchema,
  'cramschoolLeave': UpdateLeaveSchema,
  'cramschoolSessionRecord': UpdateSessionSchema,
  'cramschoolQuestionBank': UpdateQuestionSchema,
  'cramschoolHashtag': UpdateHashtagSchema,
  'cramschoolStudentAnswer': UpdateStudentAnswerSchema,
  'cramschoolErrorLog': UpdateErrorLogSchema,
  'cramschoolStudentMistakeNote': UpdateStudentMistakeNoteSchema,
  'cramschoolRestaurant': UpdateRestaurantSchema,
  'cramschoolGroupOrder': UpdateGroupOrderSchema,
  'cramschoolOrder': UpdateOrderSchema,
  'cramschoolOrderItem': UpdateOrderItemSchema,
  'cramschoolStudentGroup': UpdateStudentGroupSchema,
  'cramschoolLearningResource': UpdateLearningResourceSchema,
};

/**
 * 驗證資料
 */
export function validateData(
  modelName: string,
  data: Record<string, any>,
  isUpdate: boolean = false
): { success: boolean; data?: any; errors?: string[] } {
  try {
    // 獲取 Prisma 模型名稱
    const prismaModelName = SIMPLE_MODEL_MAP[modelName];
    if (!prismaModelName) {
      return {
        success: false,
        errors: [`找不到模型: ${modelName}`],
      };
    }

    // 獲取對應的 schema
    const schemaMap = isUpdate ? UPDATE_SCHEMA_MAP : CREATE_SCHEMA_MAP;
    const schema = schemaMap[prismaModelName];

    // 如果沒有對應的 schema，跳過驗證（基本驗證）
    if (!schema) {
      return {
        success: true,
        data,
      };
    }

    // 使用 Zod 驗證
    const result = schema.safeParse(data);

    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    } else {
      // 格式化錯誤訊息
      const errors = result.error.errors.map(err => {
        const path = err.path.join('.');
        return `欄位 '${path}': ${err.message}`;
      });

      return {
        success: false,
        errors,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      errors: [`驗證失敗: ${error.message}`],
    };
  }
}

/**
 * 批次驗證資料
 */
export function validateDataBatch(
  modelName: string,
  rows: Record<string, any>[],
  isUpdate: boolean = false
): {
  validRows: Record<string, any>[];
  invalidRows: Array<{ row: Record<string, any>; errors: string[]; index: number }>;
} {
  const validRows: Record<string, any>[] = [];
  const invalidRows: Array<{ row: Record<string, any>; errors: string[]; index: number }> = [];

  rows.forEach((row, index) => {
    const result = validateData(modelName, row, isUpdate);
    
    if (result.success && result.data) {
      validRows.push(result.data);
    } else {
      invalidRows.push({
        row,
        errors: result.errors || ['未知錯誤'],
        index: index + 1, // 1-based index for user display
      });
    }
  });

  return { validRows, invalidRows };
}

/**
 * 基本驗證（不使用 Zod schema）
 */
export function basicValidate(_data: Record<string, any>): { success: boolean; errors?: string[] } {
  const errors: string[] = [];

  // 檢查是否有空的必填欄位
  // 這裡可以根據需要添加更多基本驗證規則

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true };
}

/**
 * 驗證外鍵引用格式
 */
export function validateForeignKeyFormat(_value: string): boolean {
  // @ModelName:field_name:value 或 app.ModelName:field_name:value
  const simplePattern = /^@(\w+):(\w+):(.+)$/;
  const fullPattern = /^(\w+)\.(\w+):(\w+):(.+)$/;
  
  return simplePattern.test(_value) || fullPattern.test(_value);
}

/**
 * 格式化驗證錯誤訊息
 */
export function formatValidationErrors(
  fileName: string,
  invalidRows: Array<{ row: Record<string, any>; errors: string[]; index: number }>
): string {
  if (invalidRows.length === 0) {
    return '';
  }

  const messages: string[] = [`\n${fileName} 驗證失敗:`];
  
  invalidRows.forEach(({ index, errors }) => {
    messages.push(`  第 ${index} 行:`);
    errors.forEach(error => {
      messages.push(`    - ${error}`);
    });
  });

  return messages.join('\n');
}
