/**
 * useTiptapConverter
 * 處理 Tiptap JSON 到 Markdown 的轉換邏輯
 */

import type { TiptapDocument } from '@9jang/shared'
import type { QuestionWithExtras } from '../useQuestionList'

interface TiptapNode {
  type: string
  text?: string
  content?: TiptapNode[]
  marks?: Array<{ type: string }>
  attrs?: Record<string, unknown>
}

export function useTiptapConverter() {
  /**
   * 將 Tiptap JSON 轉換為 Markdown 字串
   */
  const tiptapToMarkdown = (node: TiptapNode | unknown): string => {
    if (!node || typeof node !== 'object') return ''

    const n = node as TiptapNode
    let markdown = ''

    // 處理文字節點
    if (n.type === 'text') {
      let text = n.text || ''
      // 處理文字標記
      if (n.marks) {
        for (const mark of n.marks) {
          if (mark.type === 'bold') {
            text = `**${text}**`
          } else if (mark.type === 'italic') {
            text = `*${text}*`
          } else if (mark.type === 'code') {
            text = `\`${text}\``
          }
        }
      }
      return text
    }

    // 處理不同類型的節點
    if (n.type === 'paragraph') {
      if (n.content && Array.isArray(n.content)) {
        const paraText = n.content.map((child) => tiptapToMarkdown(child)).join('')
        markdown += paraText + '\n\n'
      } else {
        markdown += '\n\n'
      }
    } else if (n.type === 'heading') {
      const level = ((n.attrs as { level?: number })?.level) || 1
      const headingText = n.content ? n.content.map((child) => tiptapToMarkdown(child)).join('') : ''
      markdown += '#'.repeat(level) + ' ' + headingText + '\n\n'
    } else if (n.type === 'codeBlock') {
      const codeText = n.content ? n.content.map((child) => tiptapToMarkdown(child)).join('') : ''
      const language = ((n.attrs as { language?: string })?.language) || 'text'
      markdown += '```' + language + '\n' + codeText + '\n```\n\n'
    } else if (n.type === 'hardBreak') {
      markdown += '\n'
    } else if (n.type === 'bulletList' || n.type === 'orderedList') {
      if (n.content && Array.isArray(n.content)) {
        n.content.forEach((item, index) => {
          const itemText = item.content ? item.content.map((child) => tiptapToMarkdown(child)).join('').trim() : ''
          const prefix = n.type === 'orderedList' ? `${index + 1}. ` : '- '
          markdown += prefix + itemText + '\n'
        })
        markdown += '\n'
      }
    } else if (n.type === 'blockquote') {
      const quoteText = n.content ? n.content.map((child) => tiptapToMarkdown(child)).join('').trim() : ''
      markdown += '> ' + quoteText.split('\n').join('\n> ') + '\n\n'
    } else if (n.type === 'latexBlock') {
      const latex = ((n.attrs as { latex?: string })?.latex) || ''
      markdown += '$$\n' + latex + '\n$$\n\n'
    } else if (n.type === 'inlineLatex') {
      const latex = ((n.attrs as { latex?: string })?.latex) || ''
      markdown += '$' + latex + '$'
    } else if (n.type === 'image') {
      const src = ((n.attrs as { src?: string })?.src) || ''
      const alt = ((n.attrs as { alt?: string })?.alt) || ''
      markdown += `![${alt}](${src})\n\n`
    } else if (n.type === 'questionBlock') {
      const questionId = ((n.attrs as { questionId?: string })?.questionId) || ''
      markdown += `\n[題目區塊: ${questionId || '未指定'}]\n\n`
    } else if (n.type === 'templateBlock') {
      const templateId = ((n.attrs as { templateId?: string })?.templateId) || ''
      markdown += `\n[模板區塊: ${templateId || '未指定'}]\n\n`
    } else if (n.type === 'diagram2DBlock' || n.type === 'diagram2D') {
      markdown += `\n[2D 圖表]\n\n`
    } else if (n.type === 'diagram3DBlock' || n.type === 'diagram3D') {
      markdown += `\n[3D 圖表]\n\n`
    } else if (n.type === 'circuitBlock' || n.type === 'circuit') {
      markdown += `\n[電路圖]\n\n`
    } else if (n.type === 'imagePlaceholder') {
      const alt = ((n.attrs as { alt?: string })?.alt) || '圖片'
      markdown += `\n[圖片: ${alt}]\n\n`
    } else if (n.type === 'pageBreak') {
      markdown += `\n---\n\n`
    } else if (n.content && Array.isArray(n.content)) {
      // 遞迴處理子節點
      markdown += n.content.map((child) => tiptapToMarkdown(child)).join('')
    }

    return markdown
  }

  /**
   * 獲取題目內容（支持多種格式）
   */
  const getQuestionContent = (question: QuestionWithExtras | null): string => {
    if (!question) return ''
    // 如果是字串（舊格式，向後相容）
    if (typeof question.content === 'string') return question.content
    // 如果是舊的物件格式 {format: 'markdown', text: '...'}
    if (question.content && typeof question.content === 'object' && (question.content as { text?: string }).text) {
      return (question.content as { text: string }).text
    }
    // 如果是 Tiptap JSON 格式
    if (question.content && typeof question.content === 'object' && (question.content as TiptapDocument).type === 'doc') {
      return tiptapToMarkdown(question.content as unknown as TiptapNode).trim()
    }
    return ''
  }

  /**
   * 獲取題目答案（支持多種格式）
   */
  const getQuestionAnswer = (question: QuestionWithExtras | null): string => {
    if (!question) return ''
    // 如果是字串（舊格式，向後相容）
    if (typeof question.correct_answer === 'string') return question.correct_answer
    // 如果是舊的物件格式 {format: 'markdown', text: '...'}
    if (question.correct_answer && typeof question.correct_answer === 'object' && (question.correct_answer as { text?: string }).text) {
      return (question.correct_answer as { text: string }).text
    }
    // 如果是 Tiptap JSON 格式
    if (question.correct_answer && typeof question.correct_answer === 'object' && (question.correct_answer as TiptapDocument).type === 'doc') {
      return tiptapToMarkdown(question.correct_answer as unknown as TiptapNode).trim()
    }
    return ''
  }

  /**
   * 獲取題目詳解（支持多種格式）
   */
  const getQuestionSolution = (question: QuestionWithExtras | null): string => {
    if (!question || !question.solution_content) return ''
    // 如果是字串（舊格式，向後相容）
    if (typeof question.solution_content === 'string') return question.solution_content
    // 如果是舊的物件格式 {format: 'markdown', text: '...'}
    if (question.solution_content && typeof question.solution_content === 'object' && (question.solution_content as { text?: string }).text) {
      return (question.solution_content as { text: string }).text
    }
    // 如果是 Tiptap JSON 格式
    if (question.solution_content && typeof question.solution_content === 'object' && (question.solution_content as TiptapDocument).type === 'doc') {
      return tiptapToMarkdown(question.solution_content as unknown as TiptapNode).trim()
    }
    return ''
  }

  /**
   * 獲取選項內容（支持多種格式）
   */
  const getOptionContent = (option: TiptapDocument | string | unknown): string => {
    if (!option) return ''
    // 如果是字串（舊格式，向後相容）
    if (typeof option === 'string') return option
    // 如果是 Tiptap JSON 格式
    if (option && typeof option === 'object' && (option as TiptapDocument).type === 'doc') {
      return tiptapToMarkdown(option as unknown as TiptapNode).trim()
    }
    // 如果是其他物件格式，嘗試轉換
    if (option && typeof option === 'object') {
      return tiptapToMarkdown(option as unknown as TiptapNode).trim()
    }
    return ''
  }

  return {
    tiptapToMarkdown,
    getQuestionContent,
    getQuestionAnswer,
    getQuestionSolution,
    getOptionContent,
  }
}
