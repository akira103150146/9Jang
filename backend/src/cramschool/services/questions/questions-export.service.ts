/**
 * Questions Export Service
 * 處理題目匯出邏輯（LaTeX, Markdown）
 */

import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import type { ExportResult, QuestionOption } from '../../types/question-export.types'

@Injectable()
export class QuestionsExportService {
  constructor(private prisma: PrismaService) {}

  /**
   * 匯出為 LaTeX 格式
   */
  async exportToLatex(id: number): Promise<ExportResult> {
    const question = await this.prisma.cramschoolQuestionBank.findUnique({
      where: { questionId: id },
      include: {
        subject: true,
        tags: true,
      },
    })

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`)
    }

    // 生成 LaTeX 內容
    let latex = '\\documentclass{article}\n'
    latex += '\\usepackage{amsmath}\n'
    latex += '\\usepackage{amssymb}\n'
    latex += '\\begin{document}\n\n'

    // 題目標題
    latex += `\\section*{題目 ${question.questionId}}\n\n`

    // 科目和章節
    if (question.subject) {
      latex += `\\textbf{科目:} ${question.subject.name}\\\\\n`
    }
    if (question.chapter) {
      latex += `\\textbf{章節:} ${question.chapter}\\\\\n`
    }
    if (question.level) {
      latex += `\\textbf{年級:} ${question.level}\\\\\n`
    }

    latex += '\n'

    // 題目內容
    latex += '\\textbf{題目:}\\\\\n'
    const contentText = typeof question.content === 'object' && question.content !== null 
      ? JSON.stringify(question.content) 
      : String(question.content)
    latex += this.convertToLatex(contentText) + '\n\n'

    // 選項（如果是選擇題）
    if (question.questionType === 'SINGLE_CHOICE' && question.options) {
      latex += '\\textbf{選項:}\\\\\n'
      latex += '\\begin{enumerate}\n'
      const options = typeof question.options === 'object' ? question.options : JSON.parse(String(question.options))
      if (Array.isArray(options)) {
        options.forEach((option: QuestionOption | string) => {
          const optionText = typeof option === 'object' ? (option.text || option.label || '') : String(option)
          latex += `  \\item ${this.convertToLatex(optionText)}\n`
        })
      }
      latex += '\\end{enumerate}\n\n'
    }

    // 答案
    if (question.correctAnswer) {
      latex += '\\textbf{答案:}\\\\\n'
      const answerText = typeof question.correctAnswer === 'object' 
        ? JSON.stringify(question.correctAnswer) 
        : String(question.correctAnswer)
      latex += this.convertToLatex(answerText) + '\n\n'
    }

    // 解析
    if (question.solutionContent) {
      latex += '\\textbf{解析:}\\\\\n'
      const solutionText = typeof question.solutionContent === 'object' 
        ? JSON.stringify(question.solutionContent) 
        : String(question.solutionContent)
      latex += this.convertToLatex(solutionText) + '\n\n'
    }

    latex += '\\end{document}\n'

    return {
      latex,
      filename: `question_${id}.tex`,
    }
  }

  /**
   * 匯出為 Markdown 格式
   */
  async exportToMarkdown(id: number): Promise<ExportResult> {
    const question = await this.prisma.cramschoolQuestionBank.findUnique({
      where: { questionId: id },
      include: {
        subject: true,
        tags: true,
      },
    })

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`)
    }

    // 生成 Markdown 內容
    let markdown = `# 題目 ${question.questionId}\n\n`

    // 元數據
    markdown += '## 基本資訊\n\n'
    if (question.subject) {
      markdown += `- **科目:** ${question.subject.name}\n`
    }
    if (question.chapter) {
      markdown += `- **章節:** ${question.chapter}\n`
    }
    if (question.level) {
      markdown += `- **年級:** ${question.level}\n`
    }
    if (question.difficulty) {
      markdown += `- **難度:** ${question.difficulty}\n`
    }
    markdown += '\n'

    // 題目內容
    markdown += '## 題目\n\n'
    const contentText = typeof question.content === 'object' && question.content !== null 
      ? JSON.stringify(question.content) 
      : String(question.content)
    markdown += contentText + '\n\n'

    // 選項（如果是選擇題）
    if (question.questionType === 'SINGLE_CHOICE' && question.options) {
      markdown += '## 選項\n\n'
      const options = typeof question.options === 'object' ? question.options : JSON.parse(String(question.options))
      if (Array.isArray(options)) {
        options.forEach((option: QuestionOption | string, index: number) => {
          const letter = String.fromCharCode(65 + index) // A, B, C, D...
          const optionText = typeof option === 'object' ? (option.text || option.label || '') : String(option)
          markdown += `${letter}. ${optionText}\n`
        })
      }
      markdown += '\n'
    }

    // 答案
    if (question.correctAnswer) {
      markdown += '## 答案\n\n'
      const answerText = typeof question.correctAnswer === 'object' 
        ? JSON.stringify(question.correctAnswer) 
        : String(question.correctAnswer)
      markdown += answerText + '\n\n'
    }

    // 解析
    if (question.solutionContent) {
      markdown += '## 解析\n\n'
      const solutionText = typeof question.solutionContent === 'object' 
        ? JSON.stringify(question.solutionContent) 
        : String(question.solutionContent)
      markdown += solutionText + '\n\n'
    }

    return {
      markdown,
      filename: `question_${id}.md`,
    }
  }

  /**
   * 將 HTML/TipTap JSON 轉換為 LaTeX
   */
  private convertToLatex(content: string): string {
    // 簡單的轉換邏輯，實際應該更複雜
    let latex = content

    // 移除 HTML 標籤
    latex = latex.replace(/<[^>]*>/g, '')

    // 轉換數學公式（假設使用 $...$ 或 $$...$$）
    // 這裡保持原樣，因為 LaTeX 可以直接使用

    return latex
  }
}
