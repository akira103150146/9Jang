import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateAttendanceDto,
  UpdateAttendanceDto,
  Attendance,
} from '@9jang/shared';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class AttendancesService {
  constructor(private prisma: PrismaService) {}

  async getAttendances(includeDeleted: boolean = false, page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;
    const where: any = {};
    if (!includeDeleted) {
      where.isDeleted = false;
    }

    const [results, count] = await Promise.all([
      this.prisma.cramschoolAttendance.findMany({
        where,
        skip,
        take: pageSize,
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
      }),
      this.prisma.cramschoolAttendance.count({ where }),
    ]);

    return createPaginatedResponse(
      results.map((a) => this.toAttendanceDto(a)),
      count,
      page,
      pageSize,
    );
  }

  async getAttendance(id: number): Promise<Attendance> {
    const attendance = await this.prisma.cramschoolAttendance.findUnique({
      where: { attendanceId: id },
      include: {
        session: {
          include: {
            course: true,
          },
        },
        student: true,
      },
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }

    return this.toAttendanceDto(attendance);
  }

  async createAttendance(createDto: CreateAttendanceDto): Promise<Attendance> {
    const attendance = await this.prisma.cramschoolAttendance.create({
      data: {
        sessionId: createDto.session_id,
        studentId: createDto.student_id,
        status: createDto.status || 'Absent',
      },
      include: {
        session: {
          include: {
            course: true,
          },
        },
        student: true,
      },
    });

    return this.toAttendanceDto(attendance);
  }

  async updateAttendance(id: number, updateDto: UpdateAttendanceDto): Promise<Attendance> {
    const attendance = await this.prisma.cramschoolAttendance.findUnique({
      where: { attendanceId: id },
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }

    const updatedAttendance = await this.prisma.cramschoolAttendance.update({
      where: { attendanceId: id },
      data: {
        sessionId: updateDto.session_id,
        studentId: updateDto.student_id,
        status: updateDto.status,
      },
      include: {
        session: {
          include: {
            course: true,
          },
        },
        student: true,
      },
    });

    return this.toAttendanceDto(updatedAttendance);
  }

  async deleteAttendance(id: number): Promise<void> {
    const attendance = await this.prisma.cramschoolAttendance.findUnique({
      where: { attendanceId: id },
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }

    // 軟刪除
    await this.prisma.cramschoolAttendance.update({
      where: { attendanceId: id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async restoreAttendance(id: number): Promise<Attendance> {
    const attendance = await this.prisma.cramschoolAttendance.findUnique({
      where: { attendanceId: id },
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }

    if (!attendance.isDeleted) {
      throw new NotFoundException(`Attendance with ID ${id} is not deleted`);
    }

    const restoredAttendance = await this.prisma.cramschoolAttendance.update({
      where: { attendanceId: id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
      include: {
        session: {
          include: {
            course: true,
          },
        },
        student: true,
      },
    });

    return this.toAttendanceDto(restoredAttendance);
  }

  private toAttendanceDto(attendance: any): Attendance & {
    student_name?: string;
    session_id_display?: number;
    course_name?: string;
    session_date?: string;
  } {
    const result: any = {
      attendance_id: attendance.attendanceId,
      session_id: attendance.sessionId,
      student_id: attendance.studentId,
      status: attendance.status as 'Present' | 'Absent' | 'Late' | 'Leave',
      is_deleted: attendance.isDeleted,
      deleted_at: attendance.deletedAt?.toISOString() || null,
      // 擴展字段
      student_name: attendance.student?.name || undefined,
      session_id_display: attendance.session?.sessionId || undefined,
      course_name: attendance.session?.course?.courseName || undefined,
      session_date: attendance.session?.sessionDate
        ? attendance.session.sessionDate.toISOString().split('T')[0]
        : undefined,
    };

    return result as Attendance;
  }
}
