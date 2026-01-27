/**
 * Students Core Service
 * 核心 CRUD 操作
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  CreateStudentDto,
  UpdateStudentDto,
  StudentQuery,
  Student,
} from '@9jang/shared';
import { createPaginatedResponse } from '../../../common/utils/pagination.util';
import { StudentsQueryService } from './students-query.service';
import { StudentsFeeService } from './students-fee.service';
import { StudentsPermissionService } from './students-permission.service';
import { StudentsStatsService } from './students-stats.service';

@Injectable()
export class StudentsService {
  constructor(
    private prisma: PrismaService,
    private queryService: StudentsQueryService,
    private feeService: StudentsFeeService,
    private permissionService: StudentsPermissionService,
    private statsService: StudentsStatsService,
  ) {}

  async getStudents(query: StudentQuery, userId: number, userRole: string) {
    const page = query.page || 1;
    const pageSize = query.page_size || 10;
    const skip = (page - 1) * pageSize;

    // 使用 QueryService 構建 where 條件
    const where = await this.queryService.buildWhereClause(query, userId, userRole);

    // 如果是空條件，直接返回空結果
    if (this.queryService.isEmptyCondition(where)) {
      return createPaginatedResponse([], 0, page, pageSize);
    }

    // 移除內部標記
    delete where._empty;

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

    // 使用 StatsService 計算統計信息
    const studentsWithStats = await Promise.all(
      results.map(async (student) => {
        const stats = await this.statsService.calculateStudentStats(student);

        return {
          ...this.toStudentDto(student),
          ...stats,
          student_groups: student.studentGroups?.map((sg: any) => ({
            group_id: sg.group.groupId,
            name: sg.group.name,
            description: sg.group.description,
            group_type: sg.group.groupType,
          })) || [],
          enrollments: student.enrollments.map((e: any) => ({
            enrollment_id: e.enrollmentId,
            course_id: e.courseId,
            course_name: e.course.courseName,
            enroll_date: e.enrollDate.toISOString().split('T')[0],
            discount_rate: Number(e.discountRate),
            is_active: e.isActive,
          })),
        };
      }),
    );

    return createPaginatedResponse(studentsWithStats, count, page, pageSize);
  }

  async getStudent(id: number): Promise<any> {
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

    return {
      ...this.toStudentDto(student),
      student_groups: student.studentGroups?.map((sg: any) => ({
        group_id: sg.group.groupId,
        name: sg.group.name,
        description: sg.group.description,
        group_type: sg.group.groupType,
      })) || [],
      enrollments: student.enrollments.map((e: any) => ({
        enrollment_id: e.enrollmentId,
        course_id: e.courseId,
        course_name: e.course.courseName,
        enroll_date: e.enrollDate.toISOString().split('T')[0],
        discount_rate: Number(e.discountRate),
        is_active: e.isActive,
      })),
    };
  }

  async createStudent(createDto: CreateStudentDto, userId: number, userRole: string): Promise<Student> {
    // 使用 PermissionService 檢查權限
    this.permissionService.checkCreatePermission(userRole);

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

  async restoreStudent(id: number): Promise<Student> {
    const student = await this.prisma.cramschoolStudent.findUnique({
      where: { studentId: id },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    // 恢復學生
    await this.prisma.cramschoolStudent.update({
      where: { studentId: id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    return this.getStudent(id);
  }

  async getTuitionStatus(id: number): Promise<any> {
    return this.feeService.getTuitionStatus(id);
  }

  async generateTuition(id: number, data: { year: number; month: number; enrollment_id: number; weeks: number }): Promise<any> {
    return this.feeService.generateTuition(id, data);
  }

  async batchGenerateTuitions(studentIds: number[], weeks: number = 4): Promise<any> {
    return this.feeService.batchGenerateTuitions(studentIds, weeks);
  }

  async resetPassword(id: number, password: string): Promise<any> {
    const student = await this.prisma.cramschoolStudent.findUnique({
      where: { studentId: id },
      include: { user: true },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    if (!student.userId) {
      throw new NotFoundException(`Student with ID ${id} does not have a user account`);
    }

    const hashedPassword = await require('bcrypt').hash(password, 10);
    await this.prisma.accountCustomUser.update({
      where: { id: student.userId },
      data: { password: hashedPassword },
    });

    return {
      password, // 返回明文密碼（前端需要顯示）
    };
  }

  async toggleAccountStatus(id: number): Promise<any> {
    const student = await this.prisma.cramschoolStudent.findUnique({
      where: { studentId: id },
      include: { user: true },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    if (!student.userId) {
      throw new NotFoundException(`Student with ID ${id} does not have a user account`);
    }

    const user = await this.prisma.accountCustomUser.findUnique({
      where: { id: student.userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${student.userId} not found`);
    }

    const updated = await this.prisma.accountCustomUser.update({
      where: { id: student.userId },
      data: {
        isActive: !user.isActive,
      },
    });

    return {
      is_active: updated.isActive,
    };
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

  async getAttendanceAndLeaves(id: number): Promise<any> {
    const student = await this.prisma.cramschoolStudent.findUnique({
      where: { studentId: id },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    // 獲取出席記錄
    const attendances = await this.prisma.cramschoolAttendance.findMany({
      where: {
        studentId: id,
        isDeleted: false,
      },
      include: {
        session: {
          include: {
            course: true,
          },
        },
        student: true,
      },
      orderBy: {
        session: {
          sessionDate: 'desc',
        },
      },
    });

    // 獲取請假記錄
    const leaves = await this.prisma.cramschoolLeave.findMany({
      where: {
        studentId: id,
        isDeleted: false,
      },
      include: {
        course: true,
        student: true,
      },
      orderBy: {
        leaveDate: 'desc',
      },
    });

    // 轉換出席記錄
    const attendanceData = attendances.map((a) => ({
      attendance_id: a.attendanceId,
      session_id: a.sessionId,
      session_id_display: a.session?.sessionId,
      student_id: a.studentId,
      student_name: a.student?.name,
      status: a.status,
      course_name: a.session?.course?.courseName,
      session_date: a.session?.sessionDate
        ? a.session.sessionDate.toISOString().split('T')[0]
        : null,
      is_deleted: a.isDeleted,
      deleted_at: a.deletedAt?.toISOString() || null,
    }));

    // 轉換請假記錄
    const leaveData = leaves.map((l) => ({
      leave_id: l.leaveId,
      student_id: l.studentId,
      course_id: l.courseId,
      leave_date: l.leaveDate.toISOString().split('T')[0],
      reason: l.reason,
      approval_status: l.approvalStatus,
      course_name: l.course?.courseName,
      student_name: l.student?.name,
      is_deleted: l.isDeleted,
      deleted_at: l.deletedAt?.toISOString() || null,
    }));

    return {
      student_id: student.studentId,
      student_name: student.name,
      attendances: attendanceData,
      leaves: leaveData,
    };
  }
}
