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

@Controller('cramschool/error-logs')
@UseGuards(JwtAuthGuard)
export class ErrorLogsController {
  constructor(
    private readonly errorLogsService: ErrorLogsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
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
  async getErrorLog(@Param('id', ParseIntPipe) id: number): Promise<ErrorLog> {
    return this.errorLogsService.getErrorLog(id);
  }

  @Post()
  async createErrorLog(
    @Body(new ZodValidationPipe(CreateErrorLogSchema)) createDto: CreateErrorLogDto,
  ): Promise<ErrorLog> {
    return this.errorLogsService.createErrorLog(createDto);
  }

  @Put(':id')
  async updateErrorLog(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateErrorLogSchema)) updateDto: UpdateErrorLogDto,
  ): Promise<ErrorLog> {
    return this.errorLogsService.updateErrorLog(id, updateDto);
  }

  @Delete(':id')
  async deleteErrorLog(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.errorLogsService.deleteErrorLog(id);
  }

  @Post(':id/restore')
  async restoreErrorLog(@Param('id', ParseIntPipe) id: number): Promise<ErrorLog> {
    return this.errorLogsService.restoreErrorLog(id);
  }

  @Post(':id/import-to-question-bank')
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
