/**
 * useTiptapParser
 * 處理 Tiptap JSON 的複雜解析和轉換邏輯
 * 包括 LaTeX、圖片、換行符號等的處理
 */

import { extractTextFromTiptapJSON } from '../useTiptapConverter'

/**
 * 解析換行符號：將文字中的 `\\` 轉換為 hardBreak 節點
 */
function parseLineBreaks(text: string): Array<{ type: string; text?: string }> {
  if (!text) return []

  // 檢查文字中是否包含 LaTeX 公式（有 $ 符號）
  const hasLatex = text.includes('$')

  // 如果包含 LaTeX，不處理換行符號，避免誤判 LaTeX 命令中的反斜線
  if (hasLatex) {
    return [{ type: 'text', text }]
  }

  const parts: Array<{ type: string; text?: string }> = []
  let lastIndex = 0
  // 匹配行尾的 `\\`（兩個反斜線）作為換行符號
  const lineBreakRegex = /\\\\\s*$/gm
  const lineBreakPositions: Array<{ start: number; end: number }> = []
  let match: RegExpExecArray | null

  // 找出所有換行符號的位置
  while ((match = lineBreakRegex.exec(text)) !== null) {
    lineBreakPositions.push({
      start: match.index,
      end: match.index + match[0].length
    })
  }

  // 構建節點陣列
  for (const lbMatch of lineBreakPositions) {
    // 添加換行符號前的文字
    if (lbMatch.start > lastIndex) {
      const beforeText = text.substring(lastIndex, lbMatch.start)
      if (beforeText) {
        parts.push({ type: 'text', text: beforeText })
      }
    }

    // 添加 hardBreak 節點
    parts.push({ type: 'hardBreak' })

    lastIndex = lbMatch.end
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
 * 將文字中的 LaTeX 轉換為節點陣列（不處理換行符號）
 */
function parseLatexInTextOnly(text: string): Array<any> {
  if (!text) return []

  const parts: Array<any> = []
  let lastIndex = 0

  // 先處理區塊 LaTeX ($$...$$)
  const blockLatexRegex = /\$\$([\s\S]*?)\$\$/g
  let match: RegExpExecArray | null
  const blockMatches: Array<{ start: number; end: number; latex: string }> = []

  while ((match = blockLatexRegex.exec(text)) !== null) {
    blockMatches.push({
      start: match.index,
      end: match.index + match[0].length,
      latex: match[1].trim()
    })
  }

  // 再處理行內 LaTeX ($...$)，但要排除已經在區塊 LaTeX 中的
  const inlineLatexRegex = /\$([^$\n]+?)\$/g
  const inlineMatches: Array<{ start: number; end: number; latex: string }> = []

  while ((match = inlineLatexRegex.exec(text)) !== null) {
    const start = match.index
    const end = match.index + match[0].length

    // 檢查是否在區塊 LaTeX 內
    const inBlock = blockMatches.some(block => start >= block.start && end <= block.end)
    if (!inBlock) {
      inlineMatches.push({
        start,
        end,
        latex: match[1].trim()
      })
    }
  }

  // 合併所有匹配（區塊和行內）
  const allMatches = [
    ...blockMatches.map(m => ({ ...m, isBlock: true })),
    ...inlineMatches.map(m => ({ ...m, isBlock: false }))
  ].sort((a, b) => a.start - b.start)

  // 構建節點陣列
  for (const matchItem of allMatches) {
    // 添加匹配前的文字
    if (matchItem.start > lastIndex) {
      const beforeText = text.substring(lastIndex, matchItem.start)
      if (beforeText) {
        parts.push({ type: 'text', text: beforeText })
      }
    }

    // 添加 LaTeX 節點
    if (matchItem.isBlock) {
      parts.push({
        type: 'latexBlock',
        attrs: {
          id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          formula: matchItem.latex,
          displayMode: true
        }
      })
    } else {
      parts.push({
        type: 'inlineLatex',
        attrs: {
          formula: matchItem.latex
        }
      })
    }

    lastIndex = matchItem.end
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
 * 將文字中的 LaTeX 和換行符號轉換為節點陣列
 */
function parseLatexInText(text: string): Array<any> {
  if (!text) return []

  // 先處理換行符號，將文字分割成多個部分
  const lineBreakParts = parseLineBreaks(text)
  const parts: Array<any> = []

  // 對每個部分處理 LaTeX
  for (const part of lineBreakParts) {
    if (part.type === 'hardBreak') {
      // 直接添加 hardBreak
      parts.push(part)
      continue
    }

    if (part.type === 'text' && part.text) {
      // 處理這個文字部分的 LaTeX
      const latexParsed = parseLatexInTextOnly(part.text)
      parts.push(...latexParsed)
    }
  }

  return parts.length > 0 ? parts : [{ type: 'text', text }]
}

/**
 * 處理圖片連結：將 Markdown 格式的圖片連結轉換為圖片節點
 */
function parseImageInText(text: string): Array<any> {
  if (!text) return []

  // 先處理換行符號，將文字分割成多個部分
  const lineBreakParts = parseLineBreaks(text)
  const parts: Array<any> = []

  // 對每個部分處理圖片
  for (const part of lineBreakParts) {
    if (part.type === 'hardBreak') {
      // 直接添加 hardBreak
      parts.push(part)
      continue
    }

    if (part.type === 'text' && part.text) {
      const textContent = part.text
      const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
      let lastIndex = 0
      let match: RegExpExecArray | null
      const imageMatches: Array<{ start: number; end: number; alt: string; src: string }> = []

      while ((match = imageRegex.exec(textContent)) !== null) {
        imageMatches.push({
          start: match.index,
          end: match.index + match[0].length,
          alt: match[1] || '',
          src: match[2]
        })
      }

      for (const imgMatch of imageMatches) {
        // 添加圖片前的文字（需要處理 LaTeX）
        if (imgMatch.start > lastIndex) {
          const beforeText = textContent.substring(lastIndex, imgMatch.start)
          if (beforeText) {
            const latexParsed = parseLatexInTextOnly(beforeText)
            parts.push(...latexParsed)
          }
        }

        // 添加圖片節點
        parts.push({
          type: 'image',
          attrs: {
            src: imgMatch.src,
            alt: imgMatch.alt,
            title: imgMatch.alt
          }
        })

        lastIndex = imgMatch.end
      }

      // 添加剩餘文字（需要處理 LaTeX）
      if (lastIndex < textContent.length) {
        const remainingText = textContent.substring(lastIndex)
        if (remainingText) {
          const latexParsed = parseLatexInTextOnly(remainingText)
          parts.push(...latexParsed)
        }
      }
    }
  }

  return parts.length > 0 ? parts : [{ type: 'text', text }]
}

/**
 * 處理段落節點（不遞迴，避免循環）
 */
function processParagraphNode(node: any): any {
  if (node.type !== 'paragraph' || !node.content || !Array.isArray(node.content)) {
    return node
  }

  const processedContent: Array<any> = []
  for (const child of node.content) {
    if (child.type === 'text' && child.text) {
      // 先處理圖片，再處理 LaTeX
      const imageParsed = parseImageInText(child.text)
      if (imageParsed.length === 1 && imageParsed[0].type === 'text') {
        const latexParsed = parseLatexInText(child.text)
        processedContent.push(...latexParsed)
      } else {
        // 有圖片，需要對每個文字節點處理 LaTeX
        for (const part of imageParsed) {
          if (part.type === 'text') {
            const latexParsed = parseLatexInText(part.text)
            processedContent.push(...latexParsed)
          } else {
            processedContent.push(part)
          }
        }
      }
    } else {
      processedContent.push(child)
    }
  }

  // 特殊處理：如果段落只包含一個 latexBlock，直接返回 latexBlock
  if (processedContent.length === 1 && processedContent[0].type === 'latexBlock') {
    return processedContent[0]
  }

  return {
    ...node,
    content: processedContent
  }
}

/**
 * 處理跨段落的 LaTeX 區塊：在 doc 層級合併跨段落的 $$...$$
 */
function mergeCrossParagraphLatex(content: Array<any>): Array<any> {
  if (!Array.isArray(content)) return content

  const merged: Array<any> = []
  let i = 0

  while (i < content.length) {
    const node = content[i]

    // 如果是段落，檢查是否包含 LaTeX 區塊的開始或結束
    if (node.type === 'paragraph' && node.content && Array.isArray(node.content)) {
      // 提取段落中的所有文字
      const paragraphText = node.content
        .filter((c: any) => c.type === 'text' && c.text)
        .map((c: any) => c.text)
        .join('')

      // 檢查是否包含 $$ 開始或結束
      const hasStartDollar = paragraphText.includes('$$')
      const hasEndDollar = paragraphText.endsWith('$$')

      if (hasStartDollar && !hasEndDollar) {
        // 這是 LaTeX 區塊的開始，需要合併後續段落直到找到 $$
        let latexText = paragraphText
        let j = i + 1
        let foundEnd = false

        // 收集 LaTeX 區塊開始前的文字
        const beforeLatex = paragraphText.substring(0, paragraphText.indexOf('$$'))

        // 收集 LaTeX 內容（從 $$ 開始）
        latexText = paragraphText.substring(paragraphText.indexOf('$$') + 2)

        // 繼續查找後續段落
        while (j < content.length && !foundEnd) {
          const nextNode = content[j]
          if (nextNode.type === 'paragraph' && nextNode.content && Array.isArray(nextNode.content)) {
            const nextText = nextNode.content
              .filter((c: any) => c.type === 'text' && c.text)
              .map((c: any) => c.text)
              .join('')

            if (nextText.includes('$$')) {
              // 找到結束
              const endIndex = nextText.indexOf('$$')
              latexText += nextText.substring(0, endIndex)
              const afterLatex = nextText.substring(endIndex + 2)
              foundEnd = true

              // 創建 LaTeX 區塊
              const latexBlock = {
                type: 'latexBlock',
                attrs: {
                  id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  formula: latexText.trim(),
                  displayMode: true
                }
              }

              // 添加開始前的文字段落（需要處理圖片和 LaTeX）
              if (beforeLatex.trim()) {
                const beforeParts = parseImageInText(beforeLatex)
                const beforeContent: Array<any> = []
                for (const part of beforeParts) {
                  if (part.type === 'text') {
                    const latexParsed = parseLatexInText(part.text)
                    beforeContent.push(...latexParsed)
                  } else {
                    beforeContent.push(part)
                  }
                }
                merged.push({
                  type: 'paragraph',
                  content: beforeContent
                })
              }

              // 添加 LaTeX 區塊
              merged.push(latexBlock)

              // 添加結束後的文字段落（需要處理圖片和 LaTeX）
              if (afterLatex.trim()) {
                const afterParts = parseImageInText(afterLatex)
                const afterContent: Array<any> = []
                for (const part of afterParts) {
                  if (part.type === 'text') {
                    const latexParsed = parseLatexInText(part.text)
                    afterContent.push(...latexParsed)
                  } else {
                    afterContent.push(part)
                  }
                }
                merged.push({
                  type: 'paragraph',
                  content: afterContent
                })
              }

              i = j + 1
              continue
            } else {
              // 繼續收集 LaTeX 內容
              latexText += nextText
              j++
            }
          } else {
            j++
          }
        }

        if (!foundEnd) {
          // 沒有找到結束，當作普通段落處理
          const processedNode = processParagraphNode(node)
          merged.push(processedNode)
          i++
        }
      } else {
        // 普通段落，正常處理
        const processedNode = processParagraphNode(node)
        merged.push(processedNode)
        i++
      }
    } else {
      // 非段落節點，正常處理
      merged.push(node)
      i++
    }
  }

  return merged
}

/**
 * 將 Tiptap JSON 中的 LaTeX 文字轉換為 LaTeX 節點
 */
function convertLatexInTiptapJSON(node: any): any {
  if (!node || typeof node !== 'object') return node

  // 如果已經是 LaTeX 節點，確保屬性名稱正確
  if (node.type === 'latexBlock') {
    // 如果使用舊的屬性名稱，轉換為新的
    if (node.attrs && node.attrs.latex !== undefined && node.attrs.formula === undefined) {
      return {
        ...node,
        attrs: {
          ...node.attrs,
          formula: node.attrs.latex,
          id: node.attrs.id || `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          displayMode: node.attrs.displayMode !== undefined ? node.attrs.displayMode : true
        }
      }
    }
    return node
  }

  if (node.type === 'inlineLatex') {
    // 如果使用舊的屬性名稱，轉換為新的
    if (node.attrs && node.attrs.latex !== undefined && node.attrs.formula === undefined) {
      return {
        ...node,
        attrs: {
          ...node.attrs,
          formula: node.attrs.latex
        }
      }
    }
    return node
  }

  // 如果是 doc 節點，先處理跨段落的 LaTeX
  if (node.type === 'doc' && node.content && Array.isArray(node.content)) {
    const mergedContent = mergeCrossParagraphLatex(node.content)
    return {
      ...node,
      content: mergedContent
    }
  }

  // 如果是文字節點，先處理圖片，再處理 LaTeX
  if (node.type === 'text' && node.text) {
    // 先處理圖片連結
    const imageParsed = parseImageInText(node.text)
    // 如果沒有圖片，直接處理 LaTeX
    if (imageParsed.length === 1 && imageParsed[0].type === 'text') {
      const latexParsed = parseLatexInText(node.text)
      // 如果只有一個節點且是文字，直接返回
      if (latexParsed.length === 1 && latexParsed[0].type === 'text') {
        return node
      }
      // 否則返回解析後的節點陣列
      return latexParsed
    } else {
      // 有圖片，需要對每個文字節點處理 LaTeX
      const finalParts: Array<any> = []
      for (const part of imageParsed) {
        if (part.type === 'text') {
          const latexParsed = parseLatexInText(part.text)
          finalParts.push(...latexParsed)
        } else {
          finalParts.push(part)
        }
      }
      return finalParts
    }
  }

  // 如果是段落節點，使用 processParagraphNode 處理
  if (node.type === 'paragraph') {
    return processParagraphNode(node)
  }

  // 如果有子節點，遞迴處理
  if (node.content && Array.isArray(node.content)) {
    const processedContent: Array<any> = []
    for (const child of node.content) {
      const processed = convertLatexInTiptapJSON(child)
      if (Array.isArray(processed)) {
        // 如果返回陣列，展開它
        processedContent.push(...processed)
      } else if (processed) {
        processedContent.push(processed)
      }
    }
    return {
      ...node,
      content: processedContent
    }
  }

  return node
}

/**
 * 確保 Tiptap 格式正確
 */
export function ensureTiptapFormat(data: any): any {
  // 處理空值或空物件
  if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
    return { type: 'doc', content: [] }
  }
  // 如果已經是正確的 Tiptap 格式
  if (typeof data === 'object' && data.type === 'doc') {
    // 轉換其中的 LaTeX 文字為 LaTeX 節點
    const converted = convertLatexInTiptapJSON(data)
    // 確保返回的是正確的 doc 結構
    if (converted && converted.type === 'doc') {
      return converted
    } else {
      // 如果轉換後不是 doc，包裝成 doc
      return { type: 'doc', content: Array.isArray(converted) ? converted : (converted ? [converted] : []) }
    }
  }
  // 其他情況返回空 doc（理論上不應該發生，因為後端會自動轉換）
  return { type: 'doc', content: [] }
}

/**
 * Tiptap 解析器 Composable
 */
export function useTiptapParser() {
  return {
    extractTextFromTiptapJSON,
    parseLineBreaks,
    parseLatexInTextOnly,
    parseLatexInText,
    parseImageInText,
    processParagraphNode,
    mergeCrossParagraphLatex,
    convertLatexInTiptapJSON,
    ensureTiptapFormat
  }
}
