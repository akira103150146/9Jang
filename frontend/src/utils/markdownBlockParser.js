/**
 * Markdown 區塊解析器
 * 將 Markdown 文本解析為可獨立拖動的區塊，並支援重組
 */

/**
 * 區塊類型定義
 */
const BLOCK_TYPES = {
  HEADING: 'heading',
  CODE_BLOCK: 'code_block',
  LATEX_BLOCK: 'latex_block',
  LIST: 'list',
  ORDERED_LIST: 'ordered_list',
  QUOTE: 'quote',
  PARAGRAPH: 'paragraph',
  EMPTY: 'empty'
}

/**
 * 解析 Markdown 文本為區塊陣列
 * @param {string} markdown - Markdown 文本
 * @returns {Array} 區塊陣列，每個區塊包含 { id, type, content, startLine, endLine }
 */
export function parseMarkdownToBlocks(markdown) {
  if (!markdown || typeof markdown !== 'string') {
    return []
  }

  const blocks = []
  const lines = markdown.split('\n')
  let currentBlock = null
  let lineIndex = 0

  while (lineIndex < lines.length) {
    const line = lines[lineIndex]

    // 檢查是否在程式碼區塊中
    if (line.trimStart().startsWith('```')) {
      const startLine = lineIndex
      const language = line.trimStart().slice(3).trim()
      const codeLines = [line]
      lineIndex++

      // 找到程式碼區塊結束
      while (lineIndex < lines.length) {
        codeLines.push(lines[lineIndex])
        if (lines[lineIndex].trimStart().startsWith('```')) {
          lineIndex++
          break
        }
        lineIndex++
      }

      blocks.push({
        id: generateBlockId(),
        type: BLOCK_TYPES.CODE_BLOCK,
        content: codeLines.join('\n'),
        startLine,
        endLine: lineIndex - 1,
        metadata: { language }
      })
      continue
    }

    // 檢查是否在 LaTeX 區塊中
    if (line.trim().startsWith('$$')) {
      const startLine = lineIndex
      const latexLines = [line]
      lineIndex++

      // 找到 LaTeX 區塊結束
      while (lineIndex < lines.length) {
        latexLines.push(lines[lineIndex])
        if (lines[lineIndex].trim().startsWith('$$')) {
          lineIndex++
          break
        }
        lineIndex++
      }

      blocks.push({
        id: generateBlockId(),
        type: BLOCK_TYPES.LATEX_BLOCK,
        content: latexLines.join('\n'),
        startLine,
        endLine: lineIndex - 1
      })
      continue
    }

    // 檢查標題
    if (/^#{1,6}\s+/.test(line)) {
      blocks.push({
        id: generateBlockId(),
        type: BLOCK_TYPES.HEADING,
        content: line,
        startLine: lineIndex,
        endLine: lineIndex,
        metadata: { level: line.match(/^#+/)[0].length }
      })
      lineIndex++
      continue
    }

    // 檢查引用區塊（可能多行）
    if (line.trimStart().startsWith('>')) {
      const startLine = lineIndex
      const quoteLines = [line]
      lineIndex++

      // 繼續讀取連續的引用行
      while (lineIndex < lines.length && lines[lineIndex].trimStart().startsWith('>')) {
        quoteLines.push(lines[lineIndex])
        lineIndex++
      }

      blocks.push({
        id: generateBlockId(),
        type: BLOCK_TYPES.QUOTE,
        content: quoteLines.join('\n'),
        startLine,
        endLine: lineIndex - 1
      })
      continue
    }

    // 檢查列表（無序）
    if (/^[\s]*[-*+]\s+/.test(line)) {
      const startLine = lineIndex
      const listLines = [line]
      lineIndex++

      // 繼續讀取連續的列表項（包括縮排）
      while (lineIndex < lines.length) {
        const nextLine = lines[lineIndex]
        // 檢查是否為列表項或列表項的續行（有縮排）
        if (/^[\s]*[-*+]\s+/.test(nextLine) || (nextLine.trim() && /^\s{2,}/.test(nextLine))) {
          listLines.push(nextLine)
          lineIndex++
        } else if (nextLine.trim() === '') {
          // 空行可能是列表的一部分，先加入
          listLines.push(nextLine)
          lineIndex++
          // 如果下一行還是列表項，繼續；否則退出
          if (lineIndex < lines.length && !/^[\s]*[-*+]\s+/.test(lines[lineIndex])) {
            break
          }
        } else {
          break
        }
      }

      blocks.push({
        id: generateBlockId(),
        type: BLOCK_TYPES.LIST,
        content: listLines.join('\n').trimEnd(),
        startLine,
        endLine: lineIndex - 1
      })
      continue
    }

    // 檢查有序列表
    if (/^\d+\.\s+/.test(line)) {
      const startLine = lineIndex
      const listLines = [line]
      lineIndex++

      // 繼續讀取連續的有序列表項
      while (lineIndex < lines.length) {
        const nextLine = lines[lineIndex]
        if (/^\d+\.\s+/.test(nextLine) || (nextLine.trim() && /^\s{2,}/.test(nextLine))) {
          listLines.push(nextLine)
          lineIndex++
        } else if (nextLine.trim() === '') {
          listLines.push(nextLine)
          lineIndex++
          if (lineIndex < lines.length && !/^\d+\.\s+/.test(lines[lineIndex])) {
            break
          }
        } else {
          break
        }
      }

      blocks.push({
        id: generateBlockId(),
        type: BLOCK_TYPES.ORDERED_LIST,
        content: listLines.join('\n').trimEnd(),
        startLine,
        endLine: lineIndex - 1
      })
      continue
    }

    // 檢查空行
    if (line.trim() === '') {
      // 跳過空行，不創建區塊
      lineIndex++
      continue
    }

    // 段落：收集連續的非空行，直到遇到空行或特殊區塊
    const startLine = lineIndex
    const paragraphLines = [line]
    lineIndex++

    while (lineIndex < lines.length) {
      const nextLine = lines[lineIndex]

      // 檢查是否遇到特殊區塊的開始
      if (nextLine.trim() === '' ||
        nextLine.trimStart().startsWith('```') ||
        nextLine.trim().startsWith('$$') ||
        /^#{1,6}\s+/.test(nextLine) ||
        nextLine.trimStart().startsWith('>') ||
        /^[\s]*[-*+]\s+/.test(nextLine) ||
        /^\d+\.\s+/.test(nextLine)) {
        break
      }

      paragraphLines.push(nextLine)
      lineIndex++
    }

    blocks.push({
      id: generateBlockId(),
      type: BLOCK_TYPES.PARAGRAPH,
      content: paragraphLines.join('\n'),
      startLine,
      endLine: lineIndex - 1
    })
  }

  return blocks
}

/**
 * 將區塊陣列重組為 Markdown 文本
 * @param {Array} blocks - 區塊陣列
 * @returns {string} Markdown 文本
 */
export function blocksToMarkdown(blocks) {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return ''
  }

  return blocks
    .filter(block => block && block.content)
    .map(block => block.content)
    .join('\n\n')
}

/**
 * 生成唯一的區塊 ID
 * @returns {string} 區塊 ID
 */
function generateBlockId() {
  return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 獲取區塊類型的顯示名稱
 * @param {string} type - 區塊類型
 * @returns {string} 顯示名稱
 */
export function getBlockTypeName(type) {
  const names = {
    [BLOCK_TYPES.HEADING]: '標題',
    [BLOCK_TYPES.CODE_BLOCK]: '程式碼',
    [BLOCK_TYPES.LATEX_BLOCK]: '數學公式',
    [BLOCK_TYPES.LIST]: '列表',
    [BLOCK_TYPES.ORDERED_LIST]: '有序列表',
    [BLOCK_TYPES.QUOTE]: '引用',
    [BLOCK_TYPES.PARAGRAPH]: '段落',
    [BLOCK_TYPES.EMPTY]: '空白'
  }
  return names[type] || '未知'
}

export { BLOCK_TYPES }
