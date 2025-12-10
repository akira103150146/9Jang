<template>
  <div class="markdown-editor-wrapper">
    <div ref="editorContainer" class="editor-container"></div>
    <div v-if="uploadingImage" class="upload-indicator">
      <span class="text-xs text-indigo-600">上傳圖片中...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { EditorView, keymap, highlightSpecialChars, drawSelection, highlightActiveLine, lineNumbers, highlightActiveLineGutter } from '@codemirror/view'
import { EditorState, Compartment } from '@codemirror/state'
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands'
import { markdown } from '@codemirror/lang-markdown'
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { bracketMatching, foldGutter, indentOnInput, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language'
import { uploadImageAPI, getBackendBaseURL } from '../services/api'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const editorContainer = ref(null)
let view = null
const uploadingImage = ref(false)

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

// 自定義自動完成
const customCompletions = (context) => {
  const word = context.matchBefore(/\\?\w*/)
  if (!word) return null
  
  const before = context.state.doc.sliceString(Math.max(0, context.pos - 100), context.pos)
  const completions = []
  
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
    if (completions.length > 0) {
      return {
        from: word.from,
        options: completions.slice(0, 15)
      }
    }
  }
  
  // Markdown 自動完成（當輸入特定字符時）
  if (word.text.length > 0 && !word.text.startsWith('\\')) {
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
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...historyKeymap,
        ...completionKeymap
      ]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const content = update.state.doc.toString()
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
  if (view && view.state.doc.toString() !== newValue) {
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

