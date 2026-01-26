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

@Controller('cramschool/group-orders')
@UseGuards(JwtAuthGuard)
export class GroupOrdersController {
  constructor(
    private readonly groupOrdersService: GroupOrdersService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async getGroupOrders(
    @Request() req,
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
  async getGroupOrder(@Param('id', ParseIntPipe) id: number): Promise<GroupOrder> {
    return this.groupOrdersService.getGroupOrder(id);
  }

  @Post()
  async createGroupOrder(
    @Request() req,
    @Body(new ZodValidationPipe(CreateGroupOrderSchema)) createDto: CreateGroupOrderDto,
  ): Promise<GroupOrder> {
    const user = req.user;
    return this.groupOrdersService.createGroupOrder(createDto, user.id);
  }

  @Put(':id')
  async updateGroupOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateGroupOrderSchema)) updateDto: UpdateGroupOrderDto,
  ): Promise<GroupOrder> {
    return this.groupOrdersService.updateGroupOrder(id, updateDto);
  }

  @Delete(':id')
  async deleteGroupOrder(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.groupOrdersService.deleteGroupOrder(id);
  }

  @Post(':id/complete')
  async completeGroupOrder(
    @Request() req,
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
