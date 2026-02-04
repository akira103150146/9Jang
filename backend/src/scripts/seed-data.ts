/**
 * 從 JSON 文件初始化資料庫資料
 * 
 * 使用方法：
 *   pnpm seed:data                    # 使用默認文件 seed_data_example.json
 *   pnpm seed:data <json_file_path>   # 指定 JSON 文件路徑
 *   pnpm seed:data --dry-run          # 預覽模式（使用默認文件）
 *   pnpm seed:data --clear            # 清除後初始化（使用默認文件）
 *   pnpm seed:data <json_file_path> --dry-run
 *   pnpm seed:data <json_file_path> --clear
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Django 模型名稱到 Prisma 模型名稱的映射
type PrismaModelName = 
  | 'accountCustomUser'
  | 'accountRole'
  | 'accountRolePermission'
  | 'accountAuditLog'
  | 'cramschoolStudent'
  | 'cramschoolTeacher'
  | 'cramschoolCourse'
  | 'cramschoolStudentEnrollment'
  | 'cramschoolEnrollmentPeriod'
  | 'cramschoolExtraFee'
  | 'cramschoolSessionRecord'
  | 'cramschoolAttendance'
  | 'cramschoolLeave'
  | 'cramschoolSubject'
  | 'cramschoolQuestionBank'
  | 'cramschoolHashtag'
  | 'cramschoolQuestionTag'
  | 'cramschoolStudentAnswer'
  | 'cramschoolErrorLog'
  | 'cramschoolErrorLogImage'
  | 'cramschoolStudentMistakeNote'
  | 'cramschoolStudentMistakeNoteImage'
  | 'cramschoolRestaurant'
  | 'cramschoolGroupOrder'
  | 'cramschoolOrder'
  | 'cramschoolOrderItem'
  | 'cramschoolStudentGroup'
  | 'cramschoolStudentGroupStudent'
  | 'cramschoolContentTemplate'
  | 'cramschoolContentTemplateTag'
  | 'cramschoolLearningResource'
  | 'cramschoolLearningResourceCourse'
  | 'cramschoolLearningResourceStudentGroup'
  | 'cramschoolLearningResourceTag';

const MODEL_MAP: Record<string, PrismaModelName> = {
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
};

// 模型主鍵字段映射（用於更新操作）
const PRIMARY_KEY_MAP: Record<PrismaModelName, string> = {
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
};

interface SeedItem {
  lookup_fields?: string[];
  data: Record<string, any>;
}

interface SeedData {
  models: Record<string, SeedItem[]>;
}

interface Stats {
  created: number;
  updated: number;
  skipped: number;
  errors: number;
}

// 用於存儲已創建的對象，以便處理外鍵關係
const createdObjects: Record<PrismaModelName, Record<string, any>> = {} as Record<PrismaModelName, Record<string, any>>;

function getModel(modelPath: string): any {
  const prismaModelName = MODEL_MAP[modelPath];
  if (!prismaModelName) {
    throw new Error(`找不到模型映射: ${modelPath}`);
  }

  const model = prisma[prismaModelName as keyof PrismaClient];
  if (!model) {
    throw new Error(`找不到 Prisma 模型: ${String(prismaModelName)}`);
  }

  return model;
}

/**
 * 將 snake_case 轉換為 camelCase
 * 例如: first_name -> firstName, is_staff -> isStaff
 */
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * 將對象的所有鍵從 snake_case 轉換為 camelCase
 */
function convertKeysToCamelCase(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[snakeToCamel(key)] = value;
  }
  return result;
}

async function resolveForeignKey(
  _modelPath: string,
  fieldName: string,
  value: string
): Promise<any> {
  // 檢查值是否為引用格式（例如: "account.CustomUser:username:admin"）
  // 外鍵引用格式必須包含兩個 ":"，且第一部分必須包含點號（app_label.ModelName）
  if (typeof value !== 'string' || !value.includes(':')) {
    return value;
  }

  const parts = value.split(':');
  // 外鍵引用格式應該有 3 個部分（用兩個 ":" 分隔）
  // 且第一部分應該包含點號（app_label.ModelName）
  if (parts.length !== 3 || !parts[0].includes('.')) {
    // 不是外鍵引用格式（可能是時間格式如 "18:00"），直接返回原值
    return value;
  }

  const [refModelPath, refField, refValue] = parts;

  try {
    const refModel = getModel(refModelPath);
    const modelKey = MODEL_MAP[refModelPath];
    
    // 先從 createdObjects 查找
    if (modelKey && createdObjects[modelKey] && createdObjects[modelKey][refValue]) {
      return createdObjects[modelKey][refValue];
    }

    // 從資料庫查找時，需要將字段名稱轉換為 camelCase（Prisma Client 期望的格式）
    const where: Record<string, any> = {};
    where[snakeToCamel(refField)] = refValue;
    
    const found = await refModel.findFirst({ where });
    if (!found) {
      throw new Error(`找不到引用的對象: ${refModelPath}.${refField}=${refValue}`);
    }

    return found;
  } catch (error: any) {
    throw new Error(`解析外鍵失敗 ${fieldName}: ${error.message}`);
  }
}

