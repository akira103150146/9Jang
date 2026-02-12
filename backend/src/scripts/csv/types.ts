/**
 * CSV Seeder 型別定義
 */

import { PrismaClient } from '@prisma/client';

/**
 * Prisma 模型名稱
 */
export type PrismaModelName = keyof Omit<
  PrismaClient,
  | '$connect'
  | '$disconnect'
  | '$on'
  | '$transaction'
  | '$use'
  | '$extends'
  | '$executeRaw'
  | '$executeRawUnsafe'
  | '$queryRaw'
  | '$queryRawUnsafe'
>;

/**
 * CSV 匯入選項
 */
export interface CsvImportOptions {
  /** CSV 檔案目錄 */
  csvDir?: string;
  /** 要匯入的表格名稱列表 */
  tables?: string[];
  /** 是否清空現有資料 */
  clear?: boolean;
  /** 預覽模式（不實際寫入） */
  dryRun?: boolean;
  /** 遇到錯誤繼續執行 */
  continueOnError?: boolean;
}

/**
 * CSV 範本生成選項
 */
export interface TemplateGenerateOptions {
  /** 輸出目錄 */
  outputDir?: string;
  /** 要生成的模型列表 */
  models?: string[];
  /** 只生成 header（不含範例資料） */
  empty?: boolean;
}

/**
 * 匯入統計資訊
 */
export interface ImportStats {
  /** 創建的記錄數 */
  created: number;
  /** 更新的記錄數 */
  updated: number;
  /** 跳過的記錄數 */
  skipped: number;
  /** 錯誤數 */
  errors: number;
}

/**
 * CSV 解析結果
 */
export interface ParsedCsvData {
  /** 檔案名稱 */
  fileName: string;
  /** 模型名稱 */
  modelName: string;
  /** 解析後的資料行 */
  rows: Record<string, any>[];
}

/**
 * 外鍵引用資訊
 */
export interface ForeignKeyReference {
  /** 引用的模型名稱 */
  modelName: string;
  /** 查找欄位名稱 */
  fieldName: string;
  /** 查找值 */
  value: string;
}

/**
 * Upsert 結果
 */
export type UpsertResult = 'created' | 'updated' | 'skipped';

/**
 * 模型欄位資訊
 */
export interface ModelFieldInfo {
  /** 欄位名稱（camelCase） */
  name: string;
  /** 欄位名稱（snake_case） */
  snakeName: string;
  /** 欄位類型 */
  type: string;
  /** 是否必填 */
  required: boolean;
  /** 是否為外鍵 */
  isForeignKey: boolean;
  /** 外鍵引用的模型 */
  referencedModel?: string;
  /** 預設值 */
  defaultValue?: any;
}

/**
 * 模型資訊
 */
export interface ModelInfo {
  /** 模型名稱（PascalCase） */
  name: string;
  /** Prisma 模型名稱（camelCase） */
  prismaName: PrismaModelName;
  /** 主鍵欄位名稱 */
  primaryKey: string;
  /** 預設查找欄位 */
  lookupFields: string[];
  /** 欄位資訊列表 */
  fields: ModelFieldInfo[];
}
