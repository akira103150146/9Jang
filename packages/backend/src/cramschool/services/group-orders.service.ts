import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateGroupOrderDto,
  UpdateGroupOrderDto,
  GroupOrder,
} from '@9jang/shared';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class GroupOrdersService {
  constructor(private prisma: PrismaService) {}

  async getGroupOrders(page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;

    const [results, count] = await Promise.all([
      this.prisma.cramschoolGroupOrder.findMany({
        skip,
        take: pageSize,
        include: {
          restaurant: true,
          orders: {
            where: {
              status: { in: ['Pending', 'Confirmed'] },
              isDeleted: false,
            },
          },
        },
        orderBy: { groupOrderId: 'desc' },
      }),
      this.prisma.cramschoolGroupOrder.count(),
    ]);

    return createPaginatedResponse(
      results.map((go) => this.toGroupOrderDto(go)),
      count,
      page,
      pageSize,
    );
  }

  async getGroupOrder(id: number): Promise<GroupOrder> {
    const groupOrder = await this.prisma.cramschoolGroupOrder.findUnique({
      where: { groupOrderId: id },
      include: {
        restaurant: true,
        orders: {
          where: {
            status: { in: ['Pending', 'Confirmed'] },
            isDeleted: false,
          },
        },
      },
    });

    if (!groupOrder) {
      throw new NotFoundException(`GroupOrder with ID ${id} not found`);
    }

    return this.toGroupOrderDto(groupOrder);
  }

  async createGroupOrder(createDto: CreateGroupOrderDto, userId: number): Promise<GroupOrder> {
    // 生成唯一連結
    const orderLink = `group-order-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const groupOrder = await this.prisma.cramschoolGroupOrder.create({
      data: {
        restaurantId: createDto.restaurant_id,
        title: createDto.title,
        orderLink,
        status: createDto.status || 'Open',
        deadline: new Date(createDto.deadline),
        createdById: createDto.created_by_id || null,
      },
      include: {
        restaurant: true,
        orders: true,
      },
    });

    return this.toGroupOrderDto(groupOrder);
  }

  async updateGroupOrder(id: number, updateDto: UpdateGroupOrderDto): Promise<GroupOrder> {
    const groupOrder = await this.prisma.cramschoolGroupOrder.findUnique({
      where: { groupOrderId: id },
    });

    if (!groupOrder) {
      throw new NotFoundException(`GroupOrder with ID ${id} not found`);
    }

    const updatedGroupOrder = await this.prisma.cramschoolGroupOrder.update({
      where: { groupOrderId: id },
      data: {
        restaurantId: updateDto.restaurant_id,
        title: updateDto.title,
        orderLink: updateDto.order_link,
        status: updateDto.status,
        deadline: updateDto.deadline ? new Date(updateDto.deadline) : undefined,
        createdById: updateDto.created_by_id !== undefined ? updateDto.created_by_id : undefined,
      },
      include: {
        restaurant: true,
        orders: {
          where: {
            status: { in: ['Pending', 'Confirmed'] },
            isDeleted: false,
          },
        },
      },
    });

    return this.toGroupOrderDto(updatedGroupOrder);
  }

  async deleteGroupOrder(id: number): Promise<void> {
    const groupOrder = await this.prisma.cramschoolGroupOrder.findUnique({
      where: { groupOrderId: id },
    });

    if (!groupOrder) {
      throw new NotFoundException(`GroupOrder with ID ${id} not found`);
    }

    await this.prisma.cramschoolGroupOrder.delete({
      where: { groupOrderId: id },
    });
  }

  async completeGroupOrder(id: number, userId: number, userRole: string): Promise<GroupOrder> {
    const groupOrder = await this.prisma.cramschoolGroupOrder.findUnique({
      where: { groupOrderId: id },
      include: {
        restaurant: true,
        orders: {
          where: {
            status: { in: ['Pending', 'Confirmed'] },
            isDeleted: false,
          },
          include: {
            student: true,
          },
        },
      },
    });

    if (!groupOrder) {
      throw new NotFoundException(`GroupOrder with ID ${id} not found`);
    }

    // 權限檢查：會計或發起該團購的老師
    const isAccountant = userRole === 'ACCOUNTANT';
    const isOwnerTeacher = userRole === 'TEACHER' && groupOrder.createdById === userId;

    if (!isAccountant && !isOwnerTeacher) {
      throw new ForbiddenException('只有會計或發起該團購的老師可以完成團購');
    }

    // 更新團購狀態
    const updatedGroupOrder = await this.prisma.cramschoolGroupOrder.update({
      where: { groupOrderId: id },
      data: {
        status: 'Completed',
        closedAt: new Date(),
      },
      include: {
        restaurant: true,
        orders: {
          where: {
            status: { in: ['Pending', 'Confirmed'] },
            isDeleted: false,
          },
          include: {
            student: true,
          },
        },
      },
    });

    // 為每個已確認和待確認的訂單生成費用
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const order of updatedGroupOrder.orders) {
      // 檢查是否已經為這個學生在同一天生成過相同金額的餐費
      const existingFee = await this.prisma.cramschoolExtraFee.findFirst({
        where: {
          studentId: order.studentId,
          item: 'Meal',
          amount: order.totalAmount,
          feeDate: today,
          isDeleted: false,
        },
      });

      if (!existingFee) {
        // 獲取老師名稱
        const teacher = groupOrder.createdById
          ? await this.prisma.cramschoolTeacher.findUnique({
              where: { teacherId: groupOrder.createdById },
            })
          : null;

        const teacherName = teacher?.name || '未知';
        const restaurantName = updatedGroupOrder.restaurant?.name || '未知';
        const notes = `餐費/團購：${updatedGroupOrder.title}｜店家：${restaurantName}｜發起老師：${teacherName}｜團購ID:${updatedGroupOrder.groupOrderId}｜訂單ID:${order.orderId}`;

        await this.prisma.cramschoolExtraFee.create({
          data: {
            studentId: order.studentId,
            item: 'Meal',
            amount: order.totalAmount,
            feeDate: today,
            paymentStatus: 'Unpaid',
            notes,
          },
        });
      }
    }

    return this.toGroupOrderDto(updatedGroupOrder);
  }

  private toGroupOrderDto(groupOrder: any): GroupOrder {
    const ordersCount = groupOrder.orders?.length || 0;
    const totalAmount = groupOrder.orders?.reduce((sum: number, o: any) => sum + Number(o.totalAmount || 0), 0) || 0;

    return {
      group_order_id: groupOrder.groupOrderId,
      restaurant_id: groupOrder.restaurantId,
      title: groupOrder.title,
      order_link: groupOrder.orderLink,
      status: groupOrder.status,
      deadline: groupOrder.deadline.toISOString(),
      created_by_id: groupOrder.createdById || null,
      created_at: groupOrder.createdAt?.toISOString(),
      closed_at: groupOrder.closedAt?.toISOString() || null,
    };
  }
}
