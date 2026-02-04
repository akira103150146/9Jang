import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { FeesService } from '../services/fees.service';
import {
  CreateFeeDto,
  UpdateFeeDto,
  BatchUpdateFeeStatusDto,
  CreateFeeSchema,
  UpdateFeeSchema,
  BatchUpdateFeeStatusSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard';

@ApiTags('fees')
@Controller('cramschool/fees')
@UseGuards(JwtAuthGuard)
export class FeesController {
  constructor(private readonly feesService: FeesService) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得費用列表', description: '分頁取得學費、雜費等費用記錄，可按學生篩選' })
  @ApiQuery({ name: 'page', required: false, description: '頁碼', example: 1, type: Number })
  @ApiQuery({ name: 'page_size', required: false, description: '每頁筆數', example: 10, type: Number })
  @ApiQuery({ name: 'student', required: false, description: '學生 ID 篩選', type: Number })
  @ApiQuery({ name: 'include_deleted', required: false, description: '是否包含已刪除', example: 'false', type: String })
  @ApiResponse({ status: 200, description: '成功取得費用列表' })
  @ApiResponse({ status: 401, description: '未授權' })
  async getFees(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
    @Query('student', new ParseIntPipe({ optional: true })) studentId?: number,
    @Query('include_deleted') includeDeleted?: string,
  ) {
    return this.feesService.getFees(
      page,
      pageSize,
      studentId,
      includeDeleted === 'true',
    );
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得單一費用記錄', description: '根據費用 ID 取得詳細資料' })
  @ApiParam({ name: 'id', description: '費用 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 404, description: '費用記錄不存在' })
  async getFee(@Param('id', ParseIntPipe) id: number) {
    return this.feesService.getFee(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '建立費用記錄', description: '新增學費或雜費記錄' })
  @ApiResponse({ status: 201, description: '建立成功' })
  @ApiResponse({ status: 400, description: '資料驗證失敗' })
  async createFee(
    @Body(new ZodValidationPipe(CreateFeeSchema)) createDto: CreateFeeDto,
  ) {
    return this.feesService.createFee(createDto);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '更新費用記錄', description: '修改費用金額、狀態等資訊' })
  @ApiParam({ name: 'id', description: '費用 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '費用記錄不存在' })
  async updateFee(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateFeeSchema)) updateDto: UpdateFeeDto,
  ) {
    return this.feesService.updateFee(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '刪除費用記錄', description: '刪除費用記錄' })
  @ApiParam({ name: 'id', description: '費用 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '刪除成功' })
  @ApiResponse({ status: 404, description: '費用記錄不存在' })
  async deleteFee(@Param('id', ParseIntPipe) id: number) {
    await this.feesService.deleteFee(id);
    return { message: '費用記錄已刪除' };
  }

  @Post('batch-update')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '批次更新費用狀態', description: '批次修改多筆費用的繳費狀態' })
  @ApiResponse({ status: 200, description: '批次更新成功' })
  @ApiResponse({ status: 400, description: '資料驗證失敗' })
  async batchUpdateStatus(
    @Body(new ZodValidationPipe(BatchUpdateFeeStatusSchema))
    batchUpdateDto: BatchUpdateFeeStatusDto,
  ) {
    return this.feesService.batchUpdateStatus(batchUpdateDto);
  }
}
