/**
 * 節點轉換器
 * 將解析器返回的 tokens 轉換為 Tiptap 節點結構
 */

import { parseInlineLatex } from './smartPasteParser'

/**
 * 生成唯一 ID
 */
function generateId() {
  return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 解析行內內容（處理行內 LaTeX 和 Markdown）
 * @param {string} text - 文字內容
 * @returns {Array} Tiptap 文字節點陣列
 */
function parseInlineContent(text) {
  // 先處理行內 LaTeX
  const latexParts = parseInlineLatex(text)
  const content = []

  for (const part of latexParts) {
    if (part.isLatex) {
      // 行內 LaTeX：使用 inlineLatex node
      content.push({
        type: 'inlineLatex',
        attrs: {
          formula: part.text
        }
      })
    } else {
      // 處理 Markdown 格式（粗體、斜體）
      const processed = parseMarkdownInline(part.text)
      content.push(...processed)
    }
  }

  return content.length > 0 ? content : [{ type: 'text', text }]
}

/**
 * 預處理文字：處理換行符
 * @param {string} text - 文字內容
 * @returns {string} 處理後的文字
 */
function preprocessText(text) {
  // 只處理換行符 \ -> 實際換行
  // 將行尾的 \ 轉換為實際換行
  // 注意：LaTeX 內的 \ 不應該被處理，但因為 LaTeX 已經在 parseInlineLatex 中提取出來了，所以這裡處理的是剩餘的文字
  let processedText = text.replace(/\\\s*$/gm, '\n')


  return processedText
}

/**
 * 解析 Markdown 行內格式（粗體、斜體）
 * @param {string} text - 文字內容
 * @returns {Array} Tiptap 文字節點陣列
 */
function parseMarkdownInline(text) {
  // 預處理文字（處理圖片和換行符）
  text = preprocessText(text)
  const parts = []
  // 匹配粗體 **text** 或 __text__
  const boldRegex = /(\*\*|__)(.+?)\1/g
  // 匹配斜體 *text* 或 _text_
  const italicRegex = /(?<!\*)\*([^*]+?)\*(?!\*)|(?<!_)_([^_]+?)_(?!_)/g

  let lastIndex = 0
  let match

  // 先處理粗體
  const boldMatches = []
  while ((match = boldRegex.exec(text)) !== null) {
    boldMatches.push({
      start: match.index,
      end: match.index + match[0].length,
      content: match[2],
      type: 'bold'
    })
  }

  // 再處理斜體（避免與粗體衝突）
  const italicMatches = []
  while ((match = italicRegex.exec(text)) !== null) {
    const start = match.index
    const end = match.index + match[0].length

    // 檢查是否與粗體重疊
    const overlapsBold = boldMatches.some(b =>
      (start >= b.start && start < b.end) ||
      (end > b.start && end <= b.end)
    )

    if (!overlapsBold) {
      italicMatches.push({
        start,
        end,
        content: match[1] || match[2],
        type: 'italic'
      })
    }
  }

  // 合併並排序所有標記
  const allMarkers = [
    ...boldMatches.map(m => ({ ...m, priority: 1 })),
    ...italicMatches.map(m => ({ ...m, priority: 2 }))
  ].sort((a, b) => a.start - b.start)

  // 構建內容節點
  for (const marker of allMarkers) {
    // 添加標記前的文字
    if (marker.start > lastIndex) {
      const beforeText = text.substring(lastIndex, marker.start)
      if (beforeText) {
        parts.push({ type: 'text', text: beforeText })
      }
    }

    // 添加標記內容
    const marks = []
    if (marker.type === 'bold') {
      marks.push({ type: 'bold' })
    } else if (marker.type === 'italic') {
      marks.push({ type: 'italic' })
    }

    parts.push({
      type: 'text',
      text: marker.content,
      marks: marks.length > 0 ? marks : undefined
    })

    lastIndex = marker.end
  }

  // 添加剩餘文字
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex)
    if (remainingText) {
      parts.push({ type: 'text', text: remainingText })
    }
  }

  return parts.length > 0 ? parts : [{ type: 'text', text }]
}

/**
 * 從 token 創建 Tiptap 節點
 * @param {Object} token - 解析器返回的 token
 * @param {Object} editor - Tiptap 編輯器實例（可選）
 * @param {Map} imageMappings - 圖片檔名到 URL 的映射表（可選）
 * @returns {Object} Tiptap 節點結構
 */
