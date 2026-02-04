/**
 * Questions Service (Core CRUD)
 * 處理題目的核心 CRUD 操作，整合所有拆分後的服務
 */

import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { CreateQuestionDto, UpdateQuestionDto, QuestionQuery, Question } from '@9jang/shared'
import { QuestionsPermissionService } from './questions-permission.service'
import { QuestionsQueryService } from './questions-query.service'
import { QuestionsExportService } from './questions-export.service'
import { QuestionsImportService } from './questions-import.service'

@Injectable()
export class QuestionsService {
  constructor(
    private prisma: PrismaService,
    private permissionService: QuestionsPermissionService,
    private queryService: QuestionsQueryService,
    private exportService: QuestionsExportService,
    private importService: QuestionsImportService,
  ) {}

  /**
   * 轉換為 Question DTO
   */
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
    }
  }

  /**
   * 從 Tiptap 文檔中提取文字
   */
  private extractTextFromTiptap(content: any): string {
    if (!content || typeof content !== 'object') {
      return ''
    }

    const textParts: string[] = []

    if (content.type === 'text' && content.text) {
      textParts.push(content.text)
    }

    if (content.content && Array.isArray(content.content)) {
      for (const child of content.content) {
        textParts.push(this.extractTextFromTiptap(child))
      }
    }

    return textParts.join(' ')
  }

  /**
   * 獲取題目列表
   */
  async getQuestions(query: QuestionQuery, userId: number, userRole: string) {
    const result = await this.queryService.getQuestions(query, userId, userRole)
    return {
      ...result,
      results: result.results.map((q: any) => this.toQuestionDto(q)),
    }
  }

  /**
   * 獲取題目
   */
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
    })

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`)
    }

    return this.toQuestionDto(question)
  }

  /**
   * 創建題目
   */
  async createQuestion(createDto: CreateQuestionDto, userId: number, userRole: string): Promise<Question> {
    this.permissionService.checkCreatePermission(userRole)

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
    })

    return this.getQuestion(question.questionId)
  }

  /**
   * 更新題目
   */
  async updateQuestion(
    id: number,
    updateDto: UpdateQuestionDto,
    _userId: number,
    userRole: string,
  ): Promise<Question> {
    this.permissionService.checkUpdatePermission(userRole)

    const question = await this.prisma.cramschoolQuestionBank.findUnique({
      where: { questionId: id },
    })

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`)
    }

    // 更新搜尋文字內容
    let searchTextContent = question.searchTextContent
    if (updateDto.content) {
      searchTextContent = this.extractTextFromTiptap(updateDto.content)
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
    })

    return this.getQuestion(id)
  }

  /**
   * 刪除題目
   */
  async deleteQuestion(id: number, userRole: string): Promise<void> {
    this.permissionService.checkDeletePermission(userRole)

    const question = await this.prisma.cramschoolQuestionBank.findUnique({
      where: { questionId: id },
    })

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`)
    }

    await this.prisma.cramschoolQuestionBank.delete({
      where: { questionId: id },
    })
  }

  /**
   * 搜尋章節
   */
  async searchChapters(query: string, subjectId?: number, level?: string): Promise<any[]> {
    return this.queryService.searchChapters(query, subjectId, level)
  }

  /**
   * 獲取來源選項
   */
  async getSourceOptions(): Promise<any> {
    const options = [
      '九章自命題',
      '參考書',
      '歷屆試題',
      '網路資源',
      '其他',
    ]

    return {
      options,
      default: '九章自命題',
    }
  }

  /**
   * 匯出為 LaTeX
   */
  async exportToLatex(id: number): Promise<any> {
    return this.exportService.exportToLatex(id)
  }

  /**
   * 匯出為 Markdown
   */
  async exportToMarkdown(id: number): Promise<any> {
    return this.exportService.exportToMarkdown(id)
  }

  /**
   * 從 Word 預覽題目
   */
  async previewFromWord(
    file: Express.Multer.File,
    subjectId: number,
    level: string,
    chapter: string,
  ): Promise<any> {
    return this.importService.previewFromWord(file, subjectId, level, chapter)
  }

  /**
   * 從 Word 匯入題目
   */
  async importFromWord(
    file: Express.Multer.File,
    subjectId: number,
    level: string,
    chapter: string,
    userId: number,
  ): Promise<any> {
    return this.importService.importFromWord(file, subjectId, level, chapter, userId)
  }

  /**
   * 從 Markdown 預覽題目
   */
  async previewFromMarkdown(
    markdownFile: Express.Multer.File,
    images: Express.Multer.File[],
    subjectId: number,
    level: string,
    chapter: string,
  ): Promise<any> {
    return this.importService.previewFromMarkdown(markdownFile, images, subjectId, level, chapter)
  }

  /**
   * 從 Markdown 匯入題目
   */
  async importFromMarkdown(
    markdownFile: Express.Multer.File,
    images: Express.Multer.File[],
    subjectId: number,
    level: string,
    chapter: string,
    userId: number,
  ): Promise<any> {
    return this.importService.importFromMarkdown(markdownFile, images, subjectId, level, chapter, userId)
  }
}
