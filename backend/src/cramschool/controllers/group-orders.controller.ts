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
import { GroupOrdersService } from '../services/group-orders.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateGroupOrderDto,
  UpdateGroupOrderDto,
  GroupOrder,
  CreateGroupOrderSchema,
  UpdateGroupOrderSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard';

@ApiTags('orders')
@Controller('cramschool/group-orders')
@UseGuards(JwtAuthGuard)
export class GroupOrdersController {
  constructor(
    private readonly groupOrdersService: GroupOrdersService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得團訂列表', description: '分頁取得所有團訂記錄（管理員無法使用）' })
  @ApiQuery({ name: 'page', required: false, description: '頁碼', example: 1, type: Number })
  @ApiQuery({ name: 'page_size', required: false, description: '每頁筆數', example: 10, type: Number })
  @ApiResponse({ status: 200, description: '成功取得團訂列表' })
  @ApiResponse({ status: 401, description: '未授權' })
  async getGroupOrders(
    @Request() req: AuthRequest,
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
    return this.groupOrdersService.getGroupOrders(page, pageSize);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得單一團訂', description: '根據團訂 ID 取得詳細資料和訂單明細' })
  @ApiParam({ name: 'id', description: '團訂 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '成功',  })
  @ApiResponse({ status: 404, description: '團訂不存在' })
  async getGroupOrder(@Param('id', ParseIntPipe) id: number): Promise<GroupOrder> {
    return this.groupOrdersService.getGroupOrder(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '建立團訂', description: '新增團訂記錄，設定餐廳、截止時間等' })
  @ApiResponse({ status: 201, description: '建立成功',  })
  @ApiResponse({ status: 400, description: '資料驗證失敗' })
  async createGroupOrder(
    @Request() req: AuthRequest,
    @Body(new ZodValidationPipe(CreateGroupOrderSchema)) createDto: CreateGroupOrderDto,
  ): Promise<GroupOrder> {
    const user = req.user;
    return this.groupOrdersService.createGroupOrder(createDto, user.id);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '更新團訂', description: '修改團訂資料' })
  @ApiParam({ name: 'id', description: '團訂 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '更新成功',  })
  @ApiResponse({ status: 404, description: '團訂不存在' })
  async updateGroupOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateGroupOrderSchema)) updateDto: UpdateGroupOrderDto,
  ): Promise<GroupOrder> {
    return this.groupOrdersService.updateGroupOrder(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '刪除團訂', description: '刪除團訂記錄' })
  @ApiParam({ name: 'id', description: '團訂 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '刪除成功' })
  @ApiResponse({ status: 404, description: '團訂不存在' })
  async deleteGroupOrder(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.groupOrdersService.deleteGroupOrder(id);
  }

  @Post(':id/complete')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '完成團訂', description: '標記團訂為已完成狀態' })
  @ApiParam({ name: 'id', description: '團訂 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '完成成功',  })
  @ApiResponse({ status: 404, description: '團訂不存在' })
  async completeGroupOrder(
    @Request() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GroupOrder> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    const userRole = userRecord?.role || '';
    return this.groupOrdersService.completeGroupOrder(id, user.id, userRole);
  }
}
