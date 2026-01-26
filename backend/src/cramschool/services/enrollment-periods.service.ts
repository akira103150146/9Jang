import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateEnrollmentPeriodDto,
  EnrollmentPeriod,
} from '@9jang/shared';

@Injectable()
export class EnrollmentPeriodsService {
  constructor(private prisma: PrismaService) {}

  async getPeriods(enrollmentId?: number) {
    const where: any = {};
    if (enrollmentId) {
      where.enrollmentId = enrollmentId;
    }

    const periods = await this.prisma.cramschoolEnrollmentPeriod.findMany({
      where,
      include: {
        enrollment: {
          include: {
            student: true,
            course: true,
          },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    return periods.map((p) => this.toPeriodDto(p));
  }

  async getPeriod(id: number): Promise<EnrollmentPeriod> {
    const period = await this.prisma.cramschoolEnrollmentPeriod.findUnique({
      where: { periodId: id },
      include: {
        enrollment: true,
      },
    });

    if (!period) {
      throw new NotFoundException(`Enrollment period with ID ${id} not found`);
    }

    return this.toPeriodDto(period);
  }

  async createPeriod(createDto: CreateEnrollmentPeriodDto): Promise<EnrollmentPeriod> {
    const period = await this.prisma.cramschoolEnrollmentPeriod.create({
      data: {
        enrollmentId: createDto.enrollment_id,
        startDate: new Date(createDto.start_date),
        endDate: createDto.end_date ? new Date(createDto.end_date) : null,
        isActive: createDto.is_active !== undefined ? createDto.is_active : true,
        notes: createDto.notes || null,
      },
    });

    return this.getPeriod(period.periodId);
  }

  async updatePeriod(id: number, updateDto: Partial<CreateEnrollmentPeriodDto>): Promise<EnrollmentPeriod> {
    const period = await this.prisma.cramschoolEnrollmentPeriod.findUnique({
      where: { periodId: id },
    });

    if (!period) {
      throw new NotFoundException(`Enrollment period with ID ${id} not found`);
    }

    await this.prisma.cramschoolEnrollmentPeriod.update({
      where: { periodId: id },
      data: {
        startDate: updateDto.start_date ? new Date(updateDto.start_date) : undefined,
        endDate: updateDto.end_date !== undefined ? (updateDto.end_date ? new Date(updateDto.end_date) : null) : undefined,
        isActive: updateDto.is_active,
        notes: updateDto.notes,
      },
    });

    return this.getPeriod(id);
  }

  async deletePeriod(id: number): Promise<void> {
    const period = await this.prisma.cramschoolEnrollmentPeriod.findUnique({
      where: { periodId: id },
    });

    if (!period) {
      throw new NotFoundException(`Enrollment period with ID ${id} not found`);
    }

    await this.prisma.cramschoolEnrollmentPeriod.delete({
      where: { periodId: id },
    });
  }

  private toPeriodDto(period: any): EnrollmentPeriod {
    return {
      period_id: period.periodId,
      enrollment_id: period.enrollmentId,
      start_date: period.startDate.toISOString().split('T')[0],
      end_date: period.endDate ? period.endDate.toISOString().split('T')[0] : null,
      is_active: period.isActive,
      notes: period.notes || null,
    };
  }
}
