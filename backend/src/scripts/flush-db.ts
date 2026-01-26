/**
 * 清空資料庫腳本
 * 
 * 使用方法：
 *   pnpm flush:db
 *   pnpm flush:db --noinput
 *   pnpm flush:db --keep-auth
 */

import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';

const prisma = new PrismaClient();

// 根據外鍵依賴關係排序模型（拓撲排序）
// 先刪除子模型（有外鍵指向父模型的），最後刪除父模型
const DELETE_ORDER = [
  // 多對多關聯表（先刪除）
  'cramschoolQuestionTag',
  'cramschoolContentTemplateTag',
  'cramschoolLearningResourceTag',
  'cramschoolLearningResourceCourse',
  'cramschoolLearningResourceStudentGroup',
  'cramschoolStudentGroupStudent',
  'cramschoolOrderItem',
  
  // 依賴其他模型的子模型
  'cramschoolOrder',
  'cramschoolGroupOrder',
  'cramschoolStudentAnswer',
  'cramschoolErrorLog',
  'cramschoolErrorLogImage',
  'cramschoolStudentMistakeNoteImage',
  'cramschoolStudentMistakeNote',
  'cramschoolAttendance',
  'cramschoolSessionRecord',
  'cramschoolLeave',
  'cramschoolEnrollmentPeriod',
  'cramschoolStudentEnrollment',
  'cramschoolExtraFee',
  'cramschoolQuestionBank',
  'cramschoolLearningResource',
  'cramschoolContentTemplate',
  'cramschoolCourse',
  'cramschoolStudent',
  'cramschoolTeacher',
  'cramschoolSubject',
  'cramschoolHashtag',
  'cramschoolRestaurant',
  'cramschoolStudentGroup',
  
  // Account 模組（最後刪除，因為被其他模型引用）
  'accountRolePermission',
  'accountAuditLog',
  'accountCustomUser',
  'accountRole',
] as const;

interface DeleteStats {
  modelName: string;
  count: number;
}

async function askConfirmation(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(message, (answer) => {
      rl.close();
      resolve(answer === 'YES');
    });
  });
}

async function deleteModel(
  modelName: keyof PrismaClient,
  keepAuth: boolean
): Promise<number> {
  // 如果保留認證資料，跳過 account 模組
  if (keepAuth && String(modelName).startsWith('account')) {
    return 0;
  }

  try {
    const model = prisma[modelName] as any;
    if (!model || typeof model.deleteMany !== 'function') {
      console.warn(`⚠️  跳過不支援的模型: ${String(modelName)}`);
      return 0;
    }

    const count = await model.count();
    if (count > 0) {
      await model.deleteMany({});
      console.log(`✓ ${String(modelName)}: 已刪除 ${count} 筆記錄`);
      return count;
    }
    return 0;
  } catch (error: any) {
    console.error(`✗ 刪除 ${String(modelName)} 時發生錯誤: ${error.message}`);
    throw error;
  }
}

async function flushDatabase(noinput: boolean, keepAuth: boolean) {
  console.log('='.repeat(70));
  console.log('警告：此操作將清空以下模型的所有資料：');
  
  if (keepAuth) {
    console.log('（將保留 account 模組的資料）');
  }
  
  console.log('='.repeat(70));
  console.log('');

  // 顯示將要刪除的模型
  const modelsToDelete = keepAuth
    ? DELETE_ORDER.filter((m) => !m.startsWith('account'))
    : DELETE_ORDER;

  for (const modelName of modelsToDelete) {
    const model = prisma[modelName] as any;
    if (model && typeof model.count === 'function') {
      const count = await model.count();
      if (count > 0) {
        console.log(`  - ${modelName}: ${count} 筆記錄`);
      }
    }
  }

  console.log('');
  console.log('='.repeat(70));

  // 確認操作
  if (!noinput) {
    const confirmed = await askConfirmation(
      '\n確定要清空資料庫嗎？此操作無法復原！\n輸入 "YES" 確認，或按 Enter 取消: '
    );
    
    if (!confirmed) {
      console.log('操作已取消');
      return;
    }
  }

  const stats: DeleteStats[] = [];
  let totalDeleted = 0;

  try {
    // 使用事務確保原子性
    await prisma.$transaction(async (tx) => {
      for (const modelName of modelsToDelete) {
        const count = await deleteModel(modelName as keyof PrismaClient, keepAuth);
        if (count > 0) {
          stats.push({ modelName, count });
          totalDeleted += count;
        }
      }
    }, {
      timeout: 60000, // 60 秒超時
    });

    console.log('');
    console.log('='.repeat(70));
    console.log(`✓ 資料庫清空完成！共刪除 ${totalDeleted} 筆記錄`);
    console.log('='.repeat(70));
  } catch (error: any) {
    console.error('');
    console.error('='.repeat(70));
    console.error(`✗ 清空資料庫時發生錯誤: ${error.message}`);
    console.error('='.repeat(70));
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const noinput = args.includes('--noinput') || args.includes('--no-input');
  const keepAuth = args.includes('--keep-auth');

  try {
    await flushDatabase(noinput, keepAuth);
  } catch (error: any) {
    console.error('錯誤:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
