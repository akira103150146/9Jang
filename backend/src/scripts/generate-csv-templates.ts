/**
 * CSV 範本生成腳本
 * 
 * 使用方法：
 *   pnpm seed:csv:templates                        # 生成所有模型的範本
 *   pnpm seed:csv:templates --models Student,Teacher  # 只生成指定模型
 *   pnpm seed:csv:templates --empty                # 生成空白範本（不含範例）
 */

import * as path from 'path';
import { generateAllTemplates, getAvailableModels, isValidModel } from './csv/template-generator';

async function main() {
  const args = process.argv.slice(2);
  
  // 解析參數
  const modelsArg = args.find(arg => arg.startsWith('--models='));
  const empty = args.includes('--empty');
  
  // 確定輸出目錄
  const outputDir = path.join(__dirname, '..', '..', 'fixtures', 'csv', 'templates');
  
  // 確定要生成的模型
  let modelNames: string[] | undefined;
  if (modelsArg) {
    const modelsStr = modelsArg.split('=')[1];
    modelNames = modelsStr.split(',').map(m => m.trim());
    
    // 驗證模型名稱
    const invalidModels = modelNames.filter(m => !isValidModel(m));
    if (invalidModels.length > 0) {
      console.error(`錯誤: 無效的模型名稱: ${invalidModels.join(', ')}`);
      console.error(`可用的模型: ${getAvailableModels().join(', ')}`);
      process.exit(1);
    }
  }
  
  console.log('='.repeat(70));
  console.log('CSV 範本生成器');
  console.log('='.repeat(70));
  console.log('');
  console.log(`輸出目錄: ${outputDir}`);
  console.log(`包含範例: ${!empty ? '是' : '否'}`);
  if (modelNames) {
    console.log(`指定模型: ${modelNames.join(', ')}`);
  } else {
    console.log(`生成模型: 所有模型`);
  }
  console.log('');
  console.log('正在生成範本...');
  console.log('');

  try {
    const generatedFiles = await generateAllTemplates(
      outputDir,
      modelNames,
      !empty
    );

    console.log('');
    console.log('='.repeat(70));
    console.log(`✓ 成功生成 ${generatedFiles.length} 個範本檔案`);
    console.log('='.repeat(70));
    console.log('');
    console.log('下一步:');
    console.log('  1. 複製範本到 fixtures/csv/data/ 目錄');
    console.log('  2. 編輯 CSV 檔案，填入您的資料');
    console.log('  3. 執行 pnpm seed:csv 匯入資料');
    console.log('');
    console.log('範例:');
    console.log('  cp fixtures/csv/templates/Student.csv fixtures/csv/data/');
    console.log('  # 編輯 fixtures/csv/data/Student.csv');
    console.log('  pnpm seed:csv');
    console.log('');
  } catch (error: any) {
    console.error('');
    console.error('='.repeat(70));
    console.error(`✗ 生成範本失敗: ${error.message}`);
    console.error('='.repeat(70));
    process.exit(1);
  }
}

main();
