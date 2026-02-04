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
import { LeavesService } from '../services/leaves.service';
import {
  CreateLeaveDto,
  UpdateLeaveDto,
  Leave,
  CreateLeaveSchema,
  UpdateLeaveSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard';

@ApiTags('attendances')
@Controller('cramschool/leaves')
@UseGuards(JwtAuthGuard)
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得請假記錄列表', description: '分頁取得學生請假記錄' })
  @ApiQuery({ name: 'include_deleted', required: false, description: '是否包含已刪除', example: 'false', type: String })
  @ApiQuery({ name: 'page', required: false, description: '頁碼', example: 1, type: Number })
  @ApiQuery({ name: 'page_size', required: false, description: '每頁筆數', example: 10, type: Number })
  @ApiResponse({ status: 200, description: '成功取得請假記錄列表' })
  @ApiResponse({ status: 401, description: '未授權' })
  async getLeaves(
    @Query('include_deleted') includeDeleted: string = 'false',
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
  ) {
    return this.leavesService.getLeaves(includeDeleted === 'true', page, pageSize);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得單一請假記錄', description: '根據 ID 取得請假記錄詳細資料' })
  @ApiParam({ name: 'id', description: '請假記錄 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '成功',  })
  @ApiResponse({ status: 404, description: '請假記錄不存在' })
  async getLeave(@Param('id', ParseIntPipe) id: number): Promise<Leave> {
    return this.leavesService.getLeave(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '建立請假記錄', description: '新增學生請假申請' })
  @ApiResponse({ status: 201, description: '建立成功',  })
  @ApiResponse({ status: 400, description: '資料驗證失敗' })
  async createLeave(
    @Body(new ZodValidationPipe(CreateLeaveSchema)) createDto: CreateLeaveDto,
  ): Promise<Leave> {
    return this.leavesService.createLeave(createDto);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '更新請假記錄', description: '修改請假記錄資料' })
  @ApiParam({ name: 'id', description: '請假記錄 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '更新成功',  })
  @ApiResponse({ status: 404, description: '請假記錄不存在' })
  async updateLeave(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateLeaveSchema)) updateDto: UpdateLeaveDto,
  ): Promise<Leave> {
    return this.leavesService.updateLeave(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '刪除請假記錄', description: '軟刪除請假記錄' })
  @ApiParam({ name: 'id', description: '請假記錄 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '刪除成功' })
  @ApiResponse({ status: 404, description: '請假記錄不存在' })
  async deleteLeave(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.leavesService.deleteLeave(id);
  }

  @Post(':id/restore')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '恢復請假記錄', description: '恢復已刪除的請假記錄' })
  @ApiParam({ name: 'id', description: '請假記錄 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '恢復成功',  })
  @ApiResponse({ status: 404, description: '請假記錄不存在' })
  async restoreLeave(@Param('id', ParseIntPipe) id: number): Promise<Leave> {
    return this.leavesService.restoreLeave(id);
  }
}
