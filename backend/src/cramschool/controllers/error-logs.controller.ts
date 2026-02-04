import { AuthRequest } from '@/types/request.types';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
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
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ErrorLogsService } from '../services/error-logs.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateErrorLogDto,
  UpdateErrorLogDto,
  ErrorLog,
  CreateErrorLogSchema,
  UpdateErrorLogSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard';

@ApiTags('error-logs')
@Controller('cramschool/error-logs')
@UseGuards(JwtAuthGuard)
export class ErrorLogsController {
  constructor(
    private readonly errorLogsService: ErrorLogsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '取得錯題列表', 
    description: '根據查詢條件分頁取得錯題記錄，支援按學生篩選、包含已刪除記錄'
  })
  @ApiQuery({ name: 'include_deleted', required: false, description: '是否包含已刪除記錄', example: 'false', type: String })
  @ApiQuery({ name: 'student', required: false, description: '學生 ID 篩選', type: Number })
  @ApiQuery({ name: 'page', required: false, description: '頁碼', example: 1, type: Number })
  @ApiQuery({ name: 'page_size', required: false, description: '每頁筆數', example: 10, type: Number })
  @ApiResponse({ 
    status: 200, 
    description: '成功取得錯題列表',
    schema: {
      example: {
        data: [
          {
            error_log_id: 1,
            student_id: 1,
            question_id: 1,
            notes: '計算錯誤',
            created_at: '2026-02-04T00:00:00Z'
          }
        ],
        total: 50,
        page: 1,
        page_size: 10
      }
    }
  })
  @ApiResponse({ status: 401, description: '未授權' })
  async getErrorLogs(
    @Request() req: AuthRequest,
    @Query('include_deleted') includeDeleted: string = 'false',
    @Query('student', new ParseIntPipe({ optional: true })) studentId?: number,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
  ) {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    const userRole = userRecord?.role || '';
    return this.errorLogsService.getErrorLogs(
      user.id,
      userRole,
      includeDeleted === 'true',
      studentId,
      page,
      pageSize,
    );
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '取得單一錯題', 
    description: '根據錯題 ID 取得詳細資料，包含題目內容、學生資訊、圖片等'
  })
  @ApiParam({ name: 'id', description: '錯題 ID', example: 1, type: Number })
  @ApiResponse({ 
    status: 200, 
    description: '成功取得錯題資料',
    
  })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 404, description: '錯題不存在' })
  async getErrorLog(@Param('id', ParseIntPipe) id: number): Promise<ErrorLog> {
    return this.errorLogsService.getErrorLog(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '建立錯題記錄', 
    description: '新增學生的錯題記錄到系統，可關聯題目或直接輸入內容'
  })
  @ApiResponse({ 
    status: 201, 
    description: '建立成功',
    
  })
  @ApiResponse({ status: 400, description: '資料驗證失敗' })
  @ApiResponse({ status: 401, description: '未授權' })
  async createErrorLog(
    @Body(new ZodValidationPipe(CreateErrorLogSchema)) createDto: CreateErrorLogDto,
  ): Promise<ErrorLog> {
    return this.errorLogsService.createErrorLog(createDto);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '更新錯題記錄', 
    description: '修改錯題的內容、備註等資訊'
  })
  @ApiParam({ name: 'id', description: '錯題 ID', example: 1, type: Number })
  @ApiResponse({ 
    status: 200, 
    description: '更新成功',
    
  })
  @ApiResponse({ status: 400, description: '資料驗證失敗' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 404, description: '錯題不存在' })
  async updateErrorLog(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateErrorLogSchema)) updateDto: UpdateErrorLogDto,
  ): Promise<ErrorLog> {
    return this.errorLogsService.updateErrorLog(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '刪除錯題記錄', 
    description: '軟刪除錯題記錄（設為 is_deleted = true）'
  })
  @ApiParam({ name: 'id', description: '錯題 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '刪除成功' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 404, description: '錯題不存在' })
  async deleteErrorLog(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.errorLogsService.deleteErrorLog(id);
  }

  @Post(':id/restore')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '恢復已刪除的錯題', 
    description: '將已軟刪除的錯題記錄恢復（設為 is_deleted = false）'
  })
  @ApiParam({ name: 'id', description: '錯題 ID', example: 1, type: Number })
  @ApiResponse({ 
    status: 200, 
    description: '恢復成功',
    
  })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 404, description: '錯題不存在' })
  async restoreErrorLog(@Param('id', ParseIntPipe) id: number): Promise<ErrorLog> {
    return this.errorLogsService.restoreErrorLog(id);
  }

  @Post(':id/import-to-question-bank')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '匯入到題庫', 
    description: '將錯題記錄匯入到題庫系統，建立新的題目（需教師或管理員權限）'
  })
  @ApiParam({ name: 'id', description: '錯題 ID', example: 1, type: Number })
  @ApiResponse({ 
    status: 201, 
    description: '匯入成功，返回新建立的題目資訊'
  })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '無權限（需教師或管理員）' })
  @ApiResponse({ status: 404, description: '錯題不存在' })
  async importToQuestionBank(
    @Request() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<any> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    const userRole = userRecord?.role || '';

    // 會計不可用
    if (userRole === 'ACCOUNTANT') {
      throw new Error('會計不可匯入題庫');
    }

    // 只有老師或管理員可用
    if (userRole !== 'TEACHER' && userRole !== 'ADMIN') {
      throw new Error('無權限');
    }

    return this.errorLogsService.importToQuestionBank(id, user.id);
  }

  @Post(':id/upload-images')
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '上傳錯題圖片', 
    description: '為錯題記錄上傳圖片（最多 10 張），需教師、管理員或會計權限'
  })
  @ApiParam({ name: 'id', description: '錯題 ID', example: 1, type: Number })
  @ApiResponse({ 
    status: 201, 
    description: '上傳成功，返回圖片資訊'
  })
  @ApiResponse({ status: 400, description: '沒有提供圖片或格式錯誤' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '無權限（學生不可上傳）' })
  @ApiResponse({ status: 404, description: '錯題不存在' })
  async uploadImages(
    @Request() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<any> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    const userRole = userRecord?.role || '';

    // 學生不可用
    if (userRole === 'STUDENT') {
      throw new Error('學生不可上傳學生管理端錯題圖片');
    }

    // 只有管理員、老師或會計可用
    if (userRole !== 'ADMIN' && userRole !== 'TEACHER' && userRole !== 'ACCOUNTANT') {
      throw new Error('無權限');
    }

    if (!files || files.length === 0) {
      throw new Error('沒有提供圖片');
    }

    return this.errorLogsService.uploadImages(id, files);
  }

  @Post(':id/reorder-images')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '重新排序圖片', 
    description: '調整錯題圖片的顯示順序，需教師、管理員或會計權限'
  })
  @ApiParam({ name: 'id', description: '錯題 ID', example: 1, type: Number })
  @ApiBody({
    schema: {
      example: {
        image_ids: [3, 1, 2]
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: '排序成功'
  })
  @ApiResponse({ status: 400, description: '未提供 image_ids 或格式錯誤' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '無權限（學生不可操作）' })
  @ApiResponse({ status: 404, description: '錯題不存在' })
  async reorderImages(
    @Request() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { image_ids: number[] },
  ): Promise<any> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    const userRole = userRecord?.role || '';

    // 學生不可用
    if (userRole === 'STUDENT') {
      throw new Error('學生不可操作');
    }

    // 只有管理員、老師或會計可用
    if (userRole !== 'ADMIN' && userRole !== 'TEACHER' && userRole !== 'ACCOUNTANT') {
      throw new Error('無權限');
    }

    if (!body.image_ids || !Array.isArray(body.image_ids) || body.image_ids.length === 0) {
      throw new Error('請提供 image_ids');
    }

    return this.errorLogsService.reorderImages(id, body.image_ids);
  }
}
