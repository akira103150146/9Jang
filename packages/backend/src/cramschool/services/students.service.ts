import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateStudentDto,
  UpdateStudentDto,
  StudentQuery,
  Student,
} from '@9jang/shared';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async getStudents(query: StudentQuery, userId: number, userRole: string) {
    const page = query.page || 1;
    const pageSize = query.page_size || 10;
    const skip = (page - 1) * pageSize;

    // 構建 where 條件
    const where: any = {};

    // 角色過濾
    if (userRole === 'TEACHER') {
      // 老師：只能看到上過自己課程的學生
      const teacher = await this.prisma.cramschoolTeacher.findFirst({
        where: { userId },
      });

      if (!teacher) {
        return createPaginatedResponse([], 0, page, pageSize);
      }

      const teacherCourses = await this.prisma.cramschoolCourse.findMany({
        where: { teacherId: teacher.teacherId },
        select: { courseId: true },
      });

      const courseIds = teacherCourses.map((c) => c.courseId);
      const enrollments = await this.prisma.cramschoolStudentEnrollment.findMany({
        where: {
          courseId: { in: courseIds },
          isDeleted: false,
        },
        select: { studentId: true },
        distinct: ['studentId'],
      });

      const studentIds = enrollments.map((e) => e.studentId);
      where.studentId = { in: studentIds };
    } else if (userRole === 'STUDENT') {
      // 學生：只能看到自己
      const student = await this.prisma.cramschoolStudent.findFirst({
        where: { userId },
      });

      if (!student) {
        return createPaginatedResponse([], 0, page, pageSize);
      }

      where.studentId = student.studentId;
    }

    // 軟刪除過濾
    if (!query.include_deleted) {
      where.isDeleted = false;
    }

    // 姓名搜尋
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    // 學校搜尋
    if (query.school) {
      where.school = { contains: query.school, mode: 'insensitive' };
    }

    // 年級搜尋
    if (query.grade) {
      where.grade = query.grade;
    }

    // 注意：電話搜尋可以通過 search 參數實現
    // StudentQuery 中不包含 phone 字段，使用 search 參數進行模糊搜尋

    // 標籤篩選
    if (query.tag) {
      const tagId = parseInt(query.tag);
      if (!isNaN(tagId)) {
        const studentsInGroup = await this.prisma.cramschoolStudentGroupStudent.findMany({
          where: { groupId: tagId },
          select: { studentId: true },
        });
        const studentIds = studentsInGroup.map((s) => s.studentId);
        where.studentId = where.studentId
          ? { in: studentIds.filter((id) => (where.studentId as any).in?.includes(id) || true) }
          : { in: studentIds };
      }
    }

    // 課程篩選
    if (query.course) {
      const courseId = parseInt(query.course);
      if (!isNaN(courseId)) {
        const enrollments = await this.prisma.cramschoolStudentEnrollment.findMany({
          where: {
            courseId,
            isDeleted: false,
          },
          select: { studentId: true },
        });
        const studentIds = enrollments.map((e) => e.studentId);
        where.studentId = where.studentId
          ? { in: studentIds.filter((id) => (where.studentId as any).in?.includes(id) || true) }
          : { in: studentIds };
      }
    }

    // 待繳學費篩選
    if (query.has_unpaid_fees === 'yes') {
      // 需要計算未繳費用
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
      });
      const studentIds = studentsWithUnpaid.map((s) => s.studentId);
      where.studentId = where.studentId
        ? { in: studentIds.filter((id) => (where.studentId as any).in?.includes(id) || true) }
        : { in: studentIds };
    } else if (query.has_unpaid_fees === 'no') {
      // 沒有未繳費用的學生
      const studentsWithUnpaid = await this.prisma.cramschoolExtraFee.groupBy({
        by: ['studentId'],
        where: {
          isDeleted: false,
          paymentStatus: 'Unpaid',
        },
      });
      const unpaidStudentIds = studentsWithUnpaid.map((s) => s.studentId);
      // 這裡需要更複雜的邏輯，暫時跳過
    }

    // 查詢學生
    const [results, count] = await Promise.all([
      this.prisma.cramschoolStudent.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          user: true,
          enrollments: {
            where: { isDeleted: false },
            include: {
              course: true,
              periods: {
                where: { isActive: true },
                orderBy: { startDate: 'asc' },
              },
            },
          },
          extraFees: {
            where: { isDeleted: false },
          },
          studentGroups: {
            include: {
              group: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.cramschoolStudent.count({ where }),
    ]);

    // 計算總費用和未繳費用
    const studentsWithStats = await Promise.all(
      results.map(async (student) => {
        const [totalFees, unpaidFees] = await Promise.all([
          this.prisma.cramschoolExtraFee.aggregate({
            where: {
              studentId: student.studentId,
              isDeleted: false,
            },
            _sum: { amount: true },
          }),
          this.prisma.cramschoolExtraFee.aggregate({
            where: {
              studentId: student.studentId,
              isDeleted: false,
              paymentStatus: 'Unpaid',
            },
            _sum: { amount: true },
          }),
        ]);

        return {
          ...this.toStudentDto(student),
          total_fees: Number(totalFees._sum.amount || 0),
          unpaid_fees: Number(unpaidFees._sum.amount || 0),
          enrollments_count: student.enrollments.length,
        };
      }),
    );

    return createPaginatedResponse(studentsWithStats, count, page, pageSize);
  }

  async getStudent(id: number): Promise<Student> {
    const student = await this.prisma.cramschoolStudent.findUnique({
      where: { studentId: id },
      include: {
        user: true,
        enrollments: {
          where: { isDeleted: false },
          include: {
            course: true,
            periods: {
              where: { isActive: true },
            },
          },
        },
        extraFees: {
          where: { isDeleted: false },
        },
        studentGroups: {
          include: {
            group: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return this.toStudentDto(student);
  }

  async createStudent(createDto: CreateStudentDto, userId: number, userRole: string): Promise<Student> {
    // 只有管理員或會計可以創建學生
    if (userRole !== 'ADMIN' && userRole !== 'ACCOUNTANT') {
      throw new ForbiddenException('只有管理員或會計可以創建學生');
    }

    // 創建學生
    const student = await this.prisma.cramschoolStudent.create({
      data: {
        name: createDto.name,
        school: createDto.school,
        grade: createDto.grade,
        phone: createDto.phone || null,
        emergencyContactName: createDto.emergency_contact_name || null,
        emergencyContactPhone: createDto.emergency_contact_phone || null,
        notes: createDto.notes || null,
        initialPassword: createDto.initial_password || null,
      },
    });

    // 如果提供了 initial_password，創建用戶帳號
    if (createDto.initial_password) {
      const username = `student_${student.studentId}`;
      const email = `${username}@student.local`;
      const hashedPassword = await require('bcrypt').hash(createDto.initial_password, 10);

      const user = await this.prisma.accountCustomUser.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role: 'STUDENT',
          firstName: createDto.name,
          isActive: true,
          mustChangePassword: false,
        },
      });

      await this.prisma.cramschoolStudent.update({
        where: { studentId: student.studentId },
        data: { userId: user.id },
      });
    }

    return this.getStudent(student.studentId);
  }

  async updateStudent(id: number, updateDto: UpdateStudentDto): Promise<Student> {
    const student = await this.prisma.cramschoolStudent.findUnique({
      where: { studentId: id },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    await this.prisma.cramschoolStudent.update({
      where: { studentId: id },
      data: {
        name: updateDto.name,
        school: updateDto.school,
        grade: updateDto.grade,
        phone: updateDto.phone,
        emergencyContactName: updateDto.emergency_contact_name,
        emergencyContactPhone: updateDto.emergency_contact_phone,
        notes: updateDto.notes,
      },
    });

    return this.getStudent(id);
  }

  async deleteStudent(id: number): Promise<void> {
    const student = await this.prisma.cramschoolStudent.findUnique({
      where: { studentId: id },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    // 軟刪除
    await this.prisma.cramschoolStudent.update({
      where: { studentId: id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    // 軟刪除相關記錄
    await Promise.all([
      this.prisma.cramschoolStudentEnrollment.updateMany({
        where: { studentId: id, isDeleted: false },
        data: { isDeleted: true, deletedAt: new Date() },
      }),
      this.prisma.cramschoolExtraFee.updateMany({
        where: { studentId: id, isDeleted: false },
        data: { isDeleted: true, deletedAt: new Date() },
      }),
      this.prisma.cramschoolAttendance.updateMany({
        where: { studentId: id, isDeleted: false },
        data: { isDeleted: true, deletedAt: new Date() },
      }),
      this.prisma.cramschoolLeave.updateMany({
        where: { studentId: id, isDeleted: false },
        data: { isDeleted: true, deletedAt: new Date() },
      }),
    ]);
  }

  private toStudentDto(student: any): Student {
    return {
      student_id: student.studentId,
      name: student.name,
      school: student.school,
      grade: student.grade,
      phone: student.phone,
      emergency_contact_name: student.emergencyContactName,
      emergency_contact_phone: student.emergencyContactPhone,
      notes: student.notes,
      is_deleted: student.isDeleted,
      deleted_at: student.deletedAt?.toISOString() || null,
      user_id: student.userId,
      initial_password: student.initialPassword,
    };
  }
}
