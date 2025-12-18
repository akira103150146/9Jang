import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export const DragHandle = Extension.create({
  name: 'dragHandle',

  addProseMirrorPlugins() {
    const extension = this

    const createDecorations = (state) => {
      const decorations = []
      const { doc } = state

      // 遍歷所有區塊節點
      doc.descendants((node, pos) => {
        // 只為頂層區塊添加拖動手柄
        if (node.isBlock && pos > 0 && node.type.name !== 'doc') {
          decorations.push(
            Decoration.widget(pos, () => {
              const handle = document.createElement('div')
              handle.className = 'drag-handle-widget'
              handle.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="9" cy="5" r="1"/>
                      <circle cx="9" cy="12" r="1"/>
                      <circle cx="9" cy="19" r="1"/>
                      <circle cx="15" cy="5" r="1"/>
                      <circle cx="15" cy="12" r="1"/>
                      <circle cx="15" cy="19" r="1"/>
                    </svg>
                  `
              handle.style.cssText = `
                    position: absolute;
                    left: -24px;
                    top: 4px;
                    width: 20px;
                    height: 20px;
                    cursor: grab;
                    color: rgb(148, 163, 184);
                    opacity: 0;
                    transition: opacity 0.2s;
                    z-index: 10;
                    pointer-events: auto;
                  `

              // 找到對應的區塊元素
              const findBlockElement = () => {
                let element = handle.parentElement
                while (element && !element.hasAttribute('data-type')) {
                  element = element.parentElement
                }
                return element
              }

              // Hover 顯示
              const block = findBlockElement()
              if (block) {
                block.addEventListener('mouseenter', () => {
                  handle.style.opacity = '1'
                  handle.style.color = 'rgb(99, 102, 241)'
                })
                block.addEventListener('mouseleave', () => {
                  handle.style.opacity = '0'
                  handle.style.color = 'rgb(148, 163, 184)'
                })
              }

              // 拖動處理
              let isDragging = false
              let dragStartY = 0
              let dragStartPos = pos

              handle.addEventListener('mousedown', (e) => {
                e.preventDefault()
                e.stopPropagation()
                isDragging = true
                dragStartY = e.clientY
                dragStartPos = pos
                handle.style.cursor = 'grabbing'
                handle.style.opacity = '1'

                const { view } = extension.editor
                const { state } = view

                // 添加拖動中的樣式
                const blockEl = findBlockElement()
                if (blockEl) {
                  blockEl.style.opacity = '0.5'
                  blockEl.style.border = '2px solid rgb(99, 102, 241)'
                }

                const handleMouseMove = (moveEvent) => {
                  if (!isDragging) return

                  const deltaY = moveEvent.clientY - dragStartY
                  const blockHeight = blockEl?.offsetHeight || 50

                  // 計算應該移動到的位置
                  const targetPos = Math.round(dragStartPos + (deltaY / blockHeight))

                  // 顯示插入指示線（這裡簡化處理）
                  // 實際應該計算確切的插入位置
                }

                const handleMouseUp = (upEvent) => {
                  if (!isDragging) return

                  isDragging = false
                  handle.style.cursor = 'grab'

                  const blockEl = findBlockElement()
                  if (blockEl) {
                    blockEl.style.opacity = '1'
                    blockEl.style.border = ''
                  }

                  // 計算目標位置並移動節點
                  const { view } = extension.editor
                  const { state } = view
                  const deltaY = upEvent.clientY - dragStartY

                  if (Math.abs(deltaY) > 10) {
                    // 找到目標位置
                    const targetPos = findTargetPosition(state, dragStartPos, deltaY)

                    if (targetPos !== null && targetPos !== dragStartPos) {
                      moveNode(state, view, dragStartPos, targetPos)
                    }
                  }

                  document.removeEventListener('mousemove', handleMouseMove)
                  document.removeEventListener('mouseup', handleMouseUp)
                }

                document.addEventListener('mousemove', handleMouseMove)
                document.addEventListener('mouseup', handleMouseUp)
              })

              return handle
            }, {
              side: -1,
              key: `drag-handle-${pos}`
            })
          )
        }
      })

      return DecorationSet.create(doc, decorations)
    }

    return [
      new Plugin({
        key: new PluginKey('dragHandle'),
        state: {
          init() {
            return DecorationSet.empty
          },
          apply(transaction, decorationSet, oldState, newState) {
            // 如果文檔改變，重新計算裝飾
            if (transaction.docChanged || transaction.selectionSet) {
              return createDecorations(newState)
            }
            return decorationSet
          },
        },
        props: {
          decorations(state) {
            return createDecorations(state)
          },
        },
      })
    ]
  }
})

// 輔助函數：找到目標位置
function findTargetPosition(state, startPos, deltaY) {
  const { doc } = state
  let currentPos = startPos
  const blockHeight = 50 // 估算的區塊高度

  // 簡化版本：根據 deltaY 計算應該移動多少個區塊
  const blocksToMove = Math.round(deltaY / blockHeight)

  if (blocksToMove === 0) return startPos

  // 找到目標位置
  let targetPos = startPos
  let node = doc.nodeAt(startPos)
  if (!node) return null

  const nodeSize = node.nodeSize

  if (blocksToMove > 0) {
    // 向下移動
    targetPos = startPos + nodeSize
    for (let i = 1; i < blocksToMove; i++) {
      const nextNode = doc.nodeAt(targetPos)
      if (!nextNode) break
      targetPos += nextNode.nodeSize
    }
  } else {
    // 向上移動
    targetPos = startPos - 1
    for (let i = -1; i > blocksToMove; i--) {
      const prevNode = doc.nodeAt(targetPos)
      if (!prevNode) break
      targetPos -= prevNode.nodeSize
    }
  }

  return targetPos
}

// 輔助函數：移動節點
function moveNode(state, view, fromPos, toPos) {
  const { doc, tr } = state
  const fromNode = doc.nodeAt(fromPos)

  if (!fromNode) return

  const nodeSize = fromNode.nodeSize

  // 確保目標位置有效
  if (toPos < 0 || toPos > doc.content.size) return

  // 如果目標位置在源節點之後，需要調整
  const adjustedToPos = toPos > fromPos ? toPos - nodeSize : toPos

  // 刪除源節點
  tr.delete(fromPos, fromPos + nodeSize)

  // 插入到目標位置
  tr.insert(adjustedToPos, fromNode)

  view.dispatch(tr)
}
