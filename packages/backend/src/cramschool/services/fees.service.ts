import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateFeeDto,
  UpdateFeeDto,
  Fee,
  BatchUpdateFeeStatusDto,
} from '@9jang/shared';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class FeesService {
  constructor(private prisma: PrismaService) {}

  async getFees(
    page: number = 1,
    pageSize: number = 10,
    studentId?: number,
    includeDeleted: boolean = false,
  ) {
    const skip = (page - 1) * pageSize;
    const where: any = {};

    if (studentId) {
      where.studentId = studentId;
    }

    if (!includeDeleted) {
      where.isDeleted = false;
    }

    const [results, count] = await Promise.all([
      this.prisma.cramschoolExtraFee.findMany({
        skip,
        take: pageSize,
        where,
        include: {
          student: {
            select: {
              studentId: true,
              name: true,
            },
          },
        },
        orderBy: { feeDate: 'desc' },
      }),
      this.prisma.cramschoolExtraFee.count({ where }),
    ]);

    return createPaginatedResponse(
      results.map((fee) => this.toFeeDto(fee)),
      count,
      page,
      pageSize,
    );
  }

  async getFee(id: number): Promise<Fee> {
    const fee = await this.prisma.cramschoolExtraFee.findUnique({
      where: { feeId: id },
      include: {
        student: {
          select: {
            studentId: true,
            name: true,
          },
        },
      },
    });

    if (!fee) {
      throw new NotFoundException(`Fee with ID ${id} not found`);
    }

    return this.toFeeDto(fee);
  }

  async createFee(createDto: CreateFeeDto): Promise<Fee> {
    const fee = await this.prisma.cramschoolExtraFee.create({
      data: {
        studentId: createDto.student_id,
        item: createDto.item,
        amount: createDto.amount,
        feeDate: new Date(createDto.fee_date),
        paymentStatus: createDto.payment_status || 'Unpaid',
        notes: createDto.notes || null,
        paidAt: createDto.paid_at ? new Date(createDto.paid_at) : null,
      },
      include: {
        student: {
          select: {
            studentId: true,
            name: true,
          },
        },
      },
    });

    return this.toFeeDto(fee);
  }

  async updateFee(id: number, updateDto: UpdateFeeDto): Promise<Fee> {
    const fee = await this.prisma.cramschoolExtraFee.findUnique({
      where: { feeId: id },
    });

    if (!fee) {
      throw new NotFoundException(`Fee with ID ${id} not found`);
    }

    const updatedFee = await this.prisma.cramschoolExtraFee.update({
      where: { feeId: id },
      data: {
        studentId: updateDto.student_id,
        item: updateDto.item,
        amount: updateDto.amount,
        feeDate: updateDto.fee_date ? new Date(updateDto.fee_date) : undefined,
        paymentStatus: updateDto.payment_status,
        notes: updateDto.notes,
        paidAt: updateDto.paid_at ? new Date(updateDto.paid_at) : updateDto.paid_at === null ? null : undefined,
      },
      include: {
        student: {
          select: {
            studentId: true,
            name: true,
          },
        },
      },
    });

    return this.toFeeDto(updatedFee);
  }

  async deleteFee(id: number): Promise<void> {
    const fee = await this.prisma.cramschoolExtraFee.findUnique({
      where: { feeId: id },
    });

    if (!fee) {
      throw new NotFoundException(`Fee with ID ${id} not found`);
    }

    // 軟刪除
    await this.prisma.cramschoolExtraFee.update({
      where: { feeId: id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async batchUpdateStatus(
    batchUpdateDto: BatchUpdateFeeStatusDto,
  ): Promise<{ updated: number }> {
    const { fee_ids, payment_status } = batchUpdateDto;

    if (fee_ids.length === 0) {
      throw new BadRequestException('fee_ids 不能為空');
    }

    const result = await this.prisma.cramschoolExtraFee.updateMany({
      where: {
        feeId: { in: fee_ids },
      },
      data: {
        paymentStatus: payment_status,
        paidAt: payment_status === 'Paid' ? new Date() : null,
      },
    });

    return { updated: result.count };
  }

  private toFeeDto(fee: any): Fee {
    return {
      fee_id: fee.feeId,
      student_id: fee.studentId,
      item: fee.item,
      amount: Number(fee.amount),
      fee_date: fee.feeDate.toISOString().split('T')[0],
      payment_status: fee.paymentStatus as 'Paid' | 'Unpaid' | 'Partial',
      notes: fee.notes || null,
      paid_at: fee.paidAt?.toISOString() || null,
      is_deleted: fee.isDeleted,
      deleted_at: fee.deletedAt?.toISOString() || null,
      student_name: fee.student?.name || undefined,
    };
  }
}
