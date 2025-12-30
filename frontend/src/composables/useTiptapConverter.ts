/**
 * TipTap JSON 轉換工具
 * 提供將 TipTap JSON 格式轉換為純文字或 Markdown 的函數
 * 注意：此工具只支援 TipTap JSON 格式，不再支援舊的 Markdown 字串格式
 */

import type { TiptapDocument, TiptapBlockContent, TiptapInlineContent } from '@9jang/shared'

/**
 * 從 TipTap JSON 中遞迴提取純文字
 * @param node - TipTap JSON 節點
 * @returns 提取的純文字
 */
export function extractTextFromTiptapJSON(node: unknown): string {
  if (!node || typeof node !== 'object') return ''

  let text = ''
  const tiptapNode = node as { type?: string; text?: string; content?: unknown[] }
  
  if (tiptapNode.type === 'text' && tiptapNode.text) {
    text = tiptapNode.text
  }

  if (tiptapNode.content && Array.isArray(tiptapNode.content)) {
    for (const child of tiptapNode.content) {
      text += extractTextFromTiptapJSON(child)
    }
  }

  return text
}

/**
 * 將 TipTap JSON 轉換為 Markdown 字串
 * @param node - TipTap JSON 節點
 * @returns Markdown 字串
 */
export function tiptapToMarkdown(node: unknown): string {
  if (!node || typeof node !== 'object') return ''

  const tiptapNode = node as {
    type?: string
    text?: string
    marks?: Array<{ type?: string }>
    content?: unknown[]
    attrs?: Record<string, unknown>
  }

  let markdown = ''

  // 處理文字節點
  if (tiptapNode.type === 'text') {
    let text = tiptapNode.text || ''

    // 處理文字標記
    if (tiptapNode.marks && Array.isArray(tiptapNode.marks)) {
      for (const mark of tiptapNode.marks) {
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
  if (tiptapNode.type === 'paragraph') {
    if (tiptapNode.content && Array.isArray(tiptapNode.content)) {
      const paraText = tiptapNode.content.map((child) => tiptapToMarkdown(child)).join('')
      markdown += paraText + '\n\n'
    } else {
      markdown += '\n\n'
    }
  } else if (tiptapNode.type === 'heading') {
    const level = (tiptapNode.attrs?.level as number) || 1
    const headingText = tiptapNode.content
      ? tiptapNode.content.map((child) => tiptapToMarkdown(child)).join('')
      : ''
    markdown += '#'.repeat(level) + ' ' + headingText + '\n\n'
  } else if (tiptapNode.type === 'codeBlock') {
    const codeText = tiptapNode.content
      ? tiptapNode.content.map((child) => tiptapToMarkdown(child)).join('')
      : ''
    const language = (tiptapNode.attrs?.language as string) || 'text'
    markdown += '```' + language + '\n' + codeText + '\n```\n\n'
  } else if (tiptapNode.type === 'hardBreak') {
    markdown += '\n'
  } else if (tiptapNode.type === 'bulletList' || tiptapNode.type === 'orderedList') {
    if (tiptapNode.content && Array.isArray(tiptapNode.content)) {
      tiptapNode.content.forEach((item, index) => {
        const itemNode = item as { content?: unknown[] }
        const itemText = itemNode.content
          ? itemNode.content.map((child) => tiptapToMarkdown(child)).join('').trim()
          : ''
        const prefix = tiptapNode.type === 'orderedList' ? `${index + 1}. ` : '- '
        markdown += prefix + itemText + '\n'
      })
      markdown += '\n'
    }
  } else if (tiptapNode.type === 'blockquote') {
    const quoteText = tiptapNode.content
      ? tiptapNode.content.map((child) => tiptapToMarkdown(child)).join('').trim()
      : ''
    markdown += '> ' + quoteText.split('\n').join('\n> ') + '\n\n'
  } else if (tiptapNode.type === 'latexBlock') {
    const latex = (tiptapNode.attrs?.formula as string) || ''
    markdown += '$$\n' + latex + '\n$$\n\n'
  } else if (tiptapNode.type === 'inlineLatex') {
    const latex = (tiptapNode.attrs?.formula as string) || ''
    markdown += '$' + latex + '$'
  } else if (tiptapNode.type === 'image') {
    const src = (tiptapNode.attrs?.src as string) || ''
    const alt = (tiptapNode.attrs?.alt as string) || ''
    markdown += `![${alt}](${src})\n\n`
  } else if (tiptapNode.type === 'questionBlock') {
    const questionId = (tiptapNode.attrs?.questionId as number | string) || ''
    markdown += `[Question Block: ${questionId}]\n\n`
  } else if (tiptapNode.type === 'templateBlock') {
    const templateId = (tiptapNode.attrs?.templateId as number | string) || ''
    markdown += `[Template Block: ${templateId}]\n\n`
  } else if (tiptapNode.type === 'diagram2DBlock' || tiptapNode.type === 'diagram3DBlock' || tiptapNode.type === 'circuitBlock') {
    markdown += `[${tiptapNode.type}]\n\n`
  } else {
    // 其他節點類型：遞迴處理子節點
    if (tiptapNode.content && Array.isArray(tiptapNode.content)) {
      markdown += tiptapNode.content.map((child) => tiptapToMarkdown(child)).join('')
    }
  }

  return markdown
}
