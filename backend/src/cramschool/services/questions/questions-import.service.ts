/**
 * Questions Import Service
 * 處理題目匯入邏輯（Word, Markdown）
 */

import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { WordImporterService } from '../word-importer.service'
import { MarkdownImporterService } from '../markdown-importer.service'

@Injectable()
export class QuestionsImportService {
  constructor(
    private prisma: PrismaService,
    private wordImporter: WordImporterService,
    private markdownImporter: MarkdownImporterService,
  ) {}

  /**
   * 從 Word 預覽題目（不實際創建）
   */
  async previewFromWord(
    file: Express.Multer.File,
    subjectId: number,
    level: string,
    chapter: string,
  ): Promise<any> {
    if (!file) {
      throw new BadRequestException('No file uploaded')
    }

    // 使用 WordImporterService 解析文件
    const result = await this.wordImporter.importQuestions(
      file.buffer,
      file.originalname,
      subjectId,
      level || '',
      chapter || '',
    )

    return {
      success: true,
      count: result.questions.length,
      questions: result.questions,
      errors: result.errors,
    }
  }

  /**
   * 從 Word 文件匯入題目
   */
  async importFromWord(
    file: Express.Multer.File,
    subjectId: number,
    level: string,
    chapter: string,
    userId: number,
    userRole?: string,
    difficulty?: string | null,
  ): Promise<any> {
    if (!file) {
      throw new BadRequestException('No file uploaded')
    }

    // 使用 WordImporterService 解析文件
    const result = await this.wordImporter.importQuestions(
      file.buffer,
      file.originalname,
      subjectId,
      level || '',
      chapter || '',
    )
    const questions = result.questions

    // 批次創建題目
    const createdQuestions = []
    for (const q of questions) {
      const question = await this.prisma.cramschoolQuestionBank.create({
        data: {
          subjectId,
          level: level || '',
          chapter: chapter || q.origin_detail || '',
          content: { text: q.content },
          correctAnswer: q.answer || '',
          solutionContent: q.explanation ? { text: q.explanation } : null,
          difficulty: q.difficulty || 3,
          questionType: 'SINGLE_CHOICE',
          options: q.options || [],
          questionNumber: q.question_number || '',
          origin: q.origin || '',
          originDetail: q.origin_detail || '',
          source: 'word_import',
        },
      })
      createdQuestions.push(question)
    }

    return {
      success: true,
      count: createdQuestions.length,
      questions: createdQuestions.map((q) => ({
        question_id: q.questionId,
        content: q.content,
      })),
    }
  }

  /**
   * 從 Markdown 預覽題目（不實際創建）
   */
  async previewFromMarkdown(
    markdownFile: Express.Multer.File,
    images: Express.Multer.File[],
    subjectId: number,
    level: string,
    chapter: string,
  ): Promise<any> {
    const content = markdownFile.buffer.toString('utf-8')

    if (!content || content.trim().length === 0) {
      throw new BadRequestException('No content provided')
    }

    // 使用 MarkdownImporterService 解析內容
    const imagesDict: Record<string, Buffer> = {}
    images.forEach((img) => {
      imagesDict[img.originalname] = img.buffer
    })
    
    const result = await this.markdownImporter.importQuestions(
      content,
      imagesDict,
      subjectId,
      level || '',
      chapter || '',
    )

    return {
      success: true,
      count: result.questions.length,
      questions: result.questions,
      errors: result.errors,
    }
  }

  /**
   * 從 Markdown 文件匯入題目
   */
  async importFromMarkdown(
    markdownFile: Express.Multer.File,
    images: Express.Multer.File[],
    subjectId: number,
    level: string,
    chapter: string,
    userId: number,
    userRole?: string,
  ): Promise<any> {
    const content = markdownFile.buffer.toString('utf-8')

    if (!content || content.trim().length === 0) {
      throw new BadRequestException('No content provided')
    }

    // 使用 MarkdownImporterService 解析內容
    const imagesDict: Record<string, Buffer> = {}
    images.forEach((img) => {
      imagesDict[img.originalname] = img.buffer
    })
    
    const result = await this.markdownImporter.importQuestions(
      content,
      imagesDict,
      subjectId,
      level || '',
      chapter || '',
    )
    const questions = result.questions

    // 批次創建題目
    const createdQuestions = []
    for (const q of questions) {
      const question = await this.prisma.cramschoolQuestionBank.create({
        data: {
          subjectId: q.subject_id,
          level: q.level,
          chapter: q.chapter,
          content: { text: q.content },
          correctAnswer: q.correct_answer,
          solutionContent: q.solution_content,
          difficulty: q.difficulty,
          questionType: q.question_type,
          options: q.options,
          questionNumber: q.question_number,
          origin: q.origin,
          originDetail: q.origin_detail,
          source: q.source,
        },
      })
      createdQuestions.push(question)
    }

    return {
      success: true,
      count: createdQuestions.length,
      questions: createdQuestions.map((q) => ({
        question_id: q.questionId,
        content: q.content,
      })),
    }
  }
}
