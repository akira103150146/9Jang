/**
 * CSV 範本生成器
 * 從 Prisma schema 讀取模型定義並生成 CSV 範本
 */

import * as fs from 'fs';
import * as path from 'path';
import type { ModelFieldInfo } from './types';
import { SIMPLE_MODEL_MAP } from './utils';

/**
 * 模型範例資料映射
 */
const EXAMPLE_DATA: Record<string, Record<string, any>> = {
  'Student': {
    student_id: 1,
    name: '張小明',
    school: '中山國中',
    grade: '9',
    phone: '0912345678',
    emergency_contact_name: '張爸爸',
    emergency_contact_phone: '0987654321',
    notes: '數學很好',
    user_id: '@CustomUser:username:student001',
  },
  'Teacher': {
    teacher_id: 1,
    name: '王老師',
    phone: '0912345678',
    email: 'wang@example.com',
    specialization: '數學',
    notes: '經驗豐富',
    user_id: '@CustomUser:username:teacher001',
  },
  'Course': {
    course_id: 1,
    course_name: '國三數學A班',
    subject_id: '@Subject:code:MATH_JR3',
    teacher_id: '@Teacher:teacher_id:1',
    start_time: '18:00',
    end_time: '20:00',
    day_of_week: 'Mon',
    fee_per_session: 800,
    status: 'Active',
  },
  'Subject': {
    subject_id: 1,
    code: 'MATH',
    name: '數學',
    description: '國高中數學課程',
  },
  'CustomUser': {
    username: 'student001',
    password: 'password123',
    first_name: '小明',
    last_name: '張',
    email: 'student001@example.com',
    role: 'STUDENT',
  },
  'Role': {
    id: 1,
    code: 'TEACHER',
    name: '教師',
    description: '補習班教師角色',
    is_active: true,
  },
  'AccountRole': {
    id: 1,
    code: 'TEACHER_FULL',
    name: '教師(完整權限)',
    description: '可管理學生、課程、出缺席、題庫',
    is_active: true,
  },
  'RolePermission': {
    id: 1,
    role_id: '@Role:code:TEACHER',
    permission_type: 'page',
    resource: '/courses',
    method: 'GET',
  },
  'AccountRolePermission': {
    id: 1,
    role_id: '@AccountRole:code:TEACHER_FULL',
    permission_type: 'api',
    resource: '/cramschool/students',
    method: 'GET,POST',
  },
  'AuditLog': {
    id: 1,
    user_id: '@CustomUser:username:admin001',
    action_type: 'CREATE',
    resource_type: 'Student',
    resource_id: '1',
    resource_name: '張小明',
    description: '新增學生',
    ip_address: '192.168.1.1',
  },
  'StudentEnrollment': {
    enrollment_id: 1,
    student_id: '@Student:student_id:1',
    course_id: '@Course:course_id:1',
    enroll_date: '2024-01-01',
    discount_rate: 0,
    is_active: true,
  },
  'EnrollmentPeriod': {
    period_id: 1,
    enrollment_id: '@StudentEnrollment:enrollment_id:1',
    start_date: '2024-01-01',
    end_date: '2024-06-30',
    is_active: true,
    notes: '上學期',
  },
  'ExtraFee': {
    fee_id: 1,
    student_id: '@Student:student_id:1',
    item: '講義費',
    amount: 300,
    fee_date: '2024-01-01',
    payment_status: 'Unpaid',
    notes: '數學講義',
  },
  'SessionRecord': {
    session_id: 1,
    course_id: '@Course:course_id:1',
    session_date: '2024-01-08',
  },
  'Attendance': {
    attendance_id: 1,
    session_id: '@SessionRecord:session_id:1',
    student_id: '@Student:student_id:1',
    status: 'Present',
  },
  'Leave': {
    leave_id: 1,
    student_id: '@Student:student_id:1',
    course_id: '@Course:course_id:1',
    leave_date: '2024-01-15',
    reason: '生病',
    approval_status: 'Approved',
  },
  'QuestionBank': {
    question_id: 1,
    subject_id: '@Subject:subject_id:1',
    level: '國中',
    chapter: '一元二次方程式',
    content: '{}',
    correct_answer: '{}',
    difficulty: 3,
    question_type: 'SINGLE_CHOICE',
    source: '九章自命題',
  },
  'Hashtag': {
    tag_id: 1,
    tag_name: '重要',
    creator_id: '@Teacher:teacher_id:1',
  },
  'QuestionTag': {
    question_tag_id: 1,
    question_id: '@QuestionBank:question_id:1',
    tag_id: '@Hashtag:tag_id:1',
  },
  'StudentAnswer': {
    answer_id: 1,
    student_id: '@Student:student_id:1',
    question_id: '@QuestionBank:question_id:1',
    test_name: '第一次段考',
    is_correct: false,
  },
  'ErrorLog': {
    error_log_id: 1,
    student_id: '@Student:student_id:1',
    question_id: '@QuestionBank:question_id:1',
    error_count: 1,
    review_status: 'New',
  },
  'ErrorLogImage': {
    image_id: 1,
    error_log_id: '@ErrorLog:error_log_id:1',
    image_path: '/uploads/error_logs/image1.jpg',
    caption: '錯誤解答',
    sort_order: 0,
  },
  'StudentMistakeNote': {
    note_id: 1,
    student_id: '@Student:student_id:1',
    title: '一元二次方程式錯誤',
    subject: '數學',
    content: '忘記檢查判別式',
  },
  'StudentMistakeNoteImage': {
    image_id: 1,
    note_id: '@StudentMistakeNote:note_id:1',
    image_path: '/uploads/mistake_notes/image1.jpg',
    caption: '錯題照片',
    sort_order: 0,
  },
  'Restaurant': {
    restaurant_id: 1,
    name: '便當店',
    phone: '02-12345678',
    address: '台北市某某路123號',
    is_active: true,
  },
  'GroupOrder': {
    group_order_id: 1,
    restaurant_id: '@Restaurant:restaurant_id:1',
    title: '週一午餐團購',
    order_link: 'lunch-order-20240108',
    status: 'Open',
    deadline: '2024-01-08 10:00:00',
  },
  'Order': {
    order_id: 1,
    group_order_id: '@GroupOrder:group_order_id:1',
    student_id: '@Student:student_id:1',
    status: 'Pending',
    total_amount: 80,
    notes: '不要蔥',
  },
  'OrderItem': {
    order_item_id: 1,
    order_id: '@Order:order_id:1',
    item_name: '排骨便當',
    quantity: 1,
    unit_price: 80,
    subtotal: 80,
  },
  'StudentGroup': {
    group_id: 1,
    name: '資優班',
    description: '數學資優學生群組',
    group_type: 'teaching',
  },
  'StudentGroupStudent': {
    id: 1,
    group_id: '@StudentGroup:group_id:1',
    student_id: '@Student:student_id:1',
  },
  'ContentTemplate': {
    template_id: 1,
    title: '數學講義模板',
    structure: '[]',
    is_public: true,
  },
  'ContentTemplateTag': {
    id: 1,
    template_id: '@ContentTemplate:template_id:1',
    tag_id: '@Hashtag:tag_id:1',
  },
  'LearningResource': {
    resource_id: 1,
    title: '一元二次方程式講義',
    mode: 'HANDOUT',
    structure: '[]',
    settings: '{}',
    is_individualized: false,
  },
  'LearningResourceCourse': {
    id: 1,
    resource_id: '@LearningResource:resource_id:1',
    course_id: '@Course:course_id:1',
  },
  'LearningResourceStudentGroup': {
    id: 1,
    resource_id: '@LearningResource:resource_id:1',
    group_id: '@StudentGroup:group_id:1',
  },
  'LearningResourceTag': {
    id: 1,
    resource_id: '@LearningResource:resource_id:1',
    tag_id: '@Hashtag:tag_id:1',
  },
  'CoursePdf': {
    pdf_id: 1,
    title: '數學講義PDF',
    description: '第一章講義',
    file_path: '/uploads/pdfs/math_chapter1.pdf',
    file_size: 1024000,
    course_id: '@Course:course_id:1',
    uploaded_by_id: 1,
    allow_download: true,
    is_visible_to_all: false,
    is_active: true,
  },
  'CoursePdfStudentGroup': {
    id: 1,
    pdf_id: '@CoursePdf:pdf_id:1',
    group_id: '@StudentGroup:group_id:1',
  },
};

