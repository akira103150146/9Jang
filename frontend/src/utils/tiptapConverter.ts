/**
 * Tiptap 格式轉換工具
 */

import type { TiptapDocument } from '@9jang/shared'

/**
 * 將內容轉換為 Tiptap 格式
 * 僅支援 Tiptap 格式，簡化處理
 *
 * @param structure - 要轉換的結構
 * @returns Tiptap 格式的文檔對象
 */
export function convertToTiptapFormat(structure: unknown): TiptapDocument {
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

  // 檢查是否已經是 Tiptap 格式
  if (
    typeof structure === 'object' &&
    structure !== null &&
    'type' in structure &&
    structure.type === 'doc'
  ) {
    return structure as TiptapDocument
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
