import { Extension } from '@tiptap/core'

export const KeyboardShortcuts = Extension.create({
  name: 'keyboardShortcuts',

  addKeyboardShortcuts() {
    return {
      // Shift+Enter: 插入硬換行(br)
      'Shift-Enter': ({ editor }) => {
        return editor.chain().focus().setHardBreak().run()
      },

      // Backspace: 在空區塊開頭時刪除區塊
      'Backspace': ({ editor }) => {
        const { state } = editor
        const { $from } = state.selection

        // #region agent log
        fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'KeyboardShortcuts.js:Backspace',message:'Backspace 鍵按下',data:{parentOffset:$from.parentOffset,parentType:$from.parent.type.name,parentTextLength:$from.parent.textContent.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'C'})}).catch(()=>{});
        // #endregion

        // 如果在區塊開頭且區塊為空
        if ($from.parentOffset === 0 && $from.parent.textContent.length === 0) {
          const nodeType = $from.parent.type.name

          // 如果是段落，不刪除（讓預設行為處理）
          if (nodeType === 'paragraph') {
            // #region agent log
            fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'KeyboardShortcuts.js:Backspace',message:'空段落，使用預設行為',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            return false
          }

          // 其他類型的空區塊，轉換為段落
          // #region agent log
          fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'KeyboardShortcuts.js:Backspace',message:'空區塊轉換為段落',data:{nodeType},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          return editor.chain().focus().setParagraph().run()
        }

        // #region agent log
        fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'KeyboardShortcuts.js:Backspace',message:'使用預設 Backspace 行為',data:{parentOffset:$from.parentOffset,parentTextLength:$from.parent.textContent.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        return false
      },

      // Delete: 處理 Delete 鍵，避免刪除到前面的元素
      'Delete': ({ editor }) => {
        const { state } = editor
        const { $from, $to } = state.selection
        
        // #region agent log
        fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'KeyboardShortcuts.js:Delete',message:'Delete 鍵按下',data:{fromPos:$from.pos,toPos:$to.pos,parentOffset:$from.parentOffset,parentType:$from.parent.type.name,parentTextLength:$from.parent.textContent.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        // 如果有選中內容，讓預設行為處理
        if ($from.pos !== $to.pos) {
          // #region agent log
          fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'KeyboardShortcuts.js:Delete',message:'有選中內容，使用預設行為',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          return false
        }
        
        // 檢查游標是否在段落末尾
        const parentTextLength = $from.parent.textContent.length
        const parentOffset = $from.parentOffset
        
        // #region agent log
        fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'KeyboardShortcuts.js:Delete',message:'檢查游標位置',data:{parentOffset,parentTextLength,isAtEnd:parentOffset >= parentTextLength},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        // 只有在段落末尾時才檢查下一個節點
        // 如果游標在段落中間，應該正常刪除文字
        if (parentOffset >= parentTextLength) {
          // 檢查游標深度，避免在頂層節點時出錯
          const depth = $from.depth
          
          // #region agent log
          fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'KeyboardShortcuts.js:Delete',message:'在段落末尾，檢查深度',data:{depth,parentType:$from.parent.type.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          
          let nextSiblingPos = null
          let nextSiblingNode = null
          
          if (depth > 0) {
            // 不在頂層，可以安全使用 before(-1)
            try {
              const paragraphPos = $from.before(-1)
              const paragraphNode = $from.node(-1)
              nextSiblingPos = paragraphPos + paragraphNode.nodeSize
            } catch (e) {
              // #region agent log
              fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'KeyboardShortcuts.js:Delete',message:'before(-1) 失敗，使用預設行為',data:{error:e.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'A'})}).catch(()=>{});
              // #endregion
              return false
            }
          } else {
            // 在頂層，直接使用 after() 獲取下一個位置
            nextSiblingPos = $from.after()
          }
          
          // #region agent log
          fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'KeyboardShortcuts.js:Delete',message:'計算下一個兄弟節點位置',data:{nextSiblingPos,docSize:state.doc.content.size},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          
          if (nextSiblingPos !== null && nextSiblingPos < state.doc.content.size) {
            nextSiblingNode = state.doc.nodeAt(nextSiblingPos)
            // #region agent log
            fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'KeyboardShortcuts.js:Delete',message:'檢查下一個兄弟節點',data:{nextSiblingPos,nextNodeType:nextSiblingNode?.type?.name,nextNodeSize:nextSiblingNode?.nodeSize,nextNodeIsAtom:nextSiblingNode?.isAtom},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            
            // 如果下一個節點是原子節點（如 image、questionBlock 等），不刪除
            if (nextSiblingNode && nextSiblingNode.isAtom) {
              // #region agent log
              fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'KeyboardShortcuts.js:Delete',message:'下一個節點是原子節點，阻止刪除',data:{nextNodeType:nextSiblingNode.type.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'A'})}).catch(()=>{});
              // #endregion
              return true // 阻止預設行為，避免刪除原子節點
            }
          }
        }
        
        // #region agent log
        fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'KeyboardShortcuts.js:Delete',message:'使用預設 Delete 行為',data:{parentOffset,parentTextLength,isAtEnd:parentOffset >= parentTextLength},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        return false // 使用預設行為
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
