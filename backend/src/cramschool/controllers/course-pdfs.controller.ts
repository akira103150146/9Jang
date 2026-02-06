import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  BadRequestException,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiParam, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard';
import { CoursePdfsService } from '../services/course-pdfs.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthRequest } from '@/types/request.types';
import { CreateCoursePdfDto, UpdateCoursePdfDto, CoursePdf } from '@9jang/shared';

@ApiTags('course-pdfs')
@Controller('cramschool/courses/:courseId/pdfs')
@UseGuards(JwtAuthGuard)
export class CoursePdfsController {
  constructor(
    private readonly coursePdfsService: CoursePdfsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: '上傳 PDF 講義',
    description: '老師上傳 PDF 檔案到課程,可設定可見的學生群組',
  })
  @ApiParam({ name: 'courseId', description: '課程 ID', example: 1, type: Number })
  @ApiResponse({
    status: 201,
    description: 'PDF 上傳成功',
    schema: {
      example: {
        pdf_id: 1,
        title: '第一章講義',
        description: '數學第一章',
        file_path: 'course_pdfs/1/1234567890_lecture1.pdf',
        file_size: 1024000,
        course_id: 1,
        uploaded_by_id: 1,
        student_group_ids: [1, 2],
        allow_download: false,
        is_visible_to_all: false,
        is_active: true,
        created_at: '2026-02-06T10:00:00.000Z',
        updated_at: '2026-02-06T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: '檔案格式錯誤或缺少必要欄位' })
  @ApiResponse({ status: 403, description: '無權限上傳' })
  async uploadPdf(
    @Param('courseId', ParseIntPipe) courseId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Request() req: AuthRequest,
  ): Promise<CoursePdf> {
    if (!file) {
      throw new BadRequestException('請上傳 PDF 檔案');
    }

    // 檢查檔案類型
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('只接受 PDF 格式檔案');
    }

    // 檢查檔案大小 (限制 20MB)
    if (file.size > 20 * 1024 * 1024) {
      throw new BadRequestException('PDF 檔案大小不能超過 20MB');
    }

    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });

    // 解析 body 參數
    const createDto: CreateCoursePdfDto = {
      title: body.title,
      description: body.description || null,
      course_id: courseId,
      student_group_ids: body.student_group_ids
        ? typeof body.student_group_ids === 'string'
          ? JSON.parse(body.student_group_ids)
          : body.student_group_ids
        : [],
      is_visible_to_all: body.is_visible_to_all === 'true' || body.is_visible_to_all === true,
      allow_download: body.allow_download === 'true' || body.allow_download === true,
      is_active: body.is_active !== undefined ? body.is_active === 'true' || body.is_active === true : true,
    };

    if (!createDto.title) {
      throw new BadRequestException('請提供 PDF 標題');
    }

    try {
      return this.coursePdfsService.uploadPdf(file, createDto, user.id, userRecord?.role || 'STUDENT');
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '取得課程 PDF 列表',
    description: '學生取得自己可見的 PDF, 老師取得所有 PDF',
  })
  @ApiParam({ name: 'courseId', description: '課程 ID', example: 1, type: Number })
  @ApiResponse({
    status: 200,
    description: '成功取得 PDF 列表',
    schema: {
      example: [
        {
          pdf_id: 1,
          title: '第一章講義',
          description: '數學第一章',
          file_path: 'course_pdfs/1/1234567890_lecture1.pdf',
          file_size: 1024000,
          course_id: 1,
          uploaded_by_id: 1,
          student_group_ids: [1, 2],
          allow_download: false,
          is_visible_to_all: false,
          is_active: true,
          created_at: '2026-02-06T10:00:00.000Z',
          updated_at: '2026-02-06T10:00:00.000Z',
        },
      ],
    },
  })
  async getPdfs(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Request() req: AuthRequest,
  ): Promise<CoursePdf[]> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });

    const userRole = userRecord?.role || 'STUDENT';

    try {
      if (userRole === 'TEACHER' || userRole === 'ADMIN') {
        return this.coursePdfsService.getPdfsForTeacher(courseId, user.id, userRole);
      } else {
        return this.coursePdfsService.getPdfsForStudent(courseId, user.id);
      }
    } catch (error) {
      throw error;
    }
  }

  @Get(':pdfId/view')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '檢視 PDF',
    description: '在瀏覽器中檢視 PDF (inline)',
  })
  @ApiParam({ name: 'courseId', description: '課程 ID', example: 1, type: Number })
  @ApiParam({ name: 'pdfId', description: 'PDF ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '返回 PDF 檔案流' })
  @ApiResponse({ status: 403, description: '無權限檢視' })
  @ApiResponse({ status: 404, description: 'PDF 不存在' })
  async viewPdf(
    @Param('courseId', ParseIntPipe) _courseId: number,
    @Param('pdfId', ParseIntPipe) pdfId: number,
    @Request() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });

    const { stream, filename } = await this.coursePdfsService.viewPdf(
      pdfId,
      user.id,
      userRecord?.role || 'STUDENT',
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${encodeURIComponent(filename)}"`,
    });

    return new StreamableFile(stream);
  }

  @Get(':pdfId/download')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '下載 PDF',
    description: '下載 PDF 檔案 (需要 allow_download 權限)',
  })
  @ApiParam({ name: 'courseId', description: '課程 ID', example: 1, type: Number })
  @ApiParam({ name: 'pdfId', description: 'PDF ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '返回 PDF 檔案流' })
  @ApiResponse({ status: 403, description: '無權限下載或 PDF 不允許下載' })
  @ApiResponse({ status: 404, description: 'PDF 不存在' })
  async downloadPdf(
    @Param('courseId', ParseIntPipe) _courseId: number,
    @Param('pdfId', ParseIntPipe) pdfId: number,
    @Request() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });

    const { stream, filename } = await this.coursePdfsService.downloadPdf(
      pdfId,
      user.id,
      userRecord?.role || 'STUDENT',
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
    });

    return new StreamableFile(stream);
  }

  @Put(':pdfId/download')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '切換下載權限',
    description: '老師切換 PDF 的下載權限',
  })
  @ApiParam({ name: 'courseId', description: '課程 ID', example: 1, type: Number })
  @ApiParam({ name: 'pdfId', description: 'PDF ID', example: 1, type: Number })
  @ApiBody({
    schema: {
      example: {
        allow_download: true,
      },
    },
  })
  @ApiResponse({ status: 200, description: '成功切換下載權限' })
  @ApiResponse({ status: 403, description: '無權限修改' })
  async toggleDownload(
    @Param('courseId', ParseIntPipe) _courseId: number,
    @Param('pdfId', ParseIntPipe) pdfId: number,
    @Body() body: { allow_download: boolean },
    @Request() req: AuthRequest,
  ): Promise<CoursePdf> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });

    if (body.allow_download === undefined) {
      throw new BadRequestException('請提供 allow_download 參數');
    }

    return this.coursePdfsService.toggleDownload(
      pdfId,
      body.allow_download,
      user.id,
      userRecord?.role || 'STUDENT',
    );
  }

  @Put(':pdfId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '更新 PDF 資訊',
    description: '更新 PDF 的標題、描述、群組設定等',
  })
  @ApiParam({ name: 'courseId', description: '課程 ID', example: 1, type: Number })
  @ApiParam({ name: 'pdfId', description: 'PDF ID', example: 1, type: Number })
  @ApiBody({
    schema: {
      example: {
        title: '第一章講義 (更新)',
        description: '數學第一章 - 更新版',
        student_group_ids: [1, 2, 3],
        is_visible_to_all: false,
        allow_download: true,
      },
    },
  })
  @ApiResponse({ status: 200, description: '成功更新 PDF 資訊' })
  @ApiResponse({ status: 403, description: '無權限修改' })
  async updatePdf(
    @Param('courseId', ParseIntPipe) _courseId: number,
    @Param('pdfId', ParseIntPipe) pdfId: number,
    @Body() updateDto: UpdateCoursePdfDto,
    @Request() req: AuthRequest,
  ): Promise<CoursePdf> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });

    return this.coursePdfsService.updatePdf(pdfId, updateDto, user.id, userRecord?.role || 'STUDENT');
  }

  @Delete(':pdfId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '刪除 PDF',
    description: '軟刪除 PDF (設為 is_active = false)',
  })
  @ApiParam({ name: 'courseId', description: '課程 ID', example: 1, type: Number })
  @ApiParam({ name: 'pdfId', description: 'PDF ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '刪除成功' })
  @ApiResponse({ status: 403, description: '無權限刪除' })
  @ApiResponse({ status: 404, description: 'PDF 不存在' })
  async deletePdf(
    @Param('courseId', ParseIntPipe) _courseId: number,
    @Param('pdfId', ParseIntPipe) pdfId: number,
    @Request() req: AuthRequest,
  ): Promise<{ message: string }> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });

    await this.coursePdfsService.deletePdf(pdfId, user.id, userRecord?.role || 'STUDENT');

    return { message: 'PDF 已成功刪除' };
  }
}
