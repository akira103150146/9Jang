import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateLeaveDto,
  UpdateLeaveDto,
  Leave,
} from '@9jang/shared';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class LeavesService {
  constructor(private prisma: PrismaService) {}

  async getLeaves(includeDeleted: boolean = false, page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;
    const where: any = {};
    if (!includeDeleted) {
      where.isDeleted = false;
    }

    const [results, count] = await Promise.all([
      this.prisma.cramschoolLeave.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          student: true,
          course: true,
        },
        orderBy: { leaveDate: 'desc' },
      }),
      this.prisma.cramschoolLeave.count({ where }),
    ]);

    return createPaginatedResponse(
      results.map((l) => this.toLeaveDto(l)),
      count,
      page,
      pageSize,
    );
  }

  async getLeave(id: number): Promise<Leave> {
    const leave = await this.prisma.cramschoolLeave.findUnique({
      where: { leaveId: id },
      include: {
        student: true,
        course: true,
      },
    });

    if (!leave) {
      throw new NotFoundException(`Leave with ID ${id} not found`);
    }

    return this.toLeaveDto(leave);
  }

  async createLeave(createDto: CreateLeaveDto): Promise<Leave> {
    // 驗證學生是否報名了該課程
    const enrollment = await this.prisma.cramschoolStudentEnrollment.findFirst({
      where: {
        studentId: createDto.student_id,
        courseId: createDto.course_id,
        isDeleted: false,
      },
    });

    if (!enrollment) {
      throw new BadRequestException(
        `學生未報名此課程，無法為該課程請假`
      );
    }

    const leave = await this.prisma.cramschoolLeave.create({
      data: {
        studentId: createDto.student_id,
        courseId: createDto.course_id,
        leaveDate: new Date(createDto.leave_date),
        reason: createDto.reason,
        approvalStatus: createDto.approval_status || 'Pending',
      },
    });

    return this.getLeave(leave.leaveId);
  }

  async updateLeave(id: number, updateDto: UpdateLeaveDto): Promise<Leave> {
    const leave = await this.prisma.cramschoolLeave.findUnique({
      where: { leaveId: id },
    });

    if (!leave) {
      throw new NotFoundException(`Leave with ID ${id} not found`);
    }

    // 如果更新了學生或課程，需要驗證學生是否報名了該課程
    const studentId = updateDto.student_id !== undefined ? updateDto.student_id : leave.studentId;
    const courseId = updateDto.course_id !== undefined ? updateDto.course_id : leave.courseId;

    if (updateDto.student_id !== undefined || updateDto.course_id !== undefined) {
      const enrollment = await this.prisma.cramschoolStudentEnrollment.findFirst({
        where: {
          studentId: studentId,
          courseId: courseId,
          isDeleted: false,
        },
      });

      if (!enrollment) {
        throw new BadRequestException(
          `學生未報名此課程，無法為該課程請假`
        );
      }
    }

    await this.prisma.cramschoolLeave.update({
      where: { leaveId: id },
      data: {
        studentId: updateDto.student_id !== undefined ? updateDto.student_id : undefined,
        courseId: updateDto.course_id !== undefined ? updateDto.course_id : undefined,
        leaveDate: updateDto.leave_date ? new Date(updateDto.leave_date) : undefined,
        reason: updateDto.reason,
        approvalStatus: updateDto.approval_status,
      },
    });

    return this.getLeave(id);
  }

  async deleteLeave(id: number): Promise<void> {
    const leave = await this.prisma.cramschoolLeave.findUnique({
      where: { leaveId: id },
    });

    if (!leave) {
      throw new NotFoundException(`Leave with ID ${id} not found`);
    }

    // 軟刪除
    await this.prisma.cramschoolLeave.update({
      where: { leaveId: id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async restoreLeave(id: number): Promise<Leave> {
    const leave = await this.prisma.cramschoolLeave.findUnique({
      where: { leaveId: id },
    });

    if (!leave) {
      throw new NotFoundException(`Leave with ID ${id} not found`);
    }

    await this.prisma.cramschoolLeave.update({
      where: { leaveId: id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    return this.getLeave(id);
  }

  private toLeaveDto(leave: any): Leave {
    return {
      leave_id: leave.leaveId,
      student_id: leave.studentId,
      course_id: leave.courseId,
      leave_date: leave.leaveDate.toISOString().split('T')[0],
      reason: leave.reason,
      approval_status: leave.approvalStatus as 'Pending' | 'Approved' | 'Rejected',
      is_deleted: leave.isDeleted,
      deleted_at: leave.deletedAt?.toISOString() || null,
    };
  }
}
