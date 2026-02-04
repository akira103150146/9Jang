import { AuthRequest } from '@/types/request.types';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
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

@ApiTags('orders')
@Controller('cramschool/orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '取得訂單列表', 
    description: '分頁取得訂單記錄，學生只能查看自己的訂單，教師和會計可查看所有訂單'
  })
  @ApiQuery({ name: 'include_deleted', required: false, description: '是否包含已刪除', example: 'false', type: String })
  @ApiQuery({ name: 'group_order', required: false, description: '團訂 ID 篩選', type: Number })
  @ApiQuery({ name: 'student', required: false, description: '學生 ID 篩選', type: Number })
  @ApiQuery({ name: 'page', required: false, description: '頁碼', example: 1, type: Number })
  @ApiQuery({ name: 'page_size', required: false, description: '每頁筆數', example: 10, type: Number })
  @ApiResponse({ 
    status: 200, 
    description: '成功取得訂單列表'
  })
  @ApiResponse({ status: 401, description: '未授權' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得單一訂單', description: '根據訂單 ID 取得詳細資料' })
  @ApiParam({ name: 'id', description: '訂單 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '成功',  })
  @ApiResponse({ status: 404, description: '訂單不存在' })
  async getOrder(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.ordersService.getOrder(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '建立訂單', description: '新增訂單記錄' })
  @ApiResponse({ status: 201, description: '建立成功',  })
  @ApiResponse({ status: 400, description: '資料驗證失敗' })
  async createOrder(
    @Body(new ZodValidationPipe(CreateOrderSchema)) createDto: CreateOrderDto,
  ): Promise<Order> {
    return this.ordersService.createOrder(createDto);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '更新訂單', description: '修改訂單資料' })
  @ApiParam({ name: 'id', description: '訂單 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '更新成功',  })
  @ApiResponse({ status: 404, description: '訂單不存在' })
  async updateOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateOrderSchema)) updateDto: UpdateOrderDto,
  ): Promise<Order> {
    return this.ordersService.updateOrder(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '刪除訂單', description: '軟刪除訂單' })
  @ApiParam({ name: 'id', description: '訂單 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '刪除成功' })
  @ApiResponse({ status: 404, description: '訂單不存在' })
  async deleteOrder(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.ordersService.deleteOrder(id);
  }

  @Post(':id/restore')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '恢復訂單', description: '恢復已刪除的訂單' })
  @ApiParam({ name: 'id', description: '訂單 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '恢復成功',  })
  @ApiResponse({ status: 404, description: '訂單不存在' })
  async restoreOrder(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.ordersService.restoreOrder(id);
  }
}
