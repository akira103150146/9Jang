/**
 * Upsert 處理器
 * 處理資料的創建和更新邏輯
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import type { UpsertResult } from './types';
import {
  getPrismaModel,
  getPrimaryKey,
  getLookupFields,
  getDisplayName,
  SIMPLE_MODEL_MAP,
} from './utils';
import { addToCache } from './foreign-key-resolver';

/**
 * Upsert 單筆記錄
 */
export async function upsertRecord(
  prisma: PrismaClient,
  modelName: string,
  data: Record<string, any>,
  lookupFields?: string[],
  dryRun: boolean = false
): Promise<UpsertResult> {
  try {
    // 獲取 Prisma 模型
    const model = getPrismaModel(prisma, modelName);
    const prismaModelName = SIMPLE_MODEL_MAP[modelName];
    
    if (!prismaModelName) {
      throw new Error(`找不到模型: ${modelName}`);
    }

    // 獲取查找欄位
    const fields = lookupFields || getLookupFields(prismaModelName);
    
    // 構建查找條件
    const lookup: Record<string, any> = {};
    for (const field of fields) {
      if (field in data) {
        lookup[field] = data[field];
      }
    }

    // 處理特殊欄位（CustomUser 的密碼）
    let password: string | undefined;
    const isCustomUser = modelName === 'CustomUser' || prismaModelName === 'accountCustomUser';
    
    if (isCustomUser) {
      password = data.password || data.username || 'password123';
      delete data.password;
    }

    // Dry run 模式：只檢查不執行
    if (dryRun) {
      if (Object.keys(lookup).length > 0) {
        const exists = await model.findFirst({ where: lookup });
        if (exists) {
          console.log(`  ↻ 將更新: ${getDisplayName(modelName, data)}`);
          return 'updated';
        }
      }
      console.log(`  ✓ 將創建: ${getDisplayName(modelName, data)}`);
      return 'created';
    }

    // 執行 upsert
    let obj: any;
    let created = false;

    if (Object.keys(lookup).length > 0) {
      // 使用 lookup fields 查找現有記錄
      const existing = await model.findFirst({ where: lookup });
      
      if (existing) {
        // 更新現有記錄
        const primaryKey = getPrimaryKey(prismaModelName);
        const whereClause: Record<string, any> = {};
        whereClause[primaryKey] = existing[primaryKey];
        
        if (isCustomUser && password) {
          const hashedPassword = await bcrypt.hash(password, 10);
          obj = await model.update({
            where: whereClause,
            data: { ...data, password: hashedPassword },
          });
        } else {
          obj = await model.update({
            where: whereClause,
            data,
          });
        }
        
        console.log(`  ↻ 更新: ${getDisplayName(modelName, data)}`);
        if (isCustomUser && password) {
          console.log(`     (密碼已更新: ${password})`);
        }
      } else {
        // 創建新記錄
        if (isCustomUser && password) {
          const hashedPassword = await bcrypt.hash(password, 10);
          obj = await model.create({
            data: { ...data, password: hashedPassword },
          });
        } else {
          obj = await model.create({ data });
        }
        
        created = true;
        console.log(`  ✓ 創建: ${getDisplayName(modelName, data)}`);
        if (isCustomUser && password) {
          console.log(`     (密碼: ${password})`);
        }
      }
    } else {
      // 沒有查找條件，直接創建
      if (isCustomUser && password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        obj = await model.create({
          data: { ...data, password: hashedPassword },
        });
      } else {
        obj = await model.create({ data });
      }
      
      created = true;
      console.log(`  ✓ 創建: ${getDisplayName(modelName, data)}`);
      if (isCustomUser && password) {
        console.log(`     (密碼: ${password})`);
      }
    }

    // 添加到快取
    if (obj && prismaModelName) {
      const cacheKey = fields.length > 0
        ? String(data[fields[0]])
        : String(obj.id || obj[Object.keys(obj)[0]]);
      addToCache(prismaModelName, cacheKey, obj);
    }

    return created ? 'created' : 'updated';
  } catch (error: any) {
    throw new Error(`Upsert 失敗: ${error.message}`);
  }
}

/**
 * 批次 upsert 記錄
 */
export async function upsertRecordsBatch(
  prisma: PrismaClient,
  modelName: string,
  rows: Record<string, any>[],
  lookupFields?: string[],
  dryRun: boolean = false,
  continueOnError: boolean = false
): Promise<{
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ row: Record<string, any>; error: string; index: number }>;
}> {
  const stats = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [] as Array<{ row: Record<string, any>; error: string; index: number }>,
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    
    try {
      const result = await upsertRecord(prisma, modelName, row, lookupFields, dryRun);
      
      if (result === 'created') {
        stats.created++;
      } else if (result === 'updated') {
        stats.updated++;
      } else {
        stats.skipped++;
      }
    } catch (error: any) {
      stats.errors.push({
        row,
        error: error.message,
        index: i + 1, // 1-based index for user display
      });
      
      if (!continueOnError) {
        throw error;
      }
    }
  }

  return stats;
}

/**
 * 格式化 upsert 錯誤訊息
 */
export function formatUpsertErrors(
  fileName: string,
  errors: Array<{ row: Record<string, any>; error: string; index: number }>
): string {
  if (errors.length === 0) {
    return '';
  }

  const messages: string[] = [`\n${fileName} 處理失敗:`];
  
  errors.forEach(({ index, error }) => {
    messages.push(`  第 ${index} 行: ${error}`);
  });

  return messages.join('\n');
}

/**
 * 清空模型的所有資料
 */
export async function clearModel(
  prisma: PrismaClient,
  modelName: string
): Promise<number> {
  try {
    const model = getPrismaModel(prisma, modelName);
    const count = await model.count();
    
    if (count > 0) {
      await model.deleteMany({});
      console.log(`  已清除 ${modelName}: ${count} 筆記錄`);
    }
    
    return count;
  } catch (error: any) {
    throw new Error(`清除 ${modelName} 失敗: ${error.message}`);
  }
}

/**
 * 批次清空多個模型的資料
 * 按照依賴關係反向刪除（先刪除依賴者，再刪除被依賴者）
 */
export async function clearModels(
  prisma: PrismaClient,
  modelNames: string[]
): Promise<number> {
  let totalDeleted = 0;
  
  // 反向遍歷，先刪除依賴的表格
  for (const modelName of [...modelNames].reverse()) {
    const deleted = await clearModel(prisma, modelName);
    totalDeleted += deleted;
  }
  
  return totalDeleted;
}
