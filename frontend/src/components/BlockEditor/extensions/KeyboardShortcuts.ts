import { Extension, type ExtensionConfig } from '@tiptap/core'
import type { Editor } from '@tiptap/core'

/**
 * 鍵盤快捷鍵擴展配置選項
 */
export interface KeyboardShortcutsOptions {
  [key: string]: unknown
}

/**
 * Keyboard Shortcuts 擴展
 */
export const KeyboardShortcuts = Extension.create<KeyboardShortcutsOptions, ExtensionConfig>({
  name: 'keyboardShortcuts',

  addKeyboardShortcuts() {
    return {
      // Shift+Enter: 插入硬換行(br)
      'Shift-Enter': ({ editor }: { editor: Editor }): boolean => {
        return editor.chain().focus().setHardBreak().run()
      },

      // Backspace: 在空區塊開頭時刪除區塊
      'Backspace': ({ editor }: { editor: Editor }): boolean => {
        const { state } = editor
        const { $from } = state.selection

        // 如果在區塊開頭且區塊為空
        if ($from.parentOffset === 0 && $from.parent.textContent.length === 0) {
          const nodeType = $from.parent.type.name

          // 如果是段落，不刪除（讓預設行為處理）
          if (nodeType === 'paragraph') {
            return false
          }

          // 其他類型的空區塊，轉換為段落
          return editor.chain().focus().setParagraph().run()
        }

        return false
      },

      // Delete: 處理 Delete 鍵，避免刪除到前面的元素
      'Delete': ({ editor }: { editor: Editor }): boolean => {
        const { state } = editor
        const { $from, $to } = state.selection

        // 如果有選中內容，讓預設行為處理
        if ($from.pos !== $to.pos) {
          return false
        }

        // 檢查游標是否在段落末尾
        const parentTextLength = $from.parent.textContent.length
        const parentOffset = $from.parentOffset

        // 只有在段落末尾時才檢查下一個節點
        // 如果游標在段落中間，應該正常刪除文字
        if (parentOffset >= parentTextLength) {
          // 檢查游標深度，避免在頂層節點時出錯
          const depth = $from.depth

          let nextSiblingPos: number | null = null
          let nextSiblingNode = null

          if (depth > 0) {
            // 不在頂層，可以安全使用 before(-1)
            try {
              const paragraphPos = $from.before(-1)
              const paragraphNode = $from.node(-1)
              nextSiblingPos = paragraphPos + paragraphNode.nodeSize
            } catch (e) {
              return false
            }
          } else {
            // 在頂層，直接使用 after() 獲取下一個位置
            nextSiblingPos = $from.after()
          }

          if (nextSiblingPos !== null && nextSiblingPos < state.doc.content.size) {
            nextSiblingNode = state.doc.nodeAt(nextSiblingPos)

            // 如果下一個節點是原子節點（如 image、questionBlock 等），不刪除
            if (nextSiblingNode && nextSiblingNode.isAtom) {
              return true // 阻止預設行為，避免刪除原子節點
            }
          }
        }

        return false // 使用預設行為
      },

      // Tab: 增加縮排（在列表中）或插入 Tab
      'Tab': ({ editor }: { editor: Editor }): boolean => {
        const { state } = editor
        const { $from } = state.selection

        // 如果在列表中，增加縮排
        if ($from.node(-1)?.type.name === 'listItem') {
          return editor.chain().focus().sinkListItem('listItem').run()
        }

        // 否則插入 Tab（讓預設行為處理）
        return false
      },

      // Shift+Tab: 減少縮排
      'Shift-Tab': ({ editor }: { editor: Editor }): boolean => {
        const { state } = editor
        const { $from } = state.selection

        // 如果在列表中，減少縮排
        if ($from.node(-1)?.type.name === 'listItem') {
          return editor.chain().focus().liftListItem('listItem').run()
        }

        return false
      },

      // Cmd/Ctrl+Shift+↑: 上移區塊
      'Mod-Shift-ArrowUp': ({ editor }: { editor: Editor }): boolean => {
        const { state } = editor
        const { $from } = state.selection
        const node = $from.node(-1)

        if (!node) return false

        // 找到前一個兄弟節點
        const pos = $from.before(-1)
        const prevPos = pos - 1

        if (prevPos < 0) return false

        const prevNode = state.doc.nodeAt(prevPos)
        if (!prevNode) return false

        // 交換位置
        const tr = state.tr
        const nodeSize = node.nodeSize

        tr.delete(pos, pos + nodeSize)
        tr.insert(prevPos, node)

        return editor.view.dispatch(tr)
      },

      // Cmd/Ctrl+Shift+↓: 下移區塊
      'Mod-Shift-ArrowDown': ({ editor }: { editor: Editor }): boolean => {
        const { state } = editor
        const { $from } = state.selection
        const node = $from.node(-1)

        if (!node) return false

        const pos = $from.before(-1)
        const nextPos = pos + node.nodeSize

        if (nextPos >= state.doc.content.size) return false

        const nextNode = state.doc.nodeAt(nextPos)
        if (!nextNode) return false

        // 交換位置
        const tr = state.tr
        const nodeSize = node.nodeSize
        const nextNodeSize = nextNode.nodeSize

        tr.delete(nextPos, nextPos + nextNodeSize)
        tr.insert(pos, nextNode)

        return editor.view.dispatch(tr)
      },

      // Cmd/Ctrl+D: 複製當前區塊
      'Mod-d': ({ editor }: { editor: Editor }): boolean => {
        const { state } = editor
        const { $from } = state.selection
        const node = $from.node(-1)

        if (!node) return false

        const pos = $from.after(-1)

        // 複製節點
        return editor.chain().focus().insertContentAt(pos, node.toJSON()).run()
      },

      // Cmd/Ctrl+Shift+D: 刪除當前區塊
      'Mod-Shift-d': ({ editor }: { editor: Editor }): boolean => {
        const { state } = editor
        const { $from } = state.selection
        const node = $from.node(-1)

        if (!node || node.type.name === 'doc') return false

        const pos = $from.before(-1)
        const nodeSize = node.nodeSize

        return editor.chain().focus().deleteRange({ from: pos, to: pos + nodeSize }).run()
      }
    }
  }
})
