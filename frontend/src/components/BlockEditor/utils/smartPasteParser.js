/**
 * 智能貼上解析器
 * 解析貼上的文字內容，識別 LaTeX、Markdown 等格式並轉換為 tokens
 */

/**
 * 生成唯一 ID
 */
function generateId() {
  return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 解析智能貼上內容
 * @param {string} text - 貼上的純文字內容
 * @returns {Array} tokens 陣列，每個 token 包含 type 和 content
 */
export function parseSmartPaste(text) {

  if (!text || !text.trim()) {
    return []
  }

  // 限制處理長度，避免效能問題
  if (text.length > 10000) {
    console.warn('貼上內容過長，將截斷處理')
    text = text.substring(0, 10000)
  }

  const tokens = []
  const lines = text.split(/\r?\n/)

  // 第一步：找出所有跨行的 $$...$$ 區塊
  // 使用正則表達式匹配整個文本中的 $$...$$（允許跨行）
  const blockLatexBlocks = []
  const blockLatexRegex = /\$\$([\s\S]*?)\$\$/g
  let match
  while ((match = blockLatexRegex.exec(text)) !== null) {
    const startPos = match.index
    const endPos = match.index + match[0].length

    // 計算起始和結束的行號
    const startLine = text.substring(0, startPos).split(/\r?\n/).length - 1
    const endLine = text.substring(0, endPos).split(/\r?\n/).length - 1

    // 只有跨行的才需要特殊處理（單行的會在逐行處理時處理）
    if (startLine !== endLine) {
      blockLatexBlocks.push({
        startLine,
        endLine,
        formula: match[1].trim(),
        startPos,
        endPos
      })
    }
  }


  let i = 0
  while (i < lines.length) {
    const line = lines[i]


    // 檢查當前行是否在跨行 LaTeX 區塊內
    const blockLatexBlock = blockLatexBlocks.find(block =>
      i >= block.startLine && i <= block.endLine
    )

    if (blockLatexBlock) {
      // 如果當前行是跨行 LaTeX 區塊的起始行，創建 LaTeX token
      if (i === blockLatexBlock.startLine) {
        tokens.push({
          type: 'latex',
          content: blockLatexBlock.formula,
          displayMode: true
        })
        // 跳過整個區塊的所有行
        i = blockLatexBlock.endLine + 1
        continue
      } else {
        // 在區塊中間的行，直接跳過
        i++
        continue
      }
    }

    // 跳過空行
    if (!line.trim()) {
      i++
      continue
    }

    // 1. 優先識別區塊級 LaTeX ($$...$$) - 必須以 $$ 開始和結束
    // 檢查是否以 $$ 開始
    const trimmedLine = line.trim()
    const startsWithDoubleDollar = trimmedLine.startsWith('$$')
    const endsWithDoubleDollar = trimmedLine.endsWith('$$')

    // 只有當行以 $$ 開始且以 $$ 結束時才認為是區塊 LaTeX
    if (startsWithDoubleDollar && endsWithDoubleDollar && trimmedLine.length > 4) {
      const blockLatexMatch = trimmedLine.match(/^\$\$([\s\S]*?)\$\$$/)
      if (blockLatexMatch) {
        const formula = blockLatexMatch[1].trim()
        tokens.push({
          type: 'latex',
          content: formula,
          displayMode: true
        })
        i++
        continue
      }
    }

    // 2. 識別 Markdown 標題 (# 到 ######)
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const content = headingMatch[2].trim()
      tokens.push({
        type: 'heading',
        level,
        content
      })
      i++
      continue
    }

    // 2.5. 識別 Markdown 粗體行（整行都是粗體，可能包含空格）
    // 匹配 **text** 或 ** text ** 格式
    const boldLineMatch = line.match(/^\s*\*\*(.+?)\*\*\s*$/)
    if (boldLineMatch) {
      const content = boldLineMatch[1].trim()
      tokens.push({
        type: 'paragraph',
        content: content,
        isBold: true
      })
      i++
      continue
    }

    // 3. 識別無序列表 (-, *, +)
    const listMatch = line.match(/^([-*+])\s+(.+)$/)
    if (listMatch) {
      const content = listMatch[2].trim()
      tokens.push({
        type: 'bulletList',
        content
      })
      i++
      continue
    }

    // 4. 識別有序列表 (數字.)
    const orderedListMatch = line.match(/^(\d+)\.\s+(.+)$/)
    if (orderedListMatch) {
      const content = orderedListMatch[2].trim()
      tokens.push({
        type: 'orderedList',
        content
      })
      i++
      continue
    }

    // 4.5. 識別 Blockquote (> 開頭)
    const blockquoteMatch = line.match(/^>\s+(.*)$/)
    if (blockquoteMatch) {
      // 收集連續的 blockquote 行
      const blockquoteLines = []
      while (i < lines.length) {
        const currentLine = lines[i]
        const currentMatch = currentLine.match(/^>\s+(.*)$/)

        if (!currentMatch) {
          break // 不再是 blockquote，停止收集
        }

        blockquoteLines.push(currentMatch[1])
        i++
      }

      if (blockquoteLines.length > 0) {
        const blockquoteText = blockquoteLines.join('\n')

        // 檢查是否包含圖片語法
        const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
        const images = []
        let match

        while ((match = imageRegex.exec(blockquoteText)) !== null) {
          images.push({
            alt: match[1],
            path: match[2],
            fullMatch: match[0],
            index: match.index
          })
        }

        // 如果有圖片，需要拆分 blockquote 內容
        if (images.length > 0) {
          // 創建 blockquote 容器 token，內容將在 nodeConverter 中處理
          tokens.push({
            type: 'blockquote',
            content: blockquoteText,
            hasInlineLatex: false,
            hasImages: true,
            images: images.map(img => ({
              alt: img.alt,
              filename: img.path.split('/').pop().split('\\').pop(),
              originalPath: img.path,
              fullMatch: img.fullMatch,
              index: img.index
            }))
          })
        } else {
          // 沒有圖片，正常處理
          const normalizedText = blockquoteText.replace(/\r?\n/g, ' ')
          const hasBlockLatex = /\$\$[\s\S]*?\$\$/.test(normalizedText)
          const hasPairedDollars = /\$[^$]+\$/.test(normalizedText)
          const hasInlineLatex = hasPairedDollars && !hasBlockLatex

          tokens.push({
            type: 'blockquote',
            content: blockquoteText,
            hasInlineLatex: hasInlineLatex,
            hasImages: false
          })
        }
      }
      continue
    }

    // 5. 處理普通段落（可能包含行內 LaTeX）
    // 收集連續的普通行，直到遇到特殊格式
    const paragraphLines = []
    while (i < lines.length) {
      const currentLine = lines[i]

      // 檢查當前行是否在跨行 LaTeX 區塊內
      const isInBlockLatex = blockLatexBlocks.some(block =>
        i >= block.startLine && i <= block.endLine
      )
      if (isInBlockLatex) {
        break // 如果進入跨行 LaTeX 區塊，停止收集段落
      }

      // 遇到特殊格式就停止
      if (
        !currentLine.trim() ||
        currentLine.match(/^\s*\$\$[\s\S]*?\$\$\s*$/) ||
        currentLine.match(/^(#{1,6})\s+/) ||
        currentLine.match(/^([-*+])\s+/) ||
        currentLine.match(/^(\d+)\.\s+/)
      ) {
        break
      }

      paragraphLines.push(currentLine)
      i++
    }

    if (paragraphLines.length > 0) {
      const paragraphText = paragraphLines.join('\n')

      // 檢查是否包含圖片語法 ![alt](path)
      const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
      const images = []
      let match

      while ((match = imageRegex.exec(paragraphText)) !== null) {
        images.push({
          alt: match[1],
          path: match[2],
          fullMatch: match[0],
          index: match.index
        })
      }

      // 如果有圖片，需要拆分段落
      if (images.length > 0) {
        let lastIndex = 0

        images.forEach(img => {
          // 前面的文字
          if (img.index > lastIndex) {
            const textBefore = paragraphText.substring(lastIndex, img.index)
            if (textBefore.trim()) {
              // 檢查是否包含行內 LaTeX
              const normalizedText = textBefore.replace(/\r?\n/g, ' ')
              const hasBlockLatex = /\$\$[\s\S]*?\$\$/.test(normalizedText)
              const hasPairedDollars = /\$[^$]+\$/.test(normalizedText)
              const hasInlineLatex = hasPairedDollars && !hasBlockLatex

              tokens.push({
                type: 'paragraph',
                content: textBefore,
                hasInlineLatex: hasInlineLatex
              })
            }
          }

          // 圖片 token - 提取檔名
          const filename = img.path.split('/').pop().split('\\').pop() // 處理 Windows 和 Unix 路徑
          tokens.push({
            type: 'image',
            alt: img.alt,
            filename: filename,
            originalPath: img.path
          })

          lastIndex = img.index + img.fullMatch.length
        })

        // 剩餘文字
        if (lastIndex < paragraphText.length) {
          const textAfter = paragraphText.substring(lastIndex)
          if (textAfter.trim()) {
            const normalizedText = textAfter.replace(/\r?\n/g, ' ')
            const hasBlockLatex = /\$\$[\s\S]*?\$\$/.test(normalizedText)
            const hasPairedDollars = /\$[^$]+\$/.test(normalizedText)
            const hasInlineLatex = hasPairedDollars && !hasBlockLatex

            tokens.push({
              type: 'paragraph',
              content: textAfter,
              hasInlineLatex: hasInlineLatex
            })
          }
        }
      } else {
        // 沒有圖片，正常處理段落
        // 檢查是否包含行內 LaTeX
        const normalizedText = paragraphText.replace(/\r?\n/g, ' ')
        const hasBlockLatex = /\$\$[\s\S]*?\$\$/.test(normalizedText)
        const hasPairedDollars = /\$[^$]+\$/.test(normalizedText)
        const hasInlineLatex = hasPairedDollars && !hasBlockLatex


        tokens.push({
          type: 'paragraph',
          content: paragraphText,
          hasInlineLatex: hasInlineLatex
        })
      }
    }
  }

  // 如果沒有解析出任何 token，返回一個段落
  if (tokens.length === 0) {
    tokens.push({
      type: 'paragraph',
      content: text
    })
  }

  // 限制最多 100 個區塊
  if (tokens.length > 100) {
    console.warn('貼上內容過多，將限制為前 100 個區塊')
    return tokens.slice(0, 100)
  }


  return tokens
}

/**
 * 解析行內 LaTeX 公式
 * @param {string} text - 包含行內 LaTeX 的文字
 * @returns {Array} 文字片段陣列，每個片段標記是否為 LaTeX
 */
export function parseInlineLatex(text) {
  const parts = []
  // 簡化的正則：匹配 $...$，允許跨行（將換行視為普通字符）
  // 使用 [\s\S] 來匹配包括換行在內的所有字符
  const regex = /\$([^$]+?)\$/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    const matchStart = match.index
    const matchEnd = match.index + match[0].length

    // 檢查前面是否有轉義符號
    if (matchStart > 0 && text[matchStart - 1] === '\\') {
      continue
    }

    // 檢查是否是不完整的區塊 LaTeX ($$...$ 或 $...$$)
    const beforeChar = matchStart > 0 ? text[matchStart - 1] : ''
    const afterChar = matchEnd < text.length ? text[matchEnd] : ''
    if (beforeChar === '$' || afterChar === '$') {
      continue // 跳過區塊級 LaTeX
    }

    // 添加前面的文字
    if (matchStart > lastIndex) {
      const beforeText = text.substring(lastIndex, matchStart)
      if (beforeText) {
        parts.push({
          type: 'text',
          text: beforeText,
          isLatex: false
        })
      }
    }

    // 添加 LaTeX 公式（保留換行符，但將它們視為空格處理）
    const latexContent = match[1].replace(/\r?\n/g, ' ').trim()

    if (latexContent) {
      parts.push({
        type: 'text',
        text: latexContent,
        isLatex: true
      })
    }

    lastIndex = regex.lastIndex
  }

  // 添加剩餘文字
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex)
    if (remainingText) {
      parts.push({
        type: 'text',
        text: remainingText,
        isLatex: false
      })
    }
  }

  // 如果沒有匹配到任何 LaTeX，返回整個文字
  if (parts.length === 0) {
    parts.push({
      type: 'text',
      text,
      isLatex: false
    })
  }

  return parts
}
