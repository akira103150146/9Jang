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

@Controller('cramschool/student-mistake-notes')
@UseGuards(JwtAuthGuard)
export class StudentMistakeNotesController {
  constructor(
    private readonly studentMistakeNotesService: StudentMistakeNotesService,
    private readonly prisma: PrismaService,
  ) { }

  @Get()
  async getStudentMistakeNotes(
    @Request() req,
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
  async getStudentMistakeNote(
    @Request() req,
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
  async createStudentMistakeNote(
    @Request() req,
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
  async updateStudentMistakeNote(
    @Request() req,
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
  async deleteStudentMistakeNote(
    @Request() req,
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
  async restoreStudentMistakeNote(@Param('id', ParseIntPipe) id: number): Promise<StudentMistakeNote> {
    return this.studentMistakeNotesService.restoreStudentMistakeNote(id);
  }

  @Post(':id/import-to-question-bank')
  async importToQuestionBank(
    @Request() req,
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
  async uploadImages(
    @Request() req,
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
  async reorderImages(
    @Request() req,
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
