import { Node, mergeAttributes, InputRule } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import MathFieldComponent from './MathFieldComponent.vue'

export const MathFieldExtension = Node.create({
  name: 'mathField',

  group: 'inline',

  inline: true,

  atom: true,

  addAttributes() {
    return {
      latex: {
        default: '',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="math-field"]',
        getAttrs: (node) => {
          return {
            latex: node.getAttribute('data-latex') || '',
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, {
      'data-type': 'math-field',
      'data-latex': HTMLAttributes.latex,
    }), 0]
  },

  addNodeView() {
    return VueNodeViewRenderer(MathFieldComponent)
  },

  addCommands() {
    return {
      setMathField: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        })
      },
    }
  },

  addInputRules() {
    return [
      // 匹配 $...$ 模式（行內公式）
      // 使用正則匹配 $...$，但排除 $$...$$（區塊公式）
      new InputRule({
        find: /(?<!\$)\$([^$\n]+?)\$(?!\$)/,
        handler: ({ state, range, match }) => {
          const { tr } = state
          const latexContent = match[1].trim()

          if (latexContent) {
            // 創建 mathField 節點
            const mathFieldNode = state.schema.nodes.mathField.create({
              latex: latexContent,
            })

            // 替換匹配的文本為 mathField 節點
            tr.replaceWith(range.from, range.to, mathFieldNode)
          }
        },
      }),
    ]
  },

  addProseMirrorPlugins() {
    const extension = this
    const parentPlugins = this.parent?.() || []
    return [
      ...parentPlugins,
      new Plugin({
        key: new PluginKey('mathFieldPasteHandler'),
        props: {
          handlePaste: (view, event, slice) => {
            // #region agent log
            console.log('[MathFieldExtension] handlePaste called', { sliceSize: slice.content.size, hasClipboardData: !!event.clipboardData })
            fetch('http://127.0.0.1:7243/ingest/9404a257-940d-4c9b-801f-942831841c9e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MathFieldExtension.js:90', message: 'handlePaste called', data: { sliceSize: slice.content.size, hasClipboardData: !!event.clipboardData }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
            // #endregion
            // 優先獲取純文本，避免帶格式的 HTML
            const text = event.clipboardData?.getData('text/plain') || ''
            const html = event.clipboardData?.getData('text/html') || ''
            // #region agent log
            console.log('[MathFieldExtension] clipboard data', { textLength: text.length, htmlLength: html.length, textPreview: text.substring(0, 100), htmlPreview: html.substring(0, 200) })
            fetch('http://127.0.0.1:7243/ingest/9404a257-940d-4c9b-801f-942831841c9e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MathFieldExtension.js:95', message: 'clipboard data', data: { textLength: text.length, htmlLength: html.length, textPreview: text.substring(0, 100), htmlPreview: html.substring(0, 200) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
            // #endregion

            // 如果有 HTML 但沒有純文本，嘗試從 HTML 提取純文本
            let plainText = text
            if (!plainText && html) {
              const tempDiv = document.createElement('div')
              tempDiv.innerHTML = html
              // 使用 textContent 而不是 innerText，確保完全去除格式
              plainText = tempDiv.textContent || tempDiv.innerText || ''
            }
            // 如果 plainText 為空但 html 存在，嘗試更積極地提取
            if (!plainText && html) {
              // 移除所有 HTML 標籤，保留文本內容
              plainText = html.replace(/<[^>]*>/g, '')
                .replace(/&nbsp;/g, ' ')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&#36;/g, '$') // 處理 $ 符號的 HTML 實體
                .replace(/&dollar;/g, '$') // 處理 $ 符號的另一種 HTML 實體
            }
            // 清理文本：保留換行，但清理多餘的空白字符
            if (plainText) {
              // 保留換行符，但清理多餘的空白
              plainText = plainText.replace(/[ \t]+/g, ' ') // 將多個空格/製表符替換為單個空格
                .replace(/\n\s+/g, '\n') // 清理換行後的空白
                .replace(/\s+\n/g, '\n') // 清理換行前的空白
                .trim()
            }
            // #region agent log
            console.log('[MathFieldExtension] plainText extracted', { plainTextLength: plainText.length, plainTextPreview: plainText.substring(0, 200), hasDollarSign: plainText.includes('$'), dollarCount: (plainText.match(/\$/g) || []).length })
            fetch('http://127.0.0.1:7243/ingest/9404a257-940d-4c9b-801f-942831841c9e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MathFieldExtension.js:110', message: 'plainText extracted', data: { plainTextLength: plainText.length, plainTextPreview: plainText.substring(0, 200), hasDollarSign: plainText.includes('$'), dollarCount: (plainText.match(/\$/g) || []).length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
            // #endregion

            // 如果沒有文本，讓默認處理繼續
            if (!plainText) {
              return false
            }

            // 如果有結構化內容（HTML），我們要強制使用純文本
            // 這樣可以避免帶格式的文字（字體變大、背景變黑等問題）
            const hasStructuredContent = slice.content.size > 0 || html.length > 0
            const hasDollarSign = plainText.includes('$')
            // #region agent log
            console.log('[MathFieldExtension] checking conditions', { hasStructuredContent, hasDollarSign, plainTextPreview: plainText.substring(0, 100) })
            fetch('http://127.0.0.1:7243/ingest/9404a257-940d-4c9b-801f-942831841c9e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MathFieldExtension.js:120', message: 'checking conditions', data: { hasStructuredContent, hasDollarSign, plainTextPreview: plainText.substring(0, 100) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
            // #endregion

            // 如果有 $ 符號，或者有結構化內容（需要去除格式），都進行處理
            if (!hasDollarSign && !hasStructuredContent) {
              // #region agent log
              console.log('[MathFieldExtension] skipping paste handler')
              fetch('http://127.0.0.1:7243/ingest/9404a257-940d-4c9b-801f-942831841c9e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MathFieldExtension.js:127', message: 'skipping paste handler', data: {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
              // #endregion
              return false
            }

            // 檢測 $...$ 模式（行內公式）
            // 匹配 $...$ 但不匹配 $$...$$（區塊公式）
            // 使用更簡單的正則：匹配單個 $ 開頭和結尾，且中間不包含換行
            // 注意：需要處理轉義的 LaTeX 語法（如 \\frac）
            const inlineMathRegex = /\$([^$\n]+?)\$/g
            const matches = []
            let match
            // 重置正則表達式的 lastIndex，確保從頭開始匹配
            inlineMathRegex.lastIndex = 0
            while ((match = inlineMathRegex.exec(plainText)) !== null) {
              // 檢查前後字符，確保不是 $$...$$ 的一部分
              const beforeChar = match.index > 0 ? plainText[match.index - 1] : ''
              const afterChar = match.index + match[0].length < plainText.length
                ? plainText[match.index + match[0].length]
                : ''

              // 如果前後都不是 $，則是行內公式
              if (beforeChar !== '$' && afterChar !== '$') {
                matches.push(match)
              }
            }
            // #region agent log
            console.log('[MathFieldExtension] regex matching result', { matchesCount: matches.length, plainTextSample: plainText.substring(0, 300), matches: matches.slice(0, 5).map(m => m[1]) })
            fetch('http://127.0.0.1:7243/ingest/9404a257-940d-4c9b-801f-942831841c9e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MathFieldExtension.js:156', message: 'regex matching result', data: { matchesCount: matches.length, plainTextSample: plainText.substring(0, 300), matches: matches.slice(0, 5).map(m => m[1]) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
            // #endregion

            // 阻止默認貼上行為（避免帶格式的 HTML）
            event.preventDefault()
            event.stopPropagation()
            // #region agent log
            console.log('[MathFieldExtension] paste prevented, matches:', matches.length)
            fetch('http://127.0.0.1:7243/ingest/9404a257-940d-4c9b-801f-942831841c9e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MathFieldExtension.js:145', message: 'paste prevented', data: { matchesCount: matches.length, hasStructuredContent, hasDollarSign }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
            // #endregion

            // 使用 editor 的 commands API 來插入內容，確保 NodeView 正確初始化
            const editor = extension.editor
            // #region agent log
            console.log('[MathFieldExtension] editor check', { hasEditor: !!editor })
            fetch('http://127.0.0.1:7243/ingest/9404a257-940d-4c9b-801f-942831841c9e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MathFieldExtension.js:152', message: 'editor check', data: { hasEditor: !!editor }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
            // #endregion
            if (!editor) {
              // 如果沒有 editor，回退到直接操作 transaction
              const { state, dispatch } = view
              const { from, to } = state.selection

              if (matches.length > 0) {
                let lastIndex = 0
                const fragment = []

                matches.forEach((match) => {
                  const matchStart = match.index
                  const matchEnd = match.index + match[0].length
                  const latexContent = match[1]

                  if (matchStart > lastIndex) {
                    const textBefore = plainText.substring(lastIndex, matchStart)
                    if (textBefore) {
                      fragment.push(state.schema.text(textBefore))
                    }
                  }

                  const mathFieldNode = state.schema.nodes.mathField.create({
                    latex: latexContent.trim(),
                  })
                  fragment.push(mathFieldNode)

                  lastIndex = matchEnd
                })

                if (lastIndex < plainText.length) {
                  const textAfter = plainText.substring(lastIndex)
                  if (textAfter) {
                    fragment.push(state.schema.text(textAfter))
                  }
                }

                if (fragment.length > 0) {
                  const tr = state.tr.delete(from, to).insert(from, fragment)
                  dispatch(tr)
                }
              } else {
                const lines = plainText.split(/\r?\n/)
                const nodes = []
                lines.forEach((line) => {
                  if (line.trim()) {
                    nodes.push(state.schema.nodes.paragraph.create({}, line ? [state.schema.text(line)] : []))
                  }
                })
                if (nodes.length === 0) {
                  nodes.push(state.schema.nodes.paragraph.create())
                }
                const tr = state.tr.delete(from, to).insert(from, nodes)
                dispatch(tr)
              }
              return true
            }

            // 如果有匹配到行內公式，進行轉換
            if (matches.length > 0) {
              // 構建包含 mathField 節點的內容結構
              let lastIndex = 0
              const contentNodes = []

              matches.forEach((match) => {
                const matchStart = match.index
                const matchEnd = match.index + match[0].length
                const latexContent = match[1] // 提取 $ 之間的內容

                // 添加匹配前的普通文本
                if (matchStart > lastIndex) {
                  const textBefore = plainText.substring(lastIndex, matchStart)
                  if (textBefore) {
                    contentNodes.push({
                      type: 'text',
                      text: textBefore,
                    })
                  }
                }

                // 添加 mathField 節點
                contentNodes.push({
                  type: 'mathField',
                  attrs: {
                    latex: latexContent.trim(),
                  },
                })

                lastIndex = matchEnd
              })

              // 添加最後的普通文本
              if (lastIndex < plainText.length) {
                const textAfter = plainText.substring(lastIndex)
                if (textAfter) {
                  contentNodes.push({
                    type: 'text',
                    text: textAfter,
                  })
                }
              }

              // 使用 insertContent 命令插入內容，這會確保 NodeView 正確初始化
              if (contentNodes.length > 0) {
                // #region agent log
                console.log('[MathFieldExtension] inserting content with mathField', { contentNodesCount: contentNodes.length, mathFieldCount: contentNodes.filter(n => n.type === 'mathField').length })
                fetch('http://127.0.0.1:7243/ingest/9404a257-940d-4c9b-801f-942831841c9e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MathFieldExtension.js:260', message: 'inserting content with mathField', data: { contentNodesCount: contentNodes.length, mathFieldCount: contentNodes.filter(n => n.type === 'mathField').length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
                // #endregion
                // 先刪除選中的內容，然後插入新內容
                const { from, to } = editor.state.selection
                // #region agent log
                console.log('[MathFieldExtension] about to insert content with mathField', { from, to, contentNodesCount: contentNodes.length })
                fetch('http://127.0.0.1:7243/ingest/9404a257-940d-4c9b-801f-942831841c9e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MathFieldExtension.js:280', message: 'about to insert content with mathField', data: { from, to, contentNodesCount: contentNodes.length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
                // #endregion
                // 使用 setTimeout 確保在當前事件循環之後執行
                setTimeout(() => {
                  try {
                    // 確保選擇範圍仍然有效
                    const currentState = editor.state
                    const docSize = currentState.doc.content.size
                    const safeFrom = Math.min(from, docSize)
                    const safeTo = Math.min(Math.max(safeFrom, to), docSize)

                    // 直接刪除並插入，不使用 blur/focus
                    editor.chain()
                      .deleteRange({ from: safeFrom, to: safeTo })
                      .insertContent({
                        type: 'paragraph',
                        content: contentNodes,
                      })
                      .run()
                    // #region agent log
                    console.log('[MathFieldExtension] content inserted successfully')
                    fetch('http://127.0.0.1:7243/ingest/9404a257-940d-4c9b-801f-942831841c9e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MathFieldExtension.js:295', message: 'content inserted successfully', data: {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
                    // #endregion
                  } catch (error) {
                    // #region agent log
                    console.error('[MathFieldExtension] error inserting content', error)
                    fetch('http://127.0.0.1:7243/ingest/9404a257-940d-4c9b-801f-942831841c9e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MathFieldExtension.js:300', message: 'error inserting content', data: { error: error.message, stack: error.stack }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
                    // #endregion
                  }
                }, 0)
              }
            } else {
              // 沒有公式，但需要去除格式，只插入純文本
              // #region agent log
              console.log('[MathFieldExtension] inserting plain text (no math)', { plainTextLength: plainText.length, plainTextPreview: plainText.substring(0, 100) })
              fetch('http://127.0.0.1:7243/ingest/9404a257-940d-4c9b-801f-942831841c9e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MathFieldExtension.js:293', message: 'inserting plain text', data: { plainTextLength: plainText.length, plainTextPreview: plainText.substring(0, 100) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
              // #endregion
              // 將純文本按段落分割
              const lines = plainText.split(/\r?\n/)
              const paragraphs = []

              lines.forEach((line) => {
                if (line.trim()) {
                  paragraphs.push({
                    type: 'paragraph',
                    content: line ? [{ type: 'text', text: line }] : [],
                  })
                }
              })

              if (paragraphs.length === 0) {
                paragraphs.push({
                  type: 'paragraph',
                  content: [],
                })
              }

              // 使用 insertContent 命令插入內容，先刪除選中的內容
              // 獲取當前的選擇範圍，但確保範圍有效
              const currentSelection = editor.state.selection
              const from = Math.max(0, currentSelection.from)
              const to = Math.max(from, currentSelection.to)
              // #region agent log
              console.log('[MathFieldExtension] about to insert plain text', { paragraphsCount: paragraphs.length, from, to, docSize: editor.state.doc.content.size })
              fetch('http://127.0.0.1:7243/ingest/9404a257-940d-4c9b-801f-942831841c9e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MathFieldExtension.js:333', message: 'about to insert plain text', data: { paragraphsCount: paragraphs.length, from, to, docSize: editor.state.doc.content.size }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
              // #endregion
              // 使用 setTimeout 確保在當前事件循環之後執行
              setTimeout(() => {
                try {
                  // 確保選擇範圍仍然有效
                  const currentState = editor.state
                  const docSize = currentState.doc.content.size
                  const safeFrom = Math.min(from, docSize)
                  const safeTo = Math.min(Math.max(safeFrom, to), docSize)

                  // 先刪除選中的內容，然後插入純文本
                  // 使用單一 chain 確保原子操作
                  editor.chain()
                    .deleteRange({ from: safeFrom, to: safeTo })
                    .insertContent(paragraphs)
                    .run()
                  // #region agent log
                  console.log('[MathFieldExtension] plain text inserted successfully')
                  fetch('http://127.0.0.1:7243/ingest/9404a257-940d-4c9b-801f-942831841c9e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MathFieldExtension.js:355', message: 'plain text inserted successfully', data: {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
                  // #endregion
                } catch (error) {
                  // #region agent log
                  console.error('[MathFieldExtension] error inserting plain text', error)
                  fetch('http://127.0.0.1:7243/ingest/9404a257-940d-4c9b-801f-942831841c9e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MathFieldExtension.js:360', message: 'error inserting plain text', data: { error: error.message, stack: error.stack }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
                  // #endregion
                }
              }, 0)
            }

            return true
          },
        },
      }),
    ]
  },
})
