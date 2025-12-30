import { logger } from '../utils/logger'
import type { EditorContainer, SqrtSvgElement } from './usePrintPreview.types'

/**
 * KaTeX 修復 Composable
 * 負責修復克隆後 KaTeX 元素的結構完整性，特別是根號和次方元素
 */
export function usePrintKatexRepair() {
  /**
   * 修復克隆後的 KaTeX 元素，確保所有內容都正確保留
   * 特別處理根號元素，防止水平線異常延長和內容丟失
   */
  const repairKatexElements = (
    editorContainer: EditorContainer | null,
    clone: EditorContainer
  ): number => {
    if (!editorContainer) {
      return 0
    }

    const originalKatexElements = editorContainer.querySelectorAll('.katex')
    const clonedKatexElements = clone.querySelectorAll('.katex')
    let repairedCount = 0

    // 提前定義 originalSqrtElements
    const originalSqrtElements = Array.from(originalKatexElements).filter((el) => {
      return el.querySelector('.sqrt') !== null
    })

    // 特別處理根號元素 - 強制重新克隆所有包含根號的 KaTeX 元素
    if (originalSqrtElements.length > 0) {
      originalSqrtElements.forEach((originalKatex) => {
        let clonedKatex: HTMLElement | null = null
        const originalParent = originalKatex.parentElement
        if (!originalParent) return

        const originalIndex = Array.from(originalParent.children).indexOf(originalKatex)
        const originalSqrt = originalKatex.querySelector('.sqrt')
        const originalSqrtText = originalSqrt ? originalSqrt.textContent || '' : ''

        // 嘗試通過索引找到
        if (originalIndex >= 0 && originalIndex < clonedKatexElements.length) {
          clonedKatex = clonedKatexElements[originalIndex] as HTMLElement
        } else {
          // 如果索引不匹配，通過內容查找
          clonedKatex = (Array.from(clonedKatexElements).find((el) => {
            const sqrt = el.querySelector('.sqrt')
            return sqrt && sqrt.textContent === originalSqrtText
          }) as HTMLElement) || null
        }

        if (clonedKatex && originalKatex) {
          const clonedParent = clonedKatex.parentElement

          if (clonedParent) {
            try {
              // 使用 cloneNode 確保 SVG 和所有特殊元素完整保留
              const newKatex = originalKatex.cloneNode(true) as HTMLElement

              if (newKatex) {
                // 驗證克隆是否完整
                const clonedSqrt = newKatex.querySelector('.sqrt')
                const originalSqrt = originalKatex.querySelector('.sqrt')

                if (originalSqrt && clonedSqrt) {
                  // 驗證 SVG 是否完整
                  const originalSvg = originalSqrt.querySelector('svg') as SVGElement | null
                  const clonedSvg = clonedSqrt.querySelector('svg') as SVGElement | null

                  // 如果 SVG 缺失，嘗試使用 outerHTML（雖然可能不完美）
                  if (originalSvg && !clonedSvg) {
                    logger.warn('克隆後 SVG 缺失，嘗試使用 outerHTML 方法')
                    const tempDiv = document.createElement('div')
                    tempDiv.innerHTML = originalKatex.outerHTML
                    const fallbackKatex = tempDiv.firstElementChild as HTMLElement
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
              logger.warn('修復根號元素時發生錯誤', e)
            }
          }
        }
      })
    }

    return repairedCount
  }

  /**
   * 在 iframe 中直接從原始 DOM 重建根號和次方元素
   * 這確保這些複雜元素的完整結構不會被破壞
   */
  const rebuildComplexKatexElementsInIframe = (
    editorContainer: EditorContainer | null,
    iframeDoc: Document,
    iframeWindow: Window
  ): number => {
    if (!editorContainer) {
      return 0
    }

    const originalKatexElements = editorContainer.querySelectorAll('.katex')
    const iframeKatexElements = iframeDoc.querySelectorAll('.katex')

    if (originalKatexElements.length !== iframeKatexElements.length) {
      logger.warn('原始和 iframe 中的 KaTeX 元素數量不匹配', {
        original: originalKatexElements.length,
        iframe: iframeKatexElements.length
      })
    }

    let rebuiltCount = 0

    originalKatexElements.forEach((originalKatex, index) => {
      const iframeKatex = iframeKatexElements[index] as HTMLElement | null
      if (!iframeKatex) return

      const hasSqrt = originalKatex.querySelector('.sqrt')
      const hasMsupsub = originalKatex.querySelector('.msupsub')

      // 如果包含根號或次方，直接從原始元素重新克隆到 iframe
      if (hasSqrt || hasMsupsub) {
        try {
          // 從原始元素深層克隆
          const newKatex = originalKatex.cloneNode(true) as HTMLElement

          // 驗證克隆是否完整
          if (hasSqrt) {
            const originalSqrt = originalKatex.querySelector('.sqrt')
            const newSqrt = newKatex.querySelector('.sqrt')
            const originalSvg = originalSqrt?.querySelector('svg') as SVGElement | null
            const newSvg = newSqrt?.querySelector('svg') as SVGElement | null

            // 如果 SVG 缺失，說明克隆失敗，跳過
            if (originalSvg && !newSvg) {
              logger.warn(`根號 SVG 克隆失敗（索引 ${index}），跳過重建`)
              return
            }

            // 驗證 SVG 結構完整性
            if (originalSvg && newSvg) {
              const originalViewBox = (originalSvg as SqrtSvgElement).getAttribute('viewBox')
              const newViewBox = (newSvg as SqrtSvgElement).getAttribute('viewBox')

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
              logger.warn(`次方元素克隆失敗（索引 ${index}），跳過重建`)
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
          logger.warn(`重建 KaTeX 元素失敗（索引 ${index}）`, e)
        }
      }
    })

    if (rebuiltCount > 0) {
      logger.debug(`成功重建 ${rebuiltCount} 個包含根號或次方的 KaTeX 元素`)
    }

    return rebuiltCount
  }

  return {
    repairKatexElements,
    rebuildComplexKatexElementsInIframe
  }
}
