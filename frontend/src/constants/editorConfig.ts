/**
 * 編輯器配置常量
 */

/**
 * 編輯器默認配置
 */
export interface EditorConfig {
  placeholder?: string
  editable?: boolean
  autofocus?: boolean
}

/**
 * 編輯器容器配置
 */
export const EDITOR_CONFIG = {
  // 編輯器內邊距
  PADDING: '40px',
  // 最小高度
  MIN_HEIGHT: '100vh',
  // 最大寬度
  MAX_WIDTH: '4xl' // Tailwind class: max-w-4xl
} as const

/**
 * 自動保存配置
 */
export const AUTO_SAVE_CONFIG = {
  // 防抖延遲時間（毫秒）
  DEBOUNCE_DELAY: 3000
} as const

/**
 * 列印配置
 */
export const PRINT_CONFIG = {
  // 頁面大小
  PAGE_SIZE: 'A4',
  // 頁面邊距（毫米）
  PAGE_MARGIN: '20mm',
  // 列印模式選項
  MODES: {
    QUESTION_ONLY: 'question-only',
    WITH_ANSWER: 'with-answer',
    WITH_SOLUTION: 'with-solution',
    WITH_ALL: 'with-all'
  }
} as const

/**
 * 編輯器歷史記錄深度
 */
export const EDITOR_HISTORY_DEPTH = 100

/**
 * 節點圖標映射
 */
export const NODE_ICONS: Record<string, string> = {
  paragraph: '📝',
  heading: '📌',
  latexBlock: '∫',
  inlineLatex: 'fx',
  image: '🖼️',
  templateBlock: '📄',
  questionBlock: '❓',
  sectionBlock: '📑',
  pageBreak: '📄'
}

/**
 * 默認編輯器配置
 */
export const DEFAULT_EDITOR_CONFIG: EditorConfig = {
  placeholder: '開始輸入...',
  editable: true,
  autofocus: false
}

/**
 * 編輯器樣式配置
 */
export interface EditorStyleConfig {
  fontSize?: string
  lineHeight?: string
  fontFamily?: string
}

/**
 * 默認編輯器樣式配置
 */
export const DEFAULT_EDITOR_STYLE: EditorStyleConfig = {
  fontSize: '16px',
  lineHeight: '1.6',
  fontFamily: 'inherit'
}
