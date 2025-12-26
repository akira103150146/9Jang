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
          // #region agent log
          fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutoPageBreak.js:Enter',message:'AutoPageBreak 未啟用，使用預設行為',data:{enabled:this.options.enabled},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          return false // 使用預設行為
        }

        // 取得當前游標位置
        const { state } = editor
        const { selection } = state
        const { $from } = selection

        // 取得當前節點的 DOM 元素
        try {
          const pos = $from.pos
          // #region agent log
          fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutoPageBreak.js:Enter',message:'Enter 鍵按下',data:{pos,pageHeightPx:this.options.pageHeightPx,parentType:$from.parent.type.name,parentOffset:$from.parentOffset},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
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
            // #region agent log
            fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutoPageBreak.js:Enter',message:'找不到當前節點',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
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

          // #region agent log
          fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutoPageBreak.js:Enter',message:'分頁計算',data:{nodeBottomRelative,adjustedBottom,currentPage,nextPageBoundary,remainingSpace,pageHeightPx:this.options.pageHeightPx},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion

          // 如果剩餘空間小於 100px（一個段落的平均高度），插入分頁符號
          if (remainingSpace < 100) {
            // #region agent log
            fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutoPageBreak.js:Enter',message:'需要插入分頁符號',data:{remainingSpace},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            
            // 先執行預設的 Enter 行為（創建新段落）
            const enterResult = editor.commands.first(({ commands }) => [
              () => commands.newlineInCode(),
              () => commands.createParagraphNear(),
              () => commands.liftEmptyBlock(),
              () => commands.splitBlock(),
            ])
            
            // #region agent log
            fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutoPageBreak.js:Enter',message:'Enter 預設行為執行完成',data:{enterResult,docSizeAfterEnter:editor.state.doc.content.size},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{});
            // #endregion

            // 然後在新段落前插入分頁符號
            setTimeout(() => {
              const { state } = editor
              const { selection } = state
              const currentPos = selection.$from.pos
              
              // #region agent log
              fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutoPageBreak.js:Enter',message:'準備插入分頁符號',data:{currentPos,beforeInsert:currentPos-1,docSize:state.doc.content.size},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{});
              // #endregion

              // 在當前位置前插入分頁符號
              editor.chain()
                .insertContentAt(currentPos - 1, { type: 'pageBreak' })
                .run()
              
              // 等待 DOM 更新後，將游標定位在新創建的段落中（分頁符號後）
              setTimeout(() => {
                const { state } = editor
                const pageBreakPos = currentPos - 1
                const pageBreakNode = state.doc.nodeAt(pageBreakPos)
                
                // 計算分頁符號後的游標位置（應該在新段落中）
                const cursorPosAfterPageBreak = pageBreakPos + (pageBreakNode?.nodeSize || 1)
                
                // #region agent log
                fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutoPageBreak.js:Enter',message:'設置游標位置',data:{pageBreakPos,pageBreakNodeSize:pageBreakNode?.nodeSize,cursorPosAfterPageBreak,docSize:state.doc.content.size},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{});
                // #endregion
                
                // 將游標移到分頁符號後的新段落中
                editor.chain()
                  .focus(cursorPosAfterPageBreak)
                  .run()
                
                // #region agent log
                setTimeout(() => {
                  const finalPos = editor.state.selection.$from.pos
                  fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutoPageBreak.js:Enter',message:'游標位置設置完成',data:{finalPos,expectedPos:cursorPosAfterPageBreak,match:finalPos===cursorPosAfterPageBreak},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{});
                }, 20);
                // #endregion

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
            }, 10)

            return true // 阻止預設行為
          }
          
          // #region agent log
          fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutoPageBreak.js:Enter',message:'剩餘空間足夠，使用預設 Enter 行為',data:{remainingSpace},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{});
          // #endregion

          return false // 使用預設 Enter 行為
        } catch (error) {
          console.error('自動分頁處理失敗:', error)
          return false
        }
      },
    }
  },
})
