import { Extension } from '@tiptap/core'

export const KeyboardShortcuts = Extension.create({
  name: 'keyboardShortcuts',

  addKeyboardShortcuts() {
    return {
      // Enter: 在空區塊時新增段落，否則換行
      'Enter': ({ editor }) => {
        const { state } = editor
        const { $from, $to } = state.selection

        // 如果選中整個空區塊
        if ($from.parent.type.name !== 'paragraph' && $from.parent.textContent.length === 0) {
          return editor.chain().focus().setParagraph().run()
        }

        // 如果當前是空段落，保持段落
        if ($from.parent.type.name === 'paragraph' && $from.parent.textContent.length === 0) {
          return false // 讓預設行為處理
        }

        // 否則換行
        return false
      },

      // Backspace: 在空區塊開頭時刪除區塊
      'Backspace': ({ editor }) => {
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

      // Tab: 增加縮排（在列表中）或插入 Tab
      'Tab': ({ editor }) => {
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
      'Shift-Tab': ({ editor }) => {
        const { state } = editor
        const { $from } = state.selection

        // 如果在列表中，減少縮排
        if ($from.node(-1)?.type.name === 'listItem') {
          return editor.chain().focus().liftListItem('listItem').run()
        }

        return false
      },

      // Cmd/Ctrl+Shift+↑: 上移區塊
      'Mod-Shift-ArrowUp': ({ editor }) => {
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
        const prevNodeSize = prevNode.nodeSize

        tr.delete(pos, pos + nodeSize)
        tr.insert(prevPos, node)

        return editor.view.dispatch(tr)
      },

      // Cmd/Ctrl+Shift+↓: 下移區塊
      'Mod-Shift-ArrowDown': ({ editor }) => {
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
      'Mod-d': ({ editor }) => {
        const { state } = editor
        const { $from } = state.selection
        const node = $from.node(-1)

        if (!node) return false

        const pos = $from.after(-1)

        // 複製節點
        return editor.chain().focus().insertContentAt(pos, node.toJSON()).run()
      },

      // Cmd/Ctrl+Shift+D: 刪除當前區塊
      'Mod-Shift-d': ({ editor }) => {
        const { state } = editor
        const { $from } = state.selection
        const node = $from.node(-1)

        if (!node || node.type.name === 'doc') return false

        const pos = $from.before(-1)
        const nodeSize = node.nodeSize

        return editor.chain().focus().deleteRange({ from: pos, to: pos + nodeSize }).run()
      },
    }
  },
})
