import { Extension } from '@tiptap/core'

export const Nesting = Extension.create({
  name: 'nesting',

  addKeyboardShortcuts() {
    return {
      // Tab: 增加縮排（將當前區塊變成前一個區塊的子區塊）
      'Tab': ({ editor }) => {
        const { state } = editor
        const { $from, selection } = state

        // 如果在列表中，使用列表的縮排
        if ($from.node(-1)?.type.name === 'listItem') {
          return false // 讓 StarterKit 處理
        }

        // 找到當前區塊的位置
        const currentBlockPos = $from.before(-1)
        const currentBlock = $from.node(-1)

        if (!currentBlock || currentBlockPos <= 0) return false

        // 找到前一個區塊
        let prevPos = currentBlockPos - 1
        if (prevPos < 0) return false

        // 遍歷找到前一個頂層區塊
        let prevBlock = null
        let prevBlockPos = null

        state.doc.nodesBetween(Math.max(0, prevPos - 100), prevPos, (node, pos) => {
          if (node.isBlock && pos < currentBlockPos && pos !== currentBlockPos) {
            // 檢查是否是頂層區塊（父節點是 doc）
            const resolvedPos = state.doc.resolve(pos)
            if (resolvedPos.depth === 1) {
              prevBlock = node
              prevBlockPos = pos
            }
          }
        })

        if (!prevBlock || !prevBlockPos) return false

        // 檢查前一個區塊是否可以包含子區塊
        const prevBlockType = prevBlock.type
        if (!prevBlockType.contentMatch.matchType(currentBlock.type)) {
          return false // 前一個區塊不能包含當前區塊類型
        }

        // 移動當前區塊到前一個區塊的末尾
        const tr = state.tr
        const nodeSize = currentBlock.nodeSize

        // 刪除當前區塊
        tr.delete(currentBlockPos, currentBlockPos + nodeSize)

        // 插入到前一個區塊的末尾
        const prevBlockEnd = prevBlockPos + prevBlock.nodeSize - 1
        tr.insert(prevBlockEnd, currentBlock)

        return editor.view.dispatch(tr)
      },

      // Shift+Tab: 減少縮排（將當前區塊提升為父區塊的兄弟）
      'Shift-Tab': ({ editor }) => {
        const { state } = editor
        const { $from } = state.selection

        // 如果在列表中，使用列表的減少縮排
        if ($from.node(-1)?.type.name === 'listItem') {
          return false // 讓 StarterKit 處理
        }

        // 檢查當前區塊是否有父區塊（不是 doc 的直接子節點）
        if ($from.depth <= 2) return false // 已經是頂層

        const currentBlock = $from.node(-1)
        const currentBlockPos = $from.before(-1)

        // 找到父區塊
        const parentPos = $from.before(-2)
        const parentBlock = $from.node(-2)

        if (!parentBlock || parentPos < 0) return false

        // 檢查父區塊的父節點（應該是 doc）
        if ($from.depth < 3) return false

        // 移動當前區塊到父區塊之後
        const tr = state.tr
        const nodeSize = currentBlock.nodeSize

        // 刪除當前區塊
        tr.delete(currentBlockPos, currentBlockPos + nodeSize)

        // 插入到父區塊之後
        const parentEnd = parentPos + parentBlock.nodeSize
        tr.insert(parentEnd, currentBlock)

        return editor.view.dispatch(tr)
      },
    }
  },
})
