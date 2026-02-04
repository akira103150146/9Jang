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
import { ErrorLogImagesService } from '../services/error-log-images.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateErrorLogImageDto,
  UpdateErrorLogImageDto,
  ErrorLogImage,
  CreateErrorLogImageSchema,
  UpdateErrorLogImageSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard';

@ApiTags('error-logs')
@Controller('cramschool/error-log-images')
@UseGuards(JwtAuthGuard)
export class ErrorLogImagesController {
  constructor(
    private readonly errorLogImagesService: ErrorLogImagesService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得錯題圖片列表', description: '分頁取得錯題圖片（教師和管理員可用）' })
  @ApiQuery({ name: 'error_log', required: false, description: '錯題 ID 篩選', type: Number })
  @ApiQuery({ name: 'page', required: false, description: '頁碼', example: 1, type: Number })
  @ApiQuery({ name: 'page_size', required: false, description: '每頁筆數', example: 10, type: Number })
  @ApiResponse({ status: 200, description: '成功' })
  async getErrorLogImages(
    @Request() req: AuthRequest,
    @Query('error_log', new ParseIntPipe({ optional: true })) errorLogId?: number,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
  ) {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    const userRole = userRecord?.role || '';

    // 會計和學生不可用
    if (userRole === 'ACCOUNTANT' || userRole === 'STUDENT') {
      return { count: 0, results: [], page: 1, page_size: pageSize };
    }

    return this.errorLogImagesService.getErrorLogImages(errorLogId, page, pageSize);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得單一錯題圖片', description: '根據圖片 ID 取得詳細資料' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 404, description: '圖片不存在' })
  async getErrorLogImage(@Param('id', ParseIntPipe) id: number): Promise<ErrorLogImage> {
    return this.errorLogImagesService.getErrorLogImage(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '建立錯題圖片記錄', description: '新增錯題圖片記錄' })
  @ApiResponse({ status: 201, description: '建立成功' })
  @ApiResponse({ status: 400, description: '驗證失敗' })
  async createErrorLogImage(
    @Body(new ZodValidationPipe(CreateErrorLogImageSchema)) createDto: CreateErrorLogImageDto,
  ): Promise<ErrorLogImage> {
    return this.errorLogImagesService.createErrorLogImage(createDto);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '更新錯題圖片', description: '修改圖片排序或資訊' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '圖片不存在' })
  async updateErrorLogImage(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateErrorLogImageSchema)) updateDto: UpdateErrorLogImageDto,
  ): Promise<ErrorLogImage> {
    return this.errorLogImagesService.updateErrorLogImage(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '刪除錯題圖片', description: '刪除錯題圖片記錄' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '刪除成功' })
  @ApiResponse({ status: 404, description: '圖片不存在' })
  async deleteErrorLogImage(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.errorLogImagesService.deleteErrorLogImage(id);
  }
}
