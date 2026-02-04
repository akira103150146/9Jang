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
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor, AnyFilesInterceptor } from '@nestjs/platform-express';
import { QuestionsService } from '../services/questions/questions.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  QuestionQuery,
  Question,
  QuestionQuerySchema,
  CreateQuestionSchema,
  UpdateQuestionSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard';

@Controller('cramschool/questions')
@UseGuards(JwtAuthGuard)
export class QuestionsController {
  constructor(
    private readonly questionsService: QuestionsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async getQuestions(
    @Query(new ZodValidationPipe(QuestionQuerySchema)) query: QuestionQuery,
    @Request() req: AuthRequest,
  ) {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    return this.questionsService.getQuestions(query, user.id, userRecord?.role || 'STUDENT');
  }

  @Get(':id')
  async getQuestion(@Param('id', ParseIntPipe) id: number): Promise<Question> {
    return this.questionsService.getQuestion(id);
  }

  @Post()
  async createQuestion(
    @Body(new ZodValidationPipe(CreateQuestionSchema)) createDto: CreateQuestionDto,
    @Request() req: AuthRequest,
  ): Promise<Question> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    return this.questionsService.createQuestion(createDto, user.id, userRecord?.role || 'STUDENT');
  }

  @Put(':id')
  async updateQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateQuestionSchema)) updateDto: UpdateQuestionDto,
    @Request() req: AuthRequest,
  ): Promise<Question> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    return this.questionsService.updateQuestion(id, updateDto, user.id, userRecord?.role || 'STUDENT');
  }

  @Delete(':id')
  async deleteQuestion(@Param('id', ParseIntPipe) id: number, @Request() req: AuthRequest): Promise<void> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    return this.questionsService.deleteQuestion(id, userRecord?.role || 'STUDENT');
  }

  @Get('search-chapters')
  async searchChapters(
    @Query('q') query: string,
    @Query('subject', new ParseIntPipe({ optional: true })) subjectId?: number,
    @Query('level') level?: string,
  ): Promise<any[]> {
    return this.questionsService.searchChapters(query, subjectId, level);
  }

  @Get('source-options')
  async getSourceOptions(): Promise<any> {
    return this.questionsService.getSourceOptions();
  }

  @Get(':id/export-to-latex')
  async exportToLatex(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.questionsService.exportToLatex(id);
  }

  @Get(':id/export-to-markdown')
  async exportToMarkdown(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.questionsService.exportToMarkdown(id);
  }

  @Post('preview-from-word')
  @UseInterceptors(FileInterceptor('file'))
  async previewFromWord(
    @Request() req: AuthRequest,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { subject_id: number; level: string; chapter: string },
  ): Promise<any> {
    if (!body.subject_id || !body.level || !body.chapter) {
      throw new Error('請提供 subject_id, level, chapter');
    }

    return this.questionsService.previewFromWord(file, body.subject_id, body.level, body.chapter);
  }

  @Post('import-from-word')
  @UseInterceptors(FileInterceptor('file'))
  async importFromWord(
    @Request() req: AuthRequest,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { subject_id: number; level: string; chapter: string },
  ): Promise<any> {
    const user = req.user;
    if (!body.subject_id || !body.level || !body.chapter) {
      throw new Error('請提供 subject_id, level, chapter');
    }

    return this.questionsService.importFromWord(
      file,
      body.subject_id,
      body.level,
      body.chapter,
      user.id,
    );
  }

  @Post('preview-from-markdown')
  @UseInterceptors(
    AnyFilesInterceptor({
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
    }),
  )
  async previewFromMarkdown(
    @Request() req: AuthRequest,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: { subject_id: number; level: string; chapter: string },
  ): Promise<any> {
    if (!body.subject_id || !body.level || !body.chapter) {
      throw new Error('請提供 subject_id, level, chapter');
    }

    // 分離 markdown 文件和圖片文件
    const markdownFile = files.find(
      (f) => f.fieldname === 'markdown_file' && (f.originalname.endsWith('.md') || f.originalname.endsWith('.markdown')),
    );
    const imageFiles = files.filter((f) => f.fieldname === 'images' || f.fieldname.startsWith('images'));

    if (!markdownFile) {
      throw new Error('請選擇 Markdown 檔案');
    }

    return this.questionsService.previewFromMarkdown(
      markdownFile,
      imageFiles || [],
      body.subject_id,
      body.level,
      body.chapter,
    );
  }

  @Post('import-from-markdown')
  @UseInterceptors(
    AnyFilesInterceptor({
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
    }),
  )
  async importFromMarkdown(
    @Request() req: AuthRequest,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: { subject_id: number; level: string; chapter: string },
  ): Promise<any> {
    const user = req.user;
    if (!body.subject_id || !body.level || !body.chapter) {
      throw new Error('請提供 subject_id, level, chapter');
    }

    // 分離 markdown 文件和圖片文件
    const markdownFile = files.find(
      (f) => f.fieldname === 'markdown_file' && (f.originalname.endsWith('.md') || f.originalname.endsWith('.markdown')),
    );
    const imageFiles = files.filter((f) => f.fieldname === 'images' || f.fieldname.startsWith('images'));

    if (!markdownFile) {
      throw new Error('請選擇 Markdown 檔案');
    }

    return this.questionsService.importFromMarkdown(
      markdownFile,
      imageFiles || [],
      body.subject_id,
      body.level,
      body.chapter,
      user.id,
    );
  }
}
