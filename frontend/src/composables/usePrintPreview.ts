/**
 * 列印預覽功能 Composable（重構版本）
 * 處理列印預覽的生成、DOM 克隆、樣式處理等邏輯
 * 
 * 此版本已重構為使用多個專職 composables，大大簡化了主文件
 */

import { ref, nextTick, type Ref } from 'vue'
import { debounce } from '../utils/debounce'
import { usePrintCache } from './print/usePrintCache'
import { usePrintStyles } from './print/usePrintStyles'
import { usePrintWatermark } from './print/usePrintWatermark'
import { usePrintPreviewGeneration } from './print/usePrintPreviewGeneration'
import { usePrintComponentWait } from './print/usePrintComponentWait'
import { usePrintFrameUtils } from './print/usePrintFrameUtils'
import { usePrintStylesheetCopy } from './print/usePrintStylesheetCopy'
import { usePrintStyleExtraction } from './usePrintStyleExtraction'
import { usePrintEditorUtils } from './print/usePrintEditorUtils'
import type {
  PrintMode,
  PrintPreviewOptions,
  PrintPreviewState,
  PrintPreviewActions,
  UsePrintPreviewReturn,
} from './usePrintPreview.types'

/**
 * 列印預覽 Composable（重構版本）
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

  // 使用各種 composables
  const {
    getCache,
    setCache,
    clearCache,
    hasCache,
    cacheKey,
    setStylesCache,
    getStylesCache,
    clearStylesCache,
  } = usePrintCache()

  const { generatePrintStyles: generatePrintStylesFromComposable } = usePrintStyles()

  const { extractComputedStylesFromEditor } = usePrintStyleExtraction()

  const { copyStylesheets } = usePrintStylesheetCopy()

  const {
    generatePrintPreview,
    getEditorContainer,
    hasEditorContent,
  } = usePrintPreviewGeneration({
    watermarkEnabled,
    watermarkImage,
    watermarkOpacity,
  })

  const { waitForComponentUpdate } = usePrintComponentWait({
    printPreparationMessage,
  })

  const {
    cleanupExistingFrames,
    createPrintFrame,
    createPreRenderFrame,
    waitForIframeLoad,
  } = usePrintFrameUtils()

  const { addWatermark } = usePrintWatermark({
    enabled: watermarkEnabled,
    image: watermarkImage,
    opacity: watermarkOpacity,
  })

  const { checkKatexLoaded } = usePrintEditorUtils()

  /**
   * 生成列印樣式（用於快取恢復）
   */
  const generatePrintStyles = (paperSize = 'A4', paperWidth = '210mm'): string => {
    return generatePrintStylesFromComposable({ paperSize, paperWidth })
  }

  /**
   * 添加浮水印到 iframe
   */
  const addWatermarkToIframe = (iframeDoc: Document): void => {
    const existingWatermark = iframeDoc.querySelector('.watermark')
    if (existingWatermark) {
      existingWatermark.remove()
    }
    addWatermark(iframeDoc)
  }

  /**
   * 預先渲染列印內容（在模式切換時調用）
   */
  const preRenderPrintContent = debounce(async (printModeSelection: Ref<PrintMode>): Promise<void> => {
    const mode = printModeSelection.value || 'question-only'

    // 如果已經有快取，跳過
    if (hasCache(mode)) {
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
        preRenderFrame = createPreRenderFrame()
        await waitForIframeLoad(preRenderFrame)

        const iframeDoc = preRenderFrame.contentDocument || preRenderFrame.contentWindow!.document
        const iframeWindow = preRenderFrame.contentWindow!

        // 生成預覽內容（不觸發列印）
        await generatePrintPreview(iframeDoc, iframeWindow, false)

        // 儲存快取（儲存 HTML 內容和樣式）
        const container = iframeDoc.querySelector('.print-container')
        if (container) {
          // 保存樣式，確保樣式正確應用
          const katexVscodeStyles = iframeDoc.getElementById('katex-vscode-styles')
          const katexStyles = iframeDoc.getElementById('katex-styles')
          const printStyles = iframeDoc.getElementById('print-styles')
          const editorComputedStyles = iframeDoc.getElementById('editor-computed-styles')

          // 使用 composable 的 setCache 存儲 HTML
          setCache(mode, container.innerHTML)

          // 存儲樣式信息
          setStylesCache(mode, {
            katexVscode: katexVscodeStyles?.textContent || '',
            katex: katexStyles?.textContent || '',
            print: printStyles?.textContent || '',
            computed: editorComputedStyles?.textContent || '',
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
    clearCache()
    clearStylesCache()
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
      const cachedItem = getCache(requestedMode)
      const cachedStyles = getStylesCache(requestedMode)
      const cached = cachedItem && cachedStyles
        ? {
            html: cachedItem.html,
            styles: cachedStyles,
            timestamp: cachedItem.timestamp
          }
        : null

      // 創建臨時 iframe 用於列印
      const printFrame = createPrintFrame()
      await waitForIframeLoad(printFrame)

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
        addWatermarkToIframe(iframeDoc)

        // 等待樣式應用和 KaTeX CSS 載入
        await checkKatexLoaded(iframeDoc, iframeWindow)

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
