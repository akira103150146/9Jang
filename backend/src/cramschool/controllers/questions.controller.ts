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
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, AnyFilesInterceptor } from '@nestjs/platform-express';
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

@ApiTags('questions')
@Controller('cramschool/questions')
@UseGuards(JwtAuthGuard)
export class QuestionsController {
  constructor(
    private readonly questionsService: QuestionsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得題目列表', description: '根據查詢條件分頁取得題目，支援科目、難度、章節等篩選' })
  @ApiQuery({ name: 'page', required: false, description: '頁碼', example: 1, type: Number })
  @ApiQuery({ name: 'page_size', required: false, description: '每頁筆數', example: 10, type: Number })
  @ApiQuery({ name: 'subject_id', required: false, description: '科目 ID', type: Number })
  @ApiQuery({ name: 'level', required: false, description: '年級', example: '國三', type: String })
  @ApiQuery({ name: 'chapter', required: false, description: '章節', type: String })
  @ApiQuery({ name: 'difficulty', required: false, description: '難度 (1-5)', type: Number })
  @ApiResponse({ status: 200, description: '成功取得題目列表' })
  @ApiResponse({ status: 401, description: '未授權' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得單一題目', description: '根據題目 ID 取得詳細內容、解答、標籤等' })
  @ApiParam({ name: 'id', description: '題目 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '成功',  })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 404, description: '題目不存在' })
  async getQuestion(@Param('id', ParseIntPipe) id: number): Promise<Question> {
    return this.questionsService.getQuestion(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '建立題目', description: '新增題目到題庫，可設定科目、難度、標籤等' })
  @ApiResponse({ status: 201, description: '建立成功',  })
  @ApiResponse({ status: 400, description: '資料驗證失敗' })
  @ApiResponse({ status: 401, description: '未授權' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '更新題目', description: '修改題目內容、解答、難度等資訊' })
  @ApiParam({ name: 'id', description: '題目 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '更新成功',  })
  @ApiResponse({ status: 400, description: '資料驗證失敗' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 404, description: '題目不存在' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '刪除題目', description: '軟刪除題目（設為 is_deleted）' })
  @ApiParam({ name: 'id', description: '題目 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '刪除成功' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 404, description: '題目不存在' })
  async deleteQuestion(@Param('id', ParseIntPipe) id: number, @Request() req: AuthRequest): Promise<void> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    return this.questionsService.deleteQuestion(id, userRecord?.role || 'STUDENT');
  }

  @Get('search-chapters')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '搜尋章節', description: '根據關鍵字搜尋章節名稱，可依科目和年級篩選' })
  @ApiQuery({ name: 'q', description: '搜尋關鍵字', example: '一元一次方程式', type: String })
  @ApiQuery({ name: 'subject', required: false, description: '科目 ID', type: Number })
  @ApiQuery({ name: 'level', required: false, description: '年級', example: '國三', type: String })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授權' })
  async searchChapters(
    @Query('q') query: string,
    @Query('subject', new ParseIntPipe({ optional: true })) subjectId?: number,
    @Query('level') level?: string,
  ): Promise<any[]> {
    return this.questionsService.searchChapters(query, subjectId, level);
  }

  @Get('source-options')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得來源選項', description: '取得題目來源的可用選項（如：歷屆試題、模擬考、自編等）' })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授權' })
  async getSourceOptions(): Promise<any> {
    return this.questionsService.getSourceOptions();
  }

  @Get(':id/export-to-latex')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '匯出為 LaTeX', description: '將題目匯出為 LaTeX 格式，可用於排版印刷' })
  @ApiParam({ name: 'id', description: '題目 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 404, description: '題目不存在' })
  async exportToLatex(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.questionsService.exportToLatex(id);
  }

  @Get(':id/export-to-markdown')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '匯出為 Markdown', description: '將題目匯出為 Markdown 格式' })
  @ApiParam({ name: 'id', description: '題目 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 404, description: '題目不存在' })
  async exportToMarkdown(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.questionsService.exportToMarkdown(id);
  }

  @Post('preview-from-word')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '預覽 Word 匯入', description: '上傳 Word 檔案預覽題目內容（不實際匯入到題庫）' })
  @ApiResponse({ status: 200, description: '預覽成功' })
  @ApiResponse({ status: 400, description: '檔案格式錯誤或參數缺失' })
  @ApiResponse({ status: 401, description: '未授權' })
  async previewFromWord(
    @Request() _req: AuthRequest,
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '從 Word 匯入題目', description: '上傳 Word 檔案並匯入題目到題庫' })
  @ApiResponse({ status: 201, description: '匯入成功' })
  @ApiResponse({ status: 400, description: '檔案格式錯誤或參數缺失' })
  @ApiResponse({ status: 401, description: '未授權' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '預覽 Markdown 匯入', description: '上傳 Markdown 檔案和圖片預覽題目內容（不實際匯入）' })
  @ApiResponse({ status: 200, description: '預覽成功' })
  @ApiResponse({ status: 400, description: '檔案格式錯誤或參數缺失' })
  @ApiResponse({ status: 401, description: '未授權' })
  async previewFromMarkdown(
    @Request() _req: AuthRequest,
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '從 Markdown 匯入題目', description: '上傳 Markdown 檔案和圖片並匯入題目到題庫' })
  @ApiResponse({ status: 201, description: '匯入成功' })
  @ApiResponse({ status: 400, description: '檔案格式錯誤或參數缺失' })
  @ApiResponse({ status: 401, description: '未授權' })
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
