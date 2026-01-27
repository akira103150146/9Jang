/**
 * usePrintEditorUtils
 * 處理編輯器相關的工具函數
 */

import type { EditorContainer } from '../usePrintPreview.types'

export function usePrintEditorUtils() {
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
    const hasText = (editorContainer.textContent?.trim().length || 0) > 0
    const hasProseMirror = editorContainer.querySelector('.ProseMirror')
    return hasText || !!hasProseMirror
  }

  /**
   * 檢查 KaTeX 是否已載入
   */
  const checkKatexLoaded = async (
    iframeDoc: Document,
    iframeWindow: Window,
    maxAttempts = 20,
    intervalMs = 50
  ): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      const checkLoaded = (): boolean => {
        // 使用容器內的元素來檢查，避免添加額外的測試元素
        const existingKatex = iframeDoc.querySelector('.katex')
        if (existingKatex) {
          const styles = iframeWindow.getComputedStyle(existingKatex)
          const fontFamily = styles.fontFamily
          return (
            fontFamily.includes('KaTeX') ||
            (iframeDoc.querySelector('link[href*="katex"]') as HTMLLinkElement | null)?.sheet?.cssRules.length !== undefined
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
          fontFamily.includes('KaTeX') ||
          (iframeDoc.querySelector('link[href*="katex"]') as HTMLLinkElement | null)?.sheet?.cssRules.length !== undefined
        iframeDoc.body.removeChild(testEl)
        return isKatexLoaded
      }

      // 等待最多 maxAttempts * intervalMs 毫秒
      let attempts = 0
      const interval = setInterval(() => {
        attempts++
        if (checkLoaded() || attempts >= maxAttempts) {
          clearInterval(interval)
          resolve(checkLoaded())
        }
      }, intervalMs)
    })
  }

  return {
    getEditorContainer,
    hasEditorContent,
    checkKatexLoaded,
  }
}
