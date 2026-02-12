/**
 * CSV 解析器
 * 使用 papaparse 解析 CSV 檔案
 */

import * as fs from 'fs';
import * as path from 'path';
import * as Papa from 'papaparse';
import type { ParsedCsvData } from './types';
import { convertKeysToCamelCase, SIMPLE_MODEL_MAP } from './utils';

/**
 * 解析 CSV 檔案
 */
export async function parseCsvFile(filePath: string): Promise<ParsedCsvData> {
  // 檢查檔案是否存在
  if (!fs.existsSync(filePath)) {
    throw new Error(`CSV 檔案不存在: ${filePath}`);
  }

  // 讀取檔案內容
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  // 移除 UTF-8 BOM（如果存在）
  const content = fileContent.replace(/^\uFEFF/, '');

  // 移除註解行（以 # 開頭的行）
  const lines = content.split('\n');
  const filteredLines = lines.filter(line => {
    const trimmed = line.trim();
    return trimmed && !trimmed.startsWith('#');
  });
  const cleanedContent = filteredLines.join('\n');

  // 解析 CSV
  const result = Papa.parse(cleanedContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => {
      // 移除前後空白
      return header.trim();
    },
    transform: (value: string, _field: string) => {
      // 移除前後空白
      const trimmed = value.trim();
      
      // 處理空字串
      if (trimmed === '') {
        return null;
      }
      
      // 處理布林值
      if (trimmed.toLowerCase() === 'true' || trimmed.toLowerCase() === 'yes') {
        return true;
      }
      if (trimmed.toLowerCase() === 'false' || trimmed.toLowerCase() === 'no') {
        return false;
      }
      
      // 不自動轉換數字，保持為字串
      // 這樣可以保留前導零和電話號碼格式
      // 如果需要數字，Zod schema 會自動轉換
      
      return trimmed;
    },
  });

  if (result.errors.length > 0) {
    const errorMessages = result.errors.map(err => 
      `第 ${err.row} 行: ${err.message}`
    ).join('\n');
    throw new Error(`CSV 解析錯誤:\n${errorMessages}`);
  }

  // 從檔案名稱提取模型名稱
  const fileName = path.basename(filePath, '.csv');
  const modelName = extractModelName(fileName);

  return {
    fileName,
    modelName,
    rows: result.data as Record<string, any>[],
  };
}

/**
 * 從檔案名稱提取模型名稱
 */
function extractModelName(fileName: string): string {
  // 移除可能的前綴和後綴
  let modelName = fileName
    .replace(/^(cramschool|account)_/i, '')
    .replace(/_data$/i, '')
    .replace(/_template$/i, '');
  
  // 轉換為 PascalCase
  modelName = modelName
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
  
  // 檢查是否為已知的模型
  if (SIMPLE_MODEL_MAP[modelName]) {
    return modelName;
  }
  
  // 如果不是已知模型，嘗試原始名稱
  return fileName;
}

/**
 * 批次解析 CSV 檔案
 */
export async function parseCsvFiles(csvDir: string, tableNames?: string[]): Promise<ParsedCsvData[]> {
  // 檢查目錄是否存在
  if (!fs.existsSync(csvDir)) {
    throw new Error(`CSV 目錄不存在: ${csvDir}`);
  }

  // 讀取目錄中的所有 CSV 檔案
  const files = fs.readdirSync(csvDir)
    .filter(file => file.endsWith('.csv'))
    .filter(file => {
      // 如果指定了表格名稱，只處理指定的表格
      if (tableNames && tableNames.length > 0) {
        const modelName = extractModelName(path.basename(file, '.csv'));
        return tableNames.includes(modelName);
      }
      return true;
    });

  if (files.length === 0) {
    throw new Error(`在 ${csvDir} 中找不到 CSV 檔案`);
  }

  // 解析所有檔案
  const results: ParsedCsvData[] = [];
  for (const file of files) {
    const filePath = path.join(csvDir, file);
    try {
      const parsed = await parseCsvFile(filePath);
      results.push(parsed);
    } catch (error: any) {
      throw new Error(`解析 ${file} 失敗: ${error.message}`);
    }
  }

  return results;
}

/**
 * 驗證 CSV 資料格式
 */
export function validateCsvData(data: ParsedCsvData): void {
  if (!data.rows || data.rows.length === 0) {
    throw new Error(`${data.fileName} 沒有資料行`);
  }

  // 檢查是否有空的 header
  const firstRow = data.rows[0];
  const emptyHeaders = Object.keys(firstRow).filter(key => !key || key.trim() === '');
  if (emptyHeaders.length > 0) {
    throw new Error(`${data.fileName} 包含空的欄位名稱`);
  }
}

/**
 * 將 CSV 資料轉換為 Prisma 格式
 * （將 snake_case 欄位名稱轉換為 camelCase）
 */
export function convertCsvDataToPrismaFormat(rows: Record<string, any>[]): Record<string, any>[] {
  return rows.map(row => convertKeysToCamelCase(row));
}
