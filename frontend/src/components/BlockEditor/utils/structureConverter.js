/**
 * 結構轉換工具
 * 用於在舊的線性 structure 格式和新的 Tiptap doc 格式之間轉換
 */

/**
 * 將 Tiptap doc 格式轉換為舊的線性 structure 格式
 * @param {Object} doc - Tiptap doc 格式
 * @returns {Array} 舊的 structure 陣列格式
 */
export function tiptapToLegacyStructure(doc) {
  if (!doc || doc.type !== 'doc' || !doc.content) {
    return []
  }

  const result = []

  function traverseNodes(nodes) {
    if (!Array.isArray(nodes)) return

    nodes.forEach(node => {
      if (node.type === 'paragraph') {
        // 提取文字內容
        const text = extractTextFromNode(node)
        if (text.trim() || result.length === 0) {
          result.push({
            id: node.attrs?.id || `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'text',
            content: text
          })
        }
      } else if (node.type === 'questionBlock') {
        result.push({
          id: node.attrs?.id || `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'question',
          question_id: node.attrs?.questionId || null
        })
      } else if (node.type === 'templateBlock') {
        result.push({
          id: node.attrs?.id || `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'template',
          template_id: node.attrs?.templateId || null
        })
      } else if (node.type === 'pageBreak') {
        result.push({
          id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'page_break'
        })
      } else if (node.type === 'heading') {
        // 標題轉換為文字區塊
        const text = extractTextFromNode(node)
        result.push({
          id: node.attrs?.id || `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'text',
          content: '#'.repeat(node.attrs?.level || 1) + ' ' + text
        })
      } else if (node.type === 'bulletList' || node.type === 'orderedList') {
        // 列表轉換為文字區塊
        const text = extractTextFromNode(node)
        result.push({
          id: node.attrs?.id || `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'text',
          content: text
        })
      } else if (node.type === 'blockquote') {
        // 引用轉換為文字區塊
        const text = extractTextFromNode(node)
        result.push({
          id: node.attrs?.id || `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'text',
          content: '> ' + text
        })
      } else if (node.type === 'codeBlock') {
        // 程式碼區塊轉換為文字區塊
        const text = extractTextFromNode(node)
        const language = node.attrs?.language || ''
        result.push({
          id: node.attrs?.id || `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'text',
          content: '```' + language + '\n' + text + '\n```'
        })
      } else if (node.type === 'latexBlock') {
        // LaTeX 區塊轉換為文字區塊（保留公式）
        const formula = node.attrs?.formula || ''
        const displayMode = node.attrs?.displayMode !== false
        result.push({
          id: node.attrs?.id || `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'text',
          content: displayMode ? `$$\n${formula}\n$$` : `$${formula}$`
        })
      } else if (node.content && Array.isArray(node.content)) {
        // 遞迴處理子節點
        traverseNodes(node.content)
      }
    })
  }

  traverseNodes(doc.content)

  return result
}

/**
 * 從節點中提取文字內容
 */
function extractTextFromNode(node) {
  if (!node.content || !Array.isArray(node.content)) {
    return ''
  }

  return node.content
    .map(item => {
      if (item.type === 'text') {
        return item.text || ''
      } else if (item.content) {
        return extractTextFromNode(item)
      }
      return ''
    })
    .join('')
}

/**
 * 將舊的線性 structure 格式轉換為 Tiptap doc 格式
 * @param {Array} structure - 舊的 structure 陣列格式
 * @returns {Object} Tiptap doc 格式
 */
export function legacyToTiptapStructure(structure) {
  if (!Array.isArray(structure) || structure.length === 0) {
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: []
        }
      ]
    }
  }

  const content = structure.map(block => {
    if (block.type === 'text') {
      const textContent = block.content || ''
      return {
        type: 'paragraph',
        content: textContent ? [{ type: 'text', text: textContent }] : []
      }
    } else if (block.type === 'question') {
      return {
        type: 'questionBlock',
        attrs: {
          id: block.id || `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          questionId: block.question_id || null
        },
        content: []
      }
    } else if (block.type === 'template') {
      return {
        type: 'templateBlock',
        attrs: {
          id: block.id || `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          templateId: block.template_id || null
        },
        content: []
      }
    } else if (block.type === 'page_break') {
      return {
        type: 'pageBreak',
        content: []
      }
    }

    // 未知類型轉換為段落
    return {
      type: 'paragraph',
      content: [{ type: 'text', text: `[${block.type}]` }]
    }
  })

  return {
    type: 'doc',
    content: content.length > 0 ? content : [{ type: 'paragraph', content: [] }]
  }
}
