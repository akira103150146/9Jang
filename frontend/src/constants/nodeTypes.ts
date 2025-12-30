/**
 * 節點類型常量定義
 * 用於編輯器中的節點圖標和標籤映射
 */

/**
 * 節點類型
 */
export type NodeType =
  | 'questionBlock'
  | 'templateBlock'
  | 'latexBlock'
  | 'diagram2DBlock'
  | 'diagram3DBlock'
  | 'circuitBlock'
  | 'pageBreak'
  | 'heading'
  | 'paragraph'
  | 'bulletList'
  | 'orderedList'
  | 'codeBlock'
  | 'blockquote'

/**
 * 節點類型圖標映射
 */
export const NODE_TYPE_ICONS: Record<NodeType, string> = {
  questionBlock: '❓',
  templateBlock: '📄',
  latexBlock: '𝑓',
  diagram2DBlock: '📊',
  diagram3DBlock: '🎲',
  circuitBlock: '⚡',
  pageBreak: '📄',
  heading: '📝',
  paragraph: '¶',
  bulletList: '•',
  orderedList: '1.',
  codeBlock: '</>',
  blockquote: '"'
}

/**
 * 節點類型標籤映射
 */
export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  questionBlock: '題目區塊',
  templateBlock: '模板區塊',
  latexBlock: 'LaTeX 區塊',
  diagram2DBlock: '2D 圖表',
  diagram3DBlock: '3D 圖表',
  circuitBlock: '電路圖',
  pageBreak: '換頁符',
  heading: '標題',
  paragraph: '段落',
  bulletList: '無序列表',
  orderedList: '有序列表',
  codeBlock: '程式碼',
  blockquote: '引用'
}

/**
 * 獲取節點圖標
 * @param nodeType - 節點類型
 * @returns 節點圖標
 */
export function getNodeIcon(nodeType: NodeType | string): string {
  return NODE_TYPE_ICONS[nodeType as NodeType] || '📝'
}

/**
 * 獲取節點標籤
 * @param nodeType - 節點類型
 * @returns 節點標籤
 */
export function getNodeLabel(nodeType: NodeType | string): string {
  return NODE_TYPE_LABELS[nodeType as NodeType] || nodeType
}
