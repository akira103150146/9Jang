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
import { StudentMistakeNotesService } from '../services/student-mistake-notes.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateStudentMistakeNoteDto,
  UpdateStudentMistakeNoteDto,
  StudentMistakeNote,
  CreateStudentMistakeNoteSchema,
  UpdateStudentMistakeNoteSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard';

@ApiTags('mistake-notes')
@Controller('cramschool/student-mistake-notes')
@UseGuards(JwtAuthGuard)
export class StudentMistakeNotesController {
  constructor(
    private readonly studentMistakeNotesService: StudentMistakeNotesService,
    private readonly prisma: PrismaService,
  ) { }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得訂正本列表', description: '分頁取得學生訂正本記錄，支援搜尋和篩選' })
  @ApiQuery({ name: 'include_deleted', required: false, description: '是否包含已刪除', example: 'false', type: String })
  @ApiQuery({ name: 'student_id', required: false, description: '學生 ID 篩選', type: Number })
  @ApiQuery({ name: 'q', required: false, description: '搜尋關鍵字', type: String })
  @ApiQuery({ name: 'page', required: false, description: '頁碼', example: 1, type: Number })
  @ApiQuery({ name: 'page_size', required: false, description: '每頁筆數', example: 10, type: Number })
  @ApiResponse({ status: 200, description: '成功取得訂正本列表' })
  @ApiResponse({ status: 401, description: '未授權' })
  async getStudentMistakeNotes(
    @Request() req: AuthRequest,
    @Query('include_deleted') includeDeleted: string = 'false',
    @Query('student_id', new ParseIntPipe({ optional: true })) studentId?: number,
    @Query('q') searchQuery?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
  ) {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    const userRole = userRecord?.role || '';
    return this.studentMistakeNotesService.getStudentMistakeNotes(
      user.id,
      userRole,
      includeDeleted === 'true',
      studentId,
      searchQuery,
      page,
      pageSize,
    );
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得單一訂正本', description: '根據訂正本 ID 取得詳細資料' })
  @ApiParam({ name: 'id', description: '訂正本 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 404, description: '訂正本不存在' })
  async getStudentMistakeNote(
    @Request() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StudentMistakeNote> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    const userRole = userRecord?.role || '';
    return this.studentMistakeNotesService.getStudentMistakeNote(id, user.id, userRole);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '建立訂正本記錄', description: '新增學生訂正本記錄' })
  @ApiResponse({ status: 201, description: '建立成功' })
  @ApiResponse({ status: 400, description: '資料驗證失敗' })
  async createStudentMistakeNote(
    @Request() req: AuthRequest,
    @Body(new ZodValidationPipe(CreateStudentMistakeNoteSchema)) createDto: CreateStudentMistakeNoteDto,
  ): Promise<StudentMistakeNote> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    const userRole = userRecord?.role || '';
    return this.studentMistakeNotesService.createStudentMistakeNote(createDto, user.id, userRole);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '更新訂正本', description: '修改訂正本記錄內容' })
  @ApiParam({ name: 'id', description: '訂正本 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '訂正本不存在' })
  async updateStudentMistakeNote(
    @Request() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateStudentMistakeNoteSchema)) updateDto: UpdateStudentMistakeNoteDto,
  ): Promise<StudentMistakeNote> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    const userRole = userRecord?.role || '';
    return this.studentMistakeNotesService.updateStudentMistakeNote(id, updateDto, user.id, userRole);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '刪除訂正本', description: '軟刪除訂正本記錄' })
  @ApiParam({ name: 'id', description: '訂正本 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '刪除成功' })
  @ApiResponse({ status: 404, description: '訂正本不存在' })
  async deleteStudentMistakeNote(
    @Request() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    const userRole = userRecord?.role || '';
    return this.studentMistakeNotesService.deleteStudentMistakeNote(id, user.id, userRole);
  }

  @Post(':id/restore')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '恢復訂正本', description: '恢復已刪除的訂正本記錄' })
  @ApiParam({ name: 'id', description: '訂正本 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '恢復成功' })
  @ApiResponse({ status: 404, description: '訂正本不存在' })
  async restoreStudentMistakeNote(@Param('id', ParseIntPipe) id: number): Promise<StudentMistakeNote> {
    return this.studentMistakeNotesService.restoreStudentMistakeNote(id);
  }

  @Post(':id/import-to-question-bank')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '匯入到題庫', description: '將訂正本記錄匯入到題庫（需教師或管理員權限）' })
  @ApiParam({ name: 'id', description: '訂正本 ID', example: 1, type: Number })
  @ApiResponse({ status: 201, description: '匯入成功' })
  @ApiResponse({ status: 403, description: '無權限（需教師或管理員）' })
  @ApiResponse({ status: 404, description: '訂正本不存在' })
  async importToQuestionBank(
    @Request() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: {
      subject_id: number;
      level: string;
      chapter: string;
      content: string;
      correct_answer: string;
      difficulty?: number;
      question_number?: string;
      origin?: string;
      origin_detail?: string;
      solution_content?: string;
      image_path?: string;
      tag_ids?: number[];
    },
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

    return this.studentMistakeNotesService.importToQuestionBank(id, user.id, body);
  }

  @Post(':id/upload-images')
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '上傳訂正本圖片', description: '為訂正本上傳圖片（最多 10 張，僅學生可上傳）' })
  @ApiParam({ name: 'id', description: '訂正本 ID', example: 1, type: Number })
  @ApiResponse({ status: 201, description: '上傳成功' })
  @ApiResponse({ status: 400, description: '沒有提供圖片' })
  @ApiResponse({ status: 403, description: '無權限（僅學生可上傳）' })
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

    // 只有學生可以上傳
    if (userRole !== 'STUDENT') {
      throw new Error('只有學生可以上傳錯題筆記圖片');
    }

    if (!files || files.length === 0) {
      throw new Error('沒有提供圖片');
    }

    return this.studentMistakeNotesService.uploadImages(id, user.id, files);
  }

  @Post(':id/reorder-images')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '重新排序圖片', description: '調整訂正本圖片的顯示順序（僅學生可操作）' })
  @ApiParam({ name: 'id', description: '訂正本 ID', example: 1, type: Number })
  @ApiBody({ schema: { example: { image_ids: [3, 1, 2] } } })
  @ApiResponse({ status: 200, description: '排序成功' })
  @ApiResponse({ status: 403, description: '無權限（僅學生可操作）' })
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

    // 只有學生可以操作
    if (userRole !== 'STUDENT') {
      throw new Error('只有學生可以操作');
    }

    if (!body.image_ids || !Array.isArray(body.image_ids) || body.image_ids.length === 0) {
      throw new Error('請提供 image_ids');
    }

    return this.studentMistakeNotesService.reorderImages(id, user.id, body.image_ids);
  }
}
