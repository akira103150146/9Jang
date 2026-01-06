import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuestionDto, UpdateQuestionDto, QuestionQuery, Question } from '@9jang/shared';
import { createPaginatedResponse } from '../../common/utils/pagination.util';
import { WordImporterService } from './word-importer.service';
import { MarkdownImporterService } from './markdown-importer.service';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class QuestionsService {
  constructor(
    private prisma: PrismaService,
    private wordImporter: WordImporterService,
    private markdownImporter: MarkdownImporterService,
  ) {}

  async getQuestions(query: QuestionQuery, userId: number, userRole: string) {
    // 學生只能檢視個別題目，不能列表
    if (userRole === 'STUDENT') {
      throw new ForbiddenException('學生不能查看題目列表');
    }

    // 管理員和會計不可用
    if (userRole === 'ADMIN' || userRole === 'ACCOUNTANT') {
      return createPaginatedResponse([], 0, query.page || 1, query.page_size || 10);
    }

    const page = query.page || 1;
    const pageSize = query.page_size || 10;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    // 科目篩選
    if (query.subject) {
      where.subjectId = query.subject;
    }

    // 年級篩選
    if (query.level) {
      where.level = query.level;
    }

    // 章節篩選
    if (query.chapter) {
      where.chapter = { contains: query.chapter, mode: 'insensitive' };
    }

    // 難度篩選
    if (query.difficulty) {
      where.difficulty = query.difficulty;
    }

    // 題目類型篩選
    if (query.question_type) {
      where.questionType = query.question_type;
    }

    // 標籤篩選
    if (query.tags && query.tags.length > 0) {
      const questionsWithTags = await this.prisma.cramschoolQuestionTag.findMany({
        where: { tagId: { in: query.tags } },
        select: { questionId: true },
        distinct: ['questionId'],
      });
      const questionIds = questionsWithTags.map((q) => q.questionId);
      where.questionId = { in: questionIds };
    }

    // 來源篩選
    if (query.source) {
      where.source = query.source;
    }

    // 全文檢索
    if (query.search) {
      where.searchTextContent = { contains: query.search, mode: 'insensitive' };
    }

    const [results, count] = await Promise.all([
      this.prisma.cramschoolQuestionBank.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          subject: true,
          createdBy: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: [{ createdAt: 'desc' }, { questionId: 'desc' }],
      }),
      this.prisma.cramschoolQuestionBank.count({ where }),
    ]);

    return createPaginatedResponse(
      results.map((q) => this.toQuestionDto(q)),
      count,
      page,
      pageSize,
    );
  }

  async getQuestion(id: number): Promise<Question> {
    const question = await this.prisma.cramschoolQuestionBank.findUnique({
      where: { questionId: id },
      include: {
        subject: true,
        createdBy: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    return this.toQuestionDto(question);
  }

  async createQuestion(createDto: CreateQuestionDto, userId: number, userRole: string): Promise<Question> {
    // 只有老師可以創建題目
    if (userRole !== 'TEACHER') {
      throw new ForbiddenException('只有老師可以創建題目');
    }

    const question = await this.prisma.cramschoolQuestionBank.create({
      data: {
        subjectId: createDto.subject_id!,
        level: createDto.level!,
        chapter: createDto.chapter!,
        content: createDto.content as any,
        imagePath: createDto.image_path,
        correctAnswer: createDto.correct_answer as any,
        difficulty: createDto.difficulty || 1,
        questionType: createDto.question_type || 'SINGLE_CHOICE',
        options: createDto.options as any,
        metadata: createDto.metadata as any,
        questionNumber: createDto.question_number,
        origin: createDto.origin,
        originDetail: createDto.origin_detail,
        source: createDto.source || '九章自命題',
        createdById: userId,
        importedFromErrorLogId: createDto.imported_from_error_log,
        importedStudentId: createDto.imported_student,
        solutionContent: createDto.solution_content as any,
        searchTextContent: this.extractTextFromTiptap(createDto.content),
      },
    });

    // 注意：標籤應該通過其他端點或更新操作添加
    // CreateQuestionDto 中不包含 tags 字段

    return this.getQuestion(question.questionId);
  }

  async updateQuestion(
    id: number,
    updateDto: UpdateQuestionDto,
    userId: number,
    userRole: string,
  ): Promise<Question> {
    // 只有老師可以更新題目
    if (userRole !== 'TEACHER') {
      throw new ForbiddenException('只有老師可以更新題目');
    }

    const question = await this.prisma.cramschoolQuestionBank.findUnique({
      where: { questionId: id },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    // 更新搜尋文字內容
    let searchTextContent = question.searchTextContent;
    if (updateDto.content) {
      searchTextContent = this.extractTextFromTiptap(updateDto.content);
    }

    await this.prisma.cramschoolQuestionBank.update({
      where: { questionId: id },
      data: {
        subjectId: updateDto.subject_id,
        level: updateDto.level,
        chapter: updateDto.chapter,
        content: updateDto.content as any,
        imagePath: updateDto.image_path,
        correctAnswer: updateDto.correct_answer as any,
        difficulty: updateDto.difficulty,
        questionType: updateDto.question_type,
        options: updateDto.options as any,
        metadata: updateDto.metadata as any,
        questionNumber: updateDto.question_number,
        origin: updateDto.origin,
        originDetail: updateDto.origin_detail,
        source: updateDto.source,
        solutionContent: updateDto.solution_content as any,
        searchTextContent,
      },
    });

    return this.getQuestion(id);
  }

  async deleteQuestion(id: number, userRole: string): Promise<void> {
    // 只有老師可以刪除題目
    if (userRole !== 'TEACHER') {
      throw new ForbiddenException('只有老師可以刪除題目');
    }

    const question = await this.prisma.cramschoolQuestionBank.findUnique({
      where: { questionId: id },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    await this.prisma.cramschoolQuestionBank.delete({
      where: { questionId: id },
    });
  }

  private toQuestionDto(question: any): Question {
    return {
      question_id: question.questionId,
      subject_id: question.subjectId,
      level: question.level as 'JHS' | 'SHS' | 'VCS',
      chapter: question.chapter,
      content: question.content as any,
      image_path: question.imagePath,
      correct_answer: question.correctAnswer as any,
      difficulty: question.difficulty,
      question_type: question.questionType as any,
      options: question.options as any,
      metadata: question.metadata as any,
      question_number: question.questionNumber,
      origin: question.origin,
      origin_detail: question.originDetail,
      source: question.source || '九章自命題',
      created_by: question.createdById,
      imported_from_error_log: question.importedFromErrorLogId,
      imported_student: question.importedStudentId,
      solution_content: question.solutionContent as any,
      search_text_content: question.searchTextContent,
      created_at: question.createdAt.toISOString(),
      updated_at: question.updatedAt.toISOString(),
      tags: question.tags?.map((t: any) => t.tag.tagId) || [],
      tag_names: question.tags?.map((t: any) => t.tag.tagName) || [],
    };
  }

  private extractTextFromTiptap(content: any): string {
    if (!content || typeof content !== 'object') {
      return '';
    }

    const textParts: string[] = [];

    if (content.type === 'text' && content.text) {
      textParts.push(content.text);
    }

    if (content.content && Array.isArray(content.content)) {
      for (const child of content.content) {
        textParts.push(this.extractTextFromTiptap(child));
      }
    }

    return textParts.join(' ');
  }

  async searchChapters(query: string, subjectId?: number, level?: string): Promise<any[]> {
    if (!query || !query.trim()) {
      return [];
    }

    const where: any = {
      chapter: { contains: query.trim(), mode: 'insensitive' },
    };

    if (subjectId) {
      where.subjectId = subjectId;
    }

    if (level) {
      where.level = level;
    }

    // 獲取所有匹配的題目
    const questions = await this.prisma.cramschoolQuestionBank.findMany({
      where,
      select: { chapter: true },
    });

    // 按章節分組並計算使用次數
    const chapterMap = new Map<string, number>();
    for (const q of questions) {
      if (q.chapter) {
        chapterMap.set(q.chapter, (chapterMap.get(q.chapter) || 0) + 1);
      }
    }

    // 轉換為數組並計算相關性
    const chapters = Array.from(chapterMap.entries()).map(([chapter, count]) => {
      const relevance = chapter.toLowerCase().startsWith(query.toLowerCase().trim()) ? 2 : 1;
      return {
        chapter,
        count,
        relevance,
      };
    });

    // 按相關性和使用次數排序
    chapters.sort((a, b) => {
      if (b.relevance !== a.relevance) {
        return b.relevance - a.relevance;
      }
      return b.count - a.count;
    });

    // 只返回前 10 個結果
    return chapters.slice(0, 10);
  }

  async getSourceOptions(): Promise<any> {
    // 從 Prisma schema 或配置中獲取預設選項
    // 這裡使用 Django 中的預設值
    const options = [
      '九章自命題',
      '參考書',
      '歷屆試題',
      '網路資源',
      '其他',
    ];

    return {
      options,
      default: '九章自命題',
    };
  }

  async exportToLatex(id: number): Promise<any> {
    const question = await this.prisma.cramschoolQuestionBank.findUnique({
      where: { questionId: id },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    const solutionContent = question.solutionContent as any;
    if (!solutionContent) {
      throw new NotFoundException('該題目沒有詳解內容');
    }

    // TODO: 實現完整的 LaTeX 轉換邏輯
    // 需要遷移 backend/cramschool/utils/diagram_converter.py
    const latexParts: string[] = [];
    const content = solutionContent.content || [];

    for (const node of content) {
      const nodeType = node.type;
      const attrs = node.attrs || {};

      if (nodeType === 'paragraph') {
        const text = this.extractTextFromTiptap(node);
        if (text) {
          latexParts.push(text);
        }
      } else if (nodeType === 'mathField') {
        const latex = attrs.latex || '';
        if (latex) {
          latexParts.push(`$${latex}$`);
        }
      } else if (nodeType === 'latexFormula') {
        const latex = attrs.latex || '';
        const displayMode = attrs.displayMode !== false;
        if (latex) {
          if (displayMode) {
            latexParts.push(`$$\\begin{align}${latex}\\end{align}$$`);
          } else {
            latexParts.push(`$${latex}$`);
          }
        }
      }
      // TODO: 實現 diagram2D, circuit, diagram3D 的轉換
    }

    const latexCode = latexParts.join('\n\n');

    return {
      latex: latexCode,
      question_id: question.questionId,
    };
  }

  async exportToMarkdown(id: number): Promise<any> {
    const question = await this.prisma.cramschoolQuestionBank.findUnique({
      where: { questionId: id },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    const solutionContent = question.solutionContent as any;
    if (!solutionContent) {
      throw new NotFoundException('該題目沒有詳解內容');
    }

    // 兼容：前端以 Markdown 純文字儲存
    if (solutionContent.format === 'markdown') {
      return {
        markdown: solutionContent.text || '',
        question_id: question.questionId,
      };
    }

    // TODO: 實現完整的 Markdown 轉換邏輯
    // 需要遷移 backend/cramschool/utils/markdown_exporter.py
    // 暫時返回基本轉換
    const markdown = this.extractTextFromTiptap(solutionContent);

    return {
      markdown,
      question_id: question.questionId,
    };
  }

  async previewFromWord(
    file: Express.Multer.File,
    subjectId: number,
    level: string,
    chapter: string,
  ): Promise<any> {
    if (!file) {
      throw new BadRequestException('請選擇要匯入的檔案');
    }

    const filename = file.originalname;
    if (!filename.endsWith('.docx') && !filename.endsWith('.doc')) {
      throw new BadRequestException('不支援的檔案格式，請上傳 .docx 或 .doc 檔案');
    }

    // 驗證科目是否存在
    const subject = await this.prisma.cramschoolSubject.findUnique({
      where: { subjectId },
    });

    if (!subject) {
      throw new BadRequestException('科目不存在');
    }

    // 定義保存圖片的函數
    const saveImageFunc = async (imageBytes: Buffer, imageFilename: string): Promise<string> => {
      const now = new Date();
      const dateFolder = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
      const ext = path.extname(imageFilename) || '.png';
      const uniqueFilename = `${uuidv4().replace(/-/g, '')}${ext}`;
      const relativePath = `question_images/${dateFolder}/${uniqueFilename}`;

      const mediaRoot = process.env.MEDIA_ROOT || './media';
      const fullPath = path.join(mediaRoot, relativePath);
      const dir = path.dirname(fullPath);

      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(fullPath, imageBytes);

      const mediaUrl = process.env.MEDIA_URL || '/media/';
      const imageUrl = mediaUrl.startsWith('http')
        ? `${mediaUrl}${relativePath}`
        : `${process.env.BASE_URL || 'http://localhost:3000'}${mediaUrl}${relativePath}`;

      return imageUrl;
    };

    // 解析題目（只解析，不匯入）
    const { questions, errors } = await this.wordImporter.importQuestions(
      file.buffer,
      filename,
      subjectId,
      level,
      chapter,
      saveImageFunc,
    );

    if (questions.length === 0) {
      throw new BadRequestException('未能從檔案中解析出任何題目');
    }

    // 返回預覽數據
    const previewQuestions = questions.map((q) => ({
      question_number: q.question_number || '',
      origin: q.origin || '',
      origin_detail: q.origin_detail || '',
      difficulty: q.difficulty || 3,
      content: q.content || '',
      correct_answer: q.answer || '',
    }));

    return {
      success: true,
      total: questions.length,
      questions: previewQuestions,
      errors: errors.slice(0, 20), // 只返回前 20 個錯誤
    };
  }

  async importFromWord(
    file: Express.Multer.File,
    subjectId: number,
    level: string,
    chapter: string,
    userId: number,
  ): Promise<any> {
    if (!file) {
      throw new BadRequestException('請選擇要匯入的檔案');
    }

    const filename = file.originalname;
    if (!filename.endsWith('.docx') && !filename.endsWith('.doc')) {
      throw new BadRequestException('不支援的檔案格式，請上傳 .docx 或 .doc 檔案');
    }

    // 驗證科目是否存在
    const subject = await this.prisma.cramschoolSubject.findUnique({
      where: { subjectId },
    });

    if (!subject) {
      throw new BadRequestException('科目不存在');
    }

    // 定義保存圖片的函數
    const saveImageFunc = async (imageBytes: Buffer, imageFilename: string): Promise<string> => {
      const now = new Date();
      const dateFolder = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
      const ext = path.extname(imageFilename) || '.png';
      const uniqueFilename = `${uuidv4().replace(/-/g, '')}${ext}`;
      const relativePath = `question_images/${dateFolder}/${uniqueFilename}`;

      const mediaRoot = process.env.MEDIA_ROOT || './media';
      const fullPath = path.join(mediaRoot, relativePath);
      const dir = path.dirname(fullPath);

      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(fullPath, imageBytes);

      const mediaUrl = process.env.MEDIA_URL || '/media/';
      const imageUrl = mediaUrl.startsWith('http')
        ? `${mediaUrl}${relativePath}`
        : `${process.env.BASE_URL || 'http://localhost:3000'}${mediaUrl}${relativePath}`;

      return imageUrl;
    };

    // 解析題目
    const { questions, errors } = await this.wordImporter.importQuestions(
      file.buffer,
      filename,
      subjectId,
      level,
      chapter,
      saveImageFunc,
    );

    if (questions.length === 0) {
      throw new BadRequestException('未能從檔案中解析出任何題目');
    }

    // 匯入題目到資料庫
    const createdQuestions = [];
    for (const q of questions) {
      try {
        // 處理選項
        const options = q.options?.map((opt) => ({
          value: opt.letter,
          label: opt.content,
        })) || [];

        // 判斷題型
        let questionType = 'SINGLE_CHOICE';
        if (options.length > 0) {
          if (q.answer.includes(',') || q.answer.length > 1) {
            questionType = 'MULTIPLE_CHOICE';
          }
        }

        // 處理圖片路徑
        let imagePath: string | null = null;
        if (q.image_paths && q.image_paths.length > 0) {
          imagePath = q.image_paths[0]; // 使用第一張圖片
        }

        const created = await this.prisma.cramschoolQuestionBank.create({
          data: {
            subjectId,
            level,
            chapter,
            content: q.content,
            correctAnswer: q.answer,
            difficulty: q.difficulty,
            questionType,
            options: options.length > 0 ? (options as any) : null,
            questionNumber: q.question_number || null,
            origin: q.origin || '',
            originDetail: q.origin_detail || '',
            imagePath,
            solutionContent: q.explanation
              ? ({
                  format: 'markdown',
                  text: q.explanation,
                } as any)
              : null,
            source: q.origin || 'imported_from_word',
            createdById: userId,
          },
        });

        createdQuestions.push(created);
      } catch (error: any) {
        errors.push(`匯入題目失敗：${error.message}`);
      }
    }

    return {
      success: true,
      total: questions.length,
      imported: createdQuestions.length,
      questions: createdQuestions.map((q) => this.toQuestionDto(q)),
      errors: errors.slice(0, 20),
    };
  }

  async previewFromMarkdown(
    markdownFile: Express.Multer.File,
    images: Express.Multer.File[],
    subjectId: number,
    level: string,
    chapter: string,
  ): Promise<any> {
    if (!markdownFile) {
      throw new BadRequestException('請選擇 Markdown 檔案');
    }

    const filename = markdownFile.originalname;
    if (!filename.endsWith('.md') && !filename.endsWith('.markdown')) {
      throw new BadRequestException('不支援的檔案格式，請上傳 .md 或 .markdown 檔案');
    }

    // 驗證科目是否存在
    const subject = await this.prisma.cramschoolSubject.findUnique({
      where: { subjectId },
    });

    if (!subject) {
      throw new BadRequestException('科目不存在');
    }

    // 讀取 Markdown 內容
    let markdownContent: string;
    try {
      markdownContent = markdownFile.buffer.toString('utf-8');
    } catch (error: any) {
      throw new BadRequestException(`讀取 Markdown 檔案失敗：${error.message}`);
    }

    // 獲取圖片字典
    const imagesDict: Record<string, Buffer> = {};
    if (images && images.length > 0) {
      for (const img of images) {
        try {
          imagesDict[img.originalname] = img.buffer;
        } catch (error: any) {
          throw new BadRequestException(`讀取圖片檔案 ${img.originalname} 失敗：${error.message}`);
        }
      }
    }

    // 定義保存圖片的函數（預覽模式）
    const saveImageFunc = async (imageBytes: Buffer, imageFilename: string): Promise<string> => {
      const now = new Date();
      const dateFolder = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
      const ext = path.extname(imageFilename) || '.png';
      const uniqueFilename = `${uuidv4().replace(/-/g, '')}${ext}`;
      const relativePath = `question_images/preview/${dateFolder}/${uniqueFilename}`;

      const mediaRoot = process.env.MEDIA_ROOT || './media';
      const fullPath = path.join(mediaRoot, relativePath);
      const dir = path.dirname(fullPath);

      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(fullPath, imageBytes);

      const mediaUrl = process.env.MEDIA_URL || '/media/';
      const imageUrl = mediaUrl.startsWith('http')
        ? `${mediaUrl}${relativePath}`
        : `${process.env.BASE_URL || 'http://localhost:3000'}${mediaUrl}${relativePath}`;

      return imageUrl;
    };

    // 解析題目（預覽模式）
    const { questions, errors } = await this.markdownImporter.importQuestions(
      markdownContent,
      imagesDict,
      subjectId,
      level,
      chapter,
      imagesDict && Object.keys(imagesDict).length > 0 ? saveImageFunc : undefined,
    );

    if (questions.length === 0) {
      throw new BadRequestException('未能從 Markdown 中解析出任何題目');
    }

    // 返回預覽數據
    const previewQuestions = questions.map((q) => ({
      question_number: q.question_number || '',
      origin: q.origin || '',
      origin_detail: q.origin_detail || '',
      difficulty: q.difficulty || 3,
      content: q.content || '',
      correct_answer: q.correct_answer || '',
    }));

    return {
      success: true,
      total: questions.length,
      questions: previewQuestions,
      errors: errors.slice(0, 20),
    };
  }

  async importFromMarkdown(
    markdownFile: Express.Multer.File,
    images: Express.Multer.File[],
    subjectId: number,
    level: string,
    chapter: string,
    userId: number,
  ): Promise<any> {
    if (!markdownFile) {
      throw new BadRequestException('請選擇 Markdown 檔案');
    }

    const filename = markdownFile.originalname;
    if (!filename.endsWith('.md') && !filename.endsWith('.markdown')) {
      throw new BadRequestException('不支援的檔案格式，請上傳 .md 或 .markdown 檔案');
    }

    // 驗證科目是否存在
    const subject = await this.prisma.cramschoolSubject.findUnique({
      where: { subjectId },
    });

    if (!subject) {
      throw new BadRequestException('科目不存在');
    }

    // 讀取 Markdown 內容
    let markdownContent: string;
    try {
      markdownContent = markdownFile.buffer.toString('utf-8');
    } catch (error: any) {
      throw new BadRequestException(`讀取 Markdown 檔案失敗：${error.message}`);
    }

    // 獲取圖片字典
    const imagesDict: Record<string, Buffer> = {};
    if (images && images.length > 0) {
      for (const img of images) {
        try {
          imagesDict[img.originalname] = img.buffer;
        } catch (error: any) {
          throw new BadRequestException(`讀取圖片檔案 ${img.originalname} 失敗：${error.message}`);
        }
      }
    }

    // 定義保存圖片的函數
    const saveImageFunc = async (imageBytes: Buffer, imageFilename: string): Promise<string> => {
      const now = new Date();
      const dateFolder = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
      const ext = path.extname(imageFilename) || '.png';
      const uniqueFilename = `${uuidv4().replace(/-/g, '')}${ext}`;
      const relativePath = `question_images/${dateFolder}/${uniqueFilename}`;

      const mediaRoot = process.env.MEDIA_ROOT || './media';
      const fullPath = path.join(mediaRoot, relativePath);
      const dir = path.dirname(fullPath);

      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(fullPath, imageBytes);

      const mediaUrl = process.env.MEDIA_URL || '/media/';
      const imageUrl = mediaUrl.startsWith('http')
        ? `${mediaUrl}${relativePath}`
        : `${process.env.BASE_URL || 'http://localhost:3000'}${mediaUrl}${relativePath}`;

      return imageUrl;
    };

    // 解析題目
    const { questions, errors } = await this.markdownImporter.importQuestions(
      markdownContent,
      imagesDict,
      subjectId,
      level,
      chapter,
      imagesDict && Object.keys(imagesDict).length > 0 ? saveImageFunc : undefined,
    );

    if (questions.length === 0) {
      throw new BadRequestException('未能從 Markdown 中解析出任何題目');
    }

    // 匯入題目到資料庫
    const createdQuestions = [];
    for (const q of questions) {
      try {
        const created = await this.prisma.cramschoolQuestionBank.create({
          data: {
            subjectId: q.subject_id,
            level: q.level,
            chapter: q.chapter,
            content: q.content,
            correctAnswer: q.correct_answer,
            difficulty: q.difficulty,
            questionType: q.question_type,
            options: q.options && q.options.length > 0 ? (q.options as any) : null,
            questionNumber: q.question_number || null,
            origin: q.origin || '',
            originDetail: q.origin_detail || '',
            solutionContent: q.solution_content as any,
            source: q.source || 'imported_from_markdown',
            createdById: userId,
          },
        });

        createdQuestions.push(created);
      } catch (error: any) {
        errors.push(`匯入題目失敗：${error.message}`);
      }
    }

    return {
      success: true,
      total: questions.length,
      imported: createdQuestions.length,
      questions: createdQuestions.map((q) => this.toQuestionDto(q)),
      errors: errors.slice(0, 20),
    };
  }
}
