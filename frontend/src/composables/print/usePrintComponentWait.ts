/**
 * usePrintComponentWait
 * 處理等待組件更新完成的邏輯
 */

import type { Ref } from 'vue'
import type { PrintMode } from '../usePrintPreview.types'
import { usePrintEditorUtils } from './usePrintEditorUtils'

export interface ComponentWaitOptions {
  printPreparationMessage?: Ref<string>
}

export function usePrintComponentWait(options: ComponentWaitOptions = {}) {
  const { printPreparationMessage } = options
  const { getEditorContainer } = usePrintEditorUtils()

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
      if (printPreparationMessage) {
        printPreparationMessage.value = `正在檢查組件狀態... (${retryCount}/${maxRetries})`
      }
    }

    return isReady
  }

  return {
    waitForComponentUpdate,
  }
}
