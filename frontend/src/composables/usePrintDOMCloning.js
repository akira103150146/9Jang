import { logger } from '../utils/logger'
import { usePrintStyleExtraction } from './usePrintStyleExtraction'
import { usePrintKatexRepair } from './usePrintKatexRepair'

/**
 * DOM 克隆 Composable
 * 負責克隆編輯器 DOM 並準備用於列印
 */
export function usePrintDOMCloning() {
  const { 
    applyPrintStylesToSection, 
    applyPrintStylesToLabel, 
    applyPrintStylesToContent 
  } = usePrintStyleExtraction()
  
  const { repairKatexElements } = usePrintKatexRepair()

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
   * 克隆編輯器內容並修復
   */
  const cloneEditorContent = async (editorContainer) => {
    // 先等待 KaTeX 完全渲染完成
    await new Promise(resolve => {
      const katexElements = editorContainer.querySelectorAll('.katex')
      if (katexElements.length === 0) {
        resolve()
        return
      }
      
      let allRendered = true
      katexElements.forEach(el => {
        const hasHtml = el.querySelector('.katex-html')
        if (!hasHtml || hasHtml.innerHTML.trim().length === 0) {
          allRendered = false
        }
      })
      
      if (allRendered) {
        resolve()
      } else {
        setTimeout(() => resolve(), 100)
      }
    })
    
    // 克隆整個容器
    const clone = editorContainer.cloneNode(true)
    
    // 修復 KaTeX 元素（特別是根號）
    repairKatexElements(editorContainer, clone)
    
    // 準備克隆內容用於列印
    prepareCloneForPrint(clone)
    
    return clone
  }

  return {
    prepareCloneForPrint,
    cloneEditorContent
  }
}
