import { AuthRequest } from '@/types/request.types';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateOrderDto,
  UpdateOrderDto,
  Order,
  CreateOrderSchema,
  UpdateOrderSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard';

@Controller('cramschool/orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async getOrders(
    @Request() req: AuthRequest,
    @Query('include_deleted') includeDeleted: string = 'false',
    @Query('group_order', new ParseIntPipe({ optional: true })) groupOrderId?: number,
    @Query('student', new ParseIntPipe({ optional: true })) studentId?: number,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
  ) {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    // 管理員不可用
    if (userRecord?.role === 'ADMIN') {
      return { count: 0, results: [], page: 1, page_size: pageSize };
    }

    // 學生只能看自己的訂單
    if (userRecord?.role === 'STUDENT') {
      const student = await this.prisma.cramschoolStudent.findFirst({
        where: { userId: user.id },
      });
      if (student) {
        studentId = student.studentId;
      } else {
        return { count: 0, results: [], page: 1, page_size: pageSize };
      }
    }

    return this.ordersService.getOrders(
      includeDeleted === 'true',
      groupOrderId,
      studentId,
      page,
      pageSize,
    );
  }

  @Get(':id')
  async getOrder(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.ordersService.getOrder(id);
  }

  @Post()
  async createOrder(
    @Body(new ZodValidationPipe(CreateOrderSchema)) createDto: CreateOrderDto,
  ): Promise<Order> {
    return this.ordersService.createOrder(createDto);
  }

  @Put(':id')
  async updateOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateOrderSchema)) updateDto: UpdateOrderDto,
  ): Promise<Order> {
    return this.ordersService.updateOrder(id, updateDto);
  }

  @Delete(':id')
  async deleteOrder(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.ordersService.deleteOrder(id);
  }

  @Post(':id/restore')
  async restoreOrder(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.ordersService.restoreOrder(id);
  }
}
