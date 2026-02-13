/**
 * 依賴關係分析器
 * 從 Prisma schema 分析模型之間的外鍵依賴關係
 */

import * as fs from 'fs';
import * as path from 'path';
import type { PrismaModelName } from './types';
import { SIMPLE_MODEL_MAP } from './utils';

export interface ModelDependency {
  modelName: string;
  prismaModelName: PrismaModelName;
  dependsOn: string[]; // 依賴的模型名稱（簡化名稱）
}

/**
 * 從 Prisma schema 檔案中提取模型依賴關係
 */
export function analyzeDependencies(schemaPath: string): Map<string, ModelDependency> {
  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  const dependencies = new Map<string, ModelDependency>();

  // 解析每個模型
  const modelRegex = /model\s+(\w+)\s*\{([^}]+)\}/g;
  let modelMatch;

  while ((modelMatch = modelRegex.exec(schemaContent)) !== null) {
    const prismaModelNameStr = modelMatch[1];
    const modelBody = modelMatch[2];

    // 找到對應的簡化名稱
    const simpleName = findSimpleNameByPrismaName(prismaModelNameStr);
    if (!simpleName) {
      // 如果找不到對應的簡化名稱，跳過（可能是內部模型）
      continue;
    }

    // 提取外鍵欄位
    const dependsOn = extractForeignKeys(modelBody);

    const prismaModelName = SIMPLE_MODEL_MAP[simpleName];
    dependencies.set(simpleName, {
      modelName: simpleName,
      prismaModelName,
      dependsOn,
    });
  }

  return dependencies;
}

/**
 * 從 Prisma 模型名稱找到簡化名稱
 * Prisma schema 中的模型名稱是 PascalCase (例如: CramschoolStudent)
 * SIMPLE_MODEL_MAP 中的值是 camelCase (例如: cramschoolStudent)
 */
function findSimpleNameByPrismaName(prismaModelName: string): string | null {
  // 將 PascalCase 轉換為 camelCase
  const camelCaseName = prismaModelName.charAt(0).toLowerCase() + prismaModelName.slice(1);
  
  for (const [simpleName, prismaName] of Object.entries(SIMPLE_MODEL_MAP)) {
    if (String(prismaName) === camelCaseName) {
      return simpleName;
    }
  }
  return null;
}

/**
 * 從模型定義中提取外鍵依賴
 */
function extractForeignKeys(modelBody: string): string[] {
  const dependencies = new Set<string>();

  // 匹配關聯欄位：modelName ModelType? @relation(...)
  // 例如：subject CramschoolSubject @relation(fields: [subjectId], references: [subjectId])
  // 或：user AccountCustomUser? @relation(fields: [userId], references: [id])
  const relationRegex = /(\w+)\s+(\w+)\??(\[\])?\s+@relation\([^)]*fields:\s*\[(\w+)\][^)]*\)/g;
  let relationMatch;

  while ((relationMatch = relationRegex.exec(modelBody)) !== null) {
    const referencedPrismaModel = relationMatch[2];
    
    // 找到被引用模型的簡化名稱
    const referencedSimpleName = findSimpleNameByPrismaName(referencedPrismaModel);
    if (referencedSimpleName) {
      dependencies.add(referencedSimpleName);
    }
  }

  return Array.from(dependencies);
}

/**
 * 拓撲排序
 * 將模型按照依賴關係排序，確保被依賴的模型先處理
 */
export function topologicalSort(dependencies: Map<string, ModelDependency>): string[] {
  const sorted: string[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function visit(modelName: string, path: string[] = []): void {
    // 檢測循環依賴
    if (visiting.has(modelName)) {
      const cycle = [...path, modelName].join(' → ');
      throw new Error(`偵測到循環依賴: ${cycle}`);
    }

    // 已經訪問過，跳過
    if (visited.has(modelName)) {
      return;
    }

    const dependency = dependencies.get(modelName);
    if (!dependency) {
      // 模型不在依賴圖中，可能沒有對應的 CSV 檔案
      return;
    }

    visiting.add(modelName);

    // 先訪問所有依賴
    for (const dep of dependency.dependsOn) {
      visit(dep, [...path, modelName]);
    }

    visiting.delete(modelName);
    visited.add(modelName);
    sorted.push(modelName);
  }

  // 訪問所有模型
  for (const modelName of dependencies.keys()) {
    if (!visited.has(modelName)) {
      visit(modelName);
    }
  }

  return sorted;
}

/**
 * 根據依賴關係排序模型名稱列表
 */
export function sortModelsByDependencies(
  modelNames: string[],
  schemaPath: string
): string[] {
  // 分析依賴關係
  const allDependencies = analyzeDependencies(schemaPath);

  // 只保留需要處理的模型
  const relevantDependencies = new Map<string, ModelDependency>();
  for (const modelName of modelNames) {
    const dep = allDependencies.get(modelName);
    if (dep) {
      // 只保留在 modelNames 中的依賴
      const filteredDeps = dep.dependsOn.filter(d => modelNames.includes(d));
      relevantDependencies.set(modelName, {
        ...dep,
        dependsOn: filteredDeps,
      });
    }
  }

  // 拓撲排序
  try {
    return topologicalSort(relevantDependencies);
  } catch (error: any) {
    console.warn(`警告: ${error.message}`);
    console.warn('將使用原始順序');
    return modelNames;
  }
}

/**
 * 獲取預設的 Prisma schema 路徑
 */
export function getDefaultSchemaPath(): string {
  return path.join(__dirname, '..', '..', '..', 'prisma', 'schema.prisma');
}

/**
 * 顯示依賴關係圖（用於除錯）
 */
export function printDependencyGraph(dependencies: Map<string, ModelDependency>): void {
  console.log('\n依賴關係圖:');
  console.log('='.repeat(50));
  
  for (const [modelName, dep] of dependencies.entries()) {
    if (dep.dependsOn.length === 0) {
      console.log(`${modelName} (無依賴)`);
    } else {
      console.log(`${modelName} → ${dep.dependsOn.join(', ')}`);
    }
  }
  
  console.log('='.repeat(50));
  console.log('');
}
