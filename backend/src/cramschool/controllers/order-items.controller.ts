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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
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

@ApiTags('orders')
@Controller('cramschool/order-items')
@UseGuards(JwtAuthGuard)
export class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得訂單項目列表', description: '分頁取得訂單項目' })
  @ApiQuery({ name: 'order', required: false, description: '訂單 ID 篩選', type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'page_size', required: false, type: Number })
  @ApiResponse({ status: 200, description: '成功' })
  async getOrderItems(
    @Query('order', new ParseIntPipe({ optional: true })) orderId?: number,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
  ) {
    return this.orderItemsService.getOrderItems(orderId, page, pageSize);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得單一訂單項目', description: '查詢訂單項目詳細資料' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 404, description: '訂單項目不存在' })
  async getOrderItem(@Param('id', ParseIntPipe) id: number): Promise<OrderItem> {
    return this.orderItemsService.getOrderItem(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '建立訂單項目', description: '新增訂單項目' })
  @ApiResponse({ status: 201, description: '建立成功' })
  @ApiResponse({ status: 400, description: '驗證失敗' })
  async createOrderItem(
    @Body(new ZodValidationPipe(CreateOrderItemSchema)) createDto: CreateOrderItemDto,
  ): Promise<OrderItem> {
    return this.orderItemsService.createOrderItem(createDto);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '更新訂單項目', description: '修改訂單項目資料' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '訂單項目不存在' })
  async updateOrderItem(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateOrderItemSchema)) updateDto: UpdateOrderItemDto,
  ): Promise<OrderItem> {
    return this.orderItemsService.updateOrderItem(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '刪除訂單項目', description: '刪除訂單項目' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '刪除成功' })
  @ApiResponse({ status: 404, description: '訂單項目不存在' })
  async deleteOrderItem(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.orderItemsService.deleteOrderItem(id);
  }
}