async function processItem(
  model: any,
  modelPath: string,
  item: SeedItem,
  dryRun: boolean
): Promise<'created' | 'updated' | 'skipped'> {
  if (!item.data) {
    throw new Error('項目必須包含 "data" 鍵');
  }

  // 將字段名稱從 snake_case 轉換為 camelCase（Prisma Client 期望的格式）
  // JSON 文件使用 snake_case（來自 Django），但 Prisma Client 使用 camelCase
  const data = convertKeysToCamelCase(item.data);
  const lookupFields = (item.lookup_fields || []).map(field => snakeToCamel(field));

  // 處理外鍵關係
  for (const [fieldName, value] of Object.entries(data)) {
    if (typeof value === 'string' && value.includes(':')) {
      // 先檢查是否為時間格式（HH:MM:SS 或 HH:MM）
      // 時間格式通常匹配：數字:數字:數字 或 數字:數字
      const timePattern = /^\d{1,2}:\d{2}(:\d{2})?$/;
      if (timePattern.test(value)) {
        // 是時間格式，跳過外鍵處理
        continue;
      }
      
      const resolved = await resolveForeignKey(modelPath, fieldName, value);
      
      // 如果 resolved 是字符串（原值），說明不是外鍵引用，跳過處理
      if (typeof resolved === 'string') {
        continue;
      }
      
      // 提取 ID：優先使用 id，否則使用第一個字段的值
      const resolvedId = resolved.id || resolved[Object.keys(resolved).find(k => k.endsWith('Id')) || Object.keys(resolved)[0]];
      
      // Prisma 外鍵字段通常以 Id 結尾
      // 如果字段名是 "user"，對應的 Prisma 字段是 "userId"
      // 如果字段名已經是 "userId"，直接使用
      if (fieldName.endsWith('Id')) {
        // 字段名已經是 ID 格式，直接使用 ID
        data[fieldName] = resolvedId;
      } else {
        // 字段名是關係名，轉換為 ID 字段
        const idFieldName = `${fieldName}Id`;
        data[idFieldName] = resolvedId;
        // 刪除原字段名（如果存在）
        delete data[fieldName];
      }
    }
  }
  
  // 清理錯誤生成的字段（如 startTimeId, endTimeId）
  delete data.startTimeId;
  delete data.endTimeId;

  // 處理 CustomUser 的密碼
  let password: string | undefined;
  const isCustomUser = modelPath === 'account.CustomUser';
  
  if (isCustomUser) {
    password = data.password || data.username || 'password123';
    delete data.password;
  }

  // 構建查找條件
  const lookup: Record<string, any> = {};
  if (lookupFields.length > 0) {
    for (const field of lookupFields) {
      if (!(field in data)) {
        throw new Error(`查找欄位 "${field}" 不存在於資料中`);
      }
      lookup[field] = data[field];
    }
  }

  // 執行創建或更新
  if (dryRun) {
    // Dry run 模式：檢查是否存在
    if (Object.keys(lookup).length > 0) {
      const exists = await model.findFirst({ where: lookup });
      if (exists) {
        console.log(`  ↻ 將更新: ${getDisplayName(modelPath, data)}`);
        return 'updated';
      }
    }
    console.log(`  ✓ 將創建: ${getDisplayName(modelPath, data)}`);
    return 'created';
  }

  let obj: any;
  let created = false;

  if (Object.keys(lookup).length > 0) {
    // 使用 updateOrCreate 邏輯
    const existing = await model.findFirst({ where: lookup });
    
    if (existing) {
      // 獲取模型的主鍵字段名
      const modelKey = MODEL_MAP[modelPath];
      const primaryKey = modelKey ? PRIMARY_KEY_MAP[modelKey] : 'id';
      
      // 構建 where 條件，使用正確的主鍵
      const whereClause: Record<string, any> = {};
      whereClause[primaryKey] = existing[primaryKey];
      
      // 更新現有記錄
      if (isCustomUser && password) {
        // 對於 CustomUser，需要特殊處理密碼
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
      console.log(`  ↻ 更新: ${getDisplayName(modelPath, data)}`);
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
      console.log(`  ✓ 創建: ${getDisplayName(modelPath, data)}`);
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
    console.log(`  ✓ 創建: ${getDisplayName(modelPath, data)}`);
    if (isCustomUser && password) {
      console.log(`     (密碼: ${password})`);
    }
  }

  // 保存到 createdObjects 以便後續引用
  if (obj) {
    const modelKey = MODEL_MAP[modelPath];
    if (modelKey) {
      if (!createdObjects[modelKey]) {
        createdObjects[modelKey] = {};
      }
      // 使用第一個查找欄位作為鍵，如果沒有則使用 id
      const key = lookupFields.length > 0
        ? String(data[lookupFields[0]])
        : String(obj.id || obj[Object.keys(obj)[0]]);
      createdObjects[modelKey][key] = obj;
    }
  }

  return created ? 'created' : 'updated';
}

function getDisplayName(modelPath: string, data: Record<string, any>): string {
  // 嘗試使用常見的顯示欄位
  for (const fieldName of ['name', 'username', 'title', 'code', 'course_name']) {
    if (fieldName in data) {
      return `${modelPath}: ${data[fieldName]}`;
    }
  }
  // 如果都沒有，使用第一個欄位
  if (Object.keys(data).length > 0) {
    const firstKey = Object.keys(data)[0];
    return `${modelPath}: ${firstKey}=${data[firstKey]}`;
  }
  return modelPath;
}

async function seedData(jsonFile: string, clearExisting: boolean, dryRun: boolean) {
  // 檢查文件是否存在
  if (!fs.existsSync(jsonFile)) {
    throw new Error(`文件不存在: ${jsonFile}`);
  }

  // 讀取 JSON 文件
  let data: SeedData;
  try {
    const fileContent = fs.readFileSync(jsonFile, 'utf-8');
    data = JSON.parse(fileContent);
  } catch (error: any) {
    throw new Error(`讀取 JSON 文件失敗: ${error.message}`);
  }

  if (!data.models) {
    throw new Error('JSON 文件必須包含 "models" 鍵');
  }

  if (dryRun) {
    console.log('=== 預覽模式（不會實際寫入資料庫）===');
  }

  const stats: Stats = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  };

  try {
    await prisma.$transaction(async (_tx) => {
      // 如果指定了 --clear，先清除資料
      if (clearExisting && !dryRun) {
        console.log('清除現有資料...');
        for (const modelPath of Object.keys(data.models)) {
          try {
            const model = getModel(modelPath);
            const count = await model.count();
            if (count > 0) {
              await model.deleteMany({});
              console.log(`  已清除 ${modelPath}: ${count} 筆記錄`);
            }
          } catch (error: any) {
            console.error(`  清除 ${modelPath} 失敗: ${error.message}`);
          }
        }
      }

      // 處理每個模型
      for (const [modelPath, items] of Object.entries(data.models)) {
        console.log('');
        console.log(`處理模型: ${modelPath}`);

        try {
          const model = getModel(modelPath);
          
          // 處理該模型的每筆資料
          for (const item of items) {
            try {
              const result = await processItem(model, modelPath, item, dryRun);
              if (result === 'created') {
                stats.created++;
              } else if (result === 'updated') {
                stats.updated++;
              } else {
                stats.skipped++;
              }
            } catch (error: any) {
              console.error(`  處理資料失敗: ${error.message}`);
              stats.errors++;
            }
          }
        } catch (error: any) {
          console.error(`  無法載入模型 ${modelPath}: ${error.message}`);
          stats.errors += items.length;
        }
      }

      if (dryRun) {
        // 在 dry-run 模式下，不提交事務
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
  console.log('');
  console.log('='.repeat(50));
  console.log('初始化完成！');
  console.log(`  創建: ${stats.created} 筆`);
  console.log(`  更新: ${stats.updated} 筆`);
  console.log(`  跳過: ${stats.skipped} 筆`);
  if (stats.errors > 0) {
    console.log(`  錯誤: ${stats.errors} 筆`);
  }
  console.log('='.repeat(50));
}

async function main() {
  const args = process.argv.slice(2);
  
  // 過濾出非選項參數（文件路徑）
  const fileArgs = args.filter(arg => !arg.startsWith('--'));
  const clearExisting = args.includes('--clear');
  const dryRun = args.includes('--dry-run');

  // 如果沒有提供文件路徑，使用默認文件
  let jsonFile: string;
  if (fileArgs.length > 0) {
    jsonFile = path.resolve(fileArgs[0]);
  } else {
    // 使用默認文件：相對於腳本文件位置的 seed_data_example.json
    const scriptDir = __dirname;
    jsonFile = path.join(scriptDir, 'seed_data_example.json');
    
    // 如果腳本目錄中沒有，嘗試 fixtures 目錄
    if (!fs.existsSync(jsonFile)) {
      const fixturesFile = path.join(scriptDir, '..', '..', 'fixtures', 'seed_data_example.json');
      if (fs.existsSync(fixturesFile)) {
        jsonFile = fixturesFile;
      }
    }
  }

  try {
    await seedData(jsonFile, clearExisting, dryRun);
  } catch (error: any) {
    console.error('錯誤:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
