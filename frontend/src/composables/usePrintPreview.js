import { ref, nextTick } from 'vue'

/**
 * 列印預覽功能 Composable
 * 處理列印預覽的生成、DOM 克隆、樣式處理等邏輯
 */
export function usePrintPreview(options = {}) {
    const {
        watermarkEnabled = ref(false),
        watermarkImage = ref(null),
        watermarkOpacity = ref(10)
    } = options

    // 列印準備狀態
    const isPreparingPrint = ref(false)
    const printPreparationMessage = ref('正在準備列印內容...')

    // 用於取消正在進行的列印
    let currentPrintAbortController = null
    let currentPrintMode = null

    /**
     * 移除元素的所有 scoped 樣式屬性（data-v-xxx）
     */
    const removeScopedAttributes = (element) => {
        Array.from(element.attributes).forEach(attr => {
            if (attr.name.startsWith('data-v-')) {
                element.removeAttribute(attr.name)
            }
        })
    }

    /**
     * 應用列印樣式到答案/詳解區域
     */
    const applyPrintStylesToSection = (section) => {
        removeScopedAttributes(section)
        section.style.setProperty('background', 'white', 'important')
        section.style.setProperty('border', 'none', 'important')
        section.style.setProperty('border-left', 'none', 'important')
        section.style.setProperty('padding', '0.75rem 0', 'important')
        section.style.setProperty('margin-top', '0.75rem', 'important')
        section.style.setProperty('margin-bottom', '0.5rem', 'important')
        section.style.setProperty('break-inside', 'avoid', 'important')
        section.style.setProperty('page-break-inside', 'avoid', 'important')
    }

    /**
     * 應用列印樣式到標籤
     */
    const applyPrintStylesToLabel = (label) => {
        removeScopedAttributes(label)
        label.style.setProperty('font-size', '0.875rem', 'important')
        label.style.setProperty('font-weight', '700', 'important')
        label.style.setProperty('color', 'black', 'important')
        label.style.setProperty('margin-bottom', '0.5rem', 'important')
        label.style.setProperty('display', 'block', 'important')
    }

    /**
     * 應用列印樣式到內容
     */
    const applyPrintStylesToContent = (content) => {
        removeScopedAttributes(content)
        content.style.setProperty('font-size', '0.875rem', 'important')
        content.style.setProperty('color', 'black', 'important')
        content.style.setProperty('line-height', '1.6', 'important')
        content.style.setProperty('margin-top', '0.25rem', 'important')
    }

    /**
     * 處理克隆後的 DOM，移除編輯器特定元素並應用列印樣式
     */
    const prepareCloneForPrint = (clone) => {
        // 移除編輯器特定的類別和屬性
        clone.classList.remove('continuous-editor')
        clone.removeAttribute('contenteditable')

        // 移除所有編輯相關的元素
        const editableElements = clone.querySelectorAll('[contenteditable]')
        editableElements.forEach(el => el.removeAttribute('contenteditable'))

        // 移除懸停工具列
        const toolbars = clone.querySelectorAll('.question-toolbar, .section-toolbar')
        toolbars.forEach(toolbar => toolbar.remove())

        // 處理答案和詳解區域
        const answerSections = clone.querySelectorAll('.answer-section')
        const solutionSections = clone.querySelectorAll('.solution-section')
        answerSections.forEach(applyPrintStylesToSection)
        solutionSections.forEach(applyPrintStylesToSection)

        // 處理標籤和內容
        const answerLabels = clone.querySelectorAll('.answer-label')
        const solutionLabels = clone.querySelectorAll('.solution-label')
        const answerContents = clone.querySelectorAll('.answer-content')
        const solutionContents = clone.querySelectorAll('.solution-content')

        answerLabels.forEach(applyPrintStylesToLabel)
        solutionLabels.forEach(applyPrintStylesToLabel)
        answerContents.forEach(applyPrintStylesToContent)
        solutionContents.forEach(applyPrintStylesToContent)
    }

    /**
     * 修復克隆後的 KaTeX 元素
     */
    const repairKatexElements = (editorContainer, clone) => {
        const originalKatexElements = editorContainer.querySelectorAll('.katex')
        const clonedKatexElements = clone.querySelectorAll('.katex')
        let repairedCount = 0

        clonedKatexElements.forEach((clonedEl, index) => {
            const hasContent = clonedEl.innerHTML.length > 0
            const hasHtml = !!clonedEl.querySelector('.katex-html')
            const hasMathml = !!clonedEl.querySelector('.katex-mathml')

            // 檢查 KaTeX 元素是否完整
            if (!hasContent || (!hasHtml && !hasMathml)) {
                if (index < originalKatexElements.length) {
                    const originalEl = originalKatexElements[index]
                    if (originalEl && originalEl.innerHTML.length > 0) {
                        const originalParent = originalEl.parentElement
                        const clonedParent = clonedEl.parentElement
                        if (originalParent && clonedParent) {
                            const tempDiv = document.createElement('div')
                            tempDiv.innerHTML = originalEl.outerHTML
                            const newEl = tempDiv.firstElementChild
                            if (newEl) {
                                clonedParent.replaceChild(newEl, clonedEl)
                                repairedCount++
                            }
                        }
                    }
                }
            }
        })

        return repairedCount
    }

    /**
     * 生成列印樣式 CSS
     */
    const generatePrintStyles = (paperSize = 'A4', paperWidth = '210mm') => {
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
      
      /* 確保所有文字顏色為黑色 */
      * {
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
      
      /* KaTeX 樣式 - 確保在列印時正確顯示 */
      .print-container .katex,
      .katex {
        color: black !important;
        font-size: 1.1em !important;
        line-height: 1.6 !important;
        display: inline-block !important;
        white-space: nowrap !important;
        word-break: keep-all !important;
        overflow: visible !important;
        position: relative !important;
        vertical-align: baseline !important;
      }
      
      .print-container .katex *,
      .katex * {
        color: black !important;
        white-space: nowrap !important;
        word-break: keep-all !important;
        overflow: visible !important;
      }
      
      .print-container .katex-html,
      .katex-html {
        display: inline-block !important;
        white-space: nowrap !important;
        word-break: keep-all !important;
        overflow: visible !important;
      }
      
      .print-container .katex-mathml,
      .katex-mathml {
        display: none !important;
      }
      
      .print-container .katex svg,
      .katex svg {
        display: inline-block !important;
        white-space: nowrap !important;
        word-break: keep-all !important;
        overflow: visible !important;
        vertical-align: baseline !important;
      }
      
      /* 修復根號線拉長問題 */
      .print-container .katex .sqrt .vlist-t,
      .katex .sqrt .vlist-t {
        max-height: 1.2em !important;
        overflow: hidden !important;
      }
      
      .print-container .katex .sqrt .svg-align,
      .katex .sqrt .svg-align {
        overflow: visible !important;
      }
      
      .print-container .katex .sqrt .vlist-t2,
      .katex .sqrt .vlist-t2 {
        border-left: none !important;
      }
      
      /* 修復分數線位置 */
      .print-container .katex .mfrac > .frac-line,
      .print-container .katex .frac-line,
      .katex .mfrac > .frac-line,
      .katex .frac-line {
        border-bottom-width: 0.04em !important;
        min-height: 0.04em !important;
        margin-top: 0.188em !important;
        margin-bottom: 0.092em !important;
      }
      
      .print-container .katex .mfrac,
      .katex .mfrac {
        padding-top: 0.158em !important;
        padding-bottom: 0.082em !important;
      }
    }
    `
    }

    /**
     * 複製樣式表到 iframe
     */
    const copyStylesheets = (iframeDoc) => {
        const stylesheets = Array.from(document.styleSheets)
        let styleContent = ''

        // 首先確保 KaTeX CSS 被載入
        const katexCSSLink = iframeDoc.createElement('link')
        katexCSSLink.rel = 'stylesheet'
        katexCSSLink.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css'
        katexCSSLink.crossOrigin = 'anonymous'
        iframeDoc.head.appendChild(katexCSSLink)

        // 複製其他樣式表
        for (const sheet of stylesheets) {
            try {
                if (sheet.href) {
                    const link = iframeDoc.createElement('link')
                    link.rel = 'stylesheet'
                    link.href = sheet.href
                    iframeDoc.head.appendChild(link)
                } else {
                    const rules = Array.from(sheet.cssRules || [])
                    for (const rule of rules) {
                        styleContent += rule.cssText + '\n'
                    }
                }
            } catch (e) {
                console.warn('無法複製樣式表:', e)
            }
        }

        return styleContent
    }

    /**
     * 添加浮水印到 iframe
     */
    const addWatermark = (iframeDoc) => {
        if (watermarkEnabled.value && watermarkImage.value) {
            const watermark = iframeDoc.createElement('div')
            watermark.className = 'watermark'
            watermark.style.opacity = (watermarkOpacity.value / 100).toString()

            const img = iframeDoc.createElement('img')
            img.src = watermarkImage.value
            img.alt = '浮水印'

            watermark.appendChild(img)
            iframeDoc.body.appendChild(watermark)
        }
    }

    /**
     * 獲取編輯器容器
     */
    const getEditorContainer = () => {
        return document.querySelector('.continuous-editor') ||
            document.querySelector('.block-editor-container') ||
            document.querySelector('.ProseMirror')
    }

    /**
     * 檢查編輯器是否有內容
     */
    const hasEditorContent = (editorContainer) => {
        if (!editorContainer) return false
        const hasText = editorContainer.textContent.trim().length > 0
        const hasProseMirror = editorContainer.querySelector('.ProseMirror')
        return hasText || hasProseMirror
    }

    /**
     * 生成列印預覽內容
     */
    const generatePrintPreview = async (iframeDoc, iframeWindow, triggerPrint = false) => {
        // 等待 Vue 響應式更新完成
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))

        const paperSize = 'A4'
        const paperWidth = '210mm'

        const editorContainer = getEditorContainer()

        // 檢查是否有內容
        if (!editorContainer) {
            if (triggerPrint) {
                alert('沒有可列印的內容')
                return null
            }
            return null
        }

        if (!hasEditorContent(editorContainer)) {
            if (triggerPrint) {
                alert('沒有可列印的內容')
                return null
            }
            // 預覽模式:顯示空白頁面
            const container = iframeDoc.createElement('div')
            container.style.background = 'white'
            container.style.width = paperWidth
            container.style.minHeight = '297mm'
            container.style.padding = '20mm'
            container.style.margin = '0 auto'
            iframeDoc.body.appendChild(container)
            return container
        }

        // 複製樣式表
        const styleContent = copyStylesheets(iframeDoc)

        // 添加內聯樣式
        const styleEl = iframeDoc.createElement('style')
        styleEl.textContent = styleContent + generatePrintStyles(paperSize, paperWidth)
        iframeDoc.head.appendChild(styleEl)

        // 複製編輯器內容
        const container = iframeDoc.createElement('div')
        container.className = 'print-container'
        container.style.background = 'white'

        const clone = editorContainer.cloneNode(true)

        // 修復 KaTeX 元素
        repairKatexElements(editorContainer, clone)

        // 準備克隆內容用於列印
        prepareCloneForPrint(clone)

        container.appendChild(clone)

        // 在 iframe 中再次強制應用內聯樣式
        await nextTick()

        // 在 iframe 中查找所有答案和詳解區域，強制應用內聯樣式
        const iframeAnswerSections = iframeDoc.querySelectorAll('.answer-section')
        const iframeSolutionSections = iframeDoc.querySelectorAll('.solution-section')

        iframeAnswerSections.forEach(applyPrintStylesToSection)
        iframeSolutionSections.forEach(applyPrintStylesToSection)

        // 同樣處理標籤和內容
        const iframeAnswerLabels = iframeDoc.querySelectorAll('.answer-label')
        const iframeSolutionLabels = iframeDoc.querySelectorAll('.solution-label')
        const iframeAnswerContents = iframeDoc.querySelectorAll('.answer-content')
        const iframeSolutionContents = iframeDoc.querySelectorAll('.solution-content')

        iframeAnswerLabels.forEach(applyPrintStylesToLabel)
        iframeSolutionLabels.forEach(applyPrintStylesToLabel)
        iframeAnswerContents.forEach(applyPrintStylesToContent)
        iframeSolutionContents.forEach(applyPrintStylesToContent)

        // 添加浮水印
        addWatermark(iframeDoc)

        iframeDoc.body.appendChild(container)

        // 等待 KaTeX CSS 載入完成
        await new Promise(resolve => setTimeout(resolve, 500))

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
    const waitForComponentUpdate = async (printModeSelection, requestedMode, abortController) => {
        let retryCount = 0
        const maxRetries = 20 // 最多等待 2 秒
        let isReady = false

        while (retryCount < maxRetries && !isReady) {
            if (abortController.signal.aborted) {
                return false
            }

            await new Promise(resolve => setTimeout(resolve, 100))

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

                const visibleAnswers = Array.from(answerSections).filter(el => {
                    const style = window.getComputedStyle(el)
                    return style.display !== 'none' && style.visibility !== 'hidden'
                })
                const visibleSolutions = Array.from(solutionSections).filter(el => {
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
     * 清理殘留的 iframe
     */
    const cleanupExistingFrames = () => {
        const existingFrames = Array.from(document.querySelectorAll('iframe')).filter(iframe => {
            const rect = iframe.getBoundingClientRect()
            return rect.width === 0 && rect.height === 0 && iframe.style.position === 'fixed'
        })

        existingFrames.forEach(frame => {
            try {
                if (frame.parentNode) {
                    frame.parentNode.removeChild(frame)
                }
            } catch (e) {
                console.warn('Failed to remove existing frame:', e)
            }
        })
    }

    /**
     * 列印函數
     */
    const print = async (printModeSelection) => {
        const requestedMode = printModeSelection.value

        // 如果正在準備，取消當前的列印並開始新的列印
        if (isPreparingPrint.value && currentPrintAbortController) {
            currentPrintAbortController.abort()
            currentPrintAbortController = null
            await new Promise(resolve => setTimeout(resolve, 100))
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
            await new Promise(resolve => {
                printFrame.onload = resolve
                printFrame.src = 'about:blank'
            })

            const iframeDoc = printFrame.contentDocument || printFrame.contentWindow.document
            const iframeWindow = printFrame.contentWindow

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

            // 生成預覽並觸發列印
            await generatePrintPreview(iframeDoc, iframeWindow, true)

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
            if (error.name === 'AbortError' || abortController.signal.aborted) {
                return
            }

            console.error('Print error:', error)
            alert('列印預覽時發生錯誤：' + (error.message || '未知錯誤'))
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
        print
    }
}
