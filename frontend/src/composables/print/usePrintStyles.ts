/**
 * usePrintStyles
 * 處理列印樣式生成邏輯
 */

export interface PrintStylesOptions {
  paperSize?: string
  paperWidth?: string
}

export function usePrintStyles() {
  /**
   * 生成完整的列印樣式 CSS（包含詳細的 KaTeX 樣式）
   */
  const generatePrintStyles = (options: PrintStylesOptions = {}): string => {
    const { paperSize = 'A4', paperWidth = '210mm' } = options

    return `
    /* 基本樣式（用於預覽） */
    body {
      margin: 0;
      padding: 0;
      background: white;
    }
    
    .print-container {
      width: 100%;
      max-width: ${paperWidth};
      margin: 0 auto;
      background: white;
      box-sizing: border-box;
      position: relative;
    }
    
    /* 浮水印容器 */
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: 0.1;
      z-index: -1;
      pointer-events: none;
    }
    
    .watermark img {
      max-width: 300px;
      max-height: 300px;
    }
    
    /* 列印專用樣式 */
    @page {
      size: ${paperSize};
      margin: 0;
    }
    
    @media print {
      /* 移除瀏覽器預設的頁首頁尾 */
      body::before,
      body::after {
        display: none !important;
      }
      
      /* 確保內容區域有適當的內邊距 */
      .print-container {
        padding: 20mm !important;
      }
      
      /* 題目區塊避免分頁 */
      .question-display {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        margin-bottom: 1.5rem !important;
      }
      
      /* 大題標題避免分頁 */
      .section-block {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      
      /* 答案和詳解區域的列印樣式 */
      .print-container .answer-section,
      .print-container .solution-section,
      .answer-section,
      .solution-section {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        background: white !important;
        border: none !important;
        border-left: none !important;
        padding: 0.75rem 0 !important;
        margin-top: 0.75rem !important;
        margin-bottom: 0.5rem !important;
      }
      
      .print-container .answer-label,
      .print-container .solution-label,
      .answer-label,
      .solution-label {
        font-size: 0.875rem !important;
        font-weight: 700 !important;
        color: black !important;
        margin-bottom: 0.5rem !important;
        display: block !important;
      }
      
      .print-container .answer-content,
      .print-container .solution-content,
      .answer-content,
      .solution-content {
        font-size: 0.875rem !important;
        color: black !important;
        line-height: 1.6 !important;
        margin-top: 0.25rem !important;
      }
      
      /* 確保題目內容有適當間距 */
      .print-container .question-text,
      .question-text {
        margin-bottom: 0.5rem !important;
        line-height: 1.6 !important;
        color: black !important;
      }
      
      .print-container .question-content,
      .question-content {
        line-height: 1.6 !important;
        color: black !important;
      }
      
      /* 確保圖片不會太大 */
      .print-container img,
      img {
        max-width: 100% !important;
        height: auto !important;
        page-break-inside: avoid !important;
        display: block !important;
        margin: 0.5rem 0 !important;
      }
      
      /* 全局字體渲染優化 - 必須應用到 body 和所有元素 */
      body,
      .print-container,
      .print-container * {
        -webkit-font-smoothing: antialiased !important;
        -moz-osx-font-smoothing: grayscale !important;
        text-rendering: optimizeLegibility !important;
      }
      
      /* KaTeX 樣式 - 必須與編輯器中的 katex-vscode.css 完全一致 */
      .print-container .katex,
      .katex {
        font-size: 1em !important;
        color: black !important;
        font-family: KaTeX_Main, "Times New Roman", serif !important;
        line-height: normal !important;
        text-indent: 0;
        text-rendering: optimizeLegibility !important;
        display: inline-block !important;
        vertical-align: baseline !important;
        font-weight: normal !important;
        font-style: normal !important;
        -webkit-font-smoothing: antialiased !important;
        -moz-osx-font-smoothing: grayscale !important;
      }
      
      /* 確保 KaTeX 內部所有元素也應用字體渲染優化 */
      .print-container .katex *,
      .katex * {
        -webkit-font-smoothing: antialiased !important;
        -moz-osx-font-smoothing: grayscale !important;
        text-rendering: optimizeLegibility !important;
      }
      
      /* 行內公式樣式（與編輯器一致） */
      .print-container .katex:not(.katex-display),
      .katex:not(.katex-display) {
        display: inline-block !important;
        vertical-align: baseline !important;
        margin: 0 0.1em !important;
      }
      
      /* KaTeX 內部元素的 line-height 必須為 normal（與編輯器一致） */
      .print-container .katex *,
      .katex * {
        color: inherit !important;
        line-height: normal !important;
      }
      
      /* 確保 KaTeX 中的文字為黑色 */
      .print-container .katex .katex-html .base,
      .katex .katex-html .base,
      .print-container .katex .base,
      .katex .base {
        color: black !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      
      /* 確保 KaTeX 內的所有文本節點都可見 */
      .print-container .katex .katex-html,
      .katex .katex-html {
        visibility: visible !important;
        opacity: 1 !important;
      }
      
      /* 確保普通文本內容可見（防止數字消失） */
      .print-container p,
      .print-container span,
      .print-container div,
      .print-container li {
        color: black !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      
      /* 確保所有文本節點都顯示 */
      .print-container * {
        visibility: visible !important;
      }
      
      /* 但保留隱藏的編輯器元素 */
      .print-container [style*="display: none"],
      .print-container [style*="visibility: hidden"] {
        display: none !important;
        visibility: hidden !important;
      }
      
      .print-container .katex-html,
      .katex-html {
        display: inline-block !important;
        overflow: visible !important;
      }
      
      .print-container .katex-mathml,
      .katex-mathml {
        display: none !important;
      }
      
      .print-container .katex svg,
      .katex svg {
        display: inline-block !important;
        vertical-align: baseline !important;
      }
      
      /* KaTeX 分數樣式 - 必須與編輯器中的 katex-vscode.css 完全一致 */
      .print-container .katex .mfrac,
      .katex .mfrac {
        padding-top: 0.158em !important;
        padding-bottom: 0.082em !important;
        position: relative !important;
        display: inline-block !important;
        vertical-align: middle !important;
        color: black !important;
      }
      
      /* 當分數分子包含根號時，增加額外的 padding-top 以避免分數線切到根號 */
      .print-container .katex .mfrac:has(.sqrt),
      .katex .mfrac:has(.sqrt) {
        padding-top: 0.25em !important;
      }
      
      /* 分數線 - 完全使用編輯器中的 katex-vscode.css 設置 */
      .print-container .katex .mfrac > .frac-line,
      .print-container .katex .frac-line,
      .katex .mfrac > .frac-line,
      .katex .frac-line {
        border-bottom-width: 0.04em !important;
        min-height: 0.04em !important;
        margin-top: 0.188em !important;
        margin-bottom: 0.092em !important;
        border-bottom-color: black !important;
        border-bottom-style: solid !important;
        display: inline-block !important;
        width: 100% !important;
        position: relative !important;
        background: transparent !important;
      }
      
      /* 當分數分子包含根號時，增加分數線的 margin-top 以避免切到根號 */
      .print-container .katex .mfrac:has(.sqrt) > .frac-line,
      .katex .mfrac:has(.sqrt) > .frac-line {
        margin-top: 0.25em !important;
      }
      
      /* 根號樣式 - 必須與編輯器中的 katex-vscode.css 完全一致 */
      .print-container .katex .sqrt,
      .katex .sqrt {
        display: inline-block !important;
        position: relative !important;
        overflow: visible !important;
      }
      
      /* 確保根號內的 SVG 正確渲染 */
      .print-container .katex .sqrt svg,
      .katex .sqrt svg {
        display: inline-block !important;
        vertical-align: baseline !important;
        overflow: visible !important;
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        height: 100% !important;
      }
      
      .print-container .katex .sqrt > .vlist-t,
      .katex .sqrt > .vlist-t {
        border-left-width: 0.04em !important;
        border-left-style: solid !important;
        border-left-color: transparent !important;
        display: inline-table !important;
        table-layout: auto !important;
        overflow: visible !important;
        position: relative !important;
      }
      
      .print-container .katex .sqrt .vlist-t .vlist-r .vlist .pstrut,
      .katex .sqrt .vlist-t .vlist-r .vlist .pstrut,
      .print-container .katex .sqrt .vlist-t .vlist-s,
      .katex .sqrt .vlist-t .vlist-s {
        min-width: 0 !important;
      }
      
      .print-container .katex .sqrt .sqrt-sign,
      .katex .sqrt .sqrt-sign {
        position: relative !important;
        overflow: visible !important;
      }
      
      .print-container .katex .sqrt > .root,
      .katex .sqrt > .root {
        margin-left: 0.27777778em !important;
        margin-right: -0.55555556em !important;
        position: relative !important;
      }
      
      /* 下標樣式 */
      .print-container .katex .msub,
      .katex .msub {
        position: relative !important;
        display: inline-block !important;
        margin-right: 0.05em !important;
      }
      
      .print-container .katex .msub .vlist,
      .katex .msub .vlist {
        position: relative !important;
        top: 0.3em !important;
        margin-right: 0.05em !important;
        font-size: 0.75em !important;
        vertical-align: baseline !important;
        line-height: normal !important;
      }
      
      /* 次方（上標）樣式 */
      .print-container .katex .msupsub,
      .katex .msupsub {
        vertical-align: baseline !important;
        display: inline-block !important;
        line-height: normal !important;
        position: relative !important;
      }
      
      .print-container .katex .msupsub .vlist-t,
      .katex .msupsub .vlist-t {
        display: table !important;
        line-height: normal !important;
        border-collapse: separate !important;
        border-spacing: 0 !important;
        margin-top: 0.05em !important;
        margin-bottom: 0.05em !important;
      }
      
      .print-container .katex .msupsub .vlist-r,
      .katex .msupsub .vlist-r {
        display: table-row !important;
        line-height: normal !important;
      }
      
      .print-container .katex .msupsub .sup,
      .katex .msupsub .sup {
        display: inline-block !important;
        vertical-align: baseline !important;
        line-height: normal !important;
        font-size: 0.85em !important;
      }
      
      /* 下標部分（在 msupsub 中） */
      .print-container .katex .msupsub .sub,
      .katex .msupsub .sub {
        display: inline-block !important;
        vertical-align: baseline !important;
        line-height: normal !important;
        font-size: 0.75em !important;
        position: relative !important;
        top: 0.3em !important;
      }
    }
    `
  }

  /**
   * 生成頁面設置樣式
   */
  const generatePageStyles = (paperSize: string = 'A4'): string => {
    return `
    @page {
      size: ${paperSize};
      margin: 0;
    }
    `
  }

  /**
   * 生成避免分頁樣式
   */
  const generateAvoidBreakStyles = (): string => {
    return `
    .question-display,
    .section-block,
    .answer-section,
    .solution-section {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    `
  }

  return {
    generatePrintStyles,
    generatePageStyles,
    generateAvoidBreakStyles,
  }
}
