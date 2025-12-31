import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateStudentEnrollmentDto,
  StudentEnrollment,
} from '@9jang/shared';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  async getEnrollments(page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;
    const [results, count] = await Promise.all([
      this.prisma.cramschoolStudentEnrollment.findMany({
        skip,
        take: pageSize,
        include: {
          student: true,
          course: {
            include: {
              teacher: true,
            },
          },
          periods: {
            where: { isActive: true },
            orderBy: { startDate: 'asc' },
          },
        },
        where: { isDeleted: false },
        orderBy: { enrollDate: 'desc' },
      }),
      this.prisma.cramschoolStudentEnrollment.count({
        where: { isDeleted: false },
      }),
    ]);

    return createPaginatedResponse(
      results.map((e) => this.toEnrollmentDto(e)),
      count,
      page,
      pageSize,
    );
  }

  async getEnrollment(id: number): Promise<StudentEnrollment> {
    const enrollment = await this.prisma.cramschoolStudentEnrollment.findUnique({
      where: { enrollmentId: id },
      include: {
        student: true,
        course: true,
        periods: true,
      },
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    return this.toEnrollmentDto(enrollment);
  }

  async createEnrollment(createDto: CreateStudentEnrollmentDto): Promise<StudentEnrollment> {
    const enrollment = await this.prisma.cramschoolStudentEnrollment.create({
      data: {
        studentId: createDto.student_id,
        courseId: createDto.course_id,
        enrollDate: new Date(createDto.enroll_date),
        discountRate: createDto.discount_rate || 0,
        isActive: createDto.is_active !== undefined ? createDto.is_active : true,
      },
    });

    return this.getEnrollment(enrollment.enrollmentId);
  }

  async updateEnrollment(
    id: number,
    updateDto: Partial<CreateStudentEnrollmentDto>,
  ): Promise<StudentEnrollment> {
    const enrollment = await this.prisma.cramschoolStudentEnrollment.findUnique({
      where: { enrollmentId: id },
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    await this.prisma.cramschoolStudentEnrollment.update({
      where: { enrollmentId: id },
      data: {
        enrollDate: updateDto.enroll_date ? new Date(updateDto.enroll_date) : undefined,
        discountRate: updateDto.discount_rate,
        isActive: updateDto.is_active,
      },
    });

    return this.getEnrollment(id);
  }

  async deleteEnrollment(id: number): Promise<void> {
    const enrollment = await this.prisma.cramschoolStudentEnrollment.findUnique({
      where: { enrollmentId: id },
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    // 軟刪除
    await this.prisma.cramschoolStudentEnrollment.update({
      where: { enrollmentId: id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  private toEnrollmentDto(enrollment: any): StudentEnrollment {
    return {
      enrollment_id: enrollment.enrollmentId,
      student_id: enrollment.studentId,
      course_id: enrollment.courseId,
      enroll_date: enrollment.enrollDate.toISOString().split('T')[0],
      discount_rate: Number(enrollment.discountRate),
      is_active: enrollment.isActive,
      is_deleted: enrollment.isDeleted,
      deleted_at: enrollment.deletedAt?.toISOString() || null,
    };
  }
}
