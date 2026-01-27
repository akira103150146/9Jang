/**
 * usePrintPreviewGeneration
 * 處理列印預覽生成的核心邏輯
 */

import { nextTick } from 'vue'
import { usePrintDOMCloning } from '../usePrintDOMCloning'
import { usePrintStyleExtraction } from '../usePrintStyleExtraction'
import { usePrintKatexRepair } from '../usePrintKatexRepair'
import { usePrintStylesheetCopy } from './usePrintStylesheetCopy'
import { usePrintStyles } from './usePrintStyles'
import { usePrintWatermark } from './usePrintWatermark'
import { usePrintEditorUtils } from './usePrintEditorUtils'
import type { Ref } from 'vue'
import type { EditorContainer } from '../usePrintPreview.types'

export interface PrintPreviewGenerationOptions {
  watermarkEnabled?: Ref<boolean>
  watermarkImage?: Ref<string | null>
  watermarkOpacity?: Ref<number>
  paperSize?: string
  paperWidth?: string
}

export function usePrintPreviewGeneration(options: PrintPreviewGenerationOptions = {}) {
  const {
    watermarkEnabled = undefined,
    watermarkImage = undefined,
    watermarkOpacity = undefined,
    paperSize = 'A4',
    paperWidth = '210mm',
  } = options

  // 使用各種 composables
  const { cloneEditorContent } = usePrintDOMCloning()
  const {
    extractComputedStylesFromEditor,
    applyPrintStylesToSection,
    applyPrintStylesToLabel,
    applyPrintStylesToContent,
  } = usePrintStyleExtraction()
  const { rebuildComplexKatexElementsInIframe } = usePrintKatexRepair()
  const { copyStylesheets } = usePrintStylesheetCopy()
  const { generatePrintStyles: generatePrintStylesFromComposable } = usePrintStyles()
  const { getEditorContainer, hasEditorContent, checkKatexLoaded } = usePrintEditorUtils()

  // 浮水印 composable（如果提供了選項）
  const watermarkComposable =
    watermarkEnabled && watermarkImage && watermarkOpacity
      ? usePrintWatermark({
          enabled: watermarkEnabled,
          image: watermarkImage,
          opacity: watermarkOpacity,
        })
      : null

  /**
   * 添加浮水印到 iframe
   */
  const addWatermarkToIframe = (iframeDoc: Document): void => {
    if (!watermarkComposable) return

    // 先移除可能存在的舊浮水印，避免重複
    const existingWatermark = iframeDoc.querySelector('.watermark')
    if (existingWatermark) {
      existingWatermark.remove()
    }

    // 使用 composable 的 addWatermark
    watermarkComposable.addWatermark(iframeDoc)
  }

  /**
   * 生成列印預覽
   */
  const generatePrintPreview = async (
    iframeDoc: Document,
    iframeWindow: Window,
    triggerPrint = false,
    customPaperSize = paperSize,
    customPaperWidth = paperWidth
  ): Promise<HTMLElement | null> => {
    const editorContainer = getEditorContainer()
    if (!editorContainer || !hasEditorContent(editorContainer)) {
      return null
    }

    // 複製樣式表
    const { styleContent, katexVscodeCSSContent } = copyStylesheets(iframeDoc)

    // 生成列印 CSS
    const printStyles = generatePrintStylesFromComposable({
      paperSize: customPaperSize,
      paperWidth: customPaperWidth,
    })

    // 添加浮水印樣式（如果有）
    const watermarkStyles = watermarkComposable?.generateWatermarkStyles() || ''

    // 添加內聯樣式
    // 注意：順序很重要 - 先添加列印專用樣式（低優先級），然後添加其他樣式，最後添加 katex-vscode.css（最高優先級）
    const printStyleEl = iframeDoc.createElement('style')
    printStyleEl.textContent = printStyles + watermarkStyles
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

    // 添加到 iframe body（必須先添加到 DOM 中，才能查找 KaTeX 元素）
    iframeDoc.body.innerHTML = ''
    iframeDoc.body.appendChild(container)

    // 在 iframe 中查找並應用樣式（只應用一次，避免重複）
    await nextTick()

    // 【新架構】在 iframe 中直接重建根號和次方元素
    // 注意：必須在 container 添加到 iframe body 之後調用，否則找不到 KaTeX 元素
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

    // 添加浮水印
    addWatermarkToIframe(iframeDoc)

    // 確保 KaTeX CSS 已載入
    await checkKatexLoaded(iframeDoc, iframeWindow)

    // 根據參數決定是否觸發列印
    if (triggerPrint) {
      iframeWindow.focus()
      iframeWindow.print()
    }

    return container
  }

  return {
    generatePrintPreview,
    getEditorContainer,
    hasEditorContent,
  }
}
