/**
 * CSV 資料匯入腳本
 * 
 * 使用方法：
 *   pnpm seed:csv                              # 匯入 fixtures/csv/data/ 所有檔案
 *   pnpm seed:csv --tables Student,Teacher     # 只匯入指定表格
 *   pnpm seed:csv --csv-dir ./my-data          # 指定 CSV 目錄
 *   pnpm seed:csv --dry-run                    # 預覽模式
 *   pnpm seed:csv --clear                      # 清空後匯入
 *   pnpm seed:csv --continue-on-error          # 遇到錯誤繼續執行
 */

import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import type { ImportStats } from './csv/types';
import { parseCsvFiles, validateCsvData, convertCsvDataToPrismaFormat } from './csv/csv-parser';
import { resolveAllForeignKeysInBatch, clearCache } from './csv/foreign-key-resolver';
import { validateDataBatch, formatValidationErrors } from './csv/data-validator';
import { upsertRecordsBatch, formatUpsertErrors, clearModels } from './csv/upsert-handler';

const prisma = new PrismaClient();

async function seedCsv(
  csvDir: string,
  tableNames?: string[],
  clear: boolean = false,
  dryRun: boolean = false,
  continueOnError: boolean = false
) {
  console.log('='.repeat(70));
  console.log('CSV 資料匯入');
  console.log('='.repeat(70));
  console.log('');
  console.log(`CSV 目錄: ${csvDir}`);
  if (tableNames && tableNames.length > 0) {
    console.log(`指定表格: ${tableNames.join(', ')}`);
  }
  if (dryRun) {
    console.log('模式: 預覽（不會實際寫入資料庫）');
  }
  if (clear) {
    console.log('清空模式: 是');
  }
  console.log('');

  const totalStats: ImportStats = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  };

  try {
    // 解析 CSV 檔案
    console.log('正在解析 CSV 檔案...');
    const parsedFiles = await parseCsvFiles(csvDir, tableNames);
    console.log(`找到 ${parsedFiles.length} 個 CSV 檔案`);
    console.log('');

    // 清空快取
    clearCache();

    // 在事務中處理所有資料
    await prisma.$transaction(async (tx) => {
      // 如果需要清空資料
      if (clear && !dryRun) {
        console.log('正在清空現有資料...');
        const modelNames = parsedFiles.map(f => f.modelName);
        const deleted = await clearModels(tx as PrismaClient, modelNames);
        console.log(`已清空 ${deleted} 筆記錄`);
        console.log('');
      }

      // 處理每個 CSV 檔案
      for (const parsed of parsedFiles) {
        console.log(`處理: ${parsed.fileName}`);
        console.log(`模型: ${parsed.modelName}`);
        console.log(`資料行數: ${parsed.rows.length}`);
        console.log('');

        try {
          // 驗證 CSV 資料格式
          validateCsvData(parsed);

          // 轉換為 Prisma 格式（snake_case → camelCase）
          const prismaRows = convertCsvDataToPrismaFormat(parsed.rows);

          // 解析外鍵引用
          console.log('  解析外鍵引用...');
          const resolvedRows = await resolveAllForeignKeysInBatch(
            tx as PrismaClient,
            prismaRows
          );

          // 驗證資料
          console.log('  驗證資料...');
          const { validRows, invalidRows } = validateDataBatch(
            parsed.modelName,
            resolvedRows,
            false
          );

          if (invalidRows.length > 0) {
            console.error(formatValidationErrors(parsed.fileName, invalidRows));
            totalStats.errors += invalidRows.length;
            
            if (!continueOnError) {
              throw new Error(`${parsed.fileName} 驗證失敗`);
            }
          }

          // Upsert 資料
          console.log('  匯入資料...');
          const result = await upsertRecordsBatch(
            tx as PrismaClient,
            parsed.modelName,
            validRows,
            undefined,
            dryRun,
            continueOnError
          );

          totalStats.created += result.created;
          totalStats.updated += result.updated;
          totalStats.skipped += result.skipped;
          totalStats.errors += result.errors.length;

          if (result.errors.length > 0) {
            console.error(formatUpsertErrors(parsed.fileName, result.errors));
            
            if (!continueOnError) {
              throw new Error(`${parsed.fileName} 處理失敗`);
            }
          }

          console.log('');
        } catch (error: any) {
          console.error(`處理 ${parsed.fileName} 失敗: ${error.message}`);
          console.log('');
          
          if (!continueOnError) {
            throw error;
          }
        }
      }

      // 在 dry-run 模式下，不提交事務
      if (dryRun) {
        throw new Error('Dry run mode');
      }
    }, {
      timeout: 120000, // 120 秒超時
    });
  } catch (error: any) {
    if (error.message === 'Dry run mode') {
      // Dry run 模式，正常結束
    } else {
      throw error;
    }
  }

  // 輸出統計信息
  console.log('='.repeat(70));
  console.log('匯入完成！');
  console.log(`  創建: ${totalStats.created} 筆`);
  console.log(`  更新: ${totalStats.updated} 筆`);
  console.log(`  跳過: ${totalStats.skipped} 筆`);
  if (totalStats.errors > 0) {
    console.log(`  錯誤: ${totalStats.errors} 筆`);
  }
  console.log('='.repeat(70));
}

async function main() {
  const args = process.argv.slice(2);
  
  // 解析參數
  const csvDirArg = args.find(arg => arg.startsWith('--csv-dir='));
  const tablesArg = args.find(arg => arg.startsWith('--tables='));
  const clear = args.includes('--clear');
  const dryRun = args.includes('--dry-run');
  const continueOnError = args.includes('--continue-on-error');
  
  // 確定 CSV 目錄
  let csvDir: string;
  if (csvDirArg) {
    csvDir = path.resolve(csvDirArg.split('=')[1]);
  } else {
    csvDir = path.join(__dirname, '..', '..', 'fixtures', 'csv', 'data');
  }
  
  // 確定要匯入的表格
  let tableNames: string[] | undefined;
  if (tablesArg) {
    const tablesStr = tablesArg.split('=')[1];
    tableNames = tablesStr.split(',').map(t => t.trim());
  }

  try {
    await seedCsv(csvDir, tableNames, clear, dryRun, continueOnError);
  } catch (error: any) {
    console.error('');
    console.error('='.repeat(70));
    console.error(`錯誤: ${error.message}`);
    console.error('='.repeat(70));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
