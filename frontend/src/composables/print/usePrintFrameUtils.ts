/**
 * usePrintFrameUtils
 * 處理 iframe 相關的工具函數
 */

export function usePrintFrameUtils() {
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
   * 創建列印 iframe
   */
  const createPrintFrame = (): HTMLIFrameElement => {
    const printFrame = document.createElement('iframe')
    printFrame.style.position = 'fixed'
    printFrame.style.right = '0'
    printFrame.style.bottom = '0'
    printFrame.style.width = '0'
    printFrame.style.height = '0'
    printFrame.style.border = '0'
    document.body.appendChild(printFrame)
    return printFrame
  }

  /**
   * 創建預渲染 iframe
   */
  const createPreRenderFrame = (): HTMLIFrameElement => {
    const preRenderFrame = document.createElement('iframe')
    preRenderFrame.style.position = 'absolute'
    preRenderFrame.style.left = '-9999px'
    preRenderFrame.style.width = '0'
    preRenderFrame.style.height = '0'
    preRenderFrame.style.border = '0'
    document.body.appendChild(preRenderFrame)
    return preRenderFrame
  }

  /**
   * 等待 iframe 載入
   */
  const waitForIframeLoad = (iframe: HTMLIFrameElement): Promise<void> => {
    return new Promise<void>((resolve) => {
      iframe.onload = () => resolve()
      iframe.src = 'about:blank'
    })
  }

  return {
    cleanupExistingFrames,
    createPrintFrame,
    createPreRenderFrame,
    waitForIframeLoad,
  }
}
