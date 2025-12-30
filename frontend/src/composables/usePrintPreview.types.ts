/**
 * usePrintPreview Composable 類型定義
 * 為 usePrintPreview.js 遷移到 TypeScript 做準備
 *
 * 這個文件定義了 usePrintPreview 的所有類型，包括：
 * - 狀態類型
 * - 函數參數和返回值類型
 * - DOM 元素類型
 * - 內部工具函數類型
 */

import type { Ref } from 'vue'

/**
 * 列印模式枚舉
 */
export type PrintMode = 'question-only' | 'with-answer' | 'with-solution' | 'with-all'

/**
 * 浮水印選項類型
 */
export interface WatermarkOptions {
  watermarkEnabled: Ref<boolean>
  watermarkImage: Ref<string | null>
  watermarkOpacity: Ref<number>
}

/**
 * 列印預覽狀態
 */
export interface PrintPreviewState {
  /** 是否正在準備列印 */
  isPreparingPrint: Ref<boolean>
  /** 列印準備訊息 */
  printPreparationMessage: Ref<string>
}

/**
 * 預渲染快取項
 */
export interface PreRenderedCacheItem {
  html: string
  styles: {
    print?: string
    katex?: string
    katexVscode?: string
    computed?: string
  }
  timestamp: number
}

/**
 * 列印預覽選項
 */
export interface PrintPreviewOptions {
  watermarkEnabled?: Ref<boolean>
  watermarkImage?: Ref<string | null>
  watermarkOpacity?: Ref<number>
}

/**
 * 列印預覽操作
 */
export interface PrintPreviewActions {
  /**
   * 生成列印預覽內容
   * @param iframeDoc - iframe 文檔對象
   * @param iframeWindow - iframe 窗口對象
   * @param triggerPrint - 是否觸發列印
   * @param useCache - 是否使用快取
   */
  generatePrintPreview: (
    iframeDoc: Document,
    iframeWindow: Window,
    triggerPrint?: boolean,
    useCache?: boolean
  ) => Promise<void>

  /**
   * 執行列印
   * @param printModeSelection - 列印模式選擇（可以是 Ref 或普通值）
   */
  print: (printModeSelection?: Ref<PrintMode> | PrintMode) => Promise<void>

  /**
   * 預先渲染列印內容（用於快取）
   * @param printModeSelection - 列印模式選擇（可以是 Ref 或普通值）
   */
  preRenderPrintContent: (printModeSelection?: Ref<PrintMode> | PrintMode) => Promise<void>

  /**
   * 清除預渲染快取
   */
  clearPreRenderCache: () => void
}

/**
 * usePrintPreview 返回類型
 */
export interface UsePrintPreviewReturn extends PrintPreviewState, PrintPreviewActions {}

/**
 * DOM 元素類型定義（用於列印預覽操作）
 */
export interface EditorContainer extends HTMLElement {
  querySelector(selectors: string): HTMLElement | null
  querySelectorAll(selectors: string): NodeListOf<HTMLElement>
  cloneNode(deep?: boolean): EditorContainer
  classList: DOMTokenList
  removeAttribute(name: string): void
  textContent: string | null
}

/**
 * KaTeX 元素類型
 */
export interface KatexElement extends HTMLElement {
  querySelector(selectors: '.sqrt' | '.msupsub' | '.mfrac' | 'svg'): HTMLElement | null
  querySelectorAll(selectors: string): NodeListOf<HTMLElement>
}

/**
 * 根號元素類型
 */
export interface SqrtElement extends HTMLElement {
  querySelector(selectors: '.vlist-t' | '.sqrt-sign' | 'svg' | '.root'): HTMLElement | null
  querySelectorAll(selectors: string): NodeListOf<HTMLElement>
  getBoundingClientRect(): DOMRect
}

/**
 * SVG 元素類型（用於根號的 SVG 路徑）
 */
export interface SqrtSvgElement extends SVGElement {
  getAttribute(name: 'width' | 'height' | 'viewBox'): string | null
  setAttribute(name: string, value: string): void
  getBoundingClientRect(): DOMRect
}

/**
 * 樣式提取結果類型
 */
export interface StyleExtractionResult {
  styleContent: string
  katexVscodeCSSContent: string
}

/**
 * 內部工具函數類型
 */
export interface PrintPreviewInternalHelpers {
  /**
   * 獲取編輯器容器
   */
  getEditorContainer: () => EditorContainer | null

  /**
   * 檢查編輯器是否有內容
   */
  hasEditorContent: (editorContainer: EditorContainer | null) => boolean

  /**
   * 移除 scoped 樣式屬性
   */
  removeScopedAttributes: (element: HTMLElement) => void

  /**
   * 應用列印樣式到區域
   */
  applyPrintStylesToSection: (section: HTMLElement) => void

  /**
   * 應用列印樣式到標籤
   */
  applyPrintStylesToLabel: (label: HTMLElement) => void

  /**
   * 應用列印樣式到內容
   */
  applyPrintStylesToContent: (content: HTMLElement) => void

  /**
   * 準備克隆內容用於列印
   */
  prepareCloneForPrint: (clone: EditorContainer) => void

  /**
   * 修復 KaTeX 元素
   */
  repairKatexElements: (editorContainer: EditorContainer, clone: EditorContainer) => number

  /**
   * 在 iframe 中重建複雜 KaTeX 元素
   */
  rebuildComplexKatexElementsInIframe: (
    editorContainer: EditorContainer,
    iframeDoc: Document,
    iframeWindow: Window
  ) => number

  /**
   * 提取計算樣式從編輯器
   */
  extractComputedStylesFromEditor: (editorContainer: EditorContainer) => string

  /**
   * 複製樣式表到 iframe
   */
  copyStylesheets: (iframeDoc: Document) => StyleExtractionResult

  /**
   * 生成列印樣式 CSS
   */
  generatePrintStyles: (paperSize?: string, paperWidth?: string) => string

  /**
   * 添加浮水印
   */
  addWatermark: (iframeDoc: Document) => void

  /**
   * 清理現有的 iframe
   */
  cleanupExistingFrames: () => void

  /**
   * 檢查 KaTeX 是否已載入
   */
  checkKatexLoaded: (iframeDoc: Document, iframeWindow: Window) => Promise<boolean>
}
