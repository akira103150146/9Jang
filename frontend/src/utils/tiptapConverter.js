/**
 * Tiptap 格式轉換工具
 */

/**
 * 將內容轉換為 Tiptap 格式
 * 僅支援 Tiptap 格式，簡化處理
 * 
 * @param {Object|Array} structure - 要轉換的結構
 * @returns {Object} Tiptap 格式的文檔對象
 */
export function convertToTiptapFormat(structure) {
  if (!structure || (Array.isArray(structure) && structure.length === 0)) {
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
  
  if (structure.type === 'doc') {
    return structure
  }
  
  // 非法或未知格式時回退
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
