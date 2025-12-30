/**
 * 列印預覽功能 Composable
 * 處理列印預覽的生成、DOM 克隆、樣式處理等邏輯
 */

import { ref, nextTick, type Ref } from 'vue'
import { debounce } from '../utils/debounce'
import { usePrintDOMCloning } from './usePrintDOMCloning'
import { usePrintStyleExtraction } from './usePrintStyleExtraction'
import { usePrintKatexRepair } from './usePrintKatexRepair'
import type {
  PrintMode,
  WatermarkOptions,
  PrintPreviewOptions,
  PrintPreviewState,
  PrintPreviewActions,
  UsePrintPreviewReturn,
  EditorContainer,
  PreRenderedCacheItem
} from './usePrintPreview.types'

/**
 * 列印預覽 Composable
 */
export function usePrintPreview(options: PrintPreviewOptions = {}): UsePrintPreviewReturn {
  const {
    watermarkEnabled = ref(false),
    watermarkImage = ref<string | null>(null),
    watermarkOpacity = ref(10)
  } = options

  // 列印準備狀態
  const isPreparingPrint: Ref<boolean> = ref(false)
  const printPreparationMessage: Ref<string> = ref('正在準備列印內容...')

  // 用於取消正在進行的列印
  let currentPrintAbortController: AbortController | null = null
  let currentPrintMode: PrintMode | null = null

  // 預渲染快取：儲存不同模式的預渲染內容
  const preRenderedCache = new Map<string, PreRenderedCacheItem>()

  // 重用已遷移的 composables
  const { cloneEditorContent } = usePrintDOMCloning()
  const { extractComputedStylesFromEditor, applyPrintStylesToSection, applyPrintStylesToLabel, applyPrintStylesToContent } =
    usePrintStyleExtraction()
  const { rebuildComplexKatexElementsInIframe } = usePrintKatexRepair()

  /**
   * 生成快取鍵
   */
  const cacheKey = (mode: PrintMode): string => {
    return `print-preview-${mode}`
  }

  /**
   * 生成列印樣式 CSS
   */
  const generatePrintStyles = (paperSize = 'A4', paperWidth = '210mm'): string => {
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
      
      /* KaTeX 樣式 - 必須與編輯器中的 katex-vscode.css 完全一致 */
      .print-container .katex,
      .katex {
        font-size: 1em !important;
        color: black !important;
        font-family: KaTeX_Main, "Times New Roman", serif !important;
        line-height: normal !important;
        text-indent: 0;
        text-rendering: auto;
        display: inline-block !important;
        vertical-align: baseline !important;
        font-weight: normal !important;
        font-style: normal !important;
        -webkit-font-smoothing: antialiased !important;
        -moz-osx-font-smoothing: grayscale !important;
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
      
      /* 根號樣式 - 必須與編輯器中的 katex-vscode.css 完全一致 */
      .print-container .katex .sqrt,
      .katex .sqrt {
        display: inline-block !important;
        position: relative !important;
        overflow: visible !important;
      }
      
      .print-container .katex .sqrt > .vlist-t,
      .katex .sqrt > .vlist-t {
        border-left-width: 0.04em !important;
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
      }
      
      .print-container .katex .sqrt > .root,
      .katex .sqrt > .root {
        margin-left: 0.27777778em !important;
        margin-right: -0.55555556em !important;
        position: relative !important;
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
      }
    }
    `
  }

  /**
   * 複製樣式表到 iframe
   */
  const copyStylesheets = (iframeDoc: Document): { styleContent: string; katexVscodeCSSContent: string } => {
    const stylesheets = Array.from(document.styleSheets)
    let styleContent = ''

    // 首先確保 KaTeX CSS 被載入（必須在最前面）
    const katexCSSLink = iframeDoc.createElement('link')
    katexCSSLink.rel = 'stylesheet'
    katexCSSLink.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css'
    katexCSSLink.crossOrigin = 'anonymous'
    iframeDoc.head.insertBefore(katexCSSLink, iframeDoc.head.firstChild)

    // 硬編碼 katex-vscode.css 內容
    let katexVscodeCSSContent = `
/* KaTeX 樣式 - 匹配 VSCode Markdown 預覽 */
.katex {
  font-size: 1em;
  color: inherit;
  font-family: KaTeX_Main, "Times New Roman", serif;
  line-height: normal !important;
  text-indent: 0;
  text-rendering: auto;
}

.katex:not(.katex-display) {
  display: inline-block;
  vertical-align: baseline;
  margin: 0 0.1em;
}

.katex-display {
  display: block;
  margin: 1em 0;
  text-align: center;
  overflow-x: auto;
  overflow-y: hidden;
}

.katex-display>.katex {
  display: inline-block;
  text-align: initial;
  margin: 0;
}

/* 分數線樣式 - VSCode 默認樣式 */
.katex .mfrac > .frac-line,
.katex-display .mfrac > .frac-line,
.katex:not(.katex-display) .mfrac > .frac-line,
.katex .frac-line,
.katex-display .frac-line,
.katex:not(.katex-display) .frac-line {
  border-bottom-width: 0.04em !important;
  min-height: 0.04em !important;
  margin-top: 0.188em !important;
  margin-bottom: 0.092em !important;
}

/* 分數容器 - 調整 padding 以平衡空間 */
.katex .mfrac,
.katex-display .mfrac,
.katex:not(.katex-display) .mfrac {
  padding-top: 0.158em !important;
  padding-bottom: 0.082em !important;
}

/* 根號樣式 */
.katex .sqrt {
  font-size: 1em;
}

.katex .sqrt > .vlist-t {
  border-left-width: 0.04em !important;
  display: inline-table !important;
  table-layout: auto !important;
}

.katex .sqrt .vlist-t .vlist-r .vlist .pstrut,
.katex .sqrt .vlist-t .vlist-s {
  min-width: 0 !important;
}

.katex .sqrt .sqrt-sign {
  position: relative !important;
}

.katex .sqrt > .root {
  margin-left: 0.27777778em !important;
  margin-right: -0.55555556em !important;
}

/* 確保 KaTeX 內部元素的 line-height 正確 */
.katex * {
  color: inherit;
  line-height: normal !important;
}

.katex .vlist-t {
  line-height: normal !important;
}

.katex .vlist-r {
  line-height: normal !important;
}

.katex table {
  border-collapse: separate !important;
  border-spacing: 0;
}

.katex {
  color: #000000;
}
`

    // 複製其他樣式表
    for (const sheet of stylesheets) {
      try {
        // 檢查是否可以訪問 cssRules（避免 SecurityError）
        let canAccessRules = false
        try {
          if (sheet.cssRules) {
            void sheet.cssRules.length
            canAccessRules = true
          }
        } catch (e) {
          canAccessRules = false
        }

        if (sheet.href) {
          // 檢查是否是 katex-vscode.css，嘗試提取其規則
          if (sheet.href.includes('katex-vscode.css') && canAccessRules) {
            try {
              const rules = Array.from(sheet.cssRules || [])
              for (const rule of rules) {
                katexVscodeCSSContent += rule.cssText + '\n'
              }
            } catch (e) {
              // 跳過，使用硬編碼的 katex-vscode.css
            }
          } else {
            // 對於其他外部樣式表，直接添加 link
            const link = iframeDoc.createElement('link')
            link.rel = 'stylesheet'
            link.href = sheet.href
            iframeDoc.head.appendChild(link)
          }
        } else if (canAccessRules) {
          // 內聯樣式表，且可以訪問規則
          try {
            const rules = Array.from(sheet.cssRules || [])
            for (const rule of rules) {
              styleContent += rule.cssText + '\n'
            }
          } catch (e) {
            // 無法訪問規則，跳過
          }
        }
      } catch (e) {
        console.warn('無法複製樣式表:', sheet.href || 'inline', e instanceof Error ? e.message : String(e))
      }
    }

    return { styleContent, katexVscodeCSSContent }
  }

  /**
   * 添加浮水印到 iframe
   */
  const addWatermark = (iframeDoc: Document): void => {
    // 先移除可能存在的舊浮水印，避免重複
    const existingWatermark = iframeDoc.querySelector('.watermark')
    if (existingWatermark) {
      existingWatermark.remove()
    }

    if (watermarkEnabled.value && watermarkImage.value) {
      const watermark = iframeDoc.createElement('div')
      watermark.className = 'watermark'
      watermark.style.position = 'fixed'
      watermark.style.top = '50%'
      watermark.style.left = '50%'
      watermark.style.transform = 'translate(-50%, -50%)'
      watermark.style.opacity = String(watermarkOpacity.value / 100)
      watermark.style.zIndex = '-1'
      watermark.style.pointerEvents = 'none'

      const img = iframeDoc.createElement('img')
      img.src = watermarkImage.value
      img.alt = '浮水印'
      img.style.maxWidth = '300px'
      img.style.maxHeight = '300px'

      watermark.appendChild(img)
      iframeDoc.body.appendChild(watermark)
    }
  }

  /**
   * 獲取編輯器容器
   */
  const getEditorContainer = (): EditorContainer | null => {
    return (
      (document.querySelector('.continuous-editor') as EditorContainer | null) ||
      (document.querySelector('.block-editor-container') as EditorContainer | null) ||
      (document.querySelector('.ProseMirror') as EditorContainer | null)
    )
  }

  /**
   * 檢查編輯器是否有內容
   */
  const hasEditorContent = (editorContainer: EditorContainer | null): boolean => {
    if (!editorContainer) return false
    const hasText = editorContainer.textContent?.trim().length || 0 > 0
    const hasProseMirror = editorContainer.querySelector('.ProseMirror')
    return hasText || !!hasProseMirror
  }

  /**
   * 生成列印預覽
   */
  const generatePrintPreview = async (
    iframeDoc: Document,
    iframeWindow: Window,
    triggerPrint = false,
    paperSize = 'A4',
    paperWidth = '210mm'
  ): Promise<HTMLElement | null> => {
    const editorContainer = getEditorContainer()
    if (!editorContainer || !hasEditorContent(editorContainer)) {
      return null
    }

    // 複製樣式表
    const { styleContent, katexVscodeCSSContent } = copyStylesheets(iframeDoc)

    // 生成列印 CSS（用於 @media print）
    const printCSSContent = ''

    // 添加內聯樣式
    // 注意：順序很重要 - 先添加列印專用樣式（低優先級），然後添加其他樣式，最後添加 katex-vscode.css（最高優先級）
    const printStyleEl = iframeDoc.createElement('style')
    printStyleEl.textContent = printCSSContent + generatePrintStyles(paperSize, paperWidth)
    printStyleEl.id = 'print-styles'
    iframeDoc.head.appendChild(printStyleEl)

    // 添加其他樣式（不包括 katex-vscode.css）
    if (styleContent && !katexVscodeCSSContent) {
      const otherStyleEl = iframeDoc.createElement('style')
      otherStyleEl.textContent = styleContent
      otherStyleEl.id = 'other-styles'
      iframeDoc.head.appendChild(otherStyleEl)
    }

    // 最後添加 katex-vscode.css（確保分數線和根號樣式正確）
    if (katexVscodeCSSContent) {
      const katexStyleEl = iframeDoc.createElement('style')
      katexStyleEl.textContent = katexVscodeCSSContent
      katexStyleEl.id = 'katex-vscode-styles'
      iframeDoc.head.appendChild(katexStyleEl)
    } else if (styleContent) {
      // 如果沒有單獨的 katex-vscode.css，使用完整的 styleContent
      const katexStyleEl = iframeDoc.createElement('style')
      katexStyleEl.textContent = styleContent
      katexStyleEl.id = 'katex-styles'
      iframeDoc.head.appendChild(katexStyleEl)
    }

    // 【樣式沙盒】從編輯器實際 DOM 提取計算後的樣式（最高優先級）
    const editorComputedStyles = extractComputedStylesFromEditor(editorContainer)
    if (editorComputedStyles) {
      const sandboxStyleEl = iframeDoc.createElement('style')
      sandboxStyleEl.textContent = editorComputedStyles
      sandboxStyleEl.id = 'editor-computed-styles'
      // 添加到最後，確保最高優先級，覆蓋所有之前的樣式
      iframeDoc.head.appendChild(sandboxStyleEl)
    }

    // 複製編輯器內容
    const container = iframeDoc.createElement('div')
    container.className = 'print-container'
    container.style.background = 'white'

    // 使用深層克隆，確保所有 KaTeX 元素都被正確複製
    // 先等待 KaTeX 完全渲染完成
    await new Promise<void>((resolve) => {
      // 檢查所有 KaTeX 元素是否已完全渲染
      const katexElements = editorContainer.querySelectorAll('.katex')
      if (katexElements.length === 0) {
        resolve()
        return
      }

      let allRendered = true
      katexElements.forEach((el) => {
        // 檢查 KaTeX 元素是否有完整的 HTML 結構
        const hasHtml = el.querySelector('.katex-html')
        if (!hasHtml || (hasHtml as HTMLElement).innerHTML.trim().length === 0) {
          allRendered = false
        }
      })

      if (allRendered) {
        resolve()
      } else {
        // 等待一下再檢查
        setTimeout(() => {
          resolve()
        }, 100)
      }
    })

    // 克隆編輯器內容
    const clone = await cloneEditorContent(editorContainer)
    if (!clone) {
      return null
    }

    container.appendChild(clone)

    // 在 iframe 中查找並應用樣式（只應用一次，避免重複）
    await nextTick()

    // 【新架構】在 iframe 中直接重建根號和次方元素
    rebuildComplexKatexElementsInIframe(editorContainer, iframeDoc, iframeWindow)

    // 等待重建完成
    await nextTick()

    // 在 iframe 中查找所有答案和詳解區域，強制應用內聯樣式
    const iframeAnswerSections = iframeDoc.querySelectorAll('.answer-section')
    const iframeSolutionSections = iframeDoc.querySelectorAll('.solution-section')

    iframeAnswerSections.forEach((section) => applyPrintStylesToSection(section as HTMLElement))
    iframeSolutionSections.forEach((section) => applyPrintStylesToSection(section as HTMLElement))

    // 同樣處理標籤和內容
    const iframeAnswerLabels = iframeDoc.querySelectorAll('.answer-label')
    const iframeSolutionLabels = iframeDoc.querySelectorAll('.solution-label')
    const iframeAnswerContents = iframeDoc.querySelectorAll('.answer-content')
    const iframeSolutionContents = iframeDoc.querySelectorAll('.solution-content')

    iframeAnswerLabels.forEach((label) => applyPrintStylesToLabel(label as HTMLElement))
    iframeSolutionLabels.forEach((label) => applyPrintStylesToLabel(label as HTMLElement))
    iframeAnswerContents.forEach((content) => applyPrintStylesToContent(content as HTMLElement))
    iframeSolutionContents.forEach((content) => applyPrintStylesToContent(content as HTMLElement))

    // 添加到 iframe body
    iframeDoc.body.innerHTML = ''
    iframeDoc.body.appendChild(container)

    // 添加浮水印
    addWatermark(iframeDoc)

    // 確保 KaTeX CSS 已載入
    await new Promise<void>((resolve) => {
      const checkKatexLoaded = (): boolean => {
        const katexCSSLink = iframeDoc.querySelector('link[href*="katex"]') as HTMLLinkElement | null
        if (!katexCSSLink) return false

        // 使用容器內的元素來檢查，避免添加額外的測試元素
        const existingKatex = iframeDoc.querySelector('.katex')
        if (existingKatex) {
          const styles = iframeWindow.getComputedStyle(existingKatex)
          const fontFamily = styles.fontFamily
          return (
            fontFamily.includes('KaTeX') || (katexCSSLink.sheet && katexCSSLink.sheet.cssRules.length > 0)
          )
        }
        // 如果沒有現有的 KaTeX 元素，創建臨時測試元素
        const testEl = iframeDoc.createElement('span')
        testEl.className = 'katex'
        testEl.style.position = 'absolute'
        testEl.style.left = '-9999px'
        testEl.style.visibility = 'hidden'
        iframeDoc.body.appendChild(testEl)
        const styles = iframeWindow.getComputedStyle(testEl)
        const fontFamily = styles.fontFamily
        const isKatexLoaded =
          fontFamily.includes('KaTeX') || (katexCSSLink.sheet && katexCSSLink.sheet.cssRules.length > 0)
        iframeDoc.body.removeChild(testEl)
        return isKatexLoaded
      }

      // 等待最多 1 秒
      let attempts = 0
      const maxAttempts = 20
      const interval = setInterval(() => {
        attempts++
        if (checkKatexLoaded() || attempts >= maxAttempts) {
          clearInterval(interval)
          resolve()
        }
      }, 50)
    })

    // 根據參數決定是否觸發列印
    if (triggerPrint) {
      iframeWindow.focus()
      iframeWindow.print()
    }

    return container
  }

  /**
   * 等待組件更新完成
   */
  const waitForComponentUpdate = async (
    printModeSelection: Ref<PrintMode>,
    requestedMode: PrintMode,
    abortController: AbortController
  ): Promise<boolean> => {
    let retryCount = 0
    const maxRetries = 20 // 最多等待 2 秒
    let isReady = false

    while (retryCount < maxRetries && !isReady) {
      if (abortController.signal.aborted) {
        return false
      }

      await new Promise<void>((resolve) => setTimeout(resolve, 100))

      // 再次檢查模式是否已改變
      if (printModeSelection.value !== requestedMode) {
        abortController.abort()
        return false
      }

      const editorContainer = getEditorContainer()

      if (editorContainer) {
        const answerSections = editorContainer.querySelectorAll('.answer-section')
        const solutionSections = editorContainer.querySelectorAll('.solution-section')

        const expectedAnswers = requestedMode === 'with-answer' || requestedMode === 'with-all'
        const expectedSolutions = requestedMode === 'with-solution' || requestedMode === 'with-all'

        const visibleAnswers = Array.from(answerSections).filter((el) => {
          const style = window.getComputedStyle(el)
          return style.display !== 'none' && style.visibility !== 'hidden'
        })
        const visibleSolutions = Array.from(solutionSections).filter((el) => {
          const style = window.getComputedStyle(el)
          return style.display !== 'none' && style.visibility !== 'hidden'
        })

        const answerMatch = expectedAnswers
          ? visibleAnswers.length > 0 || answerSections.length === 0
          : visibleAnswers.length === 0
        const solutionMatch = expectedSolutions
          ? visibleSolutions.length > 0 || solutionSections.length === 0
          : visibleSolutions.length === 0

        if (answerMatch && solutionMatch) {
          isReady = true
          break
        }
      }

      retryCount++
      printPreparationMessage.value = `正在檢查組件狀態... (${retryCount}/${maxRetries})`
    }

    return isReady
  }

  /**
   * 清理殘留的 iframe（更積極的清理策略）
   */
  const cleanupExistingFrames = (): void => {
    try {
      // 查找所有隱藏的 iframe（用於列印預覽的）
      const allIframes = Array.from(document.querySelectorAll('iframe'))
      const hiddenFrames = allIframes.filter((iframe) => {
        try {
          const rect = iframe.getBoundingClientRect()
          const style = window.getComputedStyle(iframe)
          // 查找所有離屏或隱藏的 iframe
          return (
            (rect.width === 0 && rect.height === 0) ||
            (iframe.style.position === 'absolute' && iframe.style.left === '-9999px') ||
            (iframe.style.position === 'fixed' && (rect.width === 0 || rect.height === 0))
          )
        } catch (e) {
          // 如果無法訪問，嘗試移除
          return true
        }
      })

      hiddenFrames.forEach((frame) => {
        try {
          // 先清理 iframe 內容
          if (frame.contentDocument && frame.contentDocument.body) {
            frame.contentDocument.body.innerHTML = ''
          }
          // 然後移除 iframe
          if (frame.parentNode) {
            frame.parentNode.removeChild(frame)
          }
        } catch (e) {
          // 忽略清理錯誤
        }
      })
    } catch (e) {
      // 忽略清理錯誤，避免影響主要功能
    }
  }

  /**
   * 預先渲染列印內容（在模式切換時調用）
   */
  const preRenderPrintContent = debounce(async (printModeSelection: Ref<PrintMode>): Promise<void> => {
    const mode = printModeSelection.value || 'question-only'
    const cacheKeyValue = cacheKey(mode)

    // 如果已經有快取，跳過
    if (preRenderedCache.has(cacheKeyValue)) {
      return
    }

    let preRenderFrame: HTMLIFrameElement | null = null
    try {
      // 等待 DOM 更新
      await nextTick()
      await new Promise<void>((resolve) => setTimeout(resolve, 300))

      const editorContainer = getEditorContainer()
      if (editorContainer && hasEditorContent(editorContainer)) {
        // 創建離屏 iframe 進行預渲染
        preRenderFrame = document.createElement('iframe')
        preRenderFrame.style.position = 'absolute'
        preRenderFrame.style.left = '-9999px'
        preRenderFrame.style.width = '0'
        preRenderFrame.style.height = '0'
        preRenderFrame.style.border = '0'
        document.body.appendChild(preRenderFrame)

        await new Promise<void>((resolve) => {
          preRenderFrame!.onload = () => resolve()
          preRenderFrame!.src = 'about:blank'
        })

        const iframeDoc = preRenderFrame.contentDocument || preRenderFrame.contentWindow!.document
        const iframeWindow = preRenderFrame.contentWindow!

        // 生成預覽內容（不觸發列印）
        await generatePrintPreview(iframeDoc, iframeWindow, false)

        // 儲存快取（儲存 HTML 內容和樣式）
        const container = iframeDoc.querySelector('.print-container')
        if (container) {
          // 也保存樣式，確保樣式正確應用（包括樣式沙盒提取的計算樣式）
          const katexVscodeStyles = iframeDoc.getElementById('katex-vscode-styles')
          const katexStyles = iframeDoc.getElementById('katex-styles')
          const printStyles = iframeDoc.getElementById('print-styles')
          const editorComputedStyles = iframeDoc.getElementById('editor-computed-styles') // 樣式沙盒提取的樣式

          preRenderedCache.set(cacheKeyValue, {
            html: container.innerHTML,
            styles: {
              katexVscode: katexVscodeStyles?.textContent || '',
              katex: katexStyles?.textContent || '',
              print: printStyles?.textContent || '',
              computed: editorComputedStyles?.textContent || '' // 保存樣式沙盒提取的計算樣式
            },
            timestamp: Date.now()
          })
        }

        // 清理預渲染 iframe
        if (preRenderFrame.parentNode) {
          preRenderFrame.parentNode.removeChild(preRenderFrame)
        }
      }
    } catch (error) {
      console.error('預渲染失敗:', error)
      // 清理預渲染 iframe（如果存在）
      if (preRenderFrame && preRenderFrame.parentNode) {
        try {
          preRenderFrame.parentNode.removeChild(preRenderFrame)
        } catch (e) {
          // 忽略清理錯誤
        }
      }
    }
  }, 500)

  /**
   * 清除預渲染快取
   */
  const clearPreRenderCache = (): void => {
    preRenderedCache.clear()
  }

  /**
   * 列印函數
   */
  const print = async (printModeSelection: Ref<PrintMode>): Promise<void> => {
    const requestedMode = printModeSelection.value

    // 如果正在準備，取消當前的列印並開始新的列印
    if (isPreparingPrint.value && currentPrintAbortController) {
      currentPrintAbortController.abort()
      currentPrintAbortController = null
      await new Promise<void>((resolve) => setTimeout(resolve, 100))
    }

    // 創建新的 AbortController
    const abortController = new AbortController()
    currentPrintAbortController = abortController
    currentPrintMode = requestedMode

    // 設置準備狀態
    isPreparingPrint.value = true
    printPreparationMessage.value = '正在等待組件更新...'

    try {
      if (abortController.signal.aborted) {
        return
      }

      await nextTick()
      printPreparationMessage.value = '正在更新組件狀態...'

      // 等待組件更新完成
      const isReady = await waitForComponentUpdate(printModeSelection, requestedMode, abortController)

      if (!isReady) {
        console.warn('組件可能未完全更新，但繼續列印流程')
      }

      // 清理殘留的 iframe
      cleanupExistingFrames()

      printPreparationMessage.value = '正在創建列印預覽...'

      // 檢查是否有預渲染快取
      const cacheKeyValue = cacheKey(requestedMode)
      const cached = preRenderedCache.get(cacheKeyValue)

      // 創建臨時 iframe 用於列印
      const printFrame = document.createElement('iframe')
      printFrame.style.position = 'fixed'
      printFrame.style.right = '0'
      printFrame.style.bottom = '0'
      printFrame.style.width = '0'
      printFrame.style.height = '0'
      printFrame.style.border = '0'
      document.body.appendChild(printFrame)

      // 等待 iframe 載入
      await new Promise<void>((resolve) => {
        printFrame.onload = () => resolve()
        printFrame.src = 'about:blank'
      })

      const iframeDoc = printFrame.contentDocument || printFrame.contentWindow!.document
      const iframeWindow = printFrame.contentWindow!

      // 確保 iframe 內容已清空
      if (iframeDoc.body) {
        iframeDoc.body.innerHTML = ''
      }
      if (iframeDoc.head) {
        iframeDoc.head.innerHTML = ''
      }

      if (abortController.signal.aborted) {
        return
      }

      printPreparationMessage.value = '正在生成列印內容...'

      // 使用快取內容
      if (cached && cached.html) {
        // 先添加列印樣式
        const printStyleEl = iframeDoc.createElement('style')
        printStyleEl.id = 'print-styles'
        printStyleEl.textContent = (cached.styles?.print || '') + generatePrintStyles('A4', '210mm')
        iframeDoc.head.appendChild(printStyleEl)

        // 然後添加其他 KaTeX 樣式
        if (cached.styles?.katex) {
          const katexStyleEl = iframeDoc.createElement('style')
          katexStyleEl.id = 'katex-styles'
          katexStyleEl.textContent = cached.styles.katex
          iframeDoc.head.appendChild(katexStyleEl)
        }

        // 添加 katex-vscode.css
        if (cached.styles?.katexVscode) {
          const katexVscodeEl = iframeDoc.createElement('style')
          katexVscodeEl.id = 'katex-vscode-styles'
          katexVscodeEl.textContent = cached.styles.katexVscode
          iframeDoc.head.appendChild(katexVscodeEl)
        } else if (!cached.styles?.katex) {
          // 如果快取中沒有樣式，重新複製
          const styleResult = copyStylesheets(iframeDoc)
          const styleContent = styleResult.styleContent || ''
          const katexVscodeCSS = styleResult.katexVscodeCSSContent || ''

          // 先添加其他樣式
          if (styleContent && !katexVscodeCSS) {
            const katexStyleEl = iframeDoc.createElement('style')
            katexStyleEl.id = 'katex-styles'
            katexStyleEl.textContent = styleContent
            iframeDoc.head.appendChild(katexStyleEl)
          }

          // 添加 katex-vscode.css
          if (katexVscodeCSS) {
            const katexVscodeEl = iframeDoc.createElement('style')
            katexVscodeEl.id = 'katex-vscode-styles'
            katexVscodeEl.textContent = katexVscodeCSS
            iframeDoc.head.appendChild(katexVscodeEl)
          }
        }

        // 【樣式沙盒】最後應用提取的計算樣式（最高優先級）
        if (cached.styles?.computed) {
          const computedStyleEl = iframeDoc.createElement('style')
          computedStyleEl.id = 'editor-computed-styles'
          computedStyleEl.textContent = cached.styles.computed
          iframeDoc.head.appendChild(computedStyleEl)
        } else {
          // 如果快取中沒有計算樣式，重新從編輯器提取（確保一致性）
          const editorContainer = getEditorContainer()
          if (editorContainer) {
            const editorComputedStyles = extractComputedStylesFromEditor(editorContainer)
            if (editorComputedStyles) {
              const computedStyleEl = iframeDoc.createElement('style')
              computedStyleEl.id = 'editor-computed-styles'
              computedStyleEl.textContent = editorComputedStyles
              iframeDoc.head.appendChild(computedStyleEl)
            }
          }
        }

        const container = iframeDoc.createElement('div')
        container.className = 'print-container'
        container.style.background = 'white'
        // 確保 body 是空的，然後添加容器（避免重複）
        iframeDoc.body.innerHTML = ''
        container.innerHTML = cached.html
        iframeDoc.body.appendChild(container)

        // 最後添加浮水印（確保浮水印在最上層，不會影響內容）
        addWatermark(iframeDoc)

        // 等待樣式應用和 KaTeX CSS 載入
        await new Promise<void>((resolve) => {
          const checkLoaded = (): boolean => {
            // 使用容器內的元素來檢查，避免添加額外的測試元素
            const existingKatex = iframeDoc.querySelector('.katex')
            if (existingKatex) {
              const styles = iframeWindow.getComputedStyle(existingKatex)
              return styles.fontFamily.includes('KaTeX')
            }
            // 如果沒有現有的 KaTeX 元素，創建臨時測試元素
            const testEl = iframeDoc.createElement('span')
            testEl.className = 'katex'
            testEl.style.position = 'absolute'
            testEl.style.left = '-9999px'
            testEl.style.visibility = 'hidden'
            iframeDoc.body.appendChild(testEl)
            const styles = iframeWindow.getComputedStyle(testEl)
            const isLoaded = styles.fontFamily.includes('KaTeX')
            iframeDoc.body.removeChild(testEl)
            return isLoaded
          }

          let attempts = 0
          const maxAttempts = 20
          const interval = setInterval(() => {
            attempts++
            if (checkLoaded() || attempts >= maxAttempts) {
              clearInterval(interval)
              setTimeout(() => resolve(), 100)
            }
          }, 50)
        })

        iframeWindow.focus()
        iframeWindow.print()
      } else {
        // 沒有快取，正常生成
        await generatePrintPreview(iframeDoc, iframeWindow, true)
      }

      if (abortController.signal.aborted) {
        return
      }

      printPreparationMessage.value = '列印預覽已準備完成'

      // 列印完成後清理
      setTimeout(() => {
        try {
          if (printFrame.parentNode) {
            printFrame.parentNode.removeChild(printFrame)
          }
        } catch (e) {
          console.warn('Failed to remove print frame:', e)
        }
      }, 1000)
    } catch (error) {
      if (error instanceof Error && (error.name === 'AbortError' || abortController.signal.aborted)) {
        return
      }

      console.error('Print error:', error)
      alert('列印預覽時發生錯誤：' + (error instanceof Error ? error.message : '未知錯誤'))
    } finally {
      if (currentPrintAbortController === abortController) {
        currentPrintAbortController = null
        currentPrintMode = null
        isPreparingPrint.value = false
        printPreparationMessage.value = '正在準備列印內容...'
      }
    }
  }

  return {
    isPreparingPrint,
    printPreparationMessage,
    generatePrintPreview,
    print,
    preRenderPrintContent,
    clearPreRenderCache
  }
}
