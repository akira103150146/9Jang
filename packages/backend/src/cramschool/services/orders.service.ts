import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateOrderDto,
  UpdateOrderDto,
  Order,
} from '@9jang/shared';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async getOrders(
    includeDeleted: boolean = false,
    groupOrderId?: number,
    studentId?: number,
    page: number = 1,
    pageSize: number = 10,
  ) {
    const skip = (page - 1) * pageSize;
    const where: any = {};

    if (!includeDeleted) {
      where.isDeleted = false;
    }

    if (groupOrderId) {
      where.groupOrderId = groupOrderId;
    }

    if (studentId) {
      where.studentId = studentId;
    }

    const [results, count] = await Promise.all([
      this.prisma.cramschoolOrder.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          groupOrder: {
            include: {
              restaurant: true,
            },
          },
          student: true,
          items: true,
        },
        orderBy: { orderId: 'desc' },
      }),
      this.prisma.cramschoolOrder.count({ where }),
    ]);

    return createPaginatedResponse(
      results.map((o) => this.toOrderDto(o)),
      count,
      page,
      pageSize,
    );
  }

  async getOrder(id: number): Promise<Order> {
    const order = await this.prisma.cramschoolOrder.findUnique({
      where: { orderId: id },
      include: {
        groupOrder: {
          include: {
            restaurant: true,
          },
        },
        student: true,
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return this.toOrderDto(order);
  }

  async createOrder(createDto: CreateOrderDto): Promise<Order> {
    const order = await this.prisma.cramschoolOrder.create({
      data: {
        groupOrderId: createDto.group_order_id,
        studentId: createDto.student_id,
        status: createDto.status || 'Pending',
        totalAmount: createDto.total_amount || 0,
        notes: createDto.notes || null,
      },
      include: {
        groupOrder: {
          include: {
            restaurant: true,
          },
        },
        student: true,
        items: true,
      },
    });

    return this.toOrderDto(order);
  }

  async updateOrder(id: number, updateDto: UpdateOrderDto): Promise<Order> {
    const order = await this.prisma.cramschoolOrder.findUnique({
      where: { orderId: id },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const updatedOrder = await this.prisma.cramschoolOrder.update({
      where: { orderId: id },
      data: {
        groupOrderId: updateDto.group_order_id,
        studentId: updateDto.student_id,
        status: updateDto.status,
        totalAmount: updateDto.total_amount !== undefined ? updateDto.total_amount : undefined,
        notes: updateDto.notes !== undefined ? updateDto.notes : undefined,
      },
      include: {
        groupOrder: {
          include: {
            restaurant: true,
          },
        },
        student: true,
        items: true,
      },
    });

    return this.toOrderDto(updatedOrder);
  }

  async deleteOrder(id: number): Promise<void> {
    const order = await this.prisma.cramschoolOrder.findUnique({
      where: { orderId: id },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // 軟刪除
    await this.prisma.cramschoolOrder.update({
      where: { orderId: id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async restoreOrder(id: number): Promise<Order> {
    const order = await this.prisma.cramschoolOrder.findUnique({
      where: { orderId: id },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (!order.isDeleted) {
      throw new NotFoundException(`Order with ID ${id} is not deleted`);
    }

    const restoredOrder = await this.prisma.cramschoolOrder.update({
      where: { orderId: id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
      include: {
        groupOrder: {
          include: {
            restaurant: true,
          },
        },
        student: true,
        items: true,
      },
    });

    return this.toOrderDto(restoredOrder);
  }

  private toOrderDto(order: any): Order {
    return {
      order_id: order.orderId,
      group_order_id: order.groupOrderId,
      student_id: order.studentId,
      status: order.status,
      total_amount: Number(order.totalAmount),
      notes: order.notes || null,
      created_at: order.createdAt?.toISOString(),
      updated_at: order.updatedAt?.toISOString(),
      is_deleted: order.isDeleted,
      deleted_at: order.deletedAt?.toISOString() || null,
    };
  }
}
