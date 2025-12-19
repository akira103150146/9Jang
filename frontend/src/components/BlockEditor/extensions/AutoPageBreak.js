import { Extension } from '@tiptap/core'

export const AutoPageBreak = Extension.create({
  name: 'autoPageBreak',

  addOptions() {
    return {
      pageHeightPx: 971, // A4 頁面高度（可從外部傳入）
      enabled: true,
    }
  },

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        if (!this.options.enabled) {
          return false // 使用預設行為
        }

        // 取得當前游標位置
        const { state } = editor
        const { selection } = state
        const { $from } = selection

        // 取得當前節點的 DOM 元素
        try {
          const pos = $from.pos
          const domAtPos = editor.view.domAtPos(pos)
          let currentNode = domAtPos.node

          // 如果是文本節點，取父元素
          if (currentNode.nodeType === Node.TEXT_NODE) {
            currentNode = currentNode.parentElement
          }

          // 向上查找到塊級元素
          while (currentNode && !currentNode.classList?.contains('ProseMirror')) {
            if (currentNode.parentElement?.classList?.contains('ProseMirror')) {
              break
            }
            currentNode = currentNode.parentElement
          }

          if (!currentNode) {
            return false
          }

          // 取得游標提示方塊的高度
          const cursorIndicator = document.querySelector('.cursor-indicator')
          let cursorIndicatorHeight = 0
          if (cursorIndicator) {
            cursorIndicatorHeight = cursorIndicator.offsetHeight
            const marginBottom = parseFloat(window.getComputedStyle(cursorIndicator).marginBottom) || 0
            cursorIndicatorHeight += marginBottom
          }

          // 計算當前節點距離容器頂部的距離
          const editorDOM = editor.view.dom
          const editorRect = editorDOM.getBoundingClientRect()
          const nodeRect = currentNode.getBoundingClientRect()

          // 當前節點的底部位置（相對於編輯器頂部）
          const nodeBottomRelative = nodeRect.bottom - editorRect.top

          // 調整：扣除游標提示方塊的高度
          const adjustedBottom = nodeBottomRelative - cursorIndicatorHeight

          // 計算當前在第幾頁
          const currentPage = Math.floor(adjustedBottom / this.options.pageHeightPx)

          // 計算當前頁的剩餘空間
          const nextPageBoundary = (currentPage + 1) * this.options.pageHeightPx
          const remainingSpace = nextPageBoundary - adjustedBottom

          // 如果剩餘空間小於 100px（一個段落的平均高度），插入分頁符號
          if (remainingSpace < 100) {
            // 先執行預設的 Enter 行為（創建新段落）
            editor.commands.first(({ commands }) => [
              () => commands.newlineInCode(),
              () => commands.createParagraphNear(),
              () => commands.liftEmptyBlock(),
              () => commands.splitBlock(),
            ])

            // 然後在新段落前插入分頁符號
            setTimeout(() => {
              const { state } = editor
              const { selection } = state
              const currentPos = selection.$from.pos

              // 在當前位置前插入分頁符號
              editor.chain()
                .insertContentAt(currentPos - 1, { type: 'pageBreak' })
                .focus(currentPos + 1) // 將游標移到分頁符號後
                .run()

              // 滾動到新位置
              setTimeout(() => {
                const newPos = editor.state.selection.$from.pos
                const domAtNewPos = editor.view.domAtPos(newPos)
                let newNode = domAtNewPos.node

                if (newNode.nodeType === Node.TEXT_NODE) {
                  newNode = newNode.parentElement
                }

                if (newNode) {
                  newNode.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }, 50)
            }, 10)

            return true // 阻止預設行為
          }

          return false // 使用預設 Enter 行為
        } catch (error) {
          console.error('自動分頁處理失敗:', error)
          return false
        }
      },
    }
  },
})
