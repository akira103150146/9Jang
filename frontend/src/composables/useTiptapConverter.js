/**
 * TipTap JSON 轉換工具
 * 提供將 TipTap JSON 格式轉換為純文字或 Markdown 的函數
 * 注意：此工具只支援 TipTap JSON 格式，不再支援舊的 Markdown 字串格式
 */

/**
 * 從 TipTap JSON 中遞迴提取純文字
 * @param {Object} node - TipTap JSON 節點
 * @returns {string} 提取的純文字
 */
export function extractTextFromTiptapJSON(node) {
  if (!node || typeof node !== 'object') return ''
  
  let text = ''
  if (node.type === 'text' && node.text) {
    text = node.text
  }
  
  if (node.content && Array.isArray(node.content)) {
    for (const child of node.content) {
      text += extractTextFromTiptapJSON(child)
    }
  }
  
  return text
}

/**
 * 將 TipTap JSON 轉換為 Markdown 字串
 * @param {Object} node - TipTap JSON 節點
 * @returns {string} Markdown 字串
 */
export function tiptapToMarkdown(node) {
  if (!node || typeof node !== 'object') return ''
  
  let markdown = ''
  
  // 處理文字節點
  if (node.type === 'text') {
    let text = node.text || ''
    // 處理文字標記
    if (node.marks) {
      for (const mark of node.marks) {
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
  if (node.type === 'paragraph') {
    if (node.content && Array.isArray(node.content)) {
      const paraText = node.content.map(child => tiptapToMarkdown(child)).join('')
      markdown += paraText + '\n\n'
    } else {
      markdown += '\n\n'
    }
  } else if (node.type === 'heading') {
    const level = node.attrs?.level || 1
    const headingText = node.content ? node.content.map(child => tiptapToMarkdown(child)).join('') : ''
    markdown += '#'.repeat(level) + ' ' + headingText + '\n\n'
  } else if (node.type === 'codeBlock') {
    const codeText = node.content ? node.content.map(child => tiptapToMarkdown(child)).join('') : ''
    const language = node.attrs?.language || 'text'
    markdown += '```' + language + '\n' + codeText + '\n```\n\n'
  } else if (node.type === 'hardBreak') {
    markdown += '\n'
  } else if (node.type === 'bulletList' || node.type === 'orderedList') {
    if (node.content && Array.isArray(node.content)) {
      node.content.forEach((item, index) => {
        const itemText = item.content ? item.content.map(child => tiptapToMarkdown(child)).join('').trim() : ''
        const prefix = node.type === 'orderedList' ? `${index + 1}. ` : '- '
        markdown += prefix + itemText + '\n'
      })
      markdown += '\n'
    }
  } else if (node.type === 'blockquote') {
    const quoteText = node.content ? node.content.map(child => tiptapToMarkdown(child)).join('').trim() : ''
    markdown += '> ' + quoteText.split('\n').join('\n> ') + '\n\n'
  } else if (node.type === 'latexBlock') {
    const latex = node.attrs?.latex || ''
    markdown += '$$\n' + latex + '\n$$\n\n'
  } else if (node.type === 'inlineLatex') {
    const latex = node.attrs?.latex || ''
    markdown += '$' + latex + '$'
  } else if (node.type === 'image') {
    const src = node.attrs?.src || ''
    const alt = node.attrs?.alt || ''
    markdown += `![${alt}](${src})\n\n`
  } else if (node.type === 'questionBlock') {
    const questionId = node.attrs?.questionId || ''
    markdown += `\n[題目區塊: ${questionId || '未指定'}]\n\n`
  } else if (node.type === 'templateBlock') {
    const templateId = node.attrs?.templateId || ''
    markdown += `\n[模板區塊: ${templateId || '未指定'}]\n\n`
  } else if (node.type === 'diagram2DBlock' || node.type === 'diagram2D') {
    markdown += `\n[2D 圖表]\n\n`
  } else if (node.type === 'diagram3DBlock' || node.type === 'diagram3D') {
    markdown += `\n[3D 圖表]\n\n`
  } else if (node.type === 'circuitBlock' || node.type === 'circuit') {
    markdown += `\n[電路圖]\n\n`
  } else if (node.type === 'imagePlaceholder') {
    const alt = node.attrs?.alt || '圖片'
    markdown += `\n[圖片: ${alt}]\n\n`
  } else if (node.type === 'pageBreak') {
    markdown += `\n---\n\n`
  } else if (node.content && Array.isArray(node.content)) {
    // 遞迴處理子節點
    markdown += node.content.map(child => tiptapToMarkdown(child)).join('')
  }
  
  return markdown
}

/**
 * 將 TipTap JSON 轉換為 Markdown
 * @param {Object} content - TipTap JSON 內容
 * @returns {string} Markdown 字串
 */
export function contentToMarkdown(content) {
  if (!content) return ''
  
  // 只處理 TipTap JSON 格式
  if (content && typeof content === 'object' && content.type === 'doc') {
    return tiptapToMarkdown(content).trim()
  }
  
  return ''
}

/**
 * 將 TipTap JSON 轉換為純文字預覽
 * @param {Object} content - TipTap JSON 內容
 * @param {number} maxLength - 最大長度（預設 100）
 * @returns {string} 純文字預覽
 */
export function contentToTextPreview(content, maxLength = 100) {
  if (!content) return '無內容'
  
  let text = ''
  
  // 只處理 TipTap JSON 格式
  if (typeof content === 'object' && content !== null && content.type === 'doc') {
    text = extractTextFromTiptapJSON(content).trim()
  }
  
  if (!text) return '無內容'
  
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

/**
 * Composable 函數
 */
export function useTiptapConverter() {
  return {
    extractTextFromTiptapJSON,
    tiptapToMarkdown,
    contentToMarkdown,
    contentToTextPreview
  }
}