export function createNodeFromToken(token, editor = null, imageMappings = null) {

  switch (token.type) {
    case 'latex':
      return {
        type: 'latexBlock',
        attrs: {
          id: generateId(),
          formula: token.content,
          displayMode: token.displayMode !== false
        }
      }

    case 'heading':
      return {
        type: 'heading',
        attrs: { level: Math.min(Math.max(token.level, 1), 6) },
        content: parseInlineContent(token.content)
      }

    case 'bulletList':
      return {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: parseInlineContent(token.content)
              }
            ]
          }
        ]
      }

    case 'orderedList':
      return {
        type: 'orderedList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: parseInlineContent(token.content)
              }
            ]
          }
        ]
      }

    case 'blockquote':

      // 如果 blockquote 包含圖片，需要拆分內容
      if (token.hasImages && token.images && token.images.length > 0) {
        const blockquoteContent = []
        const blockquoteText = token.content
        let lastIndex = 0

        // 按圖片位置排序
        const sortedImages = [...token.images].sort((a, b) => a.index - b.index)

        sortedImages.forEach(img => {
          // 前面的文字
          if (img.index > lastIndex) {
            const textBefore = blockquoteText.substring(lastIndex, img.index)
            if (textBefore.trim()) {
              const normalizedText = textBefore.replace(/\r?\n/g, ' ')
              const hasBlockLatex = /\$\$[\s\S]*?\$\$/.test(normalizedText)
              const hasPairedDollars = /\$[^$]+\$/.test(normalizedText)
              const hasInlineLatex = hasPairedDollars && !hasBlockLatex

              blockquoteContent.push({
                type: 'paragraph',
                content: parseInlineContent(textBefore)
              })
            }
          }

          // 圖片節點
          const imageUrl = imageMappings?.get(img.filename)
          if (imageUrl) {
            blockquoteContent.push({
              type: 'image',
              attrs: {
                src: imageUrl,
                alt: img.alt || img.filename,
                title: img.filename
              }
            })
          } else {
            blockquoteContent.push({
              type: 'imagePlaceholder',
              attrs: {
                id: generateId(),
                filename: img.filename,
                alt: img.alt,
                originalPath: img.originalPath
              }
            })
          }

          lastIndex = img.index + img.fullMatch.length
        })

        // 剩餘文字
        if (lastIndex < blockquoteText.length) {
          const textAfter = blockquoteText.substring(lastIndex)
          if (textAfter.trim()) {
            blockquoteContent.push({
              type: 'paragraph',
              content: parseInlineContent(textAfter)
            })
          }
        }

        return {
          type: 'blockquote',
          content: blockquoteContent.length > 0 ? blockquoteContent : [{
            type: 'paragraph',
            content: []
          }]
        }
      } else {
        // 沒有圖片，正常處理
        return {
          type: 'blockquote',
          content: [
            {
              type: 'paragraph',
              content: parseInlineContent(token.content)
            }
          ]
        }
      }

    case 'image':
      // 從映射表查找 URL
      const imageUrl = imageMappings?.get(token.filename)

      if (imageUrl) {
        // 匹配成功: 使用標準圖片節點
        return {
          type: 'image',
          attrs: {
            src: imageUrl,
            alt: token.alt || token.filename,
            title: token.filename
          }
        }
      } else {
        // 匹配失敗: 使用可點擊的佔位符
        return {
          type: 'imagePlaceholder',
          attrs: {
            id: generateId(),
            filename: token.filename,
            alt: token.alt,
            originalPath: token.originalPath
          }
        }
      }

    case 'paragraph':
      const paragraphContent = parseInlineContent(token.content)
      // 如果標記為粗體，為所有文字添加粗體標記
      if (token.isBold && paragraphContent.length > 0) {
        paragraphContent.forEach(part => {
          if (part.type === 'text' && !part.marks) {
            part.marks = [{ type: 'bold' }]
          } else if (part.type === 'text' && part.marks) {
            // 如果已有 marks，添加 bold
            if (!part.marks.some(m => m.type === 'bold')) {
              part.marks.push({ type: 'bold' })
            }
          }
        })
      }
      return {
        type: 'paragraph',
        content: paragraphContent
      }

    default:
      // 預設為段落
      return {
        type: 'paragraph',
        content: parseInlineContent(token.content || String(token))
      }
  }
}

/**
 * 批量創建節點
 * @param {Array} tokens - token 陣列
 * @param {Object} editor - Tiptap 編輯器實例（可選）
 * @param {Map} imageMappings - 圖片檔名到 URL 的映射表（可選）
 * @returns {Array} Tiptap 節點陣列
 */
export function createNodesFromTokens(tokens, editor = null, imageMappings = null) {
  const nodes = tokens.map(token => createNodeFromToken(token, editor, imageMappings))

  return nodes
}
