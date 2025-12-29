<template>
  <div class="markdown-editor-wrapper">
    <div ref="editorContainer" class="editor-container"></div>
    <div v-if="uploadingImage" class="upload-indicator">
      <span class="text-xs text-indigo-600">上傳圖片中...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { EditorView, keymap, highlightSpecialChars, drawSelection, highlightActiveLine, lineNumbers, highlightActiveLineGutter } from '@codemirror/view'
import { EditorState, Compartment } from '@codemirror/state'
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands'
import { markdown } from '@codemirror/lang-markdown'
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { bracketMatching, foldGutter, indentOnInput, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language'
import { uploadImageAPI, getBackendBaseURL } from '../services/api'
import { getAllSnippets } from '../services/snippets'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  templates: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const editorContainer = ref(null)
let view = null
const uploadingImage = ref(false)

// 暴露給父組件的方法
const focus = () => {
  if (!view) return
  view.focus()
}

const focusAtLine = (lineNumber = 1) => {
  if (!view) return
  const totalLines = view.state.doc.lines
  const safeLine = Math.max(1, Math.min(Number(lineNumber) || 1, totalLines))
  const pos = view.state.doc.line(safeLine).from
  view.dispatch({
    selection: { anchor: pos, head: pos },
    scrollIntoView: true,
  })
  view.focus()
}

const focusAtPos = (pos = 0) => {
  if (!view) return
  const max = view.state.doc.length
  const safePos = Math.max(0, Math.min(Number(pos) || 0, max))
  view.dispatch({
    selection: { anchor: safePos, head: safePos },
    scrollIntoView: true,
  })
  view.focus()
}

const insertText = (text, cursorOffset = 0) => {
  if (!view) return
  const s = view.state.selection.main
  const from = s.from
  const to = s.to
  const insert = String(text ?? '')
  view.dispatch({
    changes: { from, to, insert },
    selection: { anchor: from + insert.length + (Number(cursorOffset) || 0) },
    scrollIntoView: true,
  })
  view.focus()
}

defineExpose({ focus, focusAtLine, focusAtPos, insertText })

// 處理圖片貼上
const handlePaste = async (event) => {
  const items = event.clipboardData?.items
  if (!items) return
  
  // 查找圖片
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    
    if (item.type.startsWith('image/')) {
      event.preventDefault()
      
      const file = item.getAsFile()
      if (!file) continue
      
      // 檢查文件大小（5MB）
      if (file.size > 5 * 1024 * 1024) {
        alert('圖片文件大小不能超過 5MB')
        return
      }
      
      uploadingImage.value = true
      
      try {
        // 上傳圖片
        const response = await uploadImageAPI.upload(file)
        const imagePath = response.data.image_path
        let imageUrl = response.data.image_url || `/media/${imagePath}`
        
        // 從實際的 API 請求中提取後端基礎 URL
        // 這樣可以確保使用正確的後端 IP 地址
        let backendBaseURL
        
        // 方法1: 如果響應已經包含完整 URL，直接使用
        if (response.data.image_url && response.data.image_url.startsWith('http')) {
          try {
            const url = new URL(response.data.image_url)
            backendBaseURL = `${url.protocol}//${url.host}`
            console.log('從響應中獲取後端 URL:', backendBaseURL)
          } catch (e) {
            backendBaseURL = getBackendBaseURL()
          }
        } else {
          // 方法2: 從 API 請求的實際 URL 中提取
          // 通過檢查 response.config.url 或 response.request.responseURL
          try {
            // 嘗試從響應對象中獲取請求 URL
            const requestURL = response.config?.url || response.request?.responseURL
            if (requestURL) {
              const url = new URL(requestURL, window.location.origin)
              backendBaseURL = `${url.protocol}//${url.host}`
              console.log('從 API 請求中提取後端 URL:', backendBaseURL)
            } else {
              // 方法3: 從 API 配置中獲取
              backendBaseURL = getBackendBaseURL()
              console.log('從 API 配置獲取後端 URL:', backendBaseURL)
            }
          } catch (e) {
            console.error('無法從請求中提取 URL:', e)
            backendBaseURL = getBackendBaseURL()
          }
        }
        
        console.log('最終使用的後端 URL:', backendBaseURL)
        
        // 確保圖片 URL 指向後端伺服器
        if (imageUrl.startsWith('/media/')) {
          imageUrl = `${backendBaseURL}${imageUrl}`
        } else if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
          imageUrl = `${backendBaseURL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
        } else if (imageUrl.includes(':5173')) {
          // 如果 URL 錯誤地包含了前端端口（5173），替換為後端 URL
          imageUrl = imageUrl.replace(/https?:\/\/[^:]+:\d+/, backendBaseURL)
        }
        
        // 在游標位置插入 Markdown 圖片語法
        if (view) {
          const selection = view.state.selection.main
          const pos = selection.head
          
          // 生成 Markdown 圖片語法
          const imageMarkdown = `![${file.name || 'image'}](${imageUrl})`
          
          console.log('插入圖片 Markdown:', imageMarkdown)
          console.log('圖片 URL:', imageUrl)
          
          // 插入到游標位置
          view.dispatch({
            changes: {
              from: pos,
              insert: imageMarkdown
            },
            selection: {
              anchor: pos + imageMarkdown.length
            }
          })
          
          // 觸發更新事件
          const newContent = view.state.doc.toString()
          emit('update:modelValue', newContent)
        }
      } catch (error) {
        console.error('上傳圖片失敗：', error)
        alert('上傳圖片失敗，請稍後再試')
      } finally {
        uploadingImage.value = false
      }
      
      break
    }
  }
}

// LaTeX 自動完成選項
const latexCompletions = [
  { label: '\\frac', type: 'function', info: '分數 \\frac{a}{b}' },
  { label: '\\sqrt', type: 'function', info: '平方根 \\sqrt{x}' },
  { label: '\\sum', type: 'function', info: '求和 \\sum_{i=1}^{n}' },
  { label: '\\int', type: 'function', info: '積分 \\int_{a}^{b}' },
  { label: '\\lim', type: 'function', info: '極限 \\lim_{x \\to \\infty}' },
  { label: '\\sin', type: 'function', info: '正弦函數' },
  { label: '\\cos', type: 'function', info: '餘弦函數' },
  { label: '\\tan', type: 'function', info: '正切函數' },
  { label: '\\log', type: 'function', info: '對數 \\log(x)' },
  { label: '\\ln', type: 'function', info: '自然對數 \\ln(x)' },
  { label: '\\exp', type: 'function', info: '指數 \\exp(x)' },
  { label: '\\alpha', type: 'variable', info: '希臘字母 α' },
  { label: '\\beta', type: 'variable', info: '希臘字母 β' },
  { label: '\\gamma', type: 'variable', info: '希臘字母 γ' },
  { label: '\\delta', type: 'variable', info: '希臘字母 δ' },
  { label: '\\theta', type: 'variable', info: '希臘字母 θ' },
  { label: '\\pi', type: 'variable', info: '圓周率 π' },
  { label: '\\infty', type: 'variable', info: '無窮大 ∞' },
  { label: '\\leq', type: 'operator', info: '小於等於 ≤' },
  { label: '\\geq', type: 'operator', info: '大於等於 ≥' },
  { label: '\\neq', type: 'operator', info: '不等於 ≠' },
  { label: '\\pm', type: 'operator', info: '正負號 ±' },
  { label: '\\times', type: 'operator', info: '乘號 ×' },
  { label: '\\div', type: 'operator', info: '除號 ÷' },
  { label: '\\cdot', type: 'operator', info: '點乘 ·' },
]

// Markdown 自動完成選項
const markdownCompletions = [
  { label: '**', type: 'text', info: '粗體 **文字**' },
  { label: '*', type: 'text', info: '斜體 *文字*' },
  { label: '`', type: 'text', info: '行內程式碼 `code`' },
  { label: '```', type: 'text', info: '程式碼區塊' },
  { label: '# ', type: 'heading', info: '一級標題' },
  { label: '## ', type: 'heading', info: '二級標題' },
  { label: '### ', type: 'heading', info: '三級標題' },
  { label: '- ', type: 'list', info: '無序列表' },
  { label: '1. ', type: 'list', info: '有序列表' },
  { label: '> ', type: 'quote', info: '引用' },
  { label: '---', type: 'separator', info: '分隔線' },
]

// Slash 命令選項（類似 Notion）
const slashCommands = [
  { 
    label: '/latex', 
    type: 'latex', 
    info: '插入 LaTeX 區塊公式 $$...$$',
    insert: '$$\n\n$$',
    cursorOffset: -3
  },
  { 
    label: '/equation', 
    type: 'latex', 
    info: '插入 LaTeX 區塊公式（同 /latex）',
    insert: '$$\n\n$$',
    cursorOffset: -3
  },
  { 
    label: '/inline-latex', 
    type: 'latex', 
    info: '插入行內 LaTeX 公式 $...$',
    insert: '$$',
    cursorOffset: -1
  },
  { 
    label: '/math', 
    type: 'latex', 
    info: '插入行內數學公式（同 /inline-latex）',
    insert: '$$',
    cursorOffset: -1
  },
  { 
    label: '/heading', 
    type: 'heading', 
    info: '插入標題',
    insert: '## ',
    cursorOffset: 0
  },
  { 
    label: '/bold', 
    type: 'text', 
    info: '插入粗體文字',
    insert: '****',
    cursorOffset: -2
  },
  { 
    label: '/italic', 
    type: 'text', 
    info: '插入斜體文字',
    insert: '**',
    cursorOffset: -1
  },
  { 
    label: '/code', 
    type: 'code', 
    info: '插入程式碼區塊',
    insert: '```\n\n```',
    cursorOffset: -4
  },
  { 
    label: '/list', 
    type: 'list', 
    info: '插入無序列表',
    insert: '- ',
    cursorOffset: 0
  },
  { 
    label: '/quote', 
    type: 'quote', 
    info: '插入引用',
    insert: '> ',
    cursorOffset: 0
  },
]

const toCompletionOption = (snippet) => {
  const label = snippet?.label
  if (!label) return null
  return {
    label,
    type: snippet.type || 'snippet',
    info: snippet.info || '',
    apply: (view, completion, from, to) => {
      const all = getAllSnippets()
      const found = all.find((s) => s.label === completion.label)
      if (found && typeof found.insert === 'string' && found.insert.length > 0) {
        const insertText = found.insert.replace(/\\n/g, '\n')
        view.dispatch({
          changes: { from, to, insert: insertText },
          selection: { anchor: from + insertText.length + (Number(found.cursorOffset) || 0) },
        })
        return
      }

      // fallback: 若無 insert，就回到插入 label 本身
      view.dispatch({
        changes: { from, to, insert: completion.label },
        selection: { anchor: from + completion.label.length },
      })
    },
  }
}

// 自定義自動完成
const customCompletions = (context) => {
  const word = context.matchBefore(/[@\/\\]?\w*/)
  if (!word) return null
  
  const before = context.state.doc.sliceString(Math.max(0, context.pos - 100), context.pos)
  const completions = []
  
  // 模板快速引用（當輸入 @ 時）
  if (word.text.startsWith('@')) {
    const query = word.text.slice(1).toLowerCase()
    // 從 props 或全局獲取模板列表
    const templates = props.templates || []
    const matches = templates
      .filter(template => {
        const title = (template.title || '').toLowerCase()
        return title.includes(query)
      })
      .slice(0, 10)
    
    if (matches.length > 0) {
      matches.forEach(template => {
        completions.push({
          label: `@${template.title}`,
          type: 'template',
          info: `模板 ID: ${template.template_id}`,
          apply: (view, completion, from, to) => {
            // 插入模板引用標記（可以自定義格式）
            const insertText = `@template:${template.template_id}`
            view.dispatch({
              changes: { from, to, insert: insertText },
              selection: { anchor: from + insertText.length },
            })
          }
        })
      })
      return {
        from: word.from,
        options: completions
      }
    }
    return null
  }
  
  // Slash 命令（當輸入 / 時）
  if (word.text.startsWith('/')) {
    const query = word.text.slice(1).toLowerCase()
    const allSlash = [
      ...slashCommands.map((s) => ({ ...s })), // 既有命令
      ...getAllSnippets().filter((s) => typeof s.label === 'string' && s.label.startsWith('/')),
    ]

    allSlash.forEach((item) => {
      const q = query || ''
      const key = String(item.label || '').slice(1).toLowerCase()
      if (key.includes(q)) {
        const opt = toCompletionOption(item)
        if (opt) completions.push(opt)
      }
    })
    if (completions.length > 0) {
      return {
        from: word.from,
        options: completions.slice(0, 10)
      }
    }
  }
  
  // LaTeX 自動完成（當輸入 \ 時）
  if (word.text.startsWith('\\') || before.endsWith('\\')) {
    const query = word.text.slice(1).toLowerCase()
    latexCompletions.forEach(item => {
      if (item.label.toLowerCase().includes(query)) {
        completions.push({
          label: item.label,
          type: item.type,
          info: item.info
        })
      }
    })
    getAllSnippets()
      .filter((s) => typeof s.label === 'string' && s.label.startsWith('\\'))
      .forEach((s) => {
        const key = s.label.slice(1).toLowerCase()
        if (key.includes(query)) {
          const opt = toCompletionOption(s)
          if (opt) completions.push(opt)
        }
      })
    if (completions.length > 0) {
      return {
        from: word.from,
        options: completions.slice(0, 15)
      }
    }
  }
  
  // Markdown 自動完成（當輸入特定字符時）
  if (word.text.length > 0 && !word.text.startsWith('\\') && !word.text.startsWith('/')) {
    const query = word.text.toLowerCase()
    markdownCompletions.forEach(item => {
      if (item.label.toLowerCase().startsWith(query) || query === '') {
        completions.push({
          label: item.label,
          type: item.type,
          info: item.info
        })
      }
    })
    if (completions.length > 0) {
      return {
        from: word.from,
        options: completions.slice(0, 10)
      }
    }
  }
  
  return null
}

onMounted(() => {
  // #region agent log
  console.log('%c[DEBUG MODE] MarkdownEditor mounted', 'background: #222; color: #bada55; font-size: 14px; padding: 2px 5px;');
  // #endregion
  
  if (!editorContainer.value) return
  
  const startState = EditorState.create({
    doc: props.modelValue,
    extensions: [
      lineNumbers(),
      history(),
      foldGutter(),
      drawSelection(),
      indentOnInput(),
      bracketMatching(),
      closeBrackets(),
      autocompletion({
        override: [customCompletions],
        activateOnTyping: true,
        maxRenderedOptions: 10
      }),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      syntaxHighlighting(defaultHighlightStyle),
      markdown(),
      // completionKeymap 會自動處理自動完成的 Enter 鍵
      keymap.of([
        ...completionKeymap,
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...historyKeymap
      ]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          // #region agent log
          const content = update.state.doc.toString()
          const selection = update.state.selection.main
          console.log('[MD-Editor] updateListener triggered', {contentLength:content.length,selectionFrom:selection.from,selectionTo:selection.to});
          fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MarkdownEditor.vue:509',message:'updateListener triggered',data:{contentLength:content.length,selectionFrom:selection.from,selectionTo:selection.to,userEvent:update.transactions[0]?.annotation?.('userEvent')},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          emit('update:modelValue', content)
        }
      }),
      EditorView.theme({
        '&': {
          fontSize: '14px',
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace'
        },
        '.cm-editor': {
          borderRadius: '0.5rem',
          border: '1px solid rgb(203 213 225)',
          backgroundColor: 'white'
        },
        '.cm-focused': {
          outline: '2px solid rgb(99 102 241)',
          outlineOffset: '2px',
        },
        '.cm-scroller': {
          padding: '0.75rem',
        },
        '.cm-content': {
          minHeight: '150px',
          padding: '0.5rem 0',
        },
        '.cm-line': {
          padding: '0 0.5rem'
        },
        '.cm-autocomplete': {
          fontSize: '13px',
          border: '1px solid rgb(203 213 225)',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
        },
        '.cm-completionLabel': {
          fontFamily: 'ui-monospace, monospace'
        },
        '.cm-completionInfo': {
          fontSize: '12px',
          color: 'rgb(100 116 139)'
        }
      }),
      EditorView.lineWrapping,
    ]
  })
  
  view = new EditorView({
    state: startState,
    parent: editorContainer.value
  })
  
  // 添加 paste 事件監聽器
  const dom = view.dom
  dom.addEventListener('paste', handlePaste)
})

watch(() => props.modelValue, (newValue) => {
  // #region agent log
  console.log('[MD-Editor] watch props.modelValue', {newValueLength:newValue?.length,hasView:!!view,currentContentLength:view?.state.doc.length});
  fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MarkdownEditor.vue:556',message:'watch props.modelValue triggered',data:{newValueLength:newValue?.length,hasView:!!view,currentContentLength:view?.state.doc.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  if (!view) return
  const currentContent = view.state.doc.toString()
  // 只有在內容真的不同時才更新，避免循環更新
  if (currentContent !== newValue) {
    // #region agent log
    console.log('[MD-Editor] DISPATCHING content update', {currentLength:currentContent.length,newLength:newValue?.length});
    fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MarkdownEditor.vue:564',message:'DISPATCHING content update',data:{currentLength:currentContent.length,newLength:newValue?.length,selectionBefore:view.state.selection.main},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: newValue
      }
    })
  }
})

onUnmounted(() => {
  if (view) {
    // 移除事件監聽器
    const dom = view.dom
    dom.removeEventListener('paste', handlePaste)
    view.destroy()
  }
})
</script>

<style scoped>
.markdown-editor-wrapper {
  width: 100%;
  position: relative;
}

.editor-container {
  width: 100%;
}

.upload-indicator {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

:deep(.cm-editor) {
  border-radius: 0.5rem;
}

:deep(.cm-focused) {
  outline: 2px solid rgb(99 102 241);
  outline-offset: 2px;
}

:deep(.cm-content) {
  padding: 0.75rem;
  min-height: 150px;
}
</style>

