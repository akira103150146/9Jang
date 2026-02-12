/**
 * 外鍵解析器
 * 解析 CSV 中的外鍵引用並從資料庫查找對應的記錄
 */

import { PrismaClient } from '@prisma/client';
import type { ForeignKeyReference, PrismaModelName } from './types';
import { 
  getPrismaModel, 
  snakeToCamel, 
  extractId, 
  isForeignKeyReference,
  isTimeFormat,
  SIMPLE_MODEL_MAP
} from './utils';

/**
 * 用於存儲已創建/查找的對象，避免重複查詢
 */
const objectCache: Record<string, Record<string, any>> = {};

/**
 * 清空快取
 */
export function clearCache(): void {
  Object.keys(objectCache).forEach(key => delete objectCache[key]);
}

/**
 * 添加到快取
 */
export function addToCache(modelName: PrismaModelName, key: string, obj: any): void {
  const cacheKey = String(modelName);
  if (!objectCache[cacheKey]) {
    objectCache[cacheKey] = {};
  }
  objectCache[cacheKey][key] = obj;
}

/**
 * 從快取獲取
 */
export function getFromCache(modelName: PrismaModelName, key: string): any | undefined {
  const cacheKey = String(modelName);
  return objectCache[cacheKey]?.[key];
}

/**
 * 解析外鍵引用字串
 */
export function parseForeignKeyReference(value: string): ForeignKeyReference | null {
  if (!isForeignKeyReference(value)) {
    return null;
  }

  // 格式 1: @ModelName:field_name:value
  const simpleMatch = value.match(/^@(\w+):(\w+):(.+)$/);
  if (simpleMatch) {
    const [, modelName, fieldName, fieldValue] = simpleMatch;
    return {
      modelName,
      fieldName,
      value: fieldValue,
    };
  }

  // 格式 2: app.ModelName:field_name:value
  const fullMatch = value.match(/^(\w+)\.(\w+):(\w+):(.+)$/);
  if (fullMatch) {
    const [, , modelName, fieldName, fieldValue] = fullMatch;
    return {
      modelName,
      fieldName,
      value: fieldValue,
    };
  }

  return null;
}

/**
 * 解析外鍵引用並從資料庫查找
 */
export async function resolveForeignKey(
  prisma: PrismaClient,
  fieldName: string,
  value: any
): Promise<any> {
  // 如果不是字串，直接返回
  if (typeof value !== 'string') {
    return value;
  }

  // 如果是時間格式，直接返回
  if (isTimeFormat(value)) {
    return value;
  }

  // 解析外鍵引用
  const reference = parseForeignKeyReference(value);
  if (!reference) {
    return value;
  }

  try {
    // 獲取 Prisma 模型名稱
    const prismaModelName = SIMPLE_MODEL_MAP[reference.modelName];
    if (!prismaModelName) {
      throw new Error(`找不到模型: ${reference.modelName}`);
    }

    // 檢查快取
    const cacheKey = `${reference.fieldName}:${reference.value}`;
    const cached = getFromCache(prismaModelName, cacheKey);
    if (cached) {
      return extractId(cached, prismaModelName);
    }

    // 從資料庫查找
    const model = getPrismaModel(prisma, reference.modelName);
    const camelField = snakeToCamel(reference.fieldName);
    
    const where: Record<string, any> = {};
    where[camelField] = reference.value;
    
    const found = await model.findFirst({ where });
    if (!found) {
      throw new Error(
        `找不到引用的對象: ${reference.modelName}.${reference.fieldName}=${reference.value}`
      );
    }

    // 添加到快取
    addToCache(prismaModelName, cacheKey, found);

    // 提取 ID
    return extractId(found, prismaModelName);
  } catch (error: any) {
    throw new Error(`解析外鍵 ${fieldName} 失敗: ${error.message}`);
  }
}

/**
 * 處理資料物件中的所有外鍵引用
 */
export async function resolveAllForeignKeys(
  prisma: PrismaClient,
  data: Record<string, any>
): Promise<Record<string, any>> {
  const result = { ...data };

  for (const [fieldName, value] of Object.entries(data)) {
    if (typeof value === 'string' && isForeignKeyReference(value)) {
      const resolved = await resolveForeignKey(prisma, fieldName, value);
      
      // 如果解析成功（不是原值），處理欄位名稱
      if (resolved !== value) {
        // Prisma 外鍵欄位通常以 Id 結尾
        if (fieldName.endsWith('Id')) {
          // 字段名已經是 ID 格式，直接使用 ID
          result[fieldName] = resolved;
        } else {
          // 字段名是關係名，轉換為 ID 字段
          const idFieldName = `${fieldName}Id`;
          result[idFieldName] = resolved;
          // 刪除原字段名
          delete result[fieldName];
        }
      }
    }
  }

  // 清理錯誤生成的字段（如 startTimeId, endTimeId）
  delete result.startTimeId;
  delete result.endTimeId;

  return result;
}

/**
 * 批次解析外鍵引用
 */
export async function resolveAllForeignKeysInBatch(
  prisma: PrismaClient,
  rows: Record<string, any>[]
): Promise<Record<string, any>[]> {
  const results: Record<string, any>[] = [];

  for (const row of rows) {
    const resolved = await resolveAllForeignKeys(prisma, row);
    results.push(resolved);
  }

  return results;
}

/**
 * 驗證外鍵引用格式
 */
export function validateForeignKeyReference(value: string): boolean {
  const reference = parseForeignKeyReference(value);
  if (!reference) {
    return false;
  }

  // 檢查模型名稱是否存在
  if (!SIMPLE_MODEL_MAP[reference.modelName]) {
    return false;
  }

  return true;
}
