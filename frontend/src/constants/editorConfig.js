/**
 * 編輯器相關配置常量
 */

// 編輯器容器配置
export const EDITOR_CONFIG = {
  // 編輯器內邊距
  PADDING: '40px',
  // 最小高度
  MIN_HEIGHT: '100vh',
  // 最大寬度
  MAX_WIDTH: '4xl', // Tailwind class: max-w-4xl
}

// 自動保存配置
export const AUTO_SAVE_CONFIG = {
  // 防抖延遲時間（毫秒）
  DEBOUNCE_DELAY: 3000,
}

// 列印配置
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
    WITH_ALL: 'with-all',
  },
}

// 編輯器歷史記錄深度
export const EDITOR_HISTORY_DEPTH = 100

// 節點圖標映射（從 nodeTypes.js 導入，這裡只是作為參考）
export const NODE_ICONS = {
  paragraph: '📝',
  heading: '📌',
  latexBlock: '∫',
  inlineLatex: 'fx',
  image: '🖼️',
  templateBlock: '📄',
  questionBlock: '❓',
  sectionBlock: '📑',
  pageBreak: '📄',
}
