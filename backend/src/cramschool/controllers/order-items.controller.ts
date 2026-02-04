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
  ParseIntPipe,
} from '@nestjs/common';
import { OrderItemsService } from '../services/order-items.service';
import {
  CreateOrderItemDto,
  UpdateOrderItemDto,
  OrderItem,
  CreateOrderItemSchema,
  UpdateOrderItemSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard';

@Controller('cramschool/order-items')
@UseGuards(JwtAuthGuard)
export class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) {}

  @Get()
  async getOrderItems(
    @Query('order', new ParseIntPipe({ optional: true })) orderId?: number,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
  ) {
    return this.orderItemsService.getOrderItems(orderId, page, pageSize);
  }

  @Get(':id')
  async getOrderItem(@Param('id', ParseIntPipe) id: number): Promise<OrderItem> {
    return this.orderItemsService.getOrderItem(id);
  }

  @Post()
  async createOrderItem(
    @Body(new ZodValidationPipe(CreateOrderItemSchema)) createDto: CreateOrderItemDto,
  ): Promise<OrderItem> {
    return this.orderItemsService.createOrderItem(createDto);
  }

  @Put(':id')
  async updateOrderItem(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateOrderItemSchema)) updateDto: UpdateOrderItemDto,
  ): Promise<OrderItem> {
    return this.orderItemsService.updateOrderItem(id, updateDto);
  }

  @Delete(':id')
  async deleteOrderItem(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.orderItemsService.deleteOrderItem(id);
  }
}
