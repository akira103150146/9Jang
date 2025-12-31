import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuestionDto, UpdateQuestionDto, QuestionQuery, Question } from '@9jang/shared';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

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
}
