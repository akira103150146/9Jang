import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateOrderItemDto,
  UpdateOrderItemDto,
  OrderItem,
} from '@9jang/shared';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class OrderItemsService {
  constructor(private prisma: PrismaService) {}

  async getOrderItems(orderId?: number, page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;
    const where: any = {};

    if (orderId) {
      where.orderId = orderId;
    }

    const [results, count] = await Promise.all([
      this.prisma.cramschoolOrderItem.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          order: true,
        },
        orderBy: { orderItemId: 'asc' },
      }),
      this.prisma.cramschoolOrderItem.count({ where }),
    ]);

    return createPaginatedResponse(
      results.map((oi) => this.toOrderItemDto(oi)),
      count,
      page,
      pageSize,
    );
  }

  async getOrderItem(id: number): Promise<OrderItem> {
    const orderItem = await this.prisma.cramschoolOrderItem.findUnique({
      where: { orderItemId: id },
      include: {
        order: true,
      },
    });

    if (!orderItem) {
      throw new NotFoundException(`OrderItem with ID ${id} not found`);
    }

    return this.toOrderItemDto(orderItem);
  }

  async createOrderItem(createDto: CreateOrderItemDto): Promise<OrderItem> {
    const orderItem = await this.prisma.cramschoolOrderItem.create({
      data: {
        orderId: createDto.order_id,
        itemName: createDto.item_name,
        quantity: createDto.quantity || 1,
        unitPrice: createDto.unit_price,
        subtotal: createDto.subtotal || createDto.unit_price * (createDto.quantity || 1),
      },
      include: {
        order: true,
      },
    });

    return this.toOrderItemDto(orderItem);
  }

  async updateOrderItem(id: number, updateDto: UpdateOrderItemDto): Promise<OrderItem> {
    const orderItem = await this.prisma.cramschoolOrderItem.findUnique({
      where: { orderItemId: id },
    });

    if (!orderItem) {
      throw new NotFoundException(`OrderItem with ID ${id} not found`);
    }

    const updatedOrderItem = await this.prisma.cramschoolOrderItem.update({
      where: { orderItemId: id },
      data: {
        orderId: updateDto.order_id,
        itemName: updateDto.item_name,
        quantity: updateDto.quantity,
        unitPrice: updateDto.unit_price,
        subtotal: updateDto.subtotal !== undefined ? updateDto.subtotal : undefined,
      },
      include: {
        order: true,
      },
    });

    return this.toOrderItemDto(updatedOrderItem);
  }

  async deleteOrderItem(id: number): Promise<void> {
    const orderItem = await this.prisma.cramschoolOrderItem.findUnique({
      where: { orderItemId: id },
    });

    if (!orderItem) {
      throw new NotFoundException(`OrderItem with ID ${id} not found`);
    }

    await this.prisma.cramschoolOrderItem.delete({
      where: { orderItemId: id },
    });
  }

  private toOrderItemDto(orderItem: any): OrderItem {
    return {
      order_item_id: orderItem.orderItemId,
      order_id: orderItem.orderId,
      item_name: orderItem.itemName,
      quantity: orderItem.quantity,
      unit_price: Number(orderItem.unitPrice),
      subtotal: Number(orderItem.subtotal),
    };
  }
}
