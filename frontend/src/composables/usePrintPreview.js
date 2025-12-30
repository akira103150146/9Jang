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

    // 預渲染快取：儲存不同模式的預渲染內容
    const preRenderedCache = new Map()
    const cacheKey = (mode) => `print-preview-${mode}`

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
     * 修復克隆後的 KaTeX 元素，確保所有內容（包括文本和數字）都正確保留
     * 特別處理根號元素，防止水平線異常延長和內容丟失
     */
    const repairKatexElements = (editorContainer, clone) => {
        const originalKatexElements = editorContainer.querySelectorAll('.katex')
        const clonedKatexElements = clone.querySelectorAll('.katex')
        let repairedCount = 0

        // 提前定義 originalSqrtElements，確保它在整個函數作用域內可用
        const originalSqrtElements = Array.from(originalKatexElements).filter(el => {
            return el.querySelector('.sqrt') !== null
        })

        // 【關鍵修復】特別處理根號元素 - 強制重新克隆所有包含根號的 KaTeX 元素
        // 問題12顯示根號被拆分為 ^5/ 的形式，說明 DOM 結構被破壞
        // 解決方案：對於所有包含根號的 KaTeX 元素，直接從原始元素重新克隆
        if (originalSqrtElements.length > 0) {
            // #region agent log
            fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'usePrintPreview.js:125', message: '發現包含根號的 KaTeX 元素', data: { count: originalSqrtElements.length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'G' }) }).catch(() => { });
            // #endregion

            originalSqrtElements.forEach((originalKatex) => {
                // 找到對應的克隆元素（通過比較位置或內容）
                let clonedKatex = null
                const originalIndex = Array.from(originalKatex.parentElement.children).indexOf(originalKatex)
                const originalSqrt = originalKatex.querySelector('.sqrt')
                const originalSqrtText = originalSqrt ? originalSqrt.textContent || '' : ''

                // 嘗試通過索引找到
                if (originalIndex >= 0 && originalIndex < clonedKatexElements.length) {
                    clonedKatex = clonedKatexElements[originalIndex]
                } else {
                    // 如果索引不匹配，通過內容查找
                    clonedKatex = Array.from(clonedKatexElements).find(el => {
                        const sqrt = el.querySelector('.sqrt')
                        return sqrt && sqrt.textContent === originalSqrtText
                    })
                }

                if (clonedKatex && originalKatex) {
                    const originalParent = originalKatex.parentElement
                    const clonedParent = clonedKatex.parentElement

                    if (originalParent && clonedParent) {
                        try {
                            // 【關鍵修復】使用 cloneNode 而不是 innerHTML，確保 SVG 和所有特殊元素完整保留
                            // innerHTML 序列化可能破壞 SVG 和某些特殊元素的結構
                            // 使用深層克隆確保完整的 DOM 結構
                            const newKatex = originalKatex.cloneNode(true)

                            // #region agent log
                            const originalSqrt = originalKatex.querySelector('.sqrt')
                            const newSqrt = newKatex.querySelector('.sqrt')
                            fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'usePrintPreview.js:157', message: '使用 cloneNode 重新克隆包含根號的 KaTeX 元素', data: { originalHasSqrt: !!originalSqrt, newHasSqrt: !!newSqrt, originalSqrtInnerHTML: originalSqrt?.innerHTML?.substring(0, 100) || '', newSqrtInnerHTML: newSqrt?.innerHTML?.substring(0, 100) || '' }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H' }) }).catch(() => { });
                            // #endregion

                            if (newKatex) {
                                // 確保克隆的元素有完整的結構
                                // 檢查根號是否完整
                                const clonedSqrt = newKatex.querySelector('.sqrt')
                                const originalSqrt = originalKatex.querySelector('.sqrt')

                                if (originalSqrt && clonedSqrt) {
                                    // 驗證克隆是否完整
                                    const originalSvg = originalSqrt.querySelector('svg')
                                    const clonedSvg = clonedSqrt.querySelector('svg')

                                    // #region agent log
                                    fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'usePrintPreview.js:170', message: '驗證根號克隆完整性', data: { originalHasSvg: !!originalSvg, clonedHasSvg: !!clonedSvg, originalSvgOuterHTML: originalSvg?.outerHTML?.substring(0, 200) || '', clonedSvgOuterHTML: clonedSvg?.outerHTML?.substring(0, 200) || '' }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'N' }) }).catch(() => { });
                                    // #endregion

                                    // 如果 SVG 缺失，說明克隆不完整，嘗試使用 outerHTML（雖然可能不完美）
                                    if (originalSvg && !clonedSvg) {
                                        console.warn('克隆後 SVG 缺失，嘗試使用 outerHTML 方法')
                                        const tempDiv = document.createElement('div')
                                        tempDiv.innerHTML = originalKatex.outerHTML
                                        const fallbackKatex = tempDiv.firstElementChild
                                        if (fallbackKatex) {
                                            clonedParent.replaceChild(fallbackKatex, clonedKatex)
                                            repairedCount++
                                            return
                                        }
                                    }
                                }

                                // 替換克隆的 KaTeX 元素
                                clonedParent.replaceChild(newKatex, clonedKatex)
                                repairedCount++
                            }
                        } catch (e) {
                            console.warn('修復根號元素時發生錯誤:', e)
                            // #region agent log
                            fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'usePrintPreview.js:165', message: '修復根號元素失敗', data: { error: e.message }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'I' }) }).catch(() => { });
                            // #endregion
                        }
                    }
                }
            })
        }

        // 如果數量不匹配，直接修復所有元素
        if (originalKatexElements.length !== clonedKatexElements.length) {
            // 重新從原始容器克隆所有 KaTeX 元素
            originalKatexElements.forEach((originalEl, index) => {
                const clonedEl = clonedKatexElements[index]
                if (clonedEl && originalEl && originalEl.innerHTML.length > 0) {
                    const originalParent = originalEl.parentElement
                    const clonedParent = clonedEl.parentElement
                    if (originalParent && clonedParent) {
                        try {
                            // 創建深層克隆，確保所有子元素和文本節點都被複製
                            const tempDiv = document.createElement('div')
                            tempDiv.innerHTML = originalEl.outerHTML
                            const newEl = tempDiv.firstElementChild
                            if (newEl) {
                                clonedParent.replaceChild(newEl, clonedEl)
                                repairedCount++
                            }
                        } catch (e) {
                            console.warn('修復 KaTeX 元素時發生錯誤:', e)
                        }
                    }
                }
            })
        } else {
            // 數量匹配時，檢查每個元素是否完整（跳過已修復的根號元素）
            clonedKatexElements.forEach((clonedEl, index) => {
                // 跳過已經通過根號修復處理的元素
                const hasSqrt = clonedEl.querySelector('.sqrt')
                if (hasSqrt && originalSqrtElements.length > 0) {
                    // 檢查這個元素是否已經被修復
                    const correspondingOriginal = originalKatexElements[index]
                    if (correspondingOriginal) {
                        const originalSqrt = correspondingOriginal.querySelector('.sqrt')
                        if (originalSqrt) {
                            // 已經在根號修復中處理過，跳過
                            return
                        }
                    }
                }

                const originalEl = originalKatexElements[index]
                if (!originalEl) return

                const hasContent = clonedEl.innerHTML && clonedEl.innerHTML.trim().length > 0
                const hasHtml = !!clonedEl.querySelector('.katex-html')
                const hasMathml = !!clonedEl.querySelector('.katex-mathml')

                // 檢查原始元素是否有內容
                const originalHasContent = originalEl.innerHTML && originalEl.innerHTML.trim().length > 0

                // 如果克隆的元素缺少內容，或原始元素有內容但克隆的沒有，則修復
                if (!hasContent || (!hasHtml && !hasMathml) || (originalHasContent && !hasContent)) {
                    const originalParent = originalEl.parentElement
                    const clonedParent = clonedEl.parentElement
                    if (originalParent && clonedParent) {
                        try {
                            // 創建深層克隆，確保所有子元素和文本節點都被複製
                            const tempDiv = document.createElement('div')
                            tempDiv.innerHTML = originalEl.outerHTML
                            const newEl = tempDiv.firstElementChild
                            if (newEl) {
                                clonedParent.replaceChild(newEl, clonedEl)
                                repairedCount++
                            }
                        } catch (e) {
                            console.warn('修復 KaTeX 元素時發生錯誤:', e)
                        }
                    }
                }
            })
        }

        return repairedCount
    }

    /**
     * 修復克隆後的文本內容，確保所有文本節點都被正確保留
     * 這特別針對非 KaTeX 的普通文本，確保數字不會消失
     */
    const repairTextContent = (editorContainer, clone) => {
        // 查找所有包含文本的元素（排除 KaTeX 元素）
        const originalTextElements = editorContainer.querySelectorAll('p, span, div, li, td, th')
        const clonedTextElements = clone.querySelectorAll('p, span, div, li, td, th')

        originalTextElements.forEach((originalEl, index) => {
            // 跳過 KaTeX 元素（它們由 repairKatexElements 處理）
            if (originalEl.closest('.katex')) {
                return
            }

            const clonedEl = clonedTextElements[index]
            if (!clonedEl) return

            const originalText = originalEl.textContent || ''
            const clonedText = clonedEl.textContent || ''

            // 如果克隆的文本內容與原始不一致，嘗試修復
            if (originalText.trim() !== clonedText.trim() && originalText.trim().length > 0) {
                try {
                    // 檢查是否是因為某些元素被移除
                    const originalChildren = Array.from(originalEl.childNodes)
                    const clonedChildren = Array.from(clonedEl.childNodes)

                    // 如果子節點數量不匹配，重新克隆內容
                    if (originalChildren.length !== clonedChildren.length) {
                        const tempDiv = document.createElement('div')
                        tempDiv.innerHTML = originalEl.innerHTML
                        clonedEl.innerHTML = tempDiv.innerHTML
                    }
                } catch (e) {
                    // 忽略錯誤，繼續處理下一個元素
                }
            }
        })
    }

    /**
     * 【新架構】在 iframe 中直接從原始 DOM 重建根號和次方元素
     * 這確保這些複雜元素的完整結構不會被破壞
     * 這個方法完全繞過了克隆時可能出現的結構破壞問題
     */
    const rebuildComplexKatexElementsInIframe = (editorContainer, iframeDoc, iframeWindow) => {
        const originalKatexElements = editorContainer.querySelectorAll('.katex')
        const iframeKatexElements = iframeDoc.querySelectorAll('.katex')

        if (originalKatexElements.length !== iframeKatexElements.length) {
            console.warn('原始和 iframe 中的 KaTeX 元素數量不匹配', {
                original: originalKatexElements.length,
                iframe: iframeKatexElements.length
            })
        }

        let rebuiltCount = 0

        originalKatexElements.forEach((originalKatex, index) => {
            const iframeKatex = iframeKatexElements[index]
            if (!iframeKatex) return

            const hasSqrt = originalKatex.querySelector('.sqrt')
            const hasMsupsub = originalKatex.querySelector('.msupsub')

            // 如果包含根號或次方，直接從原始元素重新克隆到 iframe
            if (hasSqrt || hasMsupsub) {
                try {
                    // 從原始元素深層克隆
                    const newKatex = originalKatex.cloneNode(true)

                    // 驗證克隆是否完整
                    if (hasSqrt) {
                        const originalSqrt = originalKatex.querySelector('.sqrt')
                        const newSqrt = newKatex.querySelector('.sqrt')
                        const originalSvg = originalSqrt?.querySelector('svg')
                        const newSvg = newSqrt?.querySelector('svg')

                        // 如果 SVG 缺失，說明克隆失敗，跳過
                        if (originalSvg && !newSvg) {
                            console.warn(`根號 SVG 克隆失敗（索引 ${index}），跳過重建`)
                            return
                        }

                        // 驗證 SVG 結構完整性
                        if (originalSvg && newSvg) {
                            const originalViewBox = originalSvg.getAttribute('viewBox')
                            const newViewBox = newSvg.getAttribute('viewBox')

                            if (originalViewBox && newViewBox !== originalViewBox) {
                                // 修復 viewBox
                                newSvg.setAttribute('viewBox', originalViewBox)
                            }
                        }
                    }

                    // 驗證次方元素
                    if (hasMsupsub) {
                        const originalMsupsub = originalKatex.querySelector('.msupsub')
                        const newMsupsub = newKatex.querySelector('.msupsub')

                        if (originalMsupsub && !newMsupsub) {
                            console.warn(`次方元素克隆失敗（索引 ${index}），跳過重建`)
                            return
                        }
                    }

                    // 替換 iframe 中的元素
                    const iframeParent = iframeKatex.parentElement
                    if (iframeParent) {
                        iframeParent.replaceChild(newKatex, iframeKatex)
                        rebuiltCount++
                    }
                } catch (e) {
                    console.warn(`重建 KaTeX 元素失敗（索引 ${index}）:`, e)
                }
            }
        })

        if (rebuiltCount > 0) {
            console.log(`成功重建 ${rebuiltCount} 個包含根號或次方的 KaTeX 元素`)
        }

        return rebuiltCount
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
        /* 與 katex-vscode.css 保持一致 */
        font-size: 1em !important;
        color: black !important;
        font-family: KaTeX_Main, "Times New Roman", serif !important;
        line-height: normal !important;
        /* 關鍵：必須使用 normal，避免外部 line-height 干擾 KaTeX 內部佈局 */
        text-indent: 0;
        text-rendering: auto;
        display: inline-block !important;
        vertical-align: baseline !important;
        font-weight: normal !important;
        font-style: normal !important;
        /* 確保文字渲染清晰 */
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
      
      /* 重要：KaTeX 內部元素的 line-height 必須為 normal（與編輯器一致） */
      /* 注意：不要設置 white-space 和 word-break，這些會破壞 KaTeX 的佈局 */
      .print-container .katex *,
      .katex * {
        color: inherit !important;
        line-height: normal !important;
        /* 關鍵：不設置 white-space 和 word-break，避免破壞分數和根號的佈局 */
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
        /* 不設置 white-space 和 word-break，避免破壞 KaTeX 內部佈局 */
      }
      
      .print-container .katex-mathml,
      .katex-mathml {
        display: none !important;
      }
      
      .print-container .katex svg,
      .katex svg {
        display: inline-block !important;
        vertical-align: baseline !important;
        /* 不設置 white-space 和 word-break，避免破壞 KaTeX 內部佈局 */
      }
      
      /* KaTeX 分數樣式 - 必須與編輯器中的 katex-vscode.css 完全一致 */
      /* 使用和編輯器相同的間距設置，確保分數線位置一致 */
      .print-container .katex .mfrac,
      .katex .mfrac {
        /* 與 katex-vscode.css 保持一致 */
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
        /* 完全與 katex-vscode.css 保持一致 */
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
      
      /* 確保 KaTeX 內部元素的 line-height 正確（與編輯器一致） */
      .print-container .katex *,
      .katex * {
        color: inherit !important;
        line-height: normal !important;
      }
      
      .print-container .katex .vlist-t,
      .katex .vlist-t {
        line-height: normal !important;
      }
      
      .print-container .katex .vlist-r,
      .katex .vlist-r {
        line-height: normal !important;
      }
      
      /* 確保分數內的數字清晰且為黑色 */
      .print-container .katex .mfrac .base,
      .katex .mfrac .base,
      .print-container .katex .base,
      .katex .base {
        color: black !important;
      }
      
      /* 行內公式樣式（與編輯器一致） */
      .print-container .katex:not(.katex-display),
      .katex:not(.katex-display) {
        display: inline-block !important;
        vertical-align: baseline !important;
        margin: 0 0.1em !important;
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
        /* 與 katex-vscode.css 保持一致 */
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
        /* 與 katex-vscode.css 保持一致 */
        margin-left: 0.27777778em !important;
        margin-right: -0.55555556em !important;
        position: relative !important;
      }
      
      /* 確保根號內容不溢出且正確顯示 */
      .print-container .katex .sqrt .vlist,
      .katex .sqrt .vlist {
        display: inline-block !important;
        overflow: visible !important;
      }
      
      /* 確保根號內的內容不超出邊界 */
      .print-container .katex .sqrt .vlist-r,
      .katex .sqrt .vlist-r {
        display: inline-block !important;
        overflow: visible !important;
      }
      
      /* 確保根號內的文字正確顯示 */
      .print-container .katex .sqrt .base,
      .katex .sqrt .base {
        display: inline-block !important;
        overflow: visible !important;
      }
      
      /* 確保所有文字顏色為黑色（在 KaTeX 規則之後，避免覆蓋分數線） */
      /* 重要：不要對 KaTeX 元素應用這些樣式 */
      .print-container p:not(.katex):not(.katex *),
      .print-container h1:not(.katex):not(.katex *),
      .print-container h2:not(.katex):not(.katex *),
      .print-container h3:not(.katex):not(.katex *),
      .print-container h4:not(.katex):not(.katex *),
      .print-container h5:not(.katex):not(.katex *),
      .print-container h6:not(.katex):not(.katex *),
      .print-container span:not(.katex):not(.katex *),
      .print-container div:not(.katex):not(.katex *),
      p:not(.katex):not(.katex *),
      h1:not(.katex):not(.katex *),
      h2:not(.katex):not(.katex *),
      h3:not(.katex):not(.katex *),
      h4:not(.katex):not(.katex *),
      h5:not(.katex):not(.katex *),
      h6:not(.katex):not(.katex *),
      span:not(.katex):not(.katex *),
      div:not(.katex):not(.katex *) {
        color: black !important;
      }
    }
    `
    }

    /**
     * 樣式沙盒：從編輯器實際 DOM 提取計算後的樣式
     * 確保列印預覽與編輯器完全一致
     * 
     * 這個函數從編輯器中實際渲染的 KaTeX 元素提取計算後的樣式，
     * 特別是針對根號和分數這些複雜元素，確保它們在列印預覽中的
     * 渲染與編輯器中完全一致。
     */
    const extractComputedStylesFromEditor = (editorContainer) => {
        const styleRules = []
        const katexElements = editorContainer.querySelectorAll('.katex')

        if (katexElements.length === 0) {
            return ''
        }

        // 從第一個 KaTeX 元素提取樣式作為基準
        const sampleElement = katexElements[0]
        const computedStyle = window.getComputedStyle(sampleElement)

        // 提取根號元素的計算樣式（關鍵：修復根號異常延長問題）
        const sqrtElements = editorContainer.querySelectorAll('.katex .sqrt')
        if (sqrtElements.length > 0) {
            // 使用第一個根號元素作為樣本
            const sqrtSample = sqrtElements[0]
            const sqrtComputed = window.getComputedStyle(sqrtSample)
            const sqrtRect = sqrtSample.getBoundingClientRect()

            // 提取根號內部的 vlist-t 樣式（這是根號的主要容器）
            const vlistT = sqrtSample.querySelector('.vlist-t')
            if (vlistT) {
                const vlistTComputed = window.getComputedStyle(vlistT)
                const vlistTRect = vlistT.getBoundingClientRect()

                // 提取根號內部的橫線元素（可能導致異常延長）
                const sqrtSign = sqrtSample.querySelector('.sqrt-sign')
                const sqrtSignComputed = sqrtSign ? window.getComputedStyle(sqrtSign) : null

                // 提取水平線（如果有）
                const horizontals = sqrtSample.querySelectorAll('.sqrt-sign > span')

                // #region agent log
                fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'usePrintPreview.js:616', message: '提取根號樣式', data: { sqrtWidth: sqrtRect.width, sqrtComputedWidth: sqrtComputed.width, vlistTWidth: vlistTRect.width, vlistTComputedWidth: vlistTComputed.width, sqrtSignWidth: sqrtSignComputed?.width, horizontalsCount: horizontals.length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
                // #endregion

                styleRules.push(`
/* 根號主容器 - 使用編輯器實際計算的樣式（防止異常延長） */
.katex .sqrt {
  display: ${sqrtComputed.display} !important;
  position: ${sqrtComputed.position} !important;
  overflow: ${sqrtComputed.overflow} !important;
  font-size: ${sqrtComputed.fontSize} !important;
  line-height: ${sqrtComputed.lineHeight} !important;
  width: ${sqrtComputed.width} !important;
  min-width: ${sqrtComputed.minWidth || 'auto'} !important;
  max-width: ${sqrtComputed.maxWidth || 'none'} !important;
  box-sizing: ${sqrtComputed.boxSizing} !important;
}

/* 根號的 vlist-t（垂直列表表格）- 關鍵樣式（防止水平線異常延長） */
.katex .sqrt > .vlist-t {
  display: ${vlistTComputed.display} !important;
  position: ${vlistTComputed.position} !important;
  overflow: ${vlistTComputed.overflow} !important;
  border-left-width: ${vlistTComputed.borderLeftWidth} !important;
  border-left-style: ${vlistTComputed.borderLeftStyle} !important;
  border-left-color: ${vlistTComputed.borderLeftColor} !important;
  table-layout: ${vlistTComputed.tableLayout || 'auto'} !important;
  width: ${vlistTComputed.width} !important;
  min-width: ${vlistTComputed.minWidth || '0'} !important;
  max-width: ${vlistTComputed.maxWidth || 'none'} !important;
  box-sizing: ${vlistTComputed.boxSizing || 'border-box'} !important;
}

/* 根號符號容器 - 防止水平線異常延長 */
.katex .sqrt .sqrt-sign {
  position: ${sqrtSignComputed?.position || 'relative'} !important;
  display: ${sqrtSignComputed?.display || 'inline-block'} !important;
  width: ${sqrtSignComputed?.width || 'auto'} !important;
  max-width: ${sqrtSignComputed?.maxWidth || 'none'} !important;
  overflow: ${sqrtSignComputed?.overflow || 'visible'} !important;
}

/* 根號水平線 - 關鍵：限制寬度防止異常延長 */
.katex .sqrt .sqrt-sign > span {
  max-width: 100% !important;
  overflow: hidden !important;
}`)
            }

            // 提取根號內的 root 元素樣式（根號符號本身）
            const rootElement = sqrtSample.querySelector('.root')
            if (rootElement) {
                const rootComputed = window.getComputedStyle(rootElement)
                styleRules.push(`
/* 根號符號本身 */
.katex .sqrt > .root {
  margin-left: ${rootComputed.marginLeft} !important;
  margin-right: ${rootComputed.marginRight} !important;
  position: ${rootComputed.position} !important;
  display: ${rootComputed.display} !important;
  width: ${rootComputed.width} !important;
  min-width: ${rootComputed.minWidth || 'auto'} !important;
  max-width: ${rootComputed.maxWidth || 'none'} !important;
}`)
            }

            // 提取根號內的 vlist-r（垂直列表行）
            const vlistR = sqrtSample.querySelector('.vlist-r')
            if (vlistR) {
                const vlistRComputed = window.getComputedStyle(vlistR)
                styleRules.push(`
/* 根號的 vlist-r - 防止內容溢出 */
.katex .sqrt .vlist-r {
  display: ${vlistRComputed.display} !important;
  overflow: ${vlistRComputed.overflow} !important;
  line-height: ${vlistRComputed.lineHeight} !important;
  width: ${vlistRComputed.width} !important;
  max-width: ${vlistRComputed.maxWidth || 'none'} !important;
  box-sizing: ${vlistRComputed.boxSizing || 'border-box'} !important;
}`)
            }

            // 提取根號內的 vlist（垂直列表）
            const vlist = sqrtSample.querySelector('.vlist')
            if (vlist) {
                const vlistComputed = window.getComputedStyle(vlist)
                styleRules.push(`
/* 根號的 vlist - 防止內容溢出導致水平線延長 */
.katex .sqrt .vlist {
  display: ${vlistComputed.display} !important;
  overflow: ${vlistComputed.overflow} !important;
  width: ${vlistComputed.width} !important;
  max-width: ${vlistComputed.maxWidth || 'none'} !important;
  box-sizing: ${vlistComputed.boxSizing || 'border-box'} !important;
}`)
            }

            // 提取根號內的 pstrut（支撐元素，影響高度）
            const pstrut = sqrtSample.querySelector('.pstrut')
            if (pstrut) {
                const pstrutComputed = window.getComputedStyle(pstrut)
                styleRules.push(`
/* 根號的 pstrut（支撐元素）- 限制寬度防止延長 */
.katex .sqrt .pstrut {
  min-width: ${pstrutComputed.minWidth || '0'} !important;
  width: ${pstrutComputed.width} !important;
  max-width: ${pstrutComputed.maxWidth || 'none'} !important;
}`)
            }

            // 添加額外的保護規則，防止水平線異常延長
            styleRules.push(`
/* 防止根號水平線異常延長 - 強制限制 */
.katex .sqrt .sqrt-sign,
.katex .sqrt .vlist-t,
.katex .sqrt .vlist-r,
.katex .sqrt .vlist {
  contain: layout !important;
}

/* 根號內的 SVG 和路徑（水平線） */
.katex .sqrt svg,
.katex .sqrt path {
  max-width: 100% !important;
  overflow: visible !important;
}`)
        }

        // 提取分數元素的計算樣式
        const mfracElements = editorContainer.querySelectorAll('.katex .mfrac')
        if (mfracElements.length > 0) {
            const mfracSample = mfracElements[0]
            const mfracComputed = window.getComputedStyle(mfracSample)

            // 提取分數線樣式
            const fracLine = mfracSample.querySelector('.frac-line')
            if (fracLine) {
                const fracLineComputed = window.getComputedStyle(fracLine)
                styleRules.push(`
/* 分數容器 */
.katex .mfrac {
  padding-top: ${mfracComputed.paddingTop} !important;
  padding-bottom: ${mfracComputed.paddingBottom} !important;
  display: ${mfracComputed.display} !important;
  vertical-align: ${mfracComputed.verticalAlign} !important;
}

/* 分數線 - 使用編輯器實際計算的樣式 */
.katex .mfrac > .frac-line {
  border-bottom-width: ${fracLineComputed.borderBottomWidth} !important;
  border-bottom-style: ${fracLineComputed.borderBottomStyle} !important;
  border-bottom-color: ${fracLineComputed.borderBottomColor} !important;
  margin-top: ${fracLineComputed.marginTop} !important;
  margin-bottom: ${fracLineComputed.marginBottom} !important;
  min-height: ${fracLineComputed.minHeight} !important;
  display: ${fracLineComputed.display} !important;
  width: ${fracLineComputed.width} !important;
}`)
            }
        }

        // 提取基礎 KaTeX 樣式
        styleRules.push(`
/* 基礎 KaTeX 樣式 - 使用編輯器實際計算的樣式 */
.katex {
  font-size: ${computedStyle.fontSize} !important;
  font-family: ${computedStyle.fontFamily} !important;
  line-height: ${computedStyle.lineHeight} !important;
  color: ${computedStyle.color} !important;
  display: ${computedStyle.display} !important;
  vertical-align: ${computedStyle.verticalAlign} !important;
}

/* 確保所有 KaTeX 內部元素使用相同的 line-height */
.katex * {
  line-height: ${computedStyle.lineHeight} !important;
}`)

        return styleRules.join('\n')
    }

    /**
     * 複製樣式表到 iframe
     */
    const copyStylesheets = (iframeDoc) => {
        const stylesheets = Array.from(document.styleSheets)
        let styleContent = ''


        // 首先確保 KaTeX CSS 被載入（必須在最前面）
        const katexCSSLink = iframeDoc.createElement('link')
        katexCSSLink.rel = 'stylesheet'
        katexCSSLink.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css'
        katexCSSLink.crossOrigin = 'anonymous'
        // 確保 KaTeX CSS 優先載入
        iframeDoc.head.insertBefore(katexCSSLink, iframeDoc.head.firstChild)

        // 嘗試載入 katex-vscode.css（編輯器使用的樣式）
        // 注意：這需要在 Vite 構建後才能訪問，所以我們會在內聯樣式中複製這些規則


        // 特別處理 katex-vscode.css - 確保分數樣式正確
        // 直接硬編碼 katex-vscode.css 的內容，確保樣式正確應用
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
                        // 嘗試訪問 length 來測試是否可以訪問
                        void sheet.cssRules.length
                        canAccessRules = true
                    }
                } catch (e) {
                    // 無法訪問 cssRules（可能是跨域樣式表）
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
                            // 如果無法訪問規則，作為外部 link 載入（不需要，因為已經硬編碼）
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
                // 靜默失敗，避免過多錯誤日誌
                console.warn('無法複製樣式表:', sheet.href || 'inline', e.message)
            }
        }

        // 注意：katexVscodeCSSContent 已經在函數開始時硬編碼了
        // 它會被單獨添加到 iframe head 的末尾（最高優先級），不需要合併到 styleContent

        // 返回樣式內容和 katex-vscode.css（如果有的話）
        return { styleContent, katexVscodeCSSContent }
    }

    /**
     * 添加浮水印到 iframe
     * 注意：確保不會重複添加，避免造成視覺問題
     */
    const addWatermark = (iframeDoc) => {
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
            watermark.style.opacity = (watermarkOpacity.value / 100).toString()
            watermark.style.zIndex = '-1'
            watermark.style.pointerEvents = 'none'
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
     * 預先渲染列印內容（在模式切換時調用）
     */
    const preRenderPrintContent = async (printModeSelection) => {
        const mode = printModeSelection.value || 'question-only'
        const cacheKeyValue = cacheKey(mode)

        // 如果已經有快取，跳過
        if (preRenderedCache.has(cacheKeyValue)) {
            return
        }

        let preRenderFrame = null
        try {
            // 等待 DOM 更新
            await nextTick()
            await new Promise(resolve => setTimeout(resolve, 300))

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

                await new Promise(resolve => {
                    preRenderFrame.onload = resolve
                    preRenderFrame.src = 'about:blank'
                })

                const iframeDoc = preRenderFrame.contentDocument || preRenderFrame.contentWindow.document
                const iframeWindow = preRenderFrame.contentWindow

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
            }
        } catch (error) {
            console.warn('預渲染失敗:', error)
        } finally {
            // 確保清理離屏 iframe，即使發生錯誤
            if (preRenderFrame && preRenderFrame.parentNode) {
                try {
                    document.body.removeChild(preRenderFrame)
                } catch (e) {
                    // 忽略清理錯誤
                }
            }
        }
    }

    /**
     * 清除預渲染快取
     */
    const clearPreRenderCache = () => {
        preRenderedCache.clear()
    }

    /**
     * 生成列印預覽內容
     */
    const generatePrintPreview = async (iframeDoc, iframeWindow, triggerPrint = false, useCache = false) => {
        // 等待 Vue 響應式更新完成
        await nextTick()
        // 增加等待時間，確保講義模式切換後的 DOM 更新完成
        await new Promise(resolve => setTimeout(resolve, 200))

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

        // 複製樣式表（返回包含 katex-vscode.css 的對象）
        const styleResult = copyStylesheets(iframeDoc)
        const styleContent = styleResult.styleContent || ''
        const katexVscodeCSSContent = styleResult.katexVscodeCSSContent || ''

        // 讀取 print.css 內容並內聯（因為 @import 在 iframe 中可能無法正確載入）
        let printCSSContent = ''
        try {
            // 嘗試從已載入的樣式表中提取 print.css 的 @media print 規則
            const allStylesheets = Array.from(document.styleSheets)
            for (const sheet of allStylesheets) {
                try {
                    const rules = Array.from(sheet.cssRules || [])
                    for (const rule of rules) {
                        // 查找 @media print 規則
                        if (rule.type === CSSRule.MEDIA_RULE && rule.media.mediaText.includes('print')) {
                            printCSSContent += rule.cssText + '\n'
                        }
                        // 查找 @import 規則，嘗試解析 print.css
                        if (rule.type === CSSRule.IMPORT_RULE && rule.href && rule.href.includes('print.css')) {
                        }
                    }
                } catch (e) {
                    // 跨域樣式表無法訪問，跳過
                }
            }
        } catch (e) {
        }

        // 如果沒有找到 print.css 內容，添加備用的內聯樣式
        if (!printCSSContent || printCSSContent.length < 100) {
            // 手動添加 print.css 的關鍵樣式（KaTeX 相關）
            // 手動添加 print.css 的關鍵樣式（KaTeX 相關，確保分數線可見）
            printCSSContent = `
            @media print {
              .katex {
                color: black !important;
                visibility: visible !important;
                font-family: KaTeX_Main, KaTeX_Math, KaTeX_Size1, KaTeX_Size2, KaTeX_Size3, KaTeX_Size4, "Times New Roman", serif !important;
                line-height: normal !important;
                font-size: 1em !important;
              }
              
              .prose .katex,
              .prose .katex * {
                line-height: normal !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              
              /* KaTeX 分數 - 必須與編輯器中的 katex-vscode.css 完全一致 */
              .katex .mfrac {
                padding-top: 0.158em !important;
                padding-bottom: 0.082em !important;
                display: inline-block !important;
                vertical-align: middle !important;
                color: black !important;
              }
              
              /* 分數線 - 完全使用編輯器中的 katex-vscode.css 設置 */
              .katex .mfrac > .frac-line,
              .katex .frac-line {
                /* 完全與 katex-vscode.css 保持一致 */
                border-bottom-width: 0.04em !important;
                min-height: 0.04em !important;
                margin-top: 0.188em !important;
                margin-bottom: 0.092em !important;
                border-bottom-color: black !important;
                border-bottom-style: solid !important;
                display: inline-block !important;
                width: 100% !important;
              }
              
              /* 確保 KaTeX 內部元素的 line-height 正確 */
              .katex * {
                line-height: normal !important;
              }
              
              .katex .vlist-t {
                line-height: normal !important;
              }
              
              .katex .vlist-r {
                line-height: normal !important;
              }
              
              /* 確保分數內的文字為黑色 */
              .katex .mfrac *,
              .katex .base {
                color: black !important;
              }
              
              .katex * {
                color: inherit !important;
                visibility: visible !important;
                line-height: inherit !important;
              }
              
              /* 確保 KaTeX 中的文字為黑色 */
              .katex .base,
              .katex .katex-html .base {
                color: black !important;
              }
              
              .katex .msupsub .mfrac {
                padding-top: 0.15em !important;
                padding-bottom: 0.15em !important;
              }
              
              .katex .msupsub .mfrac .frac-line {
                border-bottom-width: 0.06em !important;
                border-bottom-style: solid !important;
                border-bottom-color: black !important;
                min-height: 0.06em !important;
                height: 0.06em !important;
                display: block !important;
                margin-top: 0.1em !important;
                margin-bottom: 0.1em !important;
              }
              
              .katex .msupsub .mfrac .vlist-t2 {
                padding-top: 0.05em !important;
                padding-bottom: 0.05em !important;
              }
              
              /* 次方（上標）樣式 - 防止重疊 */
              .katex .msupsub {
                vertical-align: 0.3em !important;
                margin-left: 0.1em !important;
                display: inline-block !important;
                line-height: normal !important;
              }
              
              .katex .msupsub .vlist-t {
                display: inline-table !important;
                line-height: normal !important;
                border-collapse: separate !important;
                border-spacing: 0 !important;
                margin-top: 0.05em !important;
                margin-bottom: 0.05em !important;
              }
              
              .katex .msupsub .vlist-r {
                display: table-row !important;
                line-height: normal !important;
              }
              
              .katex .msupsub .sup {
                display: inline-block !important;
                vertical-align: baseline !important;
                line-height: normal !important;
              }
              
              /* 根號樣式 - 完全使用編輯器中的 katex-vscode.css 設置 */
              .katex .sqrt {
                display: inline-block !important;
                position: relative !important;
                overflow: visible !important;
              }
              
              .katex .sqrt > .vlist-t {
                /* 與 katex-vscode.css 保持一致 */
                border-left-width: 0.04em !important;
                display: inline-table !important;
                table-layout: auto !important;
                overflow: visible !important;
                position: relative !important;
              }
              
              .katex .sqrt .vlist-t .vlist-r .vlist .pstrut,
              .katex .sqrt .vlist-t .vlist-s {
                min-width: 0 !important;
              }
              
              .katex .sqrt .sqrt-sign {
                position: relative !important;
              }
              
              .katex .sqrt > .root {
                /* 與 katex-vscode.css 保持一致 */
                margin-left: 0.27777778em !important;
                margin-right: -0.55555556em !important;
                position: relative !important;
              }
              
              /* 確保根號內容不溢出 */
              .katex .sqrt .vlist {
                display: inline-block !important;
                overflow: visible !important;
              }
              
              /* 防止根號水平線異常延長 - 強制限制寬度 */
              .katex .sqrt .sqrt-sign {
                position: relative !important;
                max-width: 100% !important;
                overflow: hidden !important;
              }
              
              .katex .sqrt .sqrt-sign > span {
                max-width: 100% !important;
                overflow: hidden !important;
              }
              
              /* 根號內的 SVG 和路徑（水平線）- 限制寬度 */
              .katex .sqrt svg {
                max-width: 100% !important;
                overflow: visible !important;
              }
              
              .katex .sqrt path {
                max-width: 100% !important;
              }
              
              /* 使用 contain 屬性防止溢出 */
              .katex .sqrt {
                contain: layout style !important;
              }
              
              .katex .sqrt > .vlist-t {
                contain: layout style !important;
              }
              
              .katex-mathml {
                display: none !important;
                visibility: hidden !important;
              }
            }
            `
        }

        // 添加內聯樣式
        // 注意：順序很重要 - 先添加列印專用樣式（低優先級），然後添加其他樣式，最後添加 katex-vscode.css（最高優先級）
        // 這樣可以確保 katex-vscode.css 的樣式不被列印樣式覆蓋
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
        // 這確保列印預覽與編輯器的實際渲染完全一致
        const editorComputedStyles = extractComputedStylesFromEditor(editorContainer)
        // #region agent log
        fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'usePrintPreview.js:1398', message: '應用樣式沙盒提取的樣式', data: { hasComputedStyles: !!editorComputedStyles, computedStylesLength: editorComputedStyles?.length || 0 }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
        // #endregion
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
        await new Promise(resolve => {
            // 檢查所有 KaTeX 元素是否已完全渲染
            const katexElements = editorContainer.querySelectorAll('.katex')
            if (katexElements.length === 0) {
                resolve()
                return
            }

            let allRendered = true
            katexElements.forEach(el => {
                // 檢查 KaTeX 元素是否有完整的 HTML 結構
                const hasHtml = el.querySelector('.katex-html')
                if (!hasHtml || hasHtml.innerHTML.trim().length === 0) {
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

        // 【關鍵改進】先修復再克隆，避免在修復過程中破壞結構
        // 方案：直接在原始容器上標記，然後一次性克隆
        const clone = editorContainer.cloneNode(true)

        // 修復 KaTeX 元素（特別是根號）- 在 prepareCloneForPrint 之前
        // 這樣可以確保根號結構在清理之前就完整保留
        repairKatexElements(editorContainer, clone)

        // 準備克隆內容用於列印（在修復後清理，但不會破壞已修復的根號）
        prepareCloneForPrint(clone)

        // 注意：暫時禁用 repairTextContent，因為它可能導致重複或衝突
        // repairTextContent(editorContainer, clone)

        // 確保容器是空的，然後添加克隆內容（避免重複）
        if (container.firstChild) {
            container.removeChild(container.firstChild)
        }
        container.appendChild(clone)

        // 在 iframe 中查找並應用樣式（只應用一次，避免重複）
        await nextTick()

        // 【新架構】在 iframe 中直接重建根號和次方元素
        // 這確保這些複雜元素的完整結構不會被破壞
        // 必須在樣式載入後、但在應用其他樣式之前執行
        rebuildComplexKatexElementsInIframe(editorContainer, iframeDoc, iframeWindow)

        // 等待重建完成
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

        // 【關鍵修復】確保根號元素的樣式正確應用，防止水平線異常延長
        const iframeSqrtElements = iframeDoc.querySelectorAll('.katex .sqrt')
        if (iframeSqrtElements.length > 0) {
            // #region agent log
            fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'usePrintPreview.js:1547', message: '修復 iframe 中的根號元素', data: { sqrtCount: iframeSqrtElements.length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
            // #endregion

            // 從編輯器獲取原始根號元素的完整結構作為參考
            const originalSqrtElements = editorContainer.querySelectorAll('.katex .sqrt')

            iframeSqrtElements.forEach((sqrtEl, index) => {
                // 嘗試從原始元素獲取正確的寬度
                const originalSqrt = originalSqrtElements[index]
                if (originalSqrt) {
                    const originalRect = originalSqrt.getBoundingClientRect()
                    const originalComputed = window.getComputedStyle(originalSqrt)

                    // #region agent log
                    fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'usePrintPreview.js:1560', message: '根號寬度對比', data: { index, originalWidth: originalRect.width, originalComputedWidth: originalComputed.width }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
                    // #endregion

                    // 如果原始元素有明確的寬度，應用到克隆元素
                    if (originalRect.width > 0 && originalRect.width < 1000) {
                        sqrtEl.style.setProperty('width', `${originalRect.width}px`, 'important')
                        sqrtEl.style.setProperty('max-width', `${originalRect.width}px`, 'important')
                    }
                }

                // 確保根號容器的樣式正確
                if (originalSqrt) {
                    const originalComputed = window.getComputedStyle(originalSqrt)
                    sqrtEl.style.setProperty('overflow', originalComputed.overflow || 'visible', 'important')
                    sqrtEl.style.setProperty('position', originalComputed.position || 'relative', 'important')
                    sqrtEl.style.setProperty('display', originalComputed.display || 'inline-block', 'important')
                } else {
                    sqrtEl.style.setProperty('overflow', 'visible', 'important')
                    sqrtEl.style.setProperty('position', 'relative', 'important')
                }

                // 修復 vlist-t（根號的主要容器）- 關鍵修復點
                const vlistT = sqrtEl.querySelector('.vlist-t')
                if (vlistT) {
                    if (originalSqrt) {
                        const originalVlistT = originalSqrt.querySelector('.vlist-t')
                        if (originalVlistT) {
                            const originalVlistTComputed = window.getComputedStyle(originalVlistT)
                            const originalVlistTRect = originalVlistT.getBoundingClientRect()

                            // 使用原始元素的樣式
                            vlistT.style.setProperty('display', originalVlistTComputed.display || 'inline-table', 'important')
                            vlistT.style.setProperty('overflow', originalVlistTComputed.overflow || 'visible', 'important')
                            vlistT.style.setProperty('table-layout', originalVlistTComputed.tableLayout || 'auto', 'important')
                            vlistT.style.setProperty('position', originalVlistTComputed.position || 'relative', 'important')

                            if (originalVlistTRect.width > 0 && originalVlistTRect.width < 1000) {
                                vlistT.style.setProperty('width', `${originalVlistTRect.width}px`, 'important')
                                vlistT.style.setProperty('max-width', `${originalVlistTRect.width}px`, 'important')
                            }
                        }
                    } else {
                        vlistT.style.setProperty('overflow', 'visible', 'important')
                        vlistT.style.setProperty('table-layout', 'auto', 'important')
                    }
                }

                // 修復 sqrt-sign（根號符號容器，包含水平線）- 最關鍵的修復點
                const sqrtSign = sqrtEl.querySelector('.sqrt-sign')
                if (sqrtSign) {
                    if (originalSqrt) {
                        const originalSqrtSign = originalSqrt.querySelector('.sqrt-sign')
                        if (originalSqrtSign) {
                            const originalSqrtSignComputed = window.getComputedStyle(originalSqrtSign)
                            // 使用原始元素的樣式
                            sqrtSign.style.setProperty('max-width', originalSqrtSignComputed.maxWidth || '100%', 'important')
                            sqrtSign.style.setProperty('overflow', originalSqrtSignComputed.overflow || 'visible', 'important')
                            sqrtSign.style.setProperty('display', originalSqrtSignComputed.display || 'inline-block', 'important')
                        } else {
                            sqrtSign.style.setProperty('max-width', '100%', 'important')
                            sqrtSign.style.setProperty('overflow', 'hidden', 'important')
                            sqrtSign.style.setProperty('display', 'inline-block', 'important')
                        }
                    } else {
                        sqrtSign.style.setProperty('max-width', '100%', 'important')
                        sqrtSign.style.setProperty('overflow', 'hidden', 'important')
                        sqrtSign.style.setProperty('display', 'inline-block', 'important')
                    }

                    // 限制水平線元素的寬度 - 直接限制為父容器寬度
                    const horizontalSpans = sqrtSign.querySelectorAll('> span')
                    horizontalSpans.forEach(span => {
                        span.style.setProperty('max-width', '100%', 'important')
                        span.style.setProperty('overflow', 'hidden', 'important')
                        span.style.setProperty('display', 'inline-block', 'important')
                    })
                }

                // 修復 SVG 路徑（水平線）- 這是根號水平線的關鍵元素
                const svg = sqrtEl.querySelector('svg')
                if (svg) {
                    const svgRect = svg.getBoundingClientRect()
                    const sqrtRect = sqrtEl.getBoundingClientRect()

                    // #region agent log
                    fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'usePrintPreview.js:1665', message: '修復根號 SVG', data: { index, svgWidth: svgRect.width, sqrtWidth: sqrtRect.width, svgViewBox: svg.getAttribute('viewBox'), svgWidthAttr: svg.getAttribute('width') }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'J' }) }).catch(() => { });
                    // #endregion

                    if (originalSqrt) {
                        const originalSvg = originalSqrt.querySelector('svg')
                        if (originalSvg) {
                            const originalSvgRect = originalSvg.getBoundingClientRect()
                            const originalSvgWidth = originalSvg.getAttribute('width')
                            const originalViewBox = originalSvg.getAttribute('viewBox')

                            // #region agent log
                            fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'usePrintPreview.js:1675', message: '原始 SVG 屬性', data: { index, originalSvgWidth, originalViewBox, originalSvgRectWidth: originalSvgRect.width }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'K' }) }).catch(() => { });
                            // #endregion

                            // 使用原始 SVG 的屬性
                            if (originalSvgWidth) {
                                svg.setAttribute('width', originalSvgWidth)
                                svg.style.setProperty('width', originalSvgWidth, 'important')
                            } else if (originalSvgRect.width > 0 && originalSvgRect.width < 1000) {
                                svg.setAttribute('width', originalSvgRect.width.toString())
                                svg.style.setProperty('width', `${originalSvgRect.width}px`, 'important')
                            }

                            if (originalViewBox) {
                                svg.setAttribute('viewBox', originalViewBox)
                            }

                            svg.style.setProperty('max-width', '100%', 'important')
                            svg.style.setProperty('overflow', 'hidden', 'important')
                        }
                    } else {
                        // 如果沒有原始元素參考，根據根號寬度限制
                        if (sqrtRect.width > 0) {
                            // 如果 SVG 寬度異常大，限制它
                            if (svgRect.width > sqrtRect.width * 2) {
                                const limitedWidth = sqrtRect.width * 1.2 // 稍微寬一點以容納根號符號
                                svg.setAttribute('width', limitedWidth.toString())
                                svg.style.setProperty('width', `${limitedWidth}px`, 'important')
                            }
                            svg.style.setProperty('max-width', `${sqrtRect.width * 1.5}px`, 'important')
                        }
                        svg.style.setProperty('overflow', 'hidden', 'important')
                    }

                    // 檢查並修復 viewBox（這可能導致 SVG 異常延長）
                    if (originalSvg) {
                        const originalViewBox = originalSvg.getAttribute('viewBox')
                        if (originalViewBox) {
                            // 確保使用原始 viewBox
                            if (svg.getAttribute('viewBox') !== originalViewBox) {
                                svg.setAttribute('viewBox', originalViewBox)
                            }
                        }
                    } else {
                        // 如果沒有原始元素，檢查 viewBox 是否異常
                        const viewBox = svg.getAttribute('viewBox')
                        if (viewBox) {
                            const viewBoxParts = viewBox.split(' ')
                            if (viewBoxParts.length >= 4) {
                                const viewBoxWidth = parseFloat(viewBoxParts[2])
                                // 如果 viewBox 寬度異常大，記錄但不要修改（可能導致破壞）
                                if (viewBoxWidth > 1000) {
                                    // #region agent log
                                    fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'usePrintPreview.js:1708', message: '異常 viewBox 檢測', data: { index, viewBox, viewBoxWidth }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'L' }) }).catch(() => { });
                                    // #endregion
                                }
                            }
                        }
                    }
                }

                // 修復所有路徑元素
                const paths = sqrtEl.querySelectorAll('path')
                paths.forEach(path => {
                    path.style.setProperty('max-width', '100%', 'important')
                    // 檢查路徑的 d 屬性是否包含異常長的線
                    const pathD = path.getAttribute('d') || ''
                    if (pathD.includes('h') || pathD.includes('H')) {
                        // 水平線命令，可能需要檢查長度
                        // 但通常通過限制 SVG 寬度已經足夠
                    }
                })
            })
        }

        // 【修復次方（上標）重疊問題】
        const iframeMsupsubElements = iframeDoc.querySelectorAll('.katex .msupsub')
        if (iframeMsupsubElements.length > 0) {
            // #region agent log
            fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'usePrintPreview.js:1615', message: '修復 iframe 中的次方元素', data: { msupsubCount: iframeMsupsubElements.length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'F' }) }).catch(() => { });
            // #endregion

            const originalMsupsubElements = editorContainer.querySelectorAll('.katex .msupsub')

            iframeMsupsubElements.forEach((msupsubEl, index) => {
                const originalMsupsub = originalMsupsubElements[index]

                if (originalMsupsub) {
                    const originalComputed = window.getComputedStyle(originalMsupsub)
                    const originalRect = originalMsupsub.getBoundingClientRect()
                    const iframeComputed = iframeWindow.getComputedStyle(msupsubEl)
                    const iframeRect = msupsubEl.getBoundingClientRect()

                    // #region agent log
                    fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'usePrintPreview.js:1720', message: '次方樣式對比', data: { index, originalVerticalAlign: originalComputed.verticalAlign, iframeVerticalAlign: iframeComputed.verticalAlign, originalDisplay: originalComputed.display, iframeDisplay: iframeComputed.display }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'M' }) }).catch(() => { });
                    // #endregion

                    // 使用原始元素的實際計算樣式
                    msupsubEl.style.setProperty('vertical-align', originalComputed.verticalAlign || '0.3em', 'important')
                    msupsubEl.style.setProperty('line-height', originalComputed.lineHeight || 'normal', 'important')
                    msupsubEl.style.setProperty('display', originalComputed.display || 'inline-block', 'important')
                    msupsubEl.style.setProperty('position', originalComputed.position || 'relative', 'important')
                } else {
                    // 如果沒有原始元素，使用默認值
                    msupsubEl.style.setProperty('vertical-align', '0.3em', 'important')
                    msupsubEl.style.setProperty('line-height', 'normal', 'important')
                    msupsubEl.style.setProperty('display', 'inline-block', 'important')
                }

                // 修復上標容器
                const vlistT = msupsubEl.querySelector('.vlist-t')
                if (vlistT) {
                    if (originalMsupsub) {
                        const originalVlistT = originalMsupsub.querySelector('.vlist-t')
                        if (originalVlistT) {
                            const originalVlistTComputed = window.getComputedStyle(originalVlistT)
                            vlistT.style.setProperty('display', originalVlistTComputed.display || 'inline-table', 'important')
                            vlistT.style.setProperty('line-height', originalVlistTComputed.lineHeight || 'normal', 'important')
                            vlistT.style.setProperty('border-collapse', originalVlistTComputed.borderCollapse || 'separate', 'important')
                            vlistT.style.setProperty('border-spacing', originalVlistTComputed.borderSpacing || '0', 'important')
                            vlistT.style.setProperty('vertical-align', originalVlistTComputed.verticalAlign || 'baseline', 'important')
                        }
                    } else {
                        vlistT.style.setProperty('display', 'inline-table', 'important')
                        vlistT.style.setProperty('line-height', 'normal', 'important')
                        vlistT.style.setProperty('border-collapse', 'separate', 'important')
                        vlistT.style.setProperty('border-spacing', '0', 'important')
                    }
                }

                // 修復上標行
                const vlistR = msupsubEl.querySelectorAll('.vlist-r')
                vlistR.forEach((vlistRItem, rIndex) => {
                    vlistRItem.style.setProperty('display', 'table-row', 'important')
                    vlistRItem.style.setProperty('line-height', 'normal', 'important')

                    // 確保上標內容正確對齊
                    const supElements = vlistRItem.querySelectorAll('.sup')
                    supElements.forEach(sup => {
                        sup.style.setProperty('display', 'inline-block', 'important')
                        sup.style.setProperty('vertical-align', 'baseline', 'important')
                        sup.style.setProperty('line-height', 'normal', 'important')
                        sup.style.setProperty('position', 'relative', 'important')
                    })
                })
            })
        }

        // 確保 body 是空的，然後添加容器（避免重複）
        iframeDoc.body.innerHTML = ''

        // 添加容器
        iframeDoc.body.appendChild(container)

        // 最後添加浮水印（確保浮水印在最上層，不會影響內容）
        addWatermark(iframeDoc)

        // 等待 KaTeX CSS 和字體載入完成（確保字符正確顯示）
        await new Promise(resolve => {
            // 檢查 KaTeX CSS 是否已載入
            const checkKatexLoaded = () => {
                // 使用容器內的元素來檢查，避免添加額外的測試元素
                const existingKatex = iframeDoc.querySelector('.katex')
                if (existingKatex) {
                    const styles = iframeWindow.getComputedStyle(existingKatex)
                    const fontFamily = styles.fontFamily
                    return fontFamily.includes('KaTeX') ||
                        (katexCSSLink.sheet && katexCSSLink.sheet.cssRules.length > 0)
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
                const isKatexLoaded = fontFamily.includes('KaTeX') ||
                    (katexCSSLink.sheet && katexCSSLink.sheet.cssRules.length > 0)
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
     * 清理殘留的 iframe（更積極的清理策略）
     */
    const cleanupExistingFrames = () => {
        try {
            // 查找所有隱藏的 iframe（用於列印預覽的）
            const allIframes = Array.from(document.querySelectorAll('iframe'))
            const hiddenFrames = allIframes.filter(iframe => {
                try {
                    const rect = iframe.getBoundingClientRect()
                    const style = window.getComputedStyle(iframe)
                    // 查找所有離屏或隱藏的 iframe
                    return (rect.width === 0 && rect.height === 0) ||
                        (iframe.style.position === 'absolute' && iframe.style.left === '-9999px') ||
                        (iframe.style.position === 'fixed' && (rect.width === 0 || rect.height === 0))
                } catch (e) {
                    // 如果無法訪問，嘗試移除
                    return true
                }
            })

            hiddenFrames.forEach(frame => {
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

            // 使用之前已經檢查過的快取（cacheKeyValue 已在前面聲明）
            if (cached && cached.html) {

                // 使用快取內容
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
                await new Promise(resolve => {
                    const checkLoaded = () => {
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
                            setTimeout(resolve, 100)
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
        print,
        preRenderPrintContent,
        clearPreRenderCache
    }
}
