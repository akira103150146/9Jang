/**
 * Students Query Service
 * 處理學生查詢和篩選邏輯
 */

import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { StudentQuery } from '@9jang/shared'

@Injectable()
export class StudentsQueryService {
  constructor(private prisma: PrismaService) {}

  /**
   * 構建查詢條件
   */
  async buildWhereClause(query: StudentQuery, userId: number, userRole: string): Promise<any> {
    const where: any = {}

    // 角色過濾
    if (userRole === 'TEACHER') {
      // 老師：只能看到上過自己課程的學生
      const teacher = await this.prisma.cramschoolTeacher.findFirst({
        where: { userId },
      })

      if (!teacher) {
        return { _empty: true } // 返回空條件
      }

      const teacherCourses = await this.prisma.cramschoolCourse.findMany({
        where: { teacherId: teacher.teacherId },
        select: { courseId: true },
      })

      const courseIds = teacherCourses.map((c) => c.courseId)
      const enrollments = await this.prisma.cramschoolStudentEnrollment.findMany({
        where: {
          courseId: { in: courseIds },
          isDeleted: false,
        },
        select: { studentId: true },
        distinct: ['studentId'],
      })

      const studentIds = enrollments.map((e) => e.studentId)
      where.studentId = { in: studentIds }
    } else if (userRole === 'STUDENT') {
      // 學生：只能看到自己
      const student = await this.prisma.cramschoolStudent.findFirst({
        where: { userId },
      })

      if (!student) {
        return { _empty: true } // 返回空條件
      }

      where.studentId = student.studentId
    }

    // 軟刪除過濾
    if (!query.include_deleted) {
      where.isDeleted = false
    }

    // 姓名搜尋
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' }
    }

    // 學校搜尋
    if (query.school) {
      where.school = { contains: query.school, mode: 'insensitive' }
    }

    // 年級搜尋
    if (query.grade) {
      where.grade = query.grade
    }

    // 標籤篩選
    if (query.tag) {
      const tagId = parseInt(query.tag)
      if (!isNaN(tagId)) {
        const studentsInGroup = await this.prisma.cramschoolStudentGroupStudent.findMany({
          where: { groupId: tagId },
          select: { studentId: true },
        })
        const studentIds = studentsInGroup.map((s) => s.studentId)
        where.studentId = where.studentId
          ? { in: studentIds.filter((id) => (where.studentId as any).in?.includes(id) || true) }
          : { in: studentIds }
      }
    }

    // 課程篩選
    if (query.course) {
      const courseId = parseInt(query.course)
      if (!isNaN(courseId)) {
        const enrollments = await this.prisma.cramschoolStudentEnrollment.findMany({
          where: {
            courseId,
            isDeleted: false,
          },
          select: { studentId: true },
        })
        const studentIds = enrollments.map((e) => e.studentId)
        where.studentId = where.studentId
          ? { in: studentIds.filter((id) => (where.studentId as any).in?.includes(id) || true) }
          : { in: studentIds }
      }
    }

    // 待繳學費篩選
    if (query.has_unpaid_fees === 'yes') {
      const studentsWithUnpaid = await this.prisma.cramschoolExtraFee.groupBy({
        by: ['studentId'],
        where: {
          isDeleted: false,
          paymentStatus: 'Unpaid',
        },
        having: {
          studentId: {
            _count: { gt: 0 },
          },
        },
      })
      const studentIds = studentsWithUnpaid.map((s) => s.studentId)
      where.studentId = where.studentId
        ? { in: studentIds.filter((id) => (where.studentId as any).in?.includes(id) || true) }
        : { in: studentIds }
    }

    return where
  }

  /**
   * 處理空條件（當查詢結果為空時）
   */
  isEmptyCondition(where: any): boolean {
    return where._empty === true
  }
}