/**
 * 從模型名稱獲取基本欄位資訊
 * 注意：這是簡化版本，實際應該從 Prisma schema 解析
 */
function getModelFields(modelName: string): ModelFieldInfo[] {
  const prismaModelName = SIMPLE_MODEL_MAP[modelName];
  if (!prismaModelName) {
    return [];
  }

  // 這裡返回基本欄位結構
  // 實際使用時，應該從 Prisma schema 或 Prisma Client 的型別資訊中提取
  const fields: ModelFieldInfo[] = [];
  
  // 從範例資料中提取欄位
  const exampleData = EXAMPLE_DATA[modelName];
  if (exampleData) {
    Object.keys(exampleData).forEach(snakeName => {
      fields.push({
        name: snakeName.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()),
        snakeName,
        type: 'string',
        required: false,
        isForeignKey: snakeName.endsWith('_id'),
        referencedModel: undefined,
      });
    });
  }

  return fields;
}

/**
 * 生成 CSV header
 */
function generateCsvHeader(fields: ModelFieldInfo[]): string {
  return fields.map(f => f.snakeName).join(',');
}

/**
 * 生成範例資料行
 */
function generateExampleRow(modelName: string, fields: ModelFieldInfo[]): string {
  const exampleData = EXAMPLE_DATA[modelName];
  if (!exampleData) {
    // 如果沒有範例資料，生成空行
    return fields.map(() => '').join(',');
  }

  return fields.map(f => {
    const value = exampleData[f.snakeName];
    if (value === null || value === undefined) {
      return '';
    }
    // 如果值包含逗號或引號，需要用引號包圍
    const strValue = String(value);
    if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
      return `"${strValue.replace(/"/g, '""')}"`;
    }
    return strValue;
  }).join(',');
}

