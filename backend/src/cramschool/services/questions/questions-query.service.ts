/**
 * Questions Query Service
 * 處理題目查詢和篩選邏輯
 */

import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { QuestionQuery, Question } from '@9jang/shared'
import { createPaginatedResponse } from '../../../common/utils/pagination.util'
import { QuestionsPermissionService } from './questions-permission.service'

@Injectable()
export class QuestionsQueryService {
  constructor(
    private prisma: PrismaService,
    private permissionService: QuestionsPermissionService,
  ) {}

  /**
   * 獲取題目列表（帶查詢和分頁）
   */
  async getQuestions(query: QuestionQuery, userId: number, userRole: string) {
    this.permissionService.checkListPermission(userRole)

    // 管理員和會計不可用
    if (userRole === 'ADMIN' || userRole === 'ACCOUNTANT') {
      return createPaginatedResponse([], 0, query.page || 1, query.page_size || 10)
    }

    const page = query.page || 1
    const pageSize = query.page_size || 10
    const skip = (page - 1) * pageSize

    const where: any = {}

    // 科目篩選
    if (query.subject) {
      where.subjectId = query.subject
    }

    // 年級篩選
    if (query.level) {
      where.level = query.level
    }

    // 章節篩選
    if (query.chapter) {
      where.chapter = { contains: query.chapter, mode: 'insensitive' }
    }

    // 難度篩選
    if (query.difficulty) {
      where.difficulty = query.difficulty
    }

    // 題目類型篩選
    if (query.question_type) {
      where.questionType = query.question_type
    }

    // 標籤篩選
    if (query.tags && query.tags.length > 0) {
      const questionsWithTags = await this.prisma.cramschoolQuestionTag.findMany({
        where: { tagId: { in: query.tags } },
        select: { questionId: true },
        distinct: ['questionId'],
      })
      const questionIds = questionsWithTags.map((q) => q.questionId)
      where.questionId = { in: questionIds }
    }

    // 來源篩選
    if (query.source) {
      where.source = query.source
    }

    // 全文檢索
    if (query.search) {
      where.searchTextContent = { contains: query.search, mode: 'insensitive' }
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
    ])

    // 返回原始數據，由主服務處理轉換
    return {
      results,
      count,
      page,
      pageSize,
    }
  }

  /**
   * 搜尋章節
   */
  async searchChapters(query: string, subjectId?: number, level?: string): Promise<any[]> {
    if (!query || !query.trim()) {
      return []
    }

    const where: any = {
      chapter: { contains: query.trim(), mode: 'insensitive' },
    }

    if (subjectId) {
      where.subjectId = subjectId
    }

    if (level) {
      where.level = level
    }

    // 獲取所有匹配的題目
    const questions = await this.prisma.cramschoolQuestionBank.findMany({
      where,
      select: { chapter: true },
    })

    // 按章節分組並計算使用次數
    const chapterMap = new Map<string, number>()
    for (const q of questions) {
      if (q.chapter) {
        chapterMap.set(q.chapter, (chapterMap.get(q.chapter) || 0) + 1)
      }
    }

    // 轉換為數組並計算相關性
    const chapters = Array.from(chapterMap.entries()).map(([chapter, count]) => {
      const relevance = chapter.toLowerCase().startsWith(query.toLowerCase().trim()) ? 2 : 1
      return {
        chapter,
        count,
        relevance,
      }
    })

    // 按相關性和使用次數排序
    chapters.sort((a, b) => {
      if (b.relevance !== a.relevance) {
        return b.relevance - a.relevance
      }
      return b.count - a.count
    })

    // 只返回前 10 個結果
    return chapters.slice(0, 10)
  }
}
