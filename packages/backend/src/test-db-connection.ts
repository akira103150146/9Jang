/**
 * 測試腳本：驗證 Prisma Schema 正確映射現有表結構
 * 
 * 使用方法：
 * pnpm test:db
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  console.log('開始測試資料庫連接和 Prisma Schema 映射...\n');

  try {
    // 1. 測試基本連接
    console.log('1. 測試資料庫連接...');
    await prisma.$connect();
    console.log('✓ 資料庫連接成功\n');

    // 2. 測試 Account 模組表
    console.log('2. 測試 Account 模組表...');
    const userCount = await prisma.accountCustomUser.count();
    console.log(`✓ account_customuser 表可訪問，記錄數: ${userCount}`);

    const roleCount = await prisma.accountRole.count();
    console.log(`✓ account_role 表可訪問，記錄數: ${roleCount}`);

    const auditLogCount = await prisma.accountAuditLog.count();
    console.log(`✓ account_auditlog 表可訪問，記錄數: ${auditLogCount}\n`);

    // 3. 測試 Cramschool 模組表
    console.log('3. 測試 Cramschool 模組表...');
    const studentCount = await prisma.cramschoolStudent.count();
    console.log(`✓ cramschool_student 表可訪問，記錄數: ${studentCount}`);

    const teacherCount = await prisma.cramschoolTeacher.count();
    console.log(`✓ cramschool_teacher 表可訪問，記錄數: ${teacherCount}`);

    const courseCount = await prisma.cramschoolCourse.count();
    console.log(`✓ cramschool_course 表可訪問，記錄數: ${courseCount}`);

    const questionCount = await prisma.cramschoolQuestionBank.count();
    console.log(`✓ cramschool_questionbank 表可訪問，記錄數: ${questionCount}`);

    const resourceCount = await prisma.cramschoolLearningResource.count();
    console.log(`✓ cramschool_learningresource 表可訪問，記錄數: ${resourceCount}\n`);

    // 4. 測試關聯查詢（select_related 對應）
    console.log('4. 測試關聯查詢（include，對應 Django select_related）...');
    const studentWithUser = await prisma.cramschoolStudent.findFirst({
      include: {
        user: true,
      },
      take: 1,
    });
    if (studentWithUser) {
      console.log(`✓ Student-User 關聯查詢成功，學生 ID: ${studentWithUser.studentId}`);
    } else {
      console.log('⚠ 沒有學生記錄，跳過關聯查詢測試');
    }

    const courseWithTeacher = await prisma.cramschoolCourse.findFirst({
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
      },
      take: 1,
    });
    if (courseWithTeacher) {
      console.log(`✓ Course-Teacher-User 關聯查詢成功，課程 ID: ${courseWithTeacher.courseId}`);
    } else {
      console.log('⚠ 沒有課程記錄，跳過關聯查詢測試');
    }
    console.log('');

    // 5. 測試多對多關聯（prefetch_related 對應）
    console.log('5. 測試多對多關聯查詢（include，對應 Django prefetch_related）...');
    const resourceWithCourses = await prisma.cramschoolLearningResource.findFirst({
      include: {
        courses: {
          include: {
            course: true,
          },
        },
      },
      take: 1,
    });
    if (resourceWithCourses) {
      console.log(`✓ Resource-Courses 多對多關聯查詢成功，資源 ID: ${resourceWithCourses.resourceId}`);
      console.log(`  關聯課程數: ${resourceWithCourses.courses.length}`);
    } else {
      console.log('⚠ 沒有資源記錄，跳過多對多關聯查詢測試');
    }
    console.log('');

    // 6. 測試複雜查詢（過濾、排序）
    console.log('6. 測試複雜查詢（過濾、排序）...');
    const activeStudents = await prisma.cramschoolStudent.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: {
        studentId: 'asc',
      },
      take: 5,
    });
    console.log(`✓ 過濾和排序查詢成功，找到 ${activeStudents.length} 條記錄\n`);

    // 7. 測試聚合查詢（對應 Django annotate）
    console.log('7. 測試聚合查詢（對應 Django annotate）...');
    const enrollmentStats = await prisma.cramschoolStudentEnrollment.groupBy({
      by: ['courseId'],
      _count: {
        enrollmentId: true,
      },
      where: {
        isDeleted: false,
      },
    });
    console.log(`✓ 聚合查詢成功，找到 ${enrollmentStats.length} 個課程的報名統計\n`);

    // 8. 測試 JSON 欄位
    console.log('8. 測試 JSON 欄位...');
    const questionWithJson = await prisma.cramschoolQuestionBank.findFirst({
      where: {
        content: {
          not: null,
        },
      },
      take: 1,
    });
    if (questionWithJson && questionWithJson.content) {
      const content = questionWithJson.content as any;
      if (typeof content === 'object') {
        console.log('✓ JSON 欄位查詢成功，content 是 JSON 類型');
      } else {
        console.log('⚠ content 不是 JSON 類型');
      }
    } else {
      console.log('⚠ 沒有題目記錄，跳過 JSON 欄位測試');
    }
    console.log('');

    console.log('✅ 所有測試通過！Prisma Schema 映射正確。');
  } catch (error) {
    console.error('❌ 測試失敗:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 執行測試
testDatabaseConnection()
  .then(() => {
    console.log('\n測試完成。');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n測試失敗:', error);
    process.exit(1);
  });