/**
 * 生成 CSV 範本內容
 */
export function generateCsvTemplate(
  modelName: string,
  includeExample: boolean = true
): string {
  const fields = getModelFields(modelName);
  if (fields.length === 0) {
    throw new Error(`無法獲取模型 ${modelName} 的欄位資訊`);
  }

  const lines: string[] = [];

  // 添加註解
  lines.push(`# ${modelName}.csv`);
  lines.push('# 外鍵引用格式: @ModelName:field_name:value');
  lines.push('# 範例: user_id,@CustomUser:username:student001');
  lines.push('');

  // 添加 header
  lines.push(generateCsvHeader(fields));

  // 添加範例資料行（如果需要）
  if (includeExample) {
    lines.push(generateExampleRow(modelName, fields));
    // 添加第二行範例（修改一些值）
    const secondExample = generateExampleRow(modelName, fields)
      .replace(/001/g, '002')
      .replace(/張小明/g, '李小華')
      .replace(/王老師/g, '李老師')
      .replace(/A班/g, 'B班')
      .replace(/1,/g, '2,');
    lines.push(secondExample);
  }

  return lines.join('\n') + '\n';
}

/**
 * 生成所有模型的 CSV 範本
 */
export async function generateAllTemplates(
  outputDir: string,
  modelNames?: string[],
  includeExample: boolean = true
): Promise<string[]> {
  // 確保輸出目錄存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 獲取要生成的模型列表
  const modelsToGenerate = modelNames || Object.keys(SIMPLE_MODEL_MAP);
  const generatedFiles: string[] = [];

  for (const modelName of modelsToGenerate) {
    try {
      // 生成範本內容
      const content = generateCsvTemplate(modelName, includeExample);
      
      // 寫入檔案
      const fileName = `${modelName}.csv`;
      const filePath = path.join(outputDir, fileName);
      fs.writeFileSync(filePath, content, 'utf-8');
      
      generatedFiles.push(fileName);
      console.log(`✓ 已生成: ${fileName}`);
    } catch (error: any) {
      console.error(`✗ 生成 ${modelName} 失敗: ${error.message}`);
    }
  }

  return generatedFiles;
}

/**
 * 生成單個模型的 CSV 範本檔案
 */
export async function generateTemplate(
  outputDir: string,
  modelName: string,
  includeExample: boolean = true
): Promise<string> {
  // 確保輸出目錄存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 生成範本內容
  const content = generateCsvTemplate(modelName, includeExample);
  
  // 寫入檔案
  const fileName = `${modelName}.csv`;
  const filePath = path.join(outputDir, fileName);
  fs.writeFileSync(filePath, content, 'utf-8');
  
  console.log(`✓ 已生成: ${fileName}`);
  return fileName;
}

/**
 * 獲取所有可用的模型名稱
 */
export function getAvailableModels(): string[] {
  return Object.keys(SIMPLE_MODEL_MAP);
}

/**
 * 檢查模型是否存在
 */
export function isValidModel(modelName: string): boolean {
  return modelName in SIMPLE_MODEL_MAP;
}
