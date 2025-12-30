import { onMounted, onUnmounted } from 'vue'

/**
 * 鍵盤快捷鍵選項
 */
export interface KeyboardShortcutsOptions {
  onSelectAll?: () => void
  editorSelector?: string
}

/**
 * 鍵盤快捷鍵處理 Composable
 * 處理全局鍵盤快捷鍵事件
 */
export function useKeyboardShortcuts(options: KeyboardShortcutsOptions = {}) {
  const {
    onSelectAll = null,
    editorSelector = '.continuous-editor, .block-editor-container'
  } = options

  /**
   * 處理鍵盤快捷鍵
   */
  const handleKeyboardShortcuts = (event: KeyboardEvent): void => {
    // 檢查是否按下了 Ctrl (Windows/Linux) 或 Cmd (Mac)
    const isModifierPressed = event.ctrlKey || event.metaKey

    if (!isModifierPressed) return

    const key = event.key.toLowerCase()

    // Ctrl+A: 全選
    if (key === 'a') {
      event.preventDefault()

      if (onSelectAll) {
        onSelectAll()
      } else {
        // 默認行為：選擇編輯器容器內的內容
        const selection = window.getSelection()
        if (!selection) return

        const range = document.createRange()
        const editorContainer = document.querySelector(editorSelector)
        if (editorContainer) {
          range.selectNodeContents(editorContainer)
          selection.removeAllRanges()
          selection.addRange(range)
        }
      }
      return
    }

    // 其他快捷鍵可以在這裡擴展
    // Ctrl+X, Ctrl+C, Ctrl+V 等由瀏覽器默認處理
  }

  /**
   * 設置鍵盤事件監聽器
   */
  const setupKeyboardShortcuts = (): void => {
    window.addEventListener('keydown', handleKeyboardShortcuts)
  }

  /**
   * 移除鍵盤事件監聽器
   */
  const cleanupKeyboardShortcuts = (): void => {
    window.removeEventListener('keydown', handleKeyboardShortcuts)
  }

  // 自動設置和清理
  onMounted(() => {
    setupKeyboardShortcuts()
  })

  onUnmounted(() => {
    cleanupKeyboardShortcuts()
  })

  return {
    handleKeyboardShortcuts,
    setupKeyboardShortcuts,
    cleanupKeyboardShortcuts
  }
}
